import 'dotenv/config'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAvXcH38rYhyATHTiW6VAWaSmllllxGUQ4",
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

const listSection = document.getElementById("list-section");
const header = document.getElementsByTagName("h2")[0]

const googleLogInButton = document.getElementById("googleLogInButton");
const logOutButton = document.getElementById("logOutButton");
const emailSignInButton = document.getElementById("emailSignIn");
const emailLogInButton = document.getElementById("emailLogIn");

const userInput = document.getElementById("userInput");
const passwordInput = document.getElementById("password");
const passwordInput2 = document.getElementById("password2");



//************************************   USER MANAGEMENT

async function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            sessionStorage.setItem("activeUser", user.displayName)
            currentUser = user.email;

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
        print();
        header.innerHTML = user.displayName? user.displayName + " favourite books":user.email + " favourite books"

    } else {
        header.innerHTML = "Please log in to see your favourite books"

    }
});


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

async function removeFromFavList(removedBook, document) {
    const docRef = await doc(db, "favourites", document);
    await updateDoc(docRef, {
        "favs": arrayRemove(removedBook)
    });
}

async function printFavBox() {
    let bookCards = document.querySelectorAll(".book-card");
    for (let m = 0; m < bookCards.length; m++) {
        let newFavouriteInput = document.createElement("input");
        let newFavouriteLabel = document.createElement("label");
        newFavouriteLabel.classList.add("like");
        newFavouriteInput.setAttribute("type", "checkbox");
        newFavouriteInput.setAttribute("name", "fav");
        newFavouriteInput.setAttribute("id", `favNum${m}`);
        newFavouriteLabel.setAttribute("for", "fav");
        newFavouriteLabel.innerHTML="Save as favourite";
        newFavouriteLabel.appendChild(newFavouriteInput);
        newFavouriteInput.addEventListener("input", async e => {

            if (e.target.checked == false) {
                const selectedBook = {
                    "title": e.target.parentNode.childNodes[0].innerHTML,
                    "image": e.target.parentNode.childNodes[1].src,
                    "weeksOnList": e.target.parentNode.childNodes[2].innerHTML.slice(15),
                    "rank": e.target.parentNode.childNodes[3].innerHTML.slice(7),
                    "description": e.target.parentNode.childNodes[4].innerHTML.slice(13),
                    "amazonLink": e.target.parentNode.childNodes[5].href
                };
                await removeFromFavList(selectedBook, activeUser);
                alert("has eliminado el titulo: " + selectedBook.title + " de tu lista de favoritos")
                e.target.parentElement.remove();
            }
        })
        bookCards[m].appendChild(newFavouriteLabel);
        bookCards[m].appendChild(newFavouriteInput);
       
    }
}

async function checkUserFavourites(user) {
    const userFavs = JSON.parse(sessionStorage.getItem("userFavs"))
    const userFavsTitles = [];
    for (let h = 0; h < userFavs.length; h++) {
        userFavsTitles.push(userFavs[h].title);
    }
    if (userFavsTitles) {
        const bookCards = document.querySelectorAll(".book-card")
        for (let p = 0; p < bookCards.length; p++) {
            let book = bookCards[p].childNodes[0].innerHTML;
            if (userFavsTitles.indexOf(book) !== -1) {
                bookCards[p].childNodes[7].checked = true;
            }
        }
    }
}



async function print() {
    await printFavourites(activeUser);
    printFavBox();
    checkUserFavourites(activeUser);
}
