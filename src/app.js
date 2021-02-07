//Modules
import { GLTFLoader } from "./modules/GLTFLoader";
import * as THREE from "./modules/three.module";

//Jump function
import { jump } from "./scripts/Movement/characterMovement.js";

//Game variables
let container, clock, mixer, activeAction, previousAction, currentAction;
let camera, scene, renderer, model, face;

//Game state
const state = {
  moveLeft: false,
  moveRight: false,
}



//Position of Character, 0 -> middle of the screen
let position = 0;

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.25,
    100
  );
  //camera.position.set( 5, 50, - 20  );
  camera.position.set(0, 8, -2);
  //Object distance from camera
  //camera.position.z = -25
  camera.position.z = -25;

  //Object position in screen
  camera.lookAt(new THREE.Vector3(0, 2, 400));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  //background IMAGE
  /*
    const imageLoader = new THREE.TextureLoader();
    scene.background = imageLoader.load(
        "/three.js/test.jpg"
    );
*/
  // ground

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  // model

  const loader = new GLTFLoader();
  loader.load(
    "src/models/RobotExpressive.glb",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);

      createCharacter(model, gltf.animations);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function createCharacter(model, animations) {
  //Importing model
  mixer = new THREE.AnimationMixer(model);

  //activeAction = actions[mixer.clipAction( animations[ 3 ] ) ];

  //Choosing which animation we want display -> 6 = Running

  activeAction = mixer.clipAction(animations[6]).play();
  previousAction = mixer.clipAction(animations[3]);

  //Default position
  model.position.set(position, 0, 0);
}

function fadeToAction(duration) {
  //previousAction = activeAction;
  currentAction = previousAction;

  //if (previousAction !== activeAction) {
  //previousAction.fadeOut(duration);
  //}

  currentAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();
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
  updatePlayer();
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}


//MovementListener 65 -> (A), 68 -> (D), 37 -> (->), 39 -> (<-)
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;

  //Right 65 = A & 37 = <-
  if (keyCode == 65 || keyCode == 37) {
    if (position <= 15) {
    state.moveLeft = true;  
    }
  }
  //Left 68 = D & 39 = ->
  else if (keyCode == 68 || keyCode == 39) {
    if (position >= -15) {
      state.moveRight = true
    }
  }
  //Jump
  else if (keyCode == 87 || keyCode == 32 || keyCode == 38) {
    //Stop the running Animation
    activeAction.stop();
    //Activate Jump Animation
    fadeToAction(0.5);
    //Jump logic
    jump(model, position, currentAction, activeAction);
  }
  updatePlayer()
}

document.addEventListener("keyup", function(event){
  if (event.keyCode == 37 || event.keyCode == 65){
    state.moveLeft = false;
  }
  if (event.keyCode == 39 || event.keyCode == 68){
    state.moveRight = false;
  }
})


function updatePlayer() {
  if (state.moveLeft){
    position += 0.2;
    model.position.set(position, 0, 0);
  }
  else if (state.moveRight){
    position -= 0.2;
    model.position.set(position, 0, 0);
  }
}