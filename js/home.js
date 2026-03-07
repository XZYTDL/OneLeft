import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/OutlinePass.js';

let introStarted = false;
let hoveredLock = null;
let unlockLevel = 1;

let yVelocity = 0;
const springStrength = 0.01;
const damping = .9;
const maxFallSpeed = 0.075;

const startY = 8;
const endY = .7;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// ====
// Eyes
// ====

const textureLoader = new THREE.TextureLoader();

const eyesTexture = textureLoader.load("./assets/eyes.svg");

const eyesMaterial = new THREE.MeshBasicMaterial({
    map: eyesTexture,
    transparent: true,
    opacity: 0
});

const eyesGeometry = new THREE.PlaneGeometry(8, 8);

const eyes = new THREE.Mesh(eyesGeometry, eyesMaterial);

eyes.position.set(0, 0, -2);

scene.add(eyes);

// ========
// Renderer
// ========

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.physicallyCorrectLights = true;

// ========
// Composer
// ========

const composer = new EffectComposer(renderer);

composer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

composer.addPass(new RenderPass(scene, camera));

document.body.appendChild(renderer.domElement);

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);

outlinePass.edgeStrength = 30;
outlinePass.edgeGlow = .2;
outlinePass.edgeThickness = 1;
outlinePass.usePatternTexture = false;

composer.addPass(outlinePass);

// ======
// Lights
// ======

const ambLight = new THREE.AmbientLight(0xffffff, .5);
const light = new THREE.DirectionalLight(0xffffff, 4);

light.position.set(1, 1, 1);

scene.add(ambLight);
scene.add(light);

// =======
// Raycast
// =======

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ======
// Models
// ======

const loader = new GLTFLoader();

let heart;
const locks = [];

const LOCK_COLORS = {
  smart: new THREE.Color('#db8a18'),
  happy: new THREE.Color('#ffe066'),
  tear: new THREE.Color('#1af0d3')
};

const target = { x: 0, y: 0 };

const modelStrength = 0.1;
const ease = 0.08;

loader.load('./assets/models/chained-heart.glb', (gltf) => {
  heart = gltf.scene;

  heart.traverse((child) => {
    if (child.isMesh) {
      if (child.material) {
        child.material.metalness = 0.6;
        child.material.roughness = 0.5;
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
        child.material.needsUpdate = true;
      }
    }
  });

  let box = new THREE.Box3().setFromObject(heart);
  let size = box.getSize(new THREE.Vector3());

  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = 6 / maxAxis;
  heart.scale.setScalar(scale);

  box = new THREE.Box3().setFromObject(heart);
  const center = box.getCenter(new THREE.Vector3());

  heart.position.sub(center);

  heart.position.y = startY;

  scene.add(heart);

  loadLock('./assets/models/smart-lock.glb', 'smart', 1);
  loadLock('./assets/models/happy-lock.glb', 'happy', 2);
  loadLock('./assets/models/tear-lock.glb', 'tear', 3);
})

function loadLock(path, type, index) {
  loader.load(path, (gltf) => {
    const lock = gltf.scene;

    lock.userData.outlineColor = LOCK_COLORS[type];
    lock.userData.type = type;
    lock.userData.index = index;

    lock.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.8;
        child.material.roughness = 0.5;

        if (index > unlockLevel) {
          child.material.transparent = true;
          child.material.opacity = 0.2;
        }

        child.material.needsUpdate = true;
      }
    });

    heart.add(lock);
    locks.push(lock);
  });
}

// =====
// Hover
// =====

const LOCK_PAGES = {
  smart: "first-lock",
  happy: "second-lock",
  tear: "third-lock"
};

function changePage(type) {
  window.location =  `./${LOCK_PAGES[type]}.html`;
}

function checkHover() {
  if (locks.length === 0) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(locks, true);

  if (intersects.length > 0) {
    
    let hovered = intersects[0].object;
    while (hovered.parent && !locks.includes(hovered)) {
      hovered = hovered.parent;
    }
    
    if (hovered.userData.index > unlockLevel) {
      document.body.style.cursor = 'not-allowed';
      hoveredLock = null;
      outlinePass.selectedObjects = [];
      return;
    }
    
    document.body.style.cursor = 'pointer';
    hoveredLock = hovered;

    outlinePass.visibleEdgeColor.copy(hovered.userData.outlineColor);
    outlinePass.selectedObjects = [hovered];
  } else {
    document.body.style.cursor = 'auto';
    hoveredLock = null;
    outlinePass.selectedObjects = [];
  }
}

document.addEventListener('click', () => {
  if (!hoveredLock) return;

  changePage(hoveredLock.userData.type);
});

// =======
// Animate
// =======

function animate() {
  requestAnimationFrame(animate);

  target.x += (mouse.x - target.x) * ease;
  target.y += (mouse.y - target.y) * ease;

  if (heart) {
    if (!introStarted) {
      introStarted = true;
    }

    if (introStarted) {
      const distance = endY - heart.position.y;
      const force = distance * springStrength;

      yVelocity += force;

      yVelocity = THREE.MathUtils.clamp(
        yVelocity,
        -maxFallSpeed,
        maxFallSpeed
      );

      yVelocity *= damping;

      heart.position.y += yVelocity;
    }

    heart.rotation.y = target.x * Math.PI * modelStrength;
    heart.rotation.x = -target.y * Math.PI * modelStrength;

    const time = performance.now() * 0.001;
    heart.rotation.z = Math.sin(time) * 0.03;
  }

  camera.position.x = target.x * 0.5;
  camera.position.y = target.y * 0.2;
  camera.position.z = 5 + Math.abs(target.x) * 0.2;

  checkHover();
  composer.render();
}

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer.setSize(w, h);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

animate();

// ======
// Loaded
// ======

document.addEventListener("DOMContentLoaded", () => {
  unlockLevel = localStorage.getItem("unlockLevel") || 1;
  if (unlockLevel >= 3) eyesMaterial.opacity = .5;
  if (unlockLevel >= 4) {
    setTimeout(() => {
      document.location.href = "./quote.html";
    }, 5000);
  }
})