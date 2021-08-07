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
let pageStatus = {
    connection: false,
    participants: false,
    messages: false
}
let messageInfo = {
    recipient: "",
    visibility: "",
    text: "",
    type: "message"
}

function checkUserName(thisButton) {
    animateButton (thisButton);
    userName = initialScreen.querySelector("input").value;
    const errorMessageArea = initialScreen.querySelector(".error-message")
    errorMessageArea.innerHTML = ""
    if (userName === ""){
        errorMessageArea.innerHTML = "Por favor, digite um nome de usuário"
        return
    }
    let userNamePromise = axios.post(API_LINKS.participants,{name:userName})
    userNamePromise.then(openChatRoom);
    userNamePromise.catch(printInitialScreenError);
}

function printInitialScreenError(error){
    let errorMessage;
    if (error.response.status === 400) {
        errorMessage = "Ops... parece que houve um problema! Já existe alguém com esse nome na sala!"
    }
    initialScreen.querySelector(".error-message").innerHTML = errorMessage

}

function startLoadingScreen () {
   const initialScreenInputItems = initialScreen.querySelector(".input-screen");
   const LoadingScreen = initialScreen.querySelector(".loading-screen")
   initialScreenInputItems.classList.add("disabled");
   LoadingScreen.classList.remove("disabled");
}

function isLoadingComplete () {
    if (pageStatus.connection && pageStatus.messages && pageStatus.participants) {
        return true;
    }
    return false;
}

function stopLoadingPage () {
    if (isLoadingComplete()){
        initialScreen.classList.add("disabled");
    }
}

function openChatRoom () {
    startLoadingScreen ();
    setInterval(searchChatRoomMessages,3000);
    setInterval(searchChatRoomParticipants,10000);
    setInterval(keepConnection,5000);
    messageInput = document.querySelector("footer input");
    messageInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            sendMessage ()
        }
    });
}

function keepConnection () {
    let connectionStatus = axios.post(API_LINKS.status,{name:userName});
    connectionStatus.then(function () {
        if (pageStatus.connection === false) {
            pageStatus.connection = true;
            stopLoadingPage();
        }
    })
    connectionStatus.catch(reloadPage);
}

function reloadPage(error) {
    alert ("Nos desculpe! Parece que ocorreu um erro :/ Vamos reiniciar a página, por favor tente entrar na sala novamente")
    window.location.reload()
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
    messagesPromise.catch(reloadPage)

}

function loadChatRoomMessages (messagesAnswer) {
    const downloadedMessages = messagesAnswer.data
    messagesSection.innerHTML = ``
    for (let i = 0 ; i < downloadedMessages.length ; i++) {
        if (downloadedMessages[i].type !== "private_message" || downloadedMessages[i].from === userName || downloadedMessages[i].to === userName || downloadedMessages[i].to === "Todos") {
            let messageMiddleSection = ``
            let listItemClass;
            if (downloadedMessages[i].type === "status") {
                listItemClass = `status`;
                messageMiddleSection = `<span class = "contact">${downloadedMessages[i].from} </span>`;
            } else if (downloadedMessages[i].type === "private_message") {
                listItemClass = `private-message`;
                messageMiddleSection = `
                <span class = "contact">${downloadedMessages[i].from} </span>
                reservadamente para 
                <span class = "contact">${downloadedMessages[i].to}: </span>`
            } else if (downloadedMessages[i].type === "message") {
                listItemClass = `message`;
                messageMiddleSection = `
                <span class = "contact">${downloadedMessages[i].from} </span>
                para 
                <span class = "contact">${downloadedMessages[i].to}: </span>`
            }
            let completeMessage = `
            <li class = ${listItemClass}>
                <span class = "time">(${downloadedMessages[i].time})</span>
                ${messageMiddleSection}
                ${downloadedMessages[i].text}
            </li>`
            messagesSection.innerHTML += completeMessage
        }
    }
    
    let activeMostRecentMessage = messagesSection.querySelector("li:last-of-type");
    if (!mostRecentMessageChecker || mostRecentMessageChecker.innerHTML !== activeMostRecentMessage.innerHTML) {
        activeMostRecentMessage.scrollIntoView();
    }
    mostRecentMessageChecker = activeMostRecentMessage;
    if (pageStatus.messages === false) {
        pageStatus.messages = true;
        stopLoadingPage();
    }
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
            messageInfo.type = "private_message"
        } else {
            messageInfo.visibility = "";
            messageInfo.type = "message"
        }
    }
    const SendingMessageArea = document.querySelector("footer .message-recipient");
    SendingMessageArea.innerHTML = `Enviando para ${messageInfo.recipient}${messageInfo.visibility}`
}

function searchChatRoomParticipants () {
    let participantsPromise = axios.get(API_LINKS.participants);
    participantsPromise.then(loadChatRoomParticipants);
    participantsPromise.catch(reloadPage)
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
    if (pageStatus.participants === false) {
        pageStatus.participants = true;
        stopLoadingPage();
    }
}

function sendMessage () {
    messageInfo.text = document.querySelector("footer input").value;
    document.querySelector("footer input").value = ""
    if (messageInfo.text !== "") {
        let sentMessage = axios.post(API_LINKS.messages,{
        from: userName,
        to: messageInfo.recipient,
        type: messageInfo.type,
        text: messageInfo.text
        })
        sentMessage.then(searchChatRoomMessages);
        sentMessage.catch(reloadPage);

    } else {
        alert("Sua mensagem precisa conter algum texto!");
    }
}

const usernameInput =  initialScreen.querySelector("input");
usernameInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        checkUserName(initialScreen.querySelector("button"));
    }
});