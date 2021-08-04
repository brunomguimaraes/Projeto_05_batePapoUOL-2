

function sidebarSwitch () {
    const sidebar = document.querySelector(".sidebar");
    const darkScreen = document.querySelector(".dark-screen");
    sidebar.classList.toggle("active");
    darkScreen.classList.toggle("active");
}

function searchChatRoomMessages () {
    const messagesPromise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages");
    messagesPromise.then(loadChatRoomMessages);
}

function loadChatRoomMessages (messagesAnswer) {
    const messages = messagesAnswer.data
    console.log(messages);
    const messagesSection = document.querySelector(".messages");

    for (let i = 0 ; i < messages.length ; i++) {
        let activeObject = messages[i]
        let messageMiddleSection = ``
        if (activeObject.type === "status") {
            messageMiddleSection = `<span class = "contact">${activeObject.from} </span>`;
        } else if (activeObject.type === "private_message") {
            messageMiddleSection = `
            <span class = "contact">${activeObject.from} </span>
            reservadamente para 
            <span class = "contact">${activeObject.to}: </span>`
        } else if (activeObject.type === "message") {
            messageMiddleSection = `
            <span class = "contact">${activeObject.from} </span>
            para 
            <span class = "contact">${activeObject.to}: </span>`
        }
        
        let completeMessage = `
        <li>
            <span class = "time">(${activeObject.time})</span>
            ${messageMiddleSection}
            ${activeObject.text}
        </li>`

        messagesSection.innerHTML += completeMessage
    }
}

searchChatRoomMessages ()