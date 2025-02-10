import { auth, signOut, onAuthStateChanged, query, getDoc, limit,deleteDoc, where,updateDoc, collection, addDoc, db, getDocs, doc } from "./logic.js";

// delPlay();
document.getElementById('userName').innerText = 'username';
let allPostDiv = document.querySelector("#postList");
let islogin = localStorage.getItem('login');
// let plays = localStorage.getItem('player');
console.log(islogin);

if (!islogin) {
  window.location.replace('./index.html');
}

// if (plays) {
//   window.location.replace('./input.html');
// }
// function delPlay() {
//   localStorage.removeItem('player')
// }

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.querySelector('.main-content');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shifted');
});

document.querySelector("#google-signout").addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log("logout successfully");
    localStorage.removeItem('login');
    localStorage.removeItem('player');
    window.location.replace('./index.html');
  }).catch((error) => {
    console.log(error);
  });
});

let checkUser = async () => {
  try {
    await onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        // console.log(user);
      } else {
        console.log("signed out");
      }
    });
  } catch (error) {
    console.error(error);
  }
};

checkUser();

let postList = document.getElementById('postList');


// let getMyPosts = async () => {
//   try {
//     const q = query(collection(db, "posts"), where("uid", "==", islogin));

//     const querySnapshot = await getDocs(q);
//     allPostDiv.innerHTML = ''
//     querySnapshot.forEach((post) => {
//       console.log(post.data());
//       postList.innerHTML += `
//       <div class="post">
//         <div class="post-title">${post.data().displayName}</div>
//         <div class="post-details">
//           <p>Topic: ${post.data().postTopic}</p>
//           <p>Description: ${post.data().postText}</p>
//           <button id='${post.id}' class='update-btn'>edit</button>
//           </div>
//           </div>`;

