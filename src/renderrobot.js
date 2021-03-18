import * as THREE from "./modules/three.module";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let clock, mixer
let camera, scene, renderer, model

const api = { state: "Walking" };

export function init1(container) {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    100
  );
  camera.position.set(-5, 3, 10);
  camera.lookAt(new THREE.Vector3(0, 2, 0));

  scene = new THREE.Scene();

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  // model

  const loader = new GLTFLoader();
  loader.load(
    "src/models/RobotExpressive.glb",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);
      createGUI(model, gltf.animations);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0x000000, 0); // the default
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(1000, 550);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  animate();
}

function createGUI(model, animations) {
  mixer = new THREE.AnimationMixer(model);

  mixer.clipAction(animations[6]).play();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  const dt = clock.getDelta();

  if (mixer) mixer.update(dt);

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

export function cleanScene() {
  renderer.dispose();
}
