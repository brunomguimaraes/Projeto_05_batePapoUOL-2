const messagesSection = document.querySelector(".chat-room ul");
const initialScreen = document.querySelector(".initial-screen");
const sidebar = document.querySelector(".sidebar");
const API_LINKS = {
    messages:"https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages" ,
    participants: "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants",
    status:"https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status"
}
let mostRecentMessageChecker;
let userName;
let messageInfo = {
    recipient: "",
    visibility: ""
}

function checkUserName(thisButton) {
    animateButton (thisButton);
    userName = initialScreen.querySelector("input").value;
    errorMessageArea = initialScreen.querySelector(".error-message")
    errorMessageArea.innerHTML = ""
    if (userName === ""){
        errorMessageArea.innerHTML = "Por favor, digite um nome de usuário"
        return
    }
    let userNamePromise = axios.post(API_LINKS.participants,{name:userName})
    userNamePromise.then(openChatRoom);

}

function openChatRoom () {
    initialScreen.classList.add("disabled");
    setInterval(searchChatRoomMessages,3000);
    setInterval(searchChatRoomParticipants,10000);
    setInterval(keepConnection,5000);
}

function userNameNotAvailable (Answer) {
}

function keepConnection () {
    axios.post(API_LINKS.status,{name:userName})
}
function animateButton (thisButton) {
    thisButton.classList.add("selected");
    setTimeout(function () {
        thisButton.classList.remove("selected");
    },80)
}

function sidebarSwitch () {
    const darkScreen = document.querySelector(".dark-screen");
    sidebar.classList.toggle("active");
    darkScreen.classList.toggle("active");
}

function searchChatRoomMessages () {
    let messagesPromise = axios.get(API_LINKS.messages);
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
        if (listItemClass !== `private-message` || messages[i].from === userName || messages[i].to === userName || messages[i].to === "Todos") {
            messagesSection.innerHTML += completeMessage
        }
    }
    
    let activeMostRecentMessage = messagesSection.querySelector("li:last-of-type");
    if (!mostRecentMessageChecker || mostRecentMessageChecker.innerHTML !== activeMostRecentMessage.innerHTML) {
        activeMostRecentMessage.scrollIntoView();
    }
    mostRecentMessageChecker = activeMostRecentMessage;
}

function selectSidebarOption(element){
    selectedSidebarList = element.parentNode;
    previouslySelectedItem = selectedSidebarList.querySelector(".selected");
    if (previouslySelectedItem) {
        previouslySelectedItem.classList.remove("selected");
    }
    element.classList.add("selected");
    updateInputSendingMessage(element,selectedSidebarList);
}

function updateInputSendingMessage(element,selectedSidebarList) {
    if (selectedSidebarList.classList.contains("online-contacts")){
        messageInfo.recipient = element.querySelector("span").innerHTML
    } else {
        if (element.querySelector("span").innerText === "Reservadamente") {
            messageInfo.visibility = " (reservadamente)"
        } else {
            messageInfo.visibility = ""
        }
    }
    const SendingMessageArea = document.querySelector("footer .message-recipient");
    SendingMessageArea.innerHTML = `Enviando para ${messageInfo.recipient}${messageInfo.visibility}`
}

function searchChatRoomParticipants () {
    let participantsPromise = axios.get(API_LINKS.participants);
    participantsPromise.then(loadChatRoomParticipants);
}

function loadChatRoomParticipants (participantsAnswer) {
    let onlineParticipants = participantsAnswer.data;
    onlineParticipants.unshift({name:"Todos"});
    let ionIcon;
    let participantClass;
    const participantsArea = sidebar.querySelector(".online-contacts")
    participantsArea.innerHTML = `<li>Escolha um contato para enviar mensagem:</li>`;
    for (let i = 0 ; i < onlineParticipants.length; i++) {
        if (i === 0) {
            ionIcon = "people";
        } else {
            ionIcon = "person-circle";            
        }
        if (onlineParticipants[i].name === messageInfo.recipient) {
            participantClass = `class="selected"`
        } else {
            participantClass = ""
        }
        participantsArea.innerHTML += `
        <li ${participantClass} onclick="selectSidebarOption(this)">
            <div>
                <ion-icon name=${ionIcon}></ion-icon>
                <span>${onlineParticipants[i].name}</span>
            </div>
            <ion-icon class = "checkmark" name="checkmark-sharp"></ion-icon>              
        </li>`;   
    }
    let selectedParticipant = participantsArea.querySelector(".selected")
    if(!selectedParticipant){
        let sendToAllParticipants = participantsArea.querySelector(":nth-child(2)")
        selectSidebarOption(sendToAllParticipants);
    }
}