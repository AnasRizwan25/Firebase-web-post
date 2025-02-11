import { auth, signOut, onAuthStateChanged, query, getDoc, limit, where, collection, db, getDocs, doc } from "./logic.js";

// delPlay();
document.getElementById('userName').innerText = 'username';
let allPostDiv = document.querySelector("#postList");
let islogin = localStorage.getItem('login');
// let plays = localStorage.getItem('player');
// console.log(islogin);

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
//     querySnapshot.forEach((post) => {
//       console.log(post.data());
//       postList.innerHTML += `
//       <div class="post">
//         <div class="post-title">${post.data().playerName}</div>
//         <div class="post-details">
//           <p>Age: ${post.data().playerAge}</p>
//           <p>Score: ${post.data().playerScore}</p>
//           <p>Year: ${post.data().playerYear}</p>
//           <button id='${post.id}' class='update-btn'>edit</button>
//         </div>
//       </div>`;
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };


let nameFunc = async () => {
  const q = query(collection(db, "users"), where("uid", "==", islogin));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((post) => {
    document.getElementById('userName').innerText = `${post.data().displayName.toUpperCase()}`;

  });
}
nameFunc()
// userName
// getMyPosts();


// let updatePost = async (post_id) => {
//   console.log(post_id);

//   try {
//     // Add a new document in collection "cities"
//     await updateDoc(doc(db, "posts", post_id), {
//       postText: "updated post 2nd time",
//     }).then(() => {
//       console.log("update done");
//       getMyPosts();
//     })
//   } catch (error) {
//     console.error(error)
//   }
// };
// let createPost = async (text) => {
//   try {
//     const docRef = await addDoc(collection(db, "posts"), {
//       postText: text,
//       uid: islogin,
//     });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (error) {
//     console.error(error);
//   }
// };
let getAllPosts = async () => {
  try {
    const posts = await getDocs(collection(db, "posts"));
    posts.forEach((post) => {
      // console.log(post.data());
      allPostDiv.innerHTML += `<div class="post">
        <div class="post-title">${post.data().displayName}</div>
        <div class="post-details">
          <p class="post-iniline">Date: ${post.data().postDate}</p>
          <p class="post-iniline">Topic: ${post.data().postTopic}</p>
          <p class="post-iniline">Description: ${post.data().postText}</p>
          <button id='${post.id}' class='like-btn'>Like</button>
          <p>${post.data().like}</p>
        </div>
      </div>`;
    });
  } catch (error) {
    console.error(error);
  }
};

getAllPosts()

document.querySelector('#addPlayerBtn').addEventListener('click', () => {
  let inputValue = document.querySelector('#searchInput').value;
  getPlayer(inputValue.toLowerCase());
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
const modal = document.getElementById('playerModal');
const closeModalButton = document.getElementById('closeModal');
const modalPlayerDetails = document.getElementById('modalPlayerDetails');

// Function to open the modal
const openModal = () => {
  modal.style.display = "block";
};

// Function to close the modal
const closeModal = () => {
  modal.style.display = "none";
};

// Event listener to close the modal when the "X" button is clicked
closeModalButton.addEventListener('click', closeModal);

// Function to fetch player data and display in the modal
let getPlayer = async (text) => {
  try {
    // Clear previous modal content
    modalPlayerDetails.innerHTML = "";

    if (!text.trim()) {
      modalPlayerDetails.innerHTML = "<p>No player found</p>";
      openModal();
      return;
    }

    const q = query(collection(db, "posts"), where("displayName", "==", text));
    const querySnapshot = await getDocs(q);
    modalPlayerDetails.innerHTML = '';

    if (querySnapshot.empty) {
      modalPlayerDetails.innerHTML = "<p>No player found</p>";
    } else {
      querySnapshot.forEach((post) => {
        const playerData = post.data();
        modalPlayerDetails.innerHTML += `
          <p class="same"><strong>Name:</strong> ${playerData.displayName}</p>
          <p><strong>Date:</strong> ${playerData.postDate}</p>
          <p><strong>Post Topic:</strong> ${playerData.postTopic}</p>
          <p><strong>Post Text:</strong> ${playerData.postText}</p>
          <br/>

        `;
      });
    }

    openModal();
  } catch (error) {
    console.error(error);
    modalPlayerDetails.innerHTML = "<p>An error occurred while fetching player data.</p>";
    openModal();
  }
};

// Handle the "Add Player" button click
document.querySelector('#addPlayerBtn').addEventListener('click', () => {
  let inputValue = document.querySelector('#searchInput').value;
  getPlayer(inputValue.toLowerCase());
});