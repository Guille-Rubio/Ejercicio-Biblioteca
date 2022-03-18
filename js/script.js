//REFACTORIZAR session storage.getItem("bookList")

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "*****************",
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
let currentUser;//sessionStorage.getItem("activeUser");
const bookLists = [];
const urlToTopLists = [];
const oldestPublishedBooksDates = [];
const lastInclusionDates = [];
const updateRate = [];
const linksToLists = [];

//Sections
const listSectionHeader = document.getElementById("list-section-header");
const listSection = document.getElementById("list-section");
const returnButton = document.getElementById("returnButton")

//buttons
const googleLogInButton = document.getElementById("googleLogInButton");
const logOutButton = document.getElementById("logOutButton");

//listeners
googleLogInButton.addEventListener("click", signInWithGoogle);
logOutButton.addEventListener("click", logOut);

//nytAPI
const rootListUrl = "https://api.nytimes.com/svc/books/v3//lists/";
const nytAPIkey = "*********************";

//Funciones auxiliares
const clearListSection = () => listSection.innerHTML = "";
const toggleDisplay = element => { element.classList.toggle("display") }


//************************************   USER MANAGEMENT
//login/logout buttons shown on load depending on user logged

if (user) {
    toggleDisplay(googleLogInButton)
} else {
    toggleDisplay(logOutButton)
}

async function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log("Logged-in");
            sessionStorage.setItem("activeUser", user.displayName)

        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(user.displayName + "is logged in");
        printFavBox();
        const uid = user.uid;
        toggleDisplay(googleLogInButton)
        toggleDisplay(logOutButton)
        currentUser = user.displayName;
    } else {
        console.log("Logged-out")
        toggleDisplay(googleLogInButton)
        toggleDisplay(logOutButton)
        deleteFavBox();
        currentUser = undefined;
    }
});

function logOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
        sessionStorage.removeItem("activeUser")
        console.log("Sign-out successful")
    }).catch((error) => {
        console.log("Log Out error")
    });
}

//LISTS VIEW

//Fetch book lists and details and store them in arrays

async function fetchLists() {
    if (sessionStorage.getItem("lists") === null) {//Realizar fetch solo si no se ha hecho ya en esta
        const response = await fetch(`https://api.nytimes.com/svc/books/v3//lists/names.json?${nytAPIkey}`);
        const data = await response.json()
            .then(data => {
                for (let i = 0; i < data.results.length; i++) {
                    bookLists.push(data.results[i].list_name);
                    oldestPublishedBooksDates.push(data.results[i].oldest_published_date);
                    lastInclusionDates.push(data.results[i].newest_published_date);
                    updateRate.push(data.results[i].updated);
                    linksToLists.push(data.results[i].list_name_encoded)
                }
                sessionStorage.setItem("lists", JSON.stringify(data.results))
            })
    } else {
        const data = JSON.parse(sessionStorage.getItem("lists"));
        for (let i = 0; i < data.length; i++) {
            bookLists.push(data[i].list_name);
            oldestPublishedBooksDates.push(data[i].oldest_published_date);
            lastInclusionDates.push(data[i].newest_published_date);
            updateRate.push(data[i].updated);
            linksToLists.push(data[i].list_name_encoded)
        }
    }
}

async function createListCards() {
    for (let k = 0; k < bookLists.length; k++) {
        let listUrl = rootListUrl + linksToLists[k] + ".json?" + nytAPIkey;
        urlToTopLists.push(listUrl);

        let newCard = document.createElement("article");
        newCard.setAttribute("class", "card");

        let newTitle = document.createElement("h3");
        let newLastInclusion = document.createElement("p");
        let newOldestBookDate = document.createElement("p");
        let newUpdateFrequency = document.createElement("p");
        let newLinkToList = document.createElement("button");
        newLinkToList.classList.add("booksLink")

        newCard.appendChild(newTitle);
        newCard.appendChild(newLastInclusion);
        newCard.appendChild(newOldestBookDate);
        newCard.appendChild(newUpdateFrequency);
        newCard.appendChild(newLinkToList);

        let newTitleText = document.createTextNode(bookLists[k]);
        let newLastInclusionText = document.createTextNode("Last book included on: " + lastInclusionDates[k]);
        let newOldestBookDateText = document.createTextNode("First book added on: " + oldestPublishedBooksDates[k]);
        let newUpdateFrequencyText = document.createTextNode("List updated " + updateRate[k]);
        let newLinkToListText = document.createTextNode("See Best-Sellers");
        newLinkToList.value = urlToTopLists[k];

        //Añadir elementos a tarjeta
        newTitle.appendChild(newTitleText);
        newLastInclusion.appendChild(newLastInclusionText);
        newOldestBookDate.appendChild(newOldestBookDateText);
        newUpdateFrequency.appendChild(newUpdateFrequencyText);
        newLinkToList.appendChild(newLinkToListText);

        //numerar lista
        let listNumber = document.createElement("p");
        newCard.appendChild.listNumber;
        listNumber.innerHTML = k;

        listSection.appendChild(newCard);
    }
}

async function addLinksToListCard() {
    let j = 0//El bucle da error si no se declara aquí
    const cardLinks = document.querySelectorAll(".booksLink");
    for (let j = 0; j < cardLinks.length; j++) {
        cardLinks[j].setAttribute("href", urlToTopLists[j]);
        cardLinks[j].addEventListener("click", async (event) => {
            let targetUrl = event.target.value;
            showBooksInList(targetUrl);
        })
    }
}

async function printListsCards() {
    clearListSection();
    await fetchLists();
    await createListCards();
    await addLinksToListCard();
}

printListsCards();


// BOOKS VIEW

function printReturnButton() {
    const returnButton = document.createElement("button");
    returnButton.setAttribute("id", "returnButton");
    returnButton.innerHTML = "Return to Book Lists";
    listSectionHeader.appendChild(returnButton);
    returnButton.addEventListener("click", () => {
        listSection.innerHTML = "";
        listSectionHeader.removeChild(returnButton);
        printListsCards();
    })
}

//BOOKS FETCH
async function fetchBooks(url) {

    const response = await fetch(url);
    const data = await response.json()
        .then(data => {
            sessionStorage.setItem("bookList", JSON.stringify(data.results.books))
        })
}


function printBookCards() {
    const booksInList = JSON.parse(sessionStorage.getItem("bookList"))

    for (let l = 0; l < booksInList.length; l++) {
        const newBookCard = document.createElement("article");
        newBookCard.classList.add("book-card")
        let newBookTitle = document.createElement("h3");
        let newBookCover = document.createElement("img");
        let newBookRankPosition = document.createElement("p");
        let newBookWeeksOnList = document.createElement("p");
        let newBookDescription = document.createElement("p");
        let linkToPurchaseBook = document.createElement("a");

        newBookTitle.innerHTML = booksInList[l].title;
        newBookCover.setAttribute("src", booksInList[l].book_image)
        newBookWeeksOnList.innerHTML = `Weeks on List: ${booksInList[l].weeks_on_list}`;
        newBookRankPosition.innerHTML = `Rank # ${booksInList[l].rank}`;
        newBookDescription.innerHTML = `Description: ${booksInList[l].description}`;
        linkToPurchaseBook.innerHTML = "Buy in Amazon";
        linkToPurchaseBook.setAttribute("href", booksInList[l].amazon_product_url);
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

function deleteFavBox() {
    let elements = document.querySelectorAll(".book-card")
    for (let n = 0; n < elements.length; n++) {
        document.getElementById("favNum" + n).remove()
    }
}

async function showBooksInList(url) {
    clearListSection();
    printReturnButton();
    await fetchBooks(url);
    printBookCards();
    if (currentUser != undefined) {
        printFavBox();
    }
    await printUserFavourites(currentUser);

}

// FAVOURITES MANAGEMENT
async function printFavBox() {
    let bookCards = document.querySelectorAll(".book-card")
    for (let m = 0; m < bookCards.length; m++) {
        let newFavouriteInput = document.createElement("input");
        let newFavouriteLabel = document.createElement("label")
        newFavouriteLabel.classList.add("like")
        newFavouriteInput.setAttribute("type", "checkbox")
        newFavouriteInput.setAttribute("name", "fav");
        newFavouriteInput.setAttribute("id", `favNum${m}`)
        newFavouriteLabel.setAttribute("for", "fav")
        newFavouriteLabel.appendChild(newFavouriteInput);
        newFavouriteInput.addEventListener("input", async e => {

            if (e.target.checked == true) {
                const selectedBook = await e.target.parentElement.childNodes[0].innerHTML;
                await updateFavList(selectedBook, currentUser)

                console.log("added " + selectedBook + " to " + currentUser)

            } else {
                const selectedBook = await e.target.parentElement.childNodes[0].innerHTML;
                console.log(selectedBook, currentUser);

                await removeFromFavList(selectedBook, currentUser);
                console.log("eliminado " + selectedBook + " " + currentUser);
            }
            console.log(e.target.value)
        })
        bookCards[m].appendChild(newFavouriteInput);
        bookCards[m].appendChild(newFavouriteLabel);
    }
}

async function updateFavList(newBook, document) {
    //first checks whether the user doc already exists
    const docCheck = await doc(db, "favourites", document);
    const docSnap = await getDoc(docCheck);

    if (docSnap.exists()) {//updates if it does
        const docRef = await doc(db, "favourites", document);
        await updateDoc(docRef, {
            "favs": arrayUnion(newBook)
        });
    } else {//creates if it doesn't
        const favRef = await collection(db, "favourites")
        await setDoc(doc(favRef, document), {
            "favs": [newBook]
        })
    }
}

async function removeFromFavList(removedBook, document) {
    const docRef = await doc(db, "favourites", document);
    await updateDoc(docRef, {
        "favs": arrayRemove(removedBook)
    });
}

//check favourites
async function getUserFavourites(document) {
    const docRef = doc(db, "favourites", document);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().favs;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}

async function printUserFavourites(user) {
    const userFavs = await getUserFavourites(user);
    const bookCards = document.querySelectorAll(".book-card")
    for (let p = 0; p < bookCards.length; p++) {
        let book = bookCards[p].childNodes[0].innerHTML;
        let checked = bookCards[p].childNodes[6].checked;
        if (userFavs.indexOf(book) !== -1) {
            bookCards[p].childNodes[6].checked = true
        }
    }
}






