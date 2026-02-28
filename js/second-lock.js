const blackCanvas = document.getElementById("blackCanvas");
const blackCtx = blackCanvas.getContext("2d");
const colorCanvas = document.getElementById("colorCanvas");
const colorCtx = colorCanvas.getContext("2d");
const door = document.getElementById("door");
const mergeCanvas = document.createElement("canvas");
const mergeCtx = mergeCanvas.getContext("2d");

const img = new Image();
img.src = "../assets/second-lock-bg.png";

let originalData;
let colorProgress;
let grayscaleData;
let totalColorProgress = 0;
let doorOpened = false;

img.onload = () => setupCanvases();

let isAnimating = false;

blackCanvas.addEventListener("click", (e) => {
    if (isAnimating) return;
    isAnimating = true;

    const rect = blackCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let div = document.createElement("div");
    div.classList.add("halo");
    div.style.left = x + "px";
    div.style.top = y + "px";
    setTimeout(() => div.remove(), 1000);
    document.body.prepend(div);

    animateReveal(x, y);
});

function getCoverDimensions(imgW, imgH, canvasW, canvasH) {
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;
    return { drawW, drawH, offsetX, offsetY };
}

function setupCanvases() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    [blackCanvas, colorCanvas, mergeCanvas].forEach(c => {
        c.width = W;
        c.height = H;
    });

    blackCtx.fillStyle = "black";
    blackCtx.fillRect(0, 0, W, H);

    const { drawW, drawH, offsetX, offsetY } = getCoverDimensions(
        img.naturalWidth, img.naturalHeight, W, H
    );

    colorCtx.imageSmoothingEnabled = false;
    colorCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
    originalData = colorCtx.getImageData(0, 0, W, H);

    grayscaleData = new ImageData(
        new Uint8ClampedArray(originalData.data), W, H
    );
    for (let i = 0; i < grayscaleData.data.length; i += 4) {
        const gray =
            grayscaleData.data[i] * 0.299 +
            grayscaleData.data[i + 1] * 0.587 +
            grayscaleData.data[i + 2] * 0.114;
        grayscaleData.data[i] = gray;
        grayscaleData.data[i + 1] = gray;
        grayscaleData.data[i + 2] = gray;
    }

    colorProgress = new Float32Array(W * H);
    totalColorProgress = 0;
    doorOpened = false;

    colorCtx.putImageData(grayscaleData, 0, 0);
}

function animateReveal(cx, cy) {
    const maxRadius = 150;
    const duration = 600;
    const startTime = performance.now();
    const totalStrength = 0.33;

    function animate(now) {
        let progress = (now - startTime) / duration;
        progress = Math.min(Math.max(progress, 0), 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const radius = maxRadius * eased;

        blackCtx.globalCompositeOperation = "destination-out";
        blackCtx.beginPath();
        blackCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        blackCtx.fill();

        const frameStrength = totalStrength / (duration / 16);
        restoreColor(cx, cy, radius, frameStrength);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    }

    requestAnimationFrame(animate);
}

function restoreColor(cx, cy, radius, strength) {
    if (!colorProgress || isNaN(strength) || strength <= 0) return;

    const width = colorCanvas.width;
    const height = colorCanvas.height;
    const imageData = colorCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const original = originalData.data;
    const grayscale = grayscaleData.data;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const dx = Math.floor(cx + x);
            const dy = Math.floor(cy + y);
            if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue;
            const dist = Math.sqrt(x * x + y * y);
            if (dist > radius) continue;

            const index = dy * width + dx;
            const pixelIndex = index * 4;
            const falloff = 1 - (dist / radius);

            const oldVal = colorProgress[index];

            if (isNaN(oldVal)) continue;
            colorProgress[index] += strength * falloff * 2;

            if (isNaN(colorProgress[index])) continue;

            if (colorProgress[index] > 1) colorProgress[index] = 1;
            totalColorProgress += colorProgress[index] - oldVal;

            const t = colorProgress[index];
            pixels[pixelIndex] = grayscale[pixelIndex] * (1 - t) + original[pixelIndex] * t;
            pixels[pixelIndex + 1] = grayscale[pixelIndex + 1] * (1 - t) + original[pixelIndex + 1] * t;
            pixels[pixelIndex + 2] = grayscale[pixelIndex + 2] * (1 - t) + original[pixelIndex + 2] * t;
            pixels[pixelIndex + 3] = 255;
        }
    }
    colorCtx.putImageData(imageData, 0, 0);

    const avg = totalColorProgress / colorProgress.length;
    if (avg >= 0.5 && !doorOpened) {
        mergeAndApply();
        door.classList.add("open");
        
        setTimeout(() => document.getElementById("door-frame").style.backgroundColor = "#000", 1000);
        setTimeout(() => {
            document.location.href = "./butterfly.html";
        }, 10000);
        doorOpened = true;
    }
}

function mergeAndApply() {
    mergeCtx.drawImage(colorCanvas, 0, 0);
    mergeCtx.drawImage(blackCanvas, 0, 0);

    door.style.backgroundImage = `url(${mergeCanvas.toDataURL()})`;
}

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        isAnimating = false;
        setupCanvases();
    }, 150);
});