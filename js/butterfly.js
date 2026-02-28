import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js";

const threeCanvas = document.getElementById("butterfly");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas,
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

camera.position.z = 5;

const light = new THREE.DirectionalLight(0xffffff, 0.15);
light.position.set(2, 5, 5);
scene.add(light);

// scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const mixers = [];

function createButterfly(baseModel, animations, x, y, z, scale) {

    const model = clone(baseModel);

    model.position.set(x, y, z);
    model.scale.set(scale, scale, scale);

    model.rotation.y = 3.75;

    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);

    if (animations.length > 0) {
        const action = mixer.clipAction(animations[0]);
        action.play();
        mixer.timeScale = 0;
    }

    mixers.push(mixer);
}


const loader = new GLTFLoader();
let mixer;

loader.load("./assets/models/butterfly.glb", (gltf) => {

    const originalModel = gltf.scene;

    createButterfly(originalModel, gltf.animations, 0, -5, 0, 1);
    createButterfly(originalModel, gltf.animations, 2, -2, -1, .5);
    createButterfly(originalModel, gltf.animations, -2, -4, 1, .5);
    createButterfly(originalModel, gltf.animations, 2, -4, 2, .5);
    createButterfly(originalModel, gltf.animations, -2, -2, -2, .5);

});


const clock = new THREE.Clock();

function renderLoop() {
    requestAnimationFrame(renderLoop);

    const delta = clock.getDelta();

    mixers.forEach(m => m.update(delta));

    renderer.render(scene, camera);
}


renderLoop();

setTimeout(() => {
    mixers.forEach(m => m.timeScale = .75);
}, 1000);

setTimeout(() => {
    localStorage.setItem("unlockLevel", 3);
    document.location.href = "./home.html";
}, 8000);