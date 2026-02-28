let lyricsDiv = document.getElementById("lyrics");
let song = document.getElementById("song");

let startTime = null;
const playedLyrics = new Set();

const lyricsTiming = [
    { id: "lyric-1", time: 10.53 },
    { id: "lyric-2", time: 13.33 },
    { id: "lyric-3", time: 16.93 },
    { id: "lyric-4", time: 19.71 },
];

function animateLyricLine(lyricEl, step = 0.27) {
    const spans = lyricEl.querySelectorAll("span");

    spans.forEach((span, i) => {
        span.style.animationDelay = `${i * step}s`;
        span.classList.add("animate");
    });
}

function timelineLoop(now) {
    const elapsed = (now - startTime) / 1000;

    lyricsTiming.forEach(({ id, time }) => {
        if (elapsed >= time && !playedLyrics.has(id)) {
            const lyricEl = document.getElementById(id);
            animateLyricLine(lyricEl);
            playedLyrics.add(id);
        }
    });

    if (playedLyrics.size < lyricsTiming.length) {
        requestAnimationFrame(timelineLoop);
    }
}

window.addEventListener("start", () => {
    startTime = performance.now();

    setTimeout(() => {
        lyricsDiv.classList.remove("hide");
    }, 10000);

    requestAnimationFrame(timelineLoop);

    setTimeout(() => {
        localStorage.setItem("unlockLevel", 1);
        document.location.href = "./home.html";
    }, 23500);
});