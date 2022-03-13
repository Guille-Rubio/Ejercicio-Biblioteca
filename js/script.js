//see if it is possible to destructure the data

//arrays for booklists
const genreList = [];
const urlToTopLists = [];
const oldestPublishedBooksDates = [];
const lastInclusionDates = [];
const updateRate = [];
const linksToLists = [];

const rootListUrl = "https://api.nytimes.com/svc/books/v3//lists/"
const nytAPIkey = "api-key=gAsn7wtEwzMskqOVdSlE3u1GA5ZHmAH4"

const listSection = document.getElementById("list-section");

//******** LISTS **********/

//Fetch book lists and details and store them in arrays

async function fetchLists() {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3//lists/names.json?${nytAPIkey}`);
    const data = await response.json()
        .then(data => {

            for (let i = 0; i < data.results.length; i++) {
                genreList.push(data.results[i].list_name);
                oldestPublishedBooksDates.push(data.results[i].oldest_published_date);
                lastInclusionDates.push(data.results[i].newest_published_date);
                updateRate.push(data.results[i].updated);
                linksToLists.push(data.results[i].list_name_encoded)
            }
            console.log(data.results);
        }
    )
}

//Create lists cards

async function createListCards() {
    for (let k = 0; k < genreList.length; k++) {
        let listUrl = rootListUrl + linksToLists[k] + ".json?" + nytAPIkey;
        urlToTopLists.push(listUrl);

        let newCard = document.createElement("article");
        newCard.setAttribute("class", "card");

        let newTitle = document.createElement("h3");
        let newLastInclusion = document.createElement("p");
        let newOldestBookDate = document.createElement("p");
        let newUpdateFrequency = document.createElement("p");
        let newLinkToList = document.createElement("a");

        newCard.appendChild(newTitle);
        newCard.appendChild(newLastInclusion);
        newCard.appendChild(newOldestBookDate);
        newCard.appendChild(newUpdateFrequency);
        newCard.appendChild(newLinkToList);

        let newTitleText = document.createTextNode(genreList[k]);
        let newLastInclusionText = document.createTextNode("Last book included on: " + lastInclusionDates[k]);
        let newOldestBookDateText = document.createTextNode("First book added on: " + oldestPublishedBooksDates[k]);
        let newUpdateFrequencyText = document.createTextNode("List updated " + updateRate[k]);
        let newLinkToListText = document.createTextNode("See Best-Sellers");

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

async function addLinksToGenreCard() {
    const cardLinks = document.querySelectorAll(".card>a");
    for (i = 0; i < cardLinks.length; i++) {
        //console.log(urlToTopLists[i])
        //cardLinks[i].setAttribute("href", urlToTopLists[i])
        cardLinks[i].addEventListener("click", async (event) => {
            console.log(event);
            showSecondView();
        })
    }//PENDIENTE PASAR URL DE API DE LISTA CORRESPONDIENTE A SEGUNDA VISTA
}

async function printListsCards() {
    listSection.innerHTML = "";
    await fetchLists();
    await createListCards();
    await addLinksToGenreCard();
}

printListsCards();


//********* Books ***********/

function clearListSection() {
    listSection.innerHTML = "";
}

function printReturnButton() {
    const returnButton = document.createElement("button");
    returnButton.innerHTML = "Return to Book Lists";
    listSection.appendChild(returnButton);
    returnButton.addEventListener("click", () => {
        listSection.innerHTML = "";
        printListsCards();
    })
}

//API fetch
async function fetchTopListAPI(url) {
    const response = await fetch(url);
    const data = await response.json()
        .then(data => { sessionStorage.setItem("bookList", JSON.stringify(data.results.books)) })
}
// Pintar tarjetas

function printBookCards() {
    const booksInList = JSON.parse(sessionStorage.getItem("bookList"))

    for (i = 0; i < booksInList.length; i++) {
        const newBookCard = document.createElement("article");
        newBookCard.classList.add("book-card")
        let newBookTitle = document.createElement("h3");
        let newBookCover = document.createElement("img");
        let newBookWeeksOnList = document.createElement("p");
        let newBookDescription = document.createElement("p");
        
        let newBookRankPosition = document.createElement("p");
        let linkToPurchaseBook = document.createElement("a");

        newBookTitle.innerHTML = booksInList[i].title;
        newBookCover.setAttribute("src", booksInList[i].book_image)
        newBookWeeksOnList.innerHTML = `Weeks on List: ${booksInList[i].weeks_on_list}`;
        newBookDescription.innerHTML = `Description: ${booksInList[i].description}`;
        newBookRankPosition.innerHTML = `Rank # ${booksInList[i].rank}`;
        linkToPurchaseBook.innerHTML = "Buy in Amazon";
        linkToPurchaseBook.setAttribute("href",booksInList[i].amazon_product_url);
        linkToPurchaseBook.setAttribute("target","_blank");

        newBookCard.appendChild(newBookCover)
        newBookCard.appendChild(newBookWeeksOnList)
        newBookCard.appendChild(newBookDescription)
        newBookCard.appendChild(newBookTitle)
        newBookCard.appendChild(newBookRankPosition)
        newBookCard.appendChild(linkToPurchaseBook)

        listSection.appendChild(newBookCard);
    }
}




async function showSecondView(url) {
    clearListSection();
    printReturnButton();
    await fetchTopListAPI(url)
    await printBookCards()

}


    //books displayed following the list order



    //topBook card includes

    //cover

    //weeks on list

    //Description

    //title  and ranking position

    //link to purchase in amazon (open in a new tab)