//       document.getElementById(post.id).addEventListener("click", () => {
//         updatePost(post.id);
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };


  let selectedPostId = null;

  // Fetch Posts from Firebase
  let getMyPosts = async () => {
    try {
      const q = query(collection(db, "posts"), where("uid", "==", islogin));
  
      const querySnapshot = await getDocs(q);
      allPostDiv.innerHTML = '';  // Clear previous posts if any
  
      querySnapshot.forEach((post) => {
        console.log(post.data());
        postList.innerHTML += `
        <div class="post" id="${post.id}">
          <div class="post-title">${post.data().displayName}</div>
          <div class="post-details">
            <p>Topic: ${post.data().postTopic}</p>
            <p>Description: ${post.data().postText}</p>
            <button class="update-btn" onclick="openEditModal('${post.id}')">Edit</button>
            <button class="delete-btn" onclick="deletePost('${post.id}')">Delete</button>
          </div>
        </div>`;
      });
    } catch (error) {
      console.error(error);
    }
  };
  

  // Open Edit Modal
  window.openEditModal = async (post_id) => {
    // Get the post data
    const postRef = doc(db, "posts", post_id);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const postData = postSnap.data();

      // Set the selected post id
      selectedPostId = post_id;

      // Populate modal with existing data
      document.getElementById("editTopic").value = postData.postTopic;
      document.getElementById("editDescription").value = postData.postText;

      // Show the modal
      document.getElementById("editModal").style.display = "flex";
    }
  };

  // Close Modal
  window.closeModal = () => {
    document.getElementById("editModal").style.display = "none";
  };

  // Handle Form Submission
  document.getElementById("updateForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTopic = document.getElementById("editTopic").value;
    const newDescription = document.getElementById("editDescription").value;

    if (newTopic.length < 6 || newDescription.length < 6) {
      alert("Both fields must contain at least 6 characters.");
      return;
    }

    try {
      // Update the post in Firebase
      await updateDoc(doc(db, "posts", selectedPostId), {
        postTopic: newTopic,
        postText: newDescription,
      });

      // Optionally update the UI (ensure the element exists before modification)
      const postElement = document.getElementById(selectedPostId);
      if (postElement) {
        const postTopicElement = postElement.querySelector(".post-details p:nth-child(1)");
        const postDescriptionElement = postElement.querySelector(".post-details p:nth-child(2)");
        
        if (postTopicElement) {
          postTopicElement.textContent = `Topic: ${newTopic}`;
        }
        if (postDescriptionElement) {
          postDescriptionElement.textContent = `Description: ${newDescription}`;
        }
      }

      // Close the modal
      closeModal();

      console.log("Post updated successfully!");

      // Refresh posts
      getMyPosts();  // Make sure getMyPosts is defined and in scope here
    } catch (error) {
      console.error("Error updating post:", error);
    }
  });

  // Load posts on page load
  getMyPosts();

  window.deletePost = async (post_id) => {
    const confirmation = confirm("Are you sure you want to delete this post?");
    
    if (confirmation) {
      try {
        // Delete the post from Firebase
        await deleteDoc(doc(db, "posts", post_id));
  
        // Remove the post from the UI
        const postElement = document.getElementById(post_id);
        if (postElement) {
          postElement.remove(); // This removes the post element from the DOM
        }
  
        console.log("Post deleted successfully!");
  
        // Optionally, refresh posts to show updated list (if needed)
        getMyPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };
  




let nameFunc = async () => {
  const q = query(collection(db, "users"), where("uid", "==", islogin));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((post) => {
    document.getElementById('userName').innerText = `${post.data().displayName.toUpperCase()}`;
  });
}
nameFunc();
// userName
getMyPosts();


// Create a post and update both Firebase and the frontend
let createPost = async (Text, Topic) => {
  try {
    let name = '';
    
    // Get the displayName of the logged-in user
    const q = query(collection(db, "users"), where("uid", "==", islogin));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((post) => {
      name = post.data().displayName;
    });

    // Add the new post to Firebase
    const docRef = await addDoc(collection(db, "posts"), {
      displayName: name.toLowerCase(),
      postTopic: Topic,
      postText: Text,
      uid: islogin,
    });

    console.log("Document written with ID: ", docRef.id);

    // Now, update the frontend with the newly created post
    const newPost = {
      id: docRef.id,
      displayName: name,
      postTopic: Topic,
      postText: Text
    };

    // Dynamically add the new post to the postList container
    const postList = document.getElementById("postList");
    postList.innerHTML += `
      <div class="post" id="${newPost.id}">
        <div class="post-title">${newPost.displayName}</div>
        <div class="post-details">
          <p>Topic: ${newPost.postTopic}</p>
          <p>Description: ${newPost.postText}</p>
          <button class='update-btn'>edit</button>
        </div>
      </div>`;

    // Optionally, attach an event listener to the edit button
    const editButton = document.querySelector(`#${newPost.id} .update-btn`);
    editButton.addEventListener("click", () => {
      openEditModal(newPost.id);
    });

  } catch (error) {
    console.error("Error creating post: ", error);
  }
};

// Add event listener to the "Show Player Detail" button
document.getElementById("addPlayerBtn").addEventListener("click", function () {
  // Get the values of the search inputs
  var searchInput1 = document.getElementById("searchInput1").value;
  var searchInput2 = document.getElementById("searchInput2").value;

  // Get the error message elements
  var error1 = document.getElementById("error1");
  var error2 = document.getElementById("error2");

  // Reset error messages
  error1.style.display = "none";
  error2.style.display = "none";

  // Validate input lengths
  if (searchInput1.length < 6) {
    error1.style.display = "block"; // Show error for input 1
  }

  if (searchInput2.length < 6) {
    error2.style.display = "block"; // Show error for input 2
  }

  // If both inputs are valid (6 or more characters), proceed with posting
  if (searchInput1.length >= 6 && searchInput2.length >= 6) {
    // Proceed with your post action (create post and automatically show it in frontend)
    createPost(searchInput2, searchInput1);
  }
});

// Get modal elements
// const modal = document.getElementById('playerModal');
// const closeModalButton = document.getElementById('closeModal');
// const modalPlayerDetails = document.getElementById('modalPlayerDetails');

// // Function to open the modal
// const openModal = () => {
//   modal.style.display = "block";
// };

// // Function to close the modal
// const closeModal = () => {
//   modal.style.display = "none";
// };

// // Event listener to close the modal when the "X" button is clicked
// closeModalButton.addEventListener('click', closeModal);

// // Function to fetch player data and display in the modal
// let getPlayer = async (text) => {
//   try {
//     // Clear previous modal content
//     modalPlayerDetails.innerHTML = "";

//     if (!text.trim()) {
//       modalPlayerDetails.innerHTML = "<p>No player found</p>";
//       openModal();
//       return;
//     }

//     const q = query(collection(db, "players"), where("playerName", "==", text));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       modalPlayerDetails.innerHTML = "<p>No player found</p>";
//     } else {
//       querySnapshot.forEach((post) => {
//         const playerData = post.data();
//         modalPlayerDetails.innerHTML = `
//           <p class="same"><strong>Player Name:</strong> ${playerData.playerName}</p>
//           <p><strong>Player Age:</strong> ${playerData.playerAge}</p>
//           <p><strong>Player Score:</strong> ${playerData.playerScore}</p>
//           <p><strong>Player Year:</strong> ${playerData.playerYear}</p>
//         `;
//       });
//     }

//     openModal();
//   } catch (error) {
//     console.error(error);
//     modalPlayerDetails.innerHTML = "<p>An error occurred while fetching player data.</p>";
//     openModal();
//   }
// };

// Handle the "Add Player" button click
