const notificationTemplate = document.getElementById("notification-template");
const notificationDiv = document.getElementById("notification-div");
const messageDiv = document.getElementById("message-div");
const messageBody = document.getElementById("message-body");
const textarea = document.getElementById("send-input");
const sendBtn = document.getElementById("send-btn");
const waStatus = document.getElementById("wa-status");

let currentBatch = null;
let currentMessage = 0;
let isOtherTyping = false;

const chat = [
    { message: "è vero che sembro un barbagianni?", time: "22:11", self: false },
    { message: "No?", time: "22:12", self: true },
    { message: "come no", time: "22:12", self: false },
    { message: "ci assomiglio?", img: "barnowl-guy", time: "22:13", self: false },
    { message: "non al tipo eh", time: "22:13", self: false },
    { message: "Gli mancano i capelli", time: "22:14", self: true },
    { message: "Poi un po' sì", time: "22:14", self: true },
    { message: "quindi ci assomiglio?", reply: -2, time: "22:14", self: false },
    { message: "sennò a che animale assomiglio", time: "22:14", self: false },
    { message: "Dalla foto mi sembri un gatto", time: "22:14", self: true },
    { message: "grazie è un grandissimo complimento", reply: -4, time: "22:14", self: false },
    { message: "quindi sarei un gatto?", reply: -2, time: "22:15", self: false },
    { message: "Lo so lo so, sono bravissimo a dare complimenti", reply: -2, time: "22:15", self: true },
    { message: "comunque secondo me saresti un ghepardo", time: "22:16", self: false },
    { message: "o un gabbiano", time: "22:17", self: false },
    { message: "Mi sembra giusto", time: "22:17", self: true },
    { message: "Il perché lo posso sapere?", time: "22:17", self: true },
    { message: "del gabbiano o del ghepardo?", reply: -1, time: "22:18", self: false },
    { message: "Di entrambi", time: "22:18", self: true },
    { message: `ghepardo:\n1 corri veloce\n2 sei omosessuale\n3 sei felinosessuale (me l'ha detto €83&9)\ngabbiano:\n1 mi dai il feeling di essere un gabbiano`, time: "22:19", self: false },
    { message: "Allora anche te mi dai il feeling di essere una foca monaca", time: "22:21", self: true },
    { message: "Guarda quanto è carina", img: "seal1", time: "22:21", self: true },
    { message: "a quindi gli assomiglio?", img: "seal2", time: "22:22", self: false },
    { message: "Non a questa", time: "22:23", self: true },
    { message: "Però è pucciosissima", time: "22:23", self: true },
    { message: "gli assomiglierei?", img: "seal3", time: "22:27", self: false },
    { message: "hm", reply: -3, time: "22:28", self: false },
    { message: "Te vai a scegliere proprio quelle meno carine", time: "22:29", self: true },
    { message: "Però sì", reply: -3, time: "22:29", self: true },
    { message: "no, io ho preso quelle da google", reply: -2, time: "22:30", self: false },
    { message: "allora sei un triceratopo", time: "22:30", self: false },
    { message: "Non mi sembrano queste", img: "seal4", time: "22:31", self: true },
    { message: "Ci sta", reply: -2, time: "22:31", self: true },
    { message: "ti ricordo che ho iOs", reply: -2, time: "22:31", self: false },
    { message: "Giusto", time: "22:32", self: true },
    { message: "ah ti arrendi così?", reply: -3, time: "22:32", self: false },
    { message: "Perché? Era il mio dinosauro preferito", reply: -1, time: "22:33", self: true },
    { message: "ah", time: "22:33", self: false },
    { message: "che carine", reply: -7, time: "22:33", self: false },
    { message: "questa però sembra depressa", img: "seal5", time: "22:35", self: false },
    { message: "non so se sono una foca monaca", time: "22:35", self: false },
    { message: "secondo te sono una foca monaca o un barbagianni?", time: "22:35", self: false },
    { message: "L'hanno messa in una piscina, ci credo", reply: -3, time: "22:35", self: true },
    { message: "Il barbagianni è più bello", reply: -2, time: "22:36", self: true },
    { message: "Per questo sei una foca monaca", time: "22:36", self: true },
    { message: "...", reply: -1, time: "22:37", self: false },
    { message: "questa potrebbe essere un'offesa", time: "22:37", self: false },
    { message: "Nooo, che dici", time: "22:37", self: true },
    { message: "hai detto che non posso essere un barbagianni perché è più bello", time: "22:37", self: false },
    { message: "Sono belle anche le foche monache", time: "22:38", self: true },
    { message: "ah quindi sono bella", time: "22:38", self: false },
    { message: "ti droghi, comunque", time: "22:39", self: false },
    { message: "Se queste sono le scelte sì", reply: -2, time: "22:39", self: true },
    { message: "e allora aggiungile te le scelte dio _9'@ ?9!@'@", reply: -1, time: "22:40", self: false },
    { message: "Non è vero, ho solo assunto del fentanyl", reply: -3, time: "22:40", self: true },
    { message: "succede", reply: -1, time: "22:41", self: false },
]

function writeMessage(message, parent, i) {
    let div = document.createElement("div");
    let p = document.createElement("p");
    let h5 = document.createElement("h5");
    let img = document.createElement("img");
    let reply = document.createElement("div");

    if (message.img) {
        img.src = `./assets/wa/chat/${message.img}.jpeg`;
        div.appendChild(img);
    }

    if (message.reply) {
        let p = document.createElement("p");
        reply.classList.add("reply");

        p.textContent = chat[i + message.reply].message;

        reply.appendChild(p);
        div.appendChild(reply);
    }

    div.classList.add("message");
    p.textContent = message.message;
    h5.textContent = message.time;

    div.appendChild(p);
    div.appendChild(h5);

    parent.appendChild(div);
}

function resizeInput() {
    textarea.classList.toggle("empty", !textarea.value);

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

function writeNextMessage() {
    if (currentMessage >= chat.length) return;

    let message = chat[currentMessage];

    if (
        !currentBatch ||
        currentBatch.classList.contains("self") !== message.self
    ) {
        currentBatch = document.createElement("div");
        currentBatch.classList.add("message-batch");
        currentBatch.classList.add(message.self ? "self" : "other");
        messageBody.appendChild(currentBatch);
    }

    writeMessage(message, currentBatch, currentMessage);

    currentMessage++;

    messageBody.scrollTop = messageBody.scrollHeight;
}

function simulateOtherMessages() {
    if (currentMessage >= chat.length) {
        waStatus.textContent = "Online";

        isOtherTyping = false;
        textarea.disabled = false;
        textarea.classList.remove("locked");
        textarea.focus();
        return;
    }

    if (chat[currentMessage].self === true) {
        waStatus.textContent = "Online";

        isOtherTyping = false;
        textarea.disabled = false;
        textarea.classList.remove("locked");
        textarea.focus();
        return;
    }

    waStatus.textContent = "Typing...";

    isOtherTyping = true;
    textarea.disabled = true;
    textarea.classList.add("locked");

    setTimeout(() => {
        writeNextMessage();

        simulateOtherMessages();

    }, 200 * chat[currentMessage].message.length);
}

function init() {
    currentMessage = 0;
    messageBody.scrollTop = messageBody.scrollHeight;

    writeNextMessage();
}

function sendMessage() {
    if (isOtherTyping) return;
    if (currentMessage >= chat.length) return;

    let expectedText = chat[currentMessage].message;

    if (textarea.value.length !== expectedText.length) return;
    textarea.value = "";
    resizeInput();

    writeNextMessage();

    if (currentMessage < chat.length && chat[currentMessage].self === false) {
        simulateOtherMessages();
    }

    if (currentMessage >= chat.length - 6) {
        document.getElementById("black-screen").classList.add("end");

        setTimeout(() => {
            localStorage.setItem("unlockLevel", 4);
            document.location.href = "./home.html";
        }, 16500);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let notificationClone = notificationTemplate.content.cloneNode(true);
    let notificationElement = notificationClone.querySelector(".notification");
    notificationDiv.appendChild(notificationClone);

    notificationElement.addEventListener("click", () => {
        messageDiv.classList.remove("hide");
        notificationElement.classList.remove("show");
    })

    setTimeout(() => {
        notificationElement.classList.add("show");
    }, 2000)

    resizeInput();
    init();
})

textarea.addEventListener("input", () => {
    resizeInput();
    let txtLength = textarea.value.length;
    textarea.value = chat[currentMessage].message.substring(0, txtLength);
});

textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        sendMessage();
    }
})

sendBtn.addEventListener("click", () => {
    sendMessage();
})

window.addEventListener("resize", () => {
    resizeInput();
})