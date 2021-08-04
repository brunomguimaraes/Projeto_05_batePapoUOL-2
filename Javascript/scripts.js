const messagesSection = document.querySelector(".chat-room ul");
let mostRecentMessageChecker;

function sidebarSwitch () {
    const sidebar = document.querySelector(".sidebar");
    const darkScreen = document.querySelector(".dark-screen");
    sidebar.classList.toggle("active");
    darkScreen.classList.toggle("active");
}

function searchChatRoomMessages () {
    let messagesPromise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages");
    messagesPromise.then(loadChatRoomMessages);
}

function loadChatRoomMessages (messagesAnswer) {
    const messages = messagesAnswer.data
    messagesSection.innerHTML = ``
    for (let i = 0 ; i < messages.length ; i++) {
        let messageMiddleSection = ``
        let listItemClass;
        if (messages[i].type === "status") {
            listItemClass = `status`;
            messageMiddleSection = `<span class = "contact">${messages[i].from} </span>`;
        } else if (messages[i].type === "private_message") {
            listItemClass = `private-message`;
            messageMiddleSection = `
            <span class = "contact">${messages[i].from} </span>
            reservadamente para 
            <span class = "contact">${messages[i].to}: </span>`
        } else if (messages[i].type === "message") {
            listItemClass = `message`;
            messageMiddleSection = `
            <span class = "contact">${messages[i].from} </span>
            para 
            <span class = "contact">${messages[i].to}: </span>`
        }
        let completeMessage = `
        <li class = ${listItemClass}>
            <span class = "time">(${messages[i].time})</span>
            ${messageMiddleSection}
            ${messages[i].text}
        </li>`
        messagesSection.innerHTML += completeMessage
    }
    
    let activeMostRecentMessage = messagesSection.querySelector("li:last-of-type");
    if (!mostRecentMessageChecker || mostRecentMessageChecker.innerHTML !== activeMostRecentMessage.innerHTML) {
        activeMostRecentMessage.scrollIntoView();
    }
    mostRecentMessageChecker = activeMostRecentMessage;
}

function selectOption(ThisElement){
    selectedUnorderedList = ThisElement.parentNode;
    selectedItem = selectedUnorderedList.querySelector(".selected");
    if (selectedItem) {
        selectedItem.classList.remove("selected");
    }
    ThisElement.classList.add("selected")
}

searchChatRoomMessages();
setInterval(searchChatRoomMessages,3000);