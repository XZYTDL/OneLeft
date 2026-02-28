/* ===
Player
=== */

let player = document.getElementById("player");

window.addEventListener("start", () => {
    initScramble();
    player.classList.add("started");
})

/* ====
Buttons
==== */

let playBtn = document.getElementById("play-btn");
let pauseBtn = document.getElementById("pause-btn");

playBtn.addEventListener("click", () => {
    playBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    window.dispatchEvent(startEvent);
});

/* ====
Content
==== */

let title = document.getElementById("title");
let artists = document.getElementById("artists");

let songTitle = "My Heart";
const artistList = 
[
    "Different Heaven",
    "EH!DE",
]

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function updateContents(name, artist) {
    title.innerText = name;
    artists.innerText = artist;
}

function randomizeLetters(string) {
    return string
        .split("")
        .map(char => {
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
}

function initScramble() {
    setInterval(() => {
        updateContents(
            randomizeLetters(songTitle),
            artistList.map((artist) => randomizeLetters(artist)).join(", ")
        );
    }, 50);
    
    updateContents(
        randomizeLetters(songTitle),
        artistList.map((artist) => randomizeLetters(artist)).join(", ")
    );
}