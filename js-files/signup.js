import { createUserWithEmailAndPassword,auth,db,onAuthStateChanged,addDoc,collection } from "./logic.js";

let islogin = localStorage.getItem('login')
 
if(islogin){
  window.location.replace('./dashboard.html')
}

// let play = localStorage.getItem('player')
// console.log(play)

// if (play) {
//   window.location.replace('./input.html')
// }



let signUpWithEmailPass = async (email, pass, name, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const docRef = await addDoc(collection(db, "users"), {
      email: user.email,
      password: pass,
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: name,
      phoneNumber: Number(phone),
    });

    console.log('Success:', docRef.id);
    localStorage.setItem('login', user.uid)
    window.location.replace('./dashboard.html');
    // return docRef
  } catch (error) {
    console.error("Error signing up:", error.code, error.message);
    // a = false;
  }
  // return false
};

let emailFlag = false;
let passFlag = false;
let nameFlag = false;
let phoneFlag = false;

function validate(value, e) {
  let email = document.querySelector('#email-id');
  let name = document.querySelector('#name-id');
  let pass = document.querySelector('#pass-id');
  let phone = document.querySelector('#phone-id');

  if (value === 'email') {
    if (!e.target.value.includes('@')) {
      email.style.display = 'block';
      emailFlag = false;
    } else {
      email.style.display = 'none';
      emailFlag = true;
    }
  }

  if (value === 'name') {
    if (e.target.value.length < 8) {
      name.style.display = 'block';
      nameFlag = false;
    } else {
      name.style.display = 'none';
      nameFlag = true;
    }
  }

  if (value === 'password') {
    if (e.target.value.length < 10) {
      pass.style.display = 'block';
      passFlag = false;
    } else {
      pass.style.display = 'none';
      passFlag = true;
    }
  }

  if (value === 'phone') {
    for (let i = 0; i < e.target.value.length; i++) {
      if (e.target.value.length < 11) {
        phone.style.display = 'block';
        phoneFlag = false;
        return;
      }
      phone.style.display = 'none';
      phoneFlag = true;
    }
  }
}



function visiblePass(e) {
  let element = e.target.previousElementSibling;
  let flag = true;

  if (element.getAttribute('type') === 'password' && flag) {
    element.setAttribute('type', 'text');
    flag = false;
    return;
  }
  element.setAttribute('type', 'password');
  flag = true;
}

function formSubmit() {
  let passValue = document.querySelector('#passValue').value;
  let emailValue = document.querySelector('#emailValue').value;
  let nameValue = document.querySelector('#nameValue').value;
  let phoneValue = document.querySelector('#phoneValue').value;
  // let cityValue = document.querySelector('#cityValue').value;

  let emailCheck = document.querySelector('#email-id');
  emailCheck.style.display = 'none';



  if (emailFlag && nameFlag && phoneFlag && passFlag && emailFlag) {
    signUpWithEmailPass(emailValue, passValue, nameValue, phoneValue)
  }
}

document.querySelector("#form").addEventListener('click', () => {
    formSubmit();
});

document.querySelector(".em").addEventListener('input', (event) => {
  validate('email', event);
});

document.querySelector(".na").addEventListener('input', (event) => {
  validate('name', event);
});

document.querySelector(".ph").addEventListener('input', (event) => {
  validate('phone', event);
});

document.querySelector(".ps").addEventListener('input', (event) => {
  validate('password', event);
});

document.querySelector(".ho").addEventListener('click', (event) => {
  visiblePass(event);
});


let checkUser = async () => {
  try {
    await onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(user);
        return true
        // ...
      } else {
        // User is signed out
        console.log("signed out");
        // ...
      }
    });
  } catch (error) {
    console.error(error);
  }
  return false
};
checkUser();