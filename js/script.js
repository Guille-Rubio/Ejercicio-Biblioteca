import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";



console.log(process.env);

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
let currentUser;
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

//inputs
const userInput = document.getElementById("userInput");
const passwordInput = document.getElementById("password");
const passwordInput2 = document.getElementById("password2");
const userInputLabel = document.getElementById("userInputLabel");
const passwordInputLabel = document.getElementById("passwordInputLabel");
const passwordInput2Label = document.getElementById("passwordInput2Label");

//buttons
const googleLogInButton = document.getElementById("googleLogInButton");
const logOutButton = document.getElementById("logOutButton");
const emailSignInButton = document.getElementById("emailSignIn");
const emailLogInButton = document.getElementById("emailLogIn");

//nytAPI
const rootListUrl = "https://api.nytimes.com/svc/books/v3//lists/";
const nytAPIkey = "api-key=gAsn7wtEwzMskqOVdSlE3u1GA5ZHmAH4";

//Funciones auxiliares
const clearListSection = () => listSection.innerHTML = "";

function checkEmail(email) {
    const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return emailRegex.test(email);
}

function checkPassword(password) {
    const passRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    return passRegex.test(password);
}

//************************************   USER MANAGEMENT

function manageLoginButtons() {
    if (sessionStorage.getItem("activeUser") == null) {
        logOutButton.classList.add("displayNone");
        emailLogInButton.classList.remove("displayNone");
        emailSignInButton.classList.remove("displayNone");
        googleLogInButton.classList.remove("displayNone");
        userInput.classList.remove("displayNone");
        passwordInput.classList.remove("displayNone");
        passwordInput2.classList.remove("displayNone");
        userInputLabel.classList.remove("displayNone");
        passwordInputLabel.classList.remove("displayNone");
        passwordInput2Label.classList.remove("displayNone");
        
    } else {
        emailLogInButton.classList.add("displayNone");
        emailSignInButton.classList.add("displayNone");
        googleLogInButton.classList.add("displayNone");
        logOutButton.classList.remove("displayNone");
        userInput.classList.add("displayNone");
        passwordInput.classList.add("displayNone");
        passwordInput2.classList.add("displayNone");
        userInputLabel.classList.add("displayNone");
        passwordInputLabel.classList.add("displayNone");
        passwordInput2Label.classList.add("displayNone");
    }
}

googleLogInButton.addEventListener("click", signInWithGoogle);
logOutButton.addEventListener("click", logOut);

async function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            sessionStorage.setItem("activeUser", user.displayName)
            currentUser = user.displayName;
            manageLoginButtons();

        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        printFavBox();
        const uid = user.uid;
        currentUser = user.displayName;
    } else {
        deleteFavBox();
        currentUser = undefined;
    }
});

function logOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
        sessionStorage.removeItem("activeUser");
        sessionStorage.removeItem("userFavs");
        currentUser = undefined;
        manageLoginButtons();
    }).catch((error) => {
    });
}


//email password login

//********** SIGN IN  *************/

emailSignInButton.addEventListener("click", (e) => {
    e.preventDefault();

    let emailSignUp = userInput.value;
    let passwordSignUp = passwordInput.value;
    let passwordSignUp2 = passwordInput2.value;

    if (checkPassword(passwordSignUp) && checkEmail(emailSignUp) && passwordSignUp == passwordSignUp2) {
        createUserWithEmailAndPassword(auth, emailSignUp, passwordSignUp)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                alert("user created");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
            });
    } else if (passwordSignUp != passwordSignUp2) {
        alert("las contraseñas no coinciden");
    } else {
        alert("Introduzca email y/o contraseña válidos");
    }
})

emailLogInButton.addEventListener("click", async (e) => {
    e.preventDefault();
    let emailLogIn = userInput.value;
    let passwordLogIn = passwordInput.value;

    await signInWithEmailAndPassword(auth, emailLogIn, passwordLogIn)
        .then(async (userCredential) => {
            const user = await userCredential.user;
            currentUser = await user.email;
            sessionStorage.setItem("activeUser", user.email)
            alert("User logged in!");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
    manageLoginButtons();
});

//LISTS VIEW

function showOnLoadAnimation() {
    const newLoadingIcon = document.createElement("span");
    newLoadingIcon.setAttribute("id", "loadingIcon");
    newLoadingIcon.classList.add("loading");
    newLoadingIcon.classList.add("style-3");
    listSection.appendChild(newLoadingIcon);
}

const removeOnLoadAnimation = () => {
    const loadingIcon = document.getElementById("loadingIcon");
    loadingIcon.remove()
}

async function fetchLists() {

    if (sessionStorage.getItem("lists") === null) {

        showOnLoadAnimation()

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
                removeOnLoadAnimation();
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
        let newUpdateFrequencyText = document.createTextNode("List updated " + updateRate[k].toLowerCase());
        let newLinkToListText = document.createTextNode("See Best-Sellers");
        newLinkToList.value = urlToTopLists[k];

        newTitle.appendChild(newTitleText);
        newLastInclusion.appendChild(newLastInclusionText);
        newOldestBookDate.appendChild(newOldestBookDateText);
        newUpdateFrequency.appendChild(newUpdateFrequencyText);
        newLinkToList.appendChild(newLinkToListText);

        //numerar lista
        /*     let listNumber = document.createElement("p");
            newCard.appendChild.listNumber;
            listNumber.innerHTML = k;  */

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
            sessionStorage.setItem("bookList", JSON.stringify(data.results.books));
        })
}

function printBookCards() {
    const booksInList = JSON.parse(sessionStorage.getItem("bookList"));

    for (let l = 0; l < booksInList.length; l++) {
        const newBookCard = document.createElement("article");
        newBookCard.classList.add("book-card");
        newBookCard.classList.add("fade-in");
        let newBookTitle = document.createElement("h3");
        let newBookCover = document.createElement("img");
        let newBookRankPosition = document.createElement("p");
        let newBookWeeksOnList = document.createElement("p");
        let newBookDescription = document.createElement("p");
        let linkToPurchaseBook = document.createElement("a");

        newBookTitle.innerHTML = booksInList[l].title;
        newBookCover.setAttribute("src", booksInList[l].book_image);
        newBookWeeksOnList.innerHTML = `Weeks on List: ${booksInList[l].weeks_on_list}`;
        newBookRankPosition.innerHTML = `Rank # ${booksInList[l].rank}`;
        newBookDescription.innerHTML = `Description: ${booksInList[l].description}`;
        linkToPurchaseBook.innerHTML = "Buy in Amazon";
        linkToPurchaseBook.setAttribute("href", booksInList[l].amazon_product_url);
        linkToPurchaseBook.setAttribute("target", "_blank");
        linkToPurchaseBook.classList.add("amazonButton");

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
    let elements = document.querySelectorAll(".book-card");
    for (let n = 0; n < elements.length; n++) {
        document.getElementById("favNum" + n).remove();
    }
}

async function showBooksInList(url) {
    clearListSection();
    showOnLoadAnimation();
    await fetchBooks(url);
    removeOnLoadAnimation();
    printReturnButton();
    printBookCards();
    if (currentUser != undefined) {
        printFavBox();
    }
    await checkUserFavourites(currentUser);
}

// *************FAVOURITES MANAGEMENT*************

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
        newFavouriteLabel.innerHTML = "Save as favourite";
        newFavouriteLabel.appendChild(newFavouriteInput);
        newFavouriteInput.addEventListener("input", async e => {

            if (e.target.checked == true) {
                const selectedBook = {
                    "title": e.target.parentNode.childNodes[0].innerHTML,
                    "image": e.target.parentNode.childNodes[1].src,
                    "weeksOnList": e.target.parentNode.childNodes[2].innerHTML.slice(15),
                    "rank": e.target.parentNode.childNodes[3].innerHTML.slice(7),
                    "description": e.target.parentNode.childNodes[4].innerHTML.slice(13),
                    "amazonLink": e.target.parentNode.childNodes[5].href
                };
                await updateFavList(selectedBook, currentUser);

            } else {
                const selectedBook = {
                    "title": e.target.parentNode.childNodes[0].innerHTML,
                    "image": e.target.parentNode.childNodes[1].src,
                    "weeksOnList": e.target.parentNode.childNodes[2].innerHTML.slice(15),
                    "rank": e.target.parentNode.childNodes[3].innerHTML.slice(7),
                    "description": e.target.parentNode.childNodes[4].innerHTML.slice(13),
                    "amazonLink": e.target.parentNode.childNodes[5].href
                };
                await removeFromFavList(selectedBook, currentUser);
                alert(currentUser + " has eliminado el titulo: " + selectedBook.title + " de tu lista de favoritos")
            }
        })
        bookCards[m].appendChild(newFavouriteLabel);
        bookCards[m].appendChild(newFavouriteInput);

    }
}

async function updateFavList(newBook, document) {
    //first checks whether the user doc already exists in firebase
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

async function getUserFavourites(document) {
    const docRef = doc(db, "favourites", document);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        sessionStorage.setItem("userFavs", JSON.stringify(docSnap.data().favs));
        return docSnap.data().favs;
    }
}

async function checkUserFavourites(user) {
    const userFavs = await getUserFavourites(user);
    const userFavsTitles = [];
    for (let h = 0; h < userFavs.length; h++) {
        userFavsTitles.push(userFavs[h].title);
    }

    if (userFavsTitles) {
        const bookCards = document.querySelectorAll(".book-card")
        for (let p = 0; p < bookCards.length; p++) {
            let book = bookCards[p].childNodes[0].innerHTML;
            let checked = bookCards[p].childNodes[6].checked;
            if (userFavsTitles.indexOf(book) !== -1) {
                bookCards[p].childNodes[6].checked = true;
            }
        }
    }
}

manageLoginButtons();
printListsCards();




