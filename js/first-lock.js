const frame = document.getElementById("site-frame");
const areas = Array.from(document.querySelectorAll("textarea"));

const cssText =
    `* {
    margin: 0;
    box-sizing: border-box;
}

body {
    background-image: url("./assets/bg-image.png");
    background-size: cover;
    background-position: center;
    image-rendering: pixelated;
    height: 100vh;
}

.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    width: max-content;

    color: #fff;
    font-family: "Cascadia Mono", sans-serif;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    padding: 2rem;
    border-radius: 1rem;
    background-color: rgba(19, 0, 0, 0.33);

    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

#btn {
    margin-top: 1rem;
    padding: .5rem 1rem;
    border-radius: 1rem;
    border: 2px solid #fff;
    
    width: 50%;
    height: 3rem;
    
    display: flex;
    justify-content: center;
    align-items: center;
    
    cursor: pointer;
    transition: .2s ease-in-out;
}

#btn:hover {
    background-color: #ffffff34;
}`

const htmlText =
    `<div class="center">
    <h1>Dragon's blood</h1>
    <h3>•@!'943</h3>
    <div id="btn">Listen</div>
</div>`

const jsText =
    `const btn = document.getElementById("btn");
btn.addEventListener("click", () => {
    window.parent.postMessage({
        type: "listen-click"
    }, "*");
});`

const texts = [cssText, htmlText, jsText];



function updateFrame() { 
    let txtLength = this.value.length;
    this.value = texts[areas.indexOf(this)].substring(0, txtLength);
    this.scrollTop = this.scrollHeight;

    const css = areas[0].value; 
    const html = areas[1].value; 
    const js = areas[2].value; 
    
    frame.srcdoc = `<!DOCTYPE html>
<html>
    <head>
        <style>
        ${css}
        </style>
    </head> 
    <body> 
    ${html} 
        <script> 
        ${js}
        </script>
    </body>
</html>`
} 

areas.forEach(area => area.addEventListener("input", updateFrame));

window.addEventListener("message", (e) => {
    if (e.data.type === "listen-click") {
        document.body.classList.add("listen-clicked");
        setTimeout(() => {
            localStorage.setItem("unlockLevel", 2);
            window.location.href = "./home.html";
        }, 3000);
    }
});