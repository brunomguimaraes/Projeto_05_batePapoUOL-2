const messagesSection = document.querySelector(".chat-room ul");
const initialScreen = document.querySelector(".initial-screen");
const sidebar = document.querySelector(".sidebar");
let mostRecentMessageChecker;
let userName;
const pageStatus = {
    connection: false,
    participants: false,
    messages: false
}
const messageInfo = {
    recipient: {name:"", ionIcon:""},
    visibility: "",
    text: "",
    type: "message",
}
const API_LINKS = {
    messages: "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages" ,
    participants: "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants",
    status: "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status"
}


function isLoadingComplete() {
    if (pageStatus.connection && pageStatus.messages && pageStatus.participants) {
        return true;
    }
    return false;
}

function stopLoadingPage() {
    if (isLoadingComplete()) {
        initialScreen.classList.add("disabled");
    }
}

function reloadPage(error) {
    alert("Nos desculpe! Parece que ocorreu um erro :/ Vamos reiniciar a página, por favor tente entrar na sala novamente");
    window.location.reload();
}

function keepConnection() {
    const connectionStatus = axios.post(API_LINKS.status, {name:userName});
    connectionStatus.then(function () {
        if (pageStatus.connection === false) {
            pageStatus.connection = true;
            stopLoadingPage();
        }
    })
    connectionStatus.catch(reloadPage);
}

function shouldUserReadThisMessage(messageObject) {
    if (messageObject.type !== "private_message" || messageObject.from === userName || messageObject.to === userName || messageObject.to === "Todos") {
        return true;
    }
    return false;
}

function createMessage(messageObject) {
    let completeMessage;
    if (messageObject.type === "status") {
        completeMessage = `<li class = "status">
        <span class = "time">(${messageObject.time})</span>
        <span class = "contact">${messageObject.from} </span>
        ${messageObject.text}
    </li>`;
    } else if (messageObject.type === "private_message") {
        completeMessage = `<li class = "private-message">
        <span class = "time">(${messageObject.time})</span>
        <span class = "contact">${messageObject.from} </span>
        reservadamente para 
        <span class = "contact">${messageObject.to}: </span>
        ${messageObject.text}
    </li>`;
    } else if (messageObject.type === "message") {
        completeMessage = `<li class = "message">
        <span class = "time">(${messageObject.time})</span>
        <span class = "contact">${messageObject.from} </span>
        para 
        <span class = "contact">${messageObject.to}: </span>
        ${messageObject.text}
    </li>`;
    }    
    return completeMessage;
}

function scrollDownIfNewMessage() {
    const activeMostRecentMessage = messagesSection.querySelector("li:last-of-type");
    if (!mostRecentMessageChecker || mostRecentMessageChecker.innerHTML !== activeMostRecentMessage.innerHTML) {
        activeMostRecentMessage.scrollIntoView();
    }
    mostRecentMessageChecker = activeMostRecentMessage;
}

function loadChatRoomMessages(messagesAnswer) {
    const downloadedMessages = messagesAnswer.data;
    messagesSection.innerHTML = ``;
    for (let i = 0 ; i < downloadedMessages.length ; i++) {
        if (shouldUserReadThisMessage(downloadedMessages[i])) {
            const completeMessage = createMessage(downloadedMessages[i]);
            messagesSection.innerHTML += completeMessage;
        }
    }
    scrollDownIfNewMessage();
    if (pageStatus.messages === false) {
        pageStatus.messages = true;
        stopLoadingPage();
    }
}

function searchChatRoomMessages() {
    const messagesPromise = axios.get(API_LINKS.messages);
    messagesPromise.then(loadChatRoomMessages);
    messagesPromise.catch(reloadPage);
}

function updateInputSendingMessage(selectedSidebarOption,selectedSidebarList) {
    if (selectedSidebarList.classList.contains("online-contacts")) {
        messageInfo.recipient.name = selectedSidebarOption.querySelector("span").innerHTML;
    } else {
        if (selectedSidebarOption.querySelector("span").innerText === "Reservadamente") {
            messageInfo.visibility = " (reservadamente)";
            messageInfo.type = "private_message";
        } else {
            messageInfo.visibility = "";
            messageInfo.type = "message";
        }
    }
    const SendingMessageArea = document.querySelector("footer .message-recipient");
    SendingMessageArea.innerHTML = `Enviando para ${messageInfo.recipient.name}${messageInfo.visibility}`;
}

function reloadVisibilityBar(selectedSidebarOption) {
    const sendToAllParticipants = sidebar.querySelector(".online-contacts :nth-child(2)");
    const privateMessageOption = sidebar.querySelector(".visibility-bar :nth-child(3)");
    const publicMessageOption = sidebar.querySelector(".visibility-bar :nth-child(2)");
    if (selectedSidebarOption === sendToAllParticipants) {
        privateMessageOption.classList.remove("selected");
        privateMessageOption.classList.add("disabled");
        activateSidebarOption(publicMessageOption);
    } else if (selectedSidebarOption !== publicMessageOption) {
        privateMessageOption.classList.remove("disabled");
    }
}

function activateSidebarOption(selectedSidebarOption) {
    if (!selectedSidebarOption.classList.contains("disabled")) {
        selectedSidebarList = selectedSidebarOption.parentNode;
        const previouslySelectedItem = selectedSidebarList.querySelector(".selected");
        if (previouslySelectedItem) {
            previouslySelectedItem.classList.remove("selected");
        }
        selectedSidebarOption.classList.add("selected");
        if (selectedSidebarList.classList.contains("online-contacts")) {
            messageInfo.recipient.ionIcon = selectedSidebarOption.querySelector("div ion-icon").name;
        }
        updateInputSendingMessage(selectedSidebarOption,selectedSidebarList);
        reloadVisibilityBar(selectedSidebarOption);
    }
}

function isAnyParticipantSelected(participantsArea) {
    const selectedParticipant = participantsArea.querySelector(".selected");
    if(!selectedParticipant) {
        if (messageInfo.recipient.name !== "") {
            alert(`O usuário ${messageInfo.recipient.name} saiu da sala!`);
        }
        const sendToAllParticipants = participantsArea.querySelector(":nth-child(2)");
        activateSidebarOption(sendToAllParticipants);
    }
}

function selectParticipantIcon(index) {
    let ionIcon;
    if (index === 0) {
        ionIcon = "people";
    } else {
        ionIcon = "person-circle";            
    }
    return ionIcon;
}

function selectParticipantClass(participant,participantIonIcon) {
    let participantClass;
    if (participant.name === messageInfo.recipient.name && messageInfo.recipient.ionIcon === participantIonIcon) {
        participantClass = `class="selected"`;
    } else {
        participantClass = "";
    }
    if (participant.name === userName && participantIonIcon === "person-circle") {
        participantClass = `class="disabled"`;
    }
    return participantClass;
}


function loadChatRoomParticipants(participantsAnswer) {
    const onlineParticipants = participantsAnswer.data;
    onlineParticipants.unshift({name:"Todos"});
    const participantsArea = sidebar.querySelector(".online-contacts");
    participantsArea.innerHTML = `<li>Escolha um contato para enviar mensagem:</li>`;
    for (let i = 0 ; i < onlineParticipants.length ; i++) {
        const participantIonIcon = selectParticipantIcon(i);
        const participantClass = selectParticipantClass(onlineParticipants[i],participantIonIcon);
        participantsArea.innerHTML += `
        <li ${participantClass} onclick="activateSidebarOption(this)">
            <div>
                <ion-icon name=${participantIonIcon}></ion-icon>
                <span>${onlineParticipants[i].name}</span>
            </div>
            <ion-icon class = "checkmark" name="checkmark-sharp"></ion-icon>              
        </li>`;   
    }
    isAnyParticipantSelected(participantsArea);
    if (pageStatus.participants === false) {
        pageStatus.participants = true;
        stopLoadingPage();
    }
}

function searchChatRoomParticipants() {
    const participantsPromise = axios.get(API_LINKS.participants);
    participantsPromise.then(loadChatRoomParticipants);
    participantsPromise.catch(reloadPage);
}


function startLoadingScreen() {
    const initialScreenInputItems = initialScreen.querySelector(".input-screen");
    initialScreenInputItems.classList.add("disabled");
    const LoadingScreen = initialScreen.querySelector(".loading-screen");
    LoadingScreen.classList.remove("disabled");
}

function openChatRoom() {
    startLoadingScreen();
    setInterval(searchChatRoomMessages,3000);
    setInterval(searchChatRoomParticipants,10000);
    setInterval(keepConnection,5000);
}

function printInitialScreenError(error) {
    let errorMessage;
    if (error.response.status === 400) {
        errorMessage = "Ops... parece que houve um problema! Já existe alguém com esse nome na sala!";
    } else {
        errorMessage = "Ops... parece que houve um problema! Por favor, tente novamente em alguns minutos";
    }
    initialScreen.querySelector(".error-message").innerHTML = errorMessage;
}

function animateButton(thisButton) {
    thisButton.classList.add("selected");
    setTimeout(function () {
        thisButton.classList.remove("selected");
    },80)
}

function checkUserName(thisButton) {
    animateButton(thisButton);
    userName = initialScreen.querySelector("input").value;
    const errorMessageArea = initialScreen.querySelector(".error-message");
    errorMessageArea.innerHTML = "";
    if (userName === "") {
        errorMessageArea.innerHTML = "Por favor, digite um nome de usuário";
        return;
    }
    const userNamePromise = axios.post(API_LINKS.participants, {name:userName});
    userNamePromise.then(openChatRoom);
    userNamePromise.catch(printInitialScreenError);
}

function sidebarSwitch() {
    const darkScreen = document.querySelector(".dark-screen");
    sidebar.classList.toggle("active");
    darkScreen.classList.toggle("active");
}

function sendMessage(thisButton) {
    animateButton(thisButton);
    messageInfo.text = document.querySelector("footer input").value;
    document.querySelector("footer input").value = "";
    if (messageInfo.text !== "") {
        const sentMessage = axios.post(API_LINKS.messages, {
        from: userName,
        to: messageInfo.recipient.name,
        type: messageInfo.type,
        text: messageInfo.text
        });
        sentMessage.then(searchChatRoomMessages);
        sentMessage.catch(reloadPage);

    } else {
        alert("Sua mensagem precisa conter algum texto!");
    }
}

function activateInputsWithEnterKey() {
    const usernameInput =  initialScreen.querySelector("input");
    usernameInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            checkUserName(initialScreen.querySelector("button"));
        }
    });
    const messageInput = document.querySelector("footer input");
    messageInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            sendMessage(document.querySelector("footer button"));
        }
    });
}

activateInputsWithEnterKey();