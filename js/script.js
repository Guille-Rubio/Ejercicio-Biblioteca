const booksLists = [];
const oldestPublishedBooksDates = [];
const lastInclusionDates = [];
const updateRate = [];
const linksToLists = [];
const rootListUrl = "https://api.nytimes.com/svc/books/v3//lists/"
const nytAPIkey = "*****************"



async function fetchAPI() {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3//lists/names.json?${nytAPIkey}`);
    const data = await response.json()
        .then(data => {

            for (let i = 0; i < data.results.length; i++) {
                booksLists.push(data.results[i].list_name);
                oldestPublishedBooksDates.push(data.results[i].oldest_published_date);
                lastInclusionDates.push(data.results[i].newest_published_date);
                updateRate.push(data.results[i].updated);
                linksToLists.push(data.results[i].list_name_encoded)
            }
            console.log(data.results);
        }
        )
}

const listSection = document.getElementById("list-section");


//Create cards

async function createCards() {
    for (let k = 0; k < booksLists.length; k++) {
        let listUrl = rootListUrl + linksToLists[k] + ".json?" + nytAPIkey;

        let newCard = document.createElement("article");
        newCard.setAttribute("class", "card");

        let newTitle = document.createElement("h3");
        let newLastInclusion = document.createElement("p");
        let newOldestBookDate = document.createElement("p");
        let newUpdateFrequency = document.createElement("p");
        let newLinkToList = document.createElement("a");
        newLinkToList.setAttribute("href",listUrl)

        newCard.appendChild(newTitle);
        newCard.appendChild(newLastInclusion);
        newCard.appendChild(newOldestBookDate);
        newCard.appendChild(newUpdateFrequency);
        newCard.appendChild(newLinkToList);

        let newTitleText = document.createTextNode(booksLists[k]);
        let newLastInclusionText = document.createTextNode("Last book included on: " + lastInclusionDates[k]);
        let newOldestBookDateText = document.createTextNode("First book added on: " + oldestPublishedBooksDates[k]);
        let newUpdateFrequencyText = document.createTextNode("List updated " + updateRate[k]);
        let newLinkToListText = document.createTextNode("link to list");

        //Añadir elementos a tarjeta
        newTitle.appendChild(newTitleText);
        newLastInclusion.appendChild(newLastInclusionText);
        newOldestBookDate.appendChild(newOldestBookDateText);
        newUpdateFrequency.appendChild(newUpdateFrequencyText);
        newLinkToList.appendChild(newLinkToListText);


        listSection.appendChild(newCard);

        //Event listener

        newLinkToList.addEventListener("click",/*funcion pintar libros de lista*/)
    }
}

async function printCards() {

    await fetchAPI();
    await createCards();

}

printCards();



