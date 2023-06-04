import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, runTransaction } from                        "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
                        databaseURL:"https://realtime-database-dcd1a-default-rtdb.firebaseio.com/"}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDb = ref(database,"endorsements")
const endorsementInputFieldEl = document.getElementById("endorsement-input-field")
const fromInputFieldEl = document.getElementById("from-input-field")
const toInputFieldEl = document.getElementById("to-input-field")
const publishButtonEl = document.getElementById("publish-button")
const endorsementsEl = document.getElementById("endorsements-list")
const itemsArray = []

/**These are complete Event Listeners */

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like)
    } else if(e.target.id === 'publish-button'){
        publishButtonClick()
    }
    if(e.target.id === "endorsement-input-field" || e.target.id === "from-input-field" ||  e.target.id === "to-input-field" ){
        endorsementInputFieldEl.placeholder = "Enter endorsement here";
        fromInputFieldEl.placeholder = "From";
        toInputFieldEl.placeholder = "To"
       
    }
    
})

/** input fields  */

 function publishButtonClick() {
    let endorsementInputValue = endorsementInputFieldEl.value
    let fromInputValue = fromInputFieldEl.value
    let toInputValue = toInputFieldEl.value
    
    if(endorsementInputValue&&fromInputValue&&toInputValue){
                push(endorsementsInDb,{
                             From: fromInputValue,
                             To:toInputValue,
                             endorsement: endorsementInputValue,
                             isLiked: false,
                             likes: 0,
                            
                         } )
    
      clearInputFieldsEl()
    } else if(!endorsementInputValue || !fromInputValue || !toInputValue){
        toInputFieldEl.placeholder = "Enter to"
        fromInputFieldEl.placeholder = "Enter from"
        endorsementInputFieldEl.placeholder = "Please enter endorsement"
    }
}

function clearInputFieldsEl() {
     endorsementInputFieldEl.value = ""
     fromInputFieldEl.value = ""
     toInputFieldEl.value = ""
} 



/**This retrieves realtime data from Db */

onValue(endorsementsInDb, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArrayFromDB = Object.entries(snapshot.val())
        clearEndorsementsEl()
        itemsArrayFromDB.forEach(function(itemsDb){
            let currentItem = itemsDb
            appendEndorsementsEl(currentItem)
            }) 
        } else {
            endorsementsEl.innerHTML = "No items here... yet"
        }
})

/**  Data into HTML */

function appendEndorsementsEl(items){
    let newEl = document.createElement("li")
    let uuid = items[0]
    let From = items[1].From
    let endorsement = items[1].endorsement 
    let To = items[1].To
    let isLiked = items[1].isLiked
    let likes = items[1].likes
    let likeIconClass = ''
        
    if (items[1].isLiked){
        likeIconClass = 'liked'
        } 
    let endorsementFeed = `
        <div class= "endorsements-container">
            <div class= "endorsement-inner">
                <h3 class= "users">To ${To}</h3>
                <p>${endorsement}</p>
                <span class= "endorsement-likes">
                    <h3 class= "users">From ${From}</h3>
                    <span class="endorsement-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${uuid}"
                    ></i>
                    ${likes}
                    </span>
                </span>
            </div>
        </div> 
        `
    newEl.innerHTML = endorsementFeed
    endorsementsEl.append(newEl)
}

function clearEndorsementsEl() {
    endorsementsEl.innerHTML = ""
}

/** Add/remove likes to db */

function handleLikeClick(uid) { 
    const dbRef = ref(database);
    const postRef = ref(database, `endorsements/${uid}`);

    runTransaction(postRef, (uid) => {
        if (uid) {
            if (uid.isLiked) {
                uid.likes--;
                uid.isLiked = false;
            } else {uid.likes++;
                if (!uid.likes) {
                uid.likes = {};
                }
                uid.isLiked = true;
            }
        }
        return uid;
    });
}
 