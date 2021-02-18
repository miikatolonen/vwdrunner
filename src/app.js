//Modules
import { GLTFLoader } from "./modules/GLTFLoader";
import * as THREE from "./modules/three.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

//Jump function
import { jump } from "./scripts/Movement/characterMovement.js";

//Game variables
let container, clock, mixer, activeAction, previousAction, currentAction;
let camera, scene, renderer, model, face;

//Game state
const state = {
  moveLeft: false,
  moveRight: false,
  isJumping: false,
};

//Position of Character, 0 -> middle of the screen
let position = 0;

var game = {
  finished: false,
  points: 0,
  speed: 0.1,
  spawnRate: 1,
  input: { left: false, right: false },
};

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

// Arrays to hold model objects
var obstacleTypes = [];
var obstacles = [];
var coins = [];

init();
animate();

function init() {
  container = document.getElementById("demo");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    5000
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
  //scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  //Loading Obstacles
  loadObstacleTypes(1);

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

function loadObstacleTypes(amount) {
  var objLoader = new OBJLoader();
  var mtlLoader = new MTLLoader();
  objLoader.setPath("src/models/");
  mtlLoader.setPath("src/models/");

  for (let i = 0; i < amount; i++) {
    mtlLoader.load("generator.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("generator.obj", function (object) {
        obstacleTypes.push(object);
      });
    });
  }
 
}


//Generate ROCKS
function procGenerateRocks() {
  newTime = new Date().getTime();
  let spawnedObs;
  if (newTime - oldTime > 2000) {
    oldTime = new Date().getTime();

    //var spawnNum = Math.round(Math.random() * 10 * game.spawnRate);
    //var spawnedObs;
    for (var i = 0; i < obstacleTypes.length; i++) {
      spawnedObs = obstacleTypes[i];
      //Direction, lanes
      spawnedObs.position.x = -5; //20 + Math.random() * 30;
      //From how long obs starts to respawn
      spawnedObs.position.z = 400;
      spawnedObs.scale.set(1, 1, 1);
      scene.add(spawnedObs);
      obstacles.push(spawnedObs);
    }

    obstacleTypes = [];

    // spawnNum = Math.round(Math.random() * 3 * game.spawnRate);
    // for (var i = 0; i < spawnNum; i++) {
    //   spawnedObs = new Coin();
    //   spawnedObs.mesh.position.x = -10 + Math.random() * 20;
    //   spawnedObs.mesh.position.z = -20 - Math.random() * 10;
    //   spawnedObs.mesh.position.y = 0.3;
    //   spawnedObs.mesh.scale.set(0.05, 0.05, 0.05);
    //   //coins.push(spawnedObs);
    //   scene.add(spawnedObs.mesh);
    //}
  }
}

function moveObstacles() {
  /*
              if (obstacles.length > 0) {
              while (obstacles[0].position.z > 0) {
                obstacles[0].position.z = obstacles[0].position.z - 0.05
              }
            }
      */
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].position.z -= 20 * game.speed;

    if (obstacles[i].position.z < -10) {
      //console.log(obstacles[i].position.z)
      //Load new obstacles when old disappear

      scene.remove(obstacles[i]);
      obstacles.pop(i);
      //loadObstacleTypes(3)
    }
  }
}
//Math.round(number * 10) / 10

function detectCollision() {
  for (var i = 0; i < obstacles.length; i++) {
    if (
      Math.round(obstacles[i].position.x * 10) / 10 + 2 >=
        Math.round(position * 10) / 10 &&
      Math.round(obstacles[i].position.x * 10) / 10 - 2 <=
        Math.round(position * 10) / 10 &&
      obstacles[i].position.z <= 2
    ) {
      alert("Game over");
    }
  }
}
//

function animate() {
  const dt = clock.getDelta();

  if (mixer) mixer.update(dt);
  updatePlayer();
  procGenerateRocks();
  moveObstacles();
  detectCollision();
  requestAnimationFrame(animate);
  game.speed += 0.0001;
  renderer.render(scene, camera);
}

//MovementListener 65 -> (A), 68 -> (D), 37 -> (->), 39 -> (<-)
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;


  if (model.position.y != 0) return;
  //Right 65 = A & 37 = <-
  if (keyCode == 65 || keyCode == 37) {
    state.moveLeft = true;
  }
  //Left 68 = D & 39 = ->
  else if (keyCode == 68 || keyCode == 39) {
    state.moveRight = true;
  }
  //Jump
  else if (keyCode == 87 || keyCode == 32 || keyCode == 38) {
    state.isJumping = true;
    state.moveLeft = false;
    state.moveRight = false;
    //Stop the running Animation
    activeAction.stop();
    //Activate Jump Animation
    fadeToAction(0.01);
    //Jump logic
    jump(model, position, currentAction, activeAction);
  }
  updatePlayer();
}

document.addEventListener("keyup", function (event) {
  if (event.keyCode == 37 || event.keyCode == 65) {
    state.moveLeft = false;
  }
  if (event.keyCode == 39 || event.keyCode == 68) {
    state.moveRight = false;
  }
});

function updatePlayer() {
  if (state.moveLeft && position <= 7) {
    position += 0.2;
    model.position.set(position, 0, 0);
  } else if (state.moveRight && position >= -7) {
    position -= 0.2;
    model.position.set(position, 0, 0);
  }
}
