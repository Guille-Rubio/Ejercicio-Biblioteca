import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "",
    authDomain: "biblioteca-nyt.firebaseapp.com",
    projectId: "biblioteca-nyt",
    storageBucket: "biblioteca-nyt.appspot.com",
    messagingSenderId: "58276938903",
    appId: "1:58276938903:web:20d9cba86920dded74d5d2"
};

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getFirestore(app);
const user = auth.currentUser;
let activeUser = sessionStorage.getItem("activeUser")

const listSectionHeader = document.getElementById("list-section-header");
const listSection = document.getElementById("list-section");

const googleLogInButton = document.getElementById("googleLogInButton");
const logOutButton = document.getElementById("logOutButton");


//Funciones auxiliares
const clearListSection = () => listSection.innerHTML = "";
const toggleDisplay = element => { element.classList.toggle("display") }

//************************************   USER MANAGEMENT




async function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            sessionStorage.setItem("activeUser", user.displayName)
            currentUser = user.displayName;

        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        toggleDisplay(googleLogInButton)
        toggleDisplay(logOutButton)
       // currentUser = user.displayName;
    } else {
        toggleDisplay(googleLogInButton)
        toggleDisplay(logOutButton)
        currentUser = undefined;
    }
});

function logOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
        sessionStorage.removeItem("activeUser")
        activeUser = undefined;
        clearListSection();
    }).catch((error) => {
    });
}

//************** SHOW USER FAVOURITES */

async function getUserFavourites(document) {
    const docRef = doc(db, "favourites", document);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        sessionStorage.setItem("userFavs", JSON.stringify(docSnap.data().favs))
        return docSnap.data().favs;
    }
}


async function printFavourites(user) {
    const favBooks = await getUserFavourites(user);

    for (let i = 0; i < favBooks.length; i++) {
        const newBookCard = document.createElement("article");
        newBookCard.classList.add("book-card")
        let newBookTitle = document.createElement("h3");
        let newBookCover = document.createElement("img");
        let newBookRankPosition = document.createElement("p");
        let newBookWeeksOnList = document.createElement("p");
        let newBookDescription = document.createElement("p");
        let linkToPurchaseBook = document.createElement("a");

        newBookTitle.innerHTML = favBooks[i].title;
        newBookCover.setAttribute("src", favBooks[i].image)
        newBookWeeksOnList.innerHTML = `Weeks on List: ${favBooks[i].weeksOnList}`;
        newBookRankPosition.innerHTML = `Rank # ${favBooks[i].rank}`;
        newBookDescription.innerHTML = `Description: ${favBooks[i].description}`;
        linkToPurchaseBook.innerHTML = "Buy in Amazon";
        linkToPurchaseBook.setAttribute("href", favBooks[i].amazonLink);
        linkToPurchaseBook.setAttribute("target", "_blank");
        linkToPurchaseBook.classList.add("amazonButton")

        newBookCard.appendChild(newBookTitle);
        newBookCard.appendChild(newBookCover);
        newBookCard.appendChild(newBookWeeksOnList);
        newBookCard.appendChild(newBookRankPosition);
        newBookCard.appendChild(newBookDescription);
        newBookCard.appendChild(linkToPurchaseBook);

        listSection.appendChild(newBookCard); 
    }
}

if(activeUser){
printFavourites(activeUser);
}