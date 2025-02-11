import { auth, signOut, onAuthStateChanged, query,where, getDoc, deleteDoc, updateDoc, collection, addDoc, db, getDocs, doc } from "./logic.js";

// Initial setup
document.getElementById('userName').innerText = 'username';
let allPostDiv = document.querySelector("#postList");
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.querySelector('.main-content');

// Check login state
let islogin = localStorage.getItem('login');
if (!islogin) {
  window.location.replace('./index.html');
}

// Sidebar toggle functionality
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shifted');
});

// Define selectedPostId globally at the top
let selectedPostId = null;

window.openEditModal = async (post_id) => {
  // Get the post data
  const postRef = doc(db, "posts", post_id);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const postData = postSnap.data();

    // Set the selected post id
    selectedPostId = post_id;  // Now this is properly initialized

    // Populate modal with existing data
    document.getElementById("editTopic").value = postData.postTopic;
    document.getElementById("editDescription").value = postData.postText;

    // Show the modal
    document.getElementById("editModal").style.display = "flex";
  }
};


// Handle sign-out
document.querySelector("#google-signout").addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log("Logout successful");
    localStorage.removeItem('login');
    localStorage.removeItem('player');
    window.location.replace('./index.html');
  }).catch((error) => {
    console.error(error);
  });
});

// Check if user is authenticated
const checkUserAuth = async () => {
  try {
    await onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
      } else {
        console.log("User signed out");
      }
    });
  } catch (error) {
    console.error("Authentication error:", error);
  }
};

checkUserAuth();

// Get posts and display them
const getMyPosts = async () => {
  try {
    const q = query(collection(db, "posts"), where("uid", "==", islogin));
    const querySnapshot = await getDocs(q);
    let postsHTML = '';

    querySnapshot.forEach((post) => {
      const postData = post.data();
      postsHTML += createPostHTML(post.id, postData);
    });

    allPostDiv.innerHTML = postsHTML;

  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Generate HTML for each post
const createPostHTML = (id, data) => {
  return `
    <div class="post" id="${id}">
      <div class="post-title">${data.displayName}   ${data.postDate}</div>
      <div class="post-details">
        <p>Topic: ${data.postTopic}</p>
        <p>Description: ${data.postText}</p>
        <button class="update-btn" onclick="openEditModal('${id}')">Edit</button>
        <button class="delete-btn" onclick="deletePost('${id}')">Delete</button>
      </div>
    </div>`;
};

// Open Edit Modal
window.openEditModal = async (post_id) => {
  const postRef = doc(db, "posts", post_id);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const postData = postSnap.data();
    document.getElementById("editTopic").value = postData.postTopic;
    document.getElementById("editDescription").value = postData.postText;
    selectedPostId = post_id;
    document.getElementById("editModal").style.display = "flex";
  }
};

// Close Modal
window.closeModal = () => {
  document.getElementById("editModal").style.display = "none";
};

// Handle Form Submission for Editing Posts
document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTopic = document.getElementById("editTopic").value;
  const newDescription = document.getElementById("editDescription").value;

  if (newTopic.length < 6 || newDescription.length < 6) {
    alert("Both fields must contain at least 6 characters.");
    return;
  }

  try {
    await updateDoc(doc(db, "posts", selectedPostId), { postTopic: newTopic, postText: newDescription });
    console.log("Post updated successfully!");
    getMyPosts();  // Refresh posts
    closeModal();
  } catch (error) {
    console.error("Error updating post:", error);
  }
});

// Delete Post
window.deletePost = async (post_id) => {
  if (confirm("Are you sure you want to delete this post?")) {
    try {
      await deleteDoc(doc(db, "posts", post_id));
      document.getElementById(post_id).remove();
      console.log("Post deleted successfully!");
      getMyPosts();  // Refresh posts
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }
};

function getCurrentTime() {
  const now = new Date();
  
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Add leading zero for minutes if needed
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  // Return the time in the desired format
  return `${hours}:${minutesStr} ${ampm}`;
}


// Create a Post and Update Frontend
let createPost = async (Text, Topic) => {
  try {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    const name = await getDisplayName(islogin);

    // Add the new post to Firebase
    const docRef = await addDoc(collection(db, "posts"), {
      postDate: getCurrentTime(),
      displayName: name.toLowerCase(),
      postTopic: Topic,
      postText: Text,
      uid: islogin,
    });

    console.log("Document written with ID:", docRef.id);
    getMyPosts();  // Refresh posts after creating a new one

  } catch (error) {
    console.error("Error creating post:", error);
  }
};

// Get Display Name of Logged-In User
const getDisplayName = async (uid) => {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  let name = '';
  querySnapshot.forEach((doc) => {
    name = doc.data().displayName;
  });
  return name;
};

// Add Player Button Click Handler
document.getElementById("addPlayerBtn").addEventListener("click", () => {
  const searchInput1 = document.getElementById("searchInput1").value;
  const searchInput2 = document.getElementById("searchInput2").value;
  const error1 = document.getElementById("error1");
  const error2 = document.getElementById("error2");

  error1.style.display = "none";
  error2.style.display = "none";

  if (searchInput1.length < 6) {
    error1.style.display = "block";
  }

  if (searchInput2.length < 6) {
    error2.style.display = "block";
  }

  if (searchInput1.length >= 6 && searchInput2.length >= 6) {
    createPost(searchInput2, searchInput1);
  }
});

// Load posts on page load
getMyPosts();
