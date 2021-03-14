//Modules
import { GLTFLoader } from "./modules/GLTFLoader";
import * as THREE from "./modules/three.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

//Jump function
import { jump } from "./scripts/Movement/characterMovement.js";

//Game variables
let container, clock, mixer, activeAction, previousAction, currentAction;
let camera,
  scene,
  renderer,
  model,
  pointHud,
  gameStart,
  gameStop,
  grid,
  floor,
  playBtn,
  infoBtn,
  startBtn,
  mainMenu;

//Game state
const state = {
  moveLeft: false,
  moveRight: false,
  isJumping: false,
  bgMusicPlay: false
};

//Position of Character, 0 -> middle of the screen
let position = 0;

var game = {
  finished: false,
  points: 0,
  speed: 0.1,
  spawnRate: 1,
};

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

// Arrays to hold model objects
var obstacleTypes = [];
var obstacles = [];

init();
//GameSound();

function init() {
  container = document.createElement("div");
  container.id = "game";
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
  scene.background = new THREE.Color(0x0055ff);
  //scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0x4c5559, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xc8cbcc);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  createSky();
  
  //Loading Obstacles
  loadObstacleTypes();

  var asloader = new THREE.TextureLoader();

  var grassTexture = asloader.load(
    "src/models/desert.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(1, 512);
    }
  );

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100000, 8, 8),
    new THREE.MeshLambertMaterial({
      map: grassTexture,
    })
  );
  floor.rotation.x -= Math.PI / 2;
  floor.position.y = -11;
  scene.add(floor);

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
  menuInit();
  gameEnding();
  loadHUD();
}

function createCharacter(model, animations) {
  //Importing model
  mixer = new THREE.AnimationMixer(model);

  //Choosing which animation we want display -> 6 = Running

  activeAction = mixer.clipAction(animations[6]).play();
  previousAction = mixer.clipAction(animations[3]);

  //Default position
  model.position.set(position, 0, 0);
}

function fadeToAction(duration) {
  //previousAction = activeAction;
  currentAction = previousAction;

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

function loadObstacleTypes() {
  var objLoader = new OBJLoader();
  var mtlLoader = new MTLLoader();
  objLoader.setPath("src/models/");
  mtlLoader.setPath("src/models/");

  let obstaclePattern = Math.floor(Math.random() * (5 - 1 + 1)) + 1;

  //Two obstacles

  /*
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = -15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
    });
   */

  obstacleTypes = [];

  if (obstaclePattern === 1) {
    //Two obstacles
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = -15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
    });
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 0;
        object.position.z = 350;
        obstacleTypes.push(object);
      });
    });
  } else if (obstaclePattern === 2) {
    //Three obstacles
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = -15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 0;
        object.position.z = 350;
        obstacleTypes.push(object);
      });
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
    });
  } else if (obstaclePattern === 3) {
    //One obstacle
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = -15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
    });
  } else if (obstaclePattern === 4) {
    //Two obstacle, left and right
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = -15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 15;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
    });
  } else if (obstaclePattern === 5) {
    // Two from middle
    mtlLoader.load("PropaneTank.mtl", function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 0;
        object.position.z = 400;
        obstacleTypes.push(object);
      });
      objLoader.load("PropaneTank.obj", function (object) {
        object.position.x = 0;
        object.position.z = 350;
        obstacleTypes.push(object);
      });
    });
  }
}

//Generate Propanetanks
function generateObjects() {
  newTime = new Date().getTime();
  let obstacle;

  if (newTime - oldTime > 2000) {
    oldTime = new Date().getTime();

    for (var i = 0; i < obstacleTypes.length; i++) {
      obstacle = obstacleTypes[i];
      obstacle.scale.set(1, 1, 1);
      scene.add(obstacle);
      obstacles.push(obstacle);
    }
    obstacleTypes = [];
  }
}

function moveObstacles() {
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].position.z -= 20 * game.speed;

    if (obstacles[i].position.z < -70) {
      //Load new obstacles when old disappear
      scene.remove(obstacles[i]);
      obstacles.pop(i);
      obstacleTypes.pop(i);
      if (obstacleTypes.length == 0 && obstacles.length == 0) {
        loadObstacleTypes();
      }
    }
  }
}

function createSky(){
  const geometry = new THREE.CircleGeometry(2,32);
  const material = new THREE.MeshBasicMaterial( {color: 0xffae00, side: THREE.DoubleSide} );
  const sun = new THREE.Mesh( geometry, material );
  sun.position.set(16,14,0);
  //scene.add(sun);
  //scene.add(cloud);
  const imageLoader = new THREE.TextureLoader();
  scene.background = imageLoader.load(
      "/src/sky.jpg"
  );
}


function detectCollision() {
  for (var i = 0; i < obstacles.length; i++) {
    console.log(
      "Player position",
      model.position.x,
      model.position.y,
      model.position.z
    );
    //console.log(obstacles[i].position.z);
    console.log(
      "Obstaakkeli: ",
      Math.round(obstacles[i].position.x * 10) / 10 + 2,
      Math.round(model.position.x * 10) / 10,
      Math.round(obstacles[i].position.x * 10) / 10 - 2,
      Math.round(model.position.x * 10) / 10
    );
    if (
      Math.round(obstacles[i].position.x * 10) / 10 + 2 >
        Math.round(model.position.x * 10) / 10 &&
      Math.round(obstacles[i].position.x * 10) / 10 - 2 <
        Math.round(model.position.x * 10) / 10 &&
      model.position.y <= 1
    ) {
      if (
        obstacles[i].position.x === 15 &&
        obstacles[i].position.z < -1 &&
        obstacles[i].position.z > -10
      ) {
        EndSound();
        EndGame();
      } else if (
        obstacles[i].position.x === -15 &&
        obstacles[i].position.z < -1 &&
        obstacles[i].position.z > -10
      ) {
        EndSound();
        EndGame();
      } else if (
        obstacles[i].position.x === 0 &&
        obstacles[i].position.z < 0 &&
        obstacles[i].position.z > -10
      ) {
        EndSound();
        EndGame();
      }

      //Game OVER
    }
  }
}

function EndSound() {
  var endSound = new Audio();
  endSound.src = "https://freesound.org/data/previews/404/404754_140737-lq.mp3";
  endSound.play();
}
function GameSound(){
var gameSound = new Audio(); 
gameSound.src ="https://freesound.org/data/previews/410/410574_625529-lq.mp3";
if (typeof gameSound.loop == 'boolean')
{
    gameSound.loop = true;
}else{
    gameSound.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
gameSound.play();
}

function cleanObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    scene.remove(obstacles[i]);
  }
}

function EndGame() {
  game.finished = true;
  document.getElementById("game").style.display = "none";
  var title = document.createElement("P")
  title.innerText = "Game over! You got " + game.points + " points";
  title.classList.add("playfultext");
  gameStop.appendChild(title);
  gameStop.appendChild(playBtn);
  document.body.appendChild(gameStop);
  gameStop.style.display = "block";
  playBtn.style.display = "";
}

function restartGame() {
  document.getElementById("game").style.display = "block";
  cleanObstacles();
  position = 0;
  obstacles = [];
  obstacleTypes = [];
  model.position.set(position, 0, 0);
  game.points = 0;
  game.finished = false;
  game.speed = 0.1;
  state.bgMusicPlay = true;
  loadObstacleTypes();
  animate();
}

function animate() {
  if (!game.finished) {
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    generateObjects();
    const time = -performance.now() / 1000;
    floor.position.z -= 2;
    moveObstacles();
    detectCollision();
    updateHUD();
    requestAnimationFrame(animate);
    game.speed += 0.0001;
    renderer.render(scene, camera);
  }
}

//MovementListener 65 -> (A), 68 -> (D), 37 -> (->), 39 -> (<-)
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;

  if (model.position.y > 0) return;
  //Right 65 = A & 37 = <-
  if ((keyCode == 65 || keyCode == 37) && !state.moveLeft) {
    state.moveLeft = true;
    updatePlayer();
  }
  //Left 68 = D & 39 = ->
  else if ((keyCode == 68 || keyCode == 39) && !state.moveRight) {
    state.moveRight = true;
    updatePlayer();
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
  if (state.moveLeft && position < 0) {
    position = 0;
    smoothMoveToLeft(position);
  } else if (state.moveLeft && position >= 0) {
    position = 15;
    smoothMoveToLeft(position);
  } else if (state.moveRight && position > 0) {
    position = 0;
    smoothMoveToRight(position);
  } else if (state.moveRight && position <= 0) {
    position = -15;
    smoothMoveToRight(position);
  }
}

function setPosition(position) {
  model.position.x = position;
}

function updateHUD() {
  game.points += 1;
  pointHud.innerHTML = game.points;
}

//-------------------------------------
// Smoother movements for the robot
//-------------------------------------
function smoothMoveToLeft(targetPositionX) {
  targetPositionX = position;

  if (model.position.x < targetPositionX) {
    model.position.x += 0.4;
    setPosition(model.position.x);
    requestAnimationFrame(smoothMoveToLeft);
  }
  if (
    model.position.x > targetPositionX &&
    model.position.x < targetPositionX + 0.5
  ) {
    model.position.x = targetPositionX;
    setPosition(model.position.x);
  }
}

function smoothMoveToRight(targetPositionX) {
  targetPositionX = position;

  if (model.position.x > targetPositionX) {
    model.position.x -= 0.4;
    setPosition(model.position.x);
    requestAnimationFrame(smoothMoveToRight);
  }
  if (
    model.position.x < targetPositionX &&
    model.position.x > targetPositionX + 0.5
  ) {
    model.position.x = targetPositionX;
    setPosition(model.position.x);
  }
}

function menuInit() {
  mainMenu = document.createElement("div");
  mainMenu.style.display = "block";
  mainMenu.id = "mainmenu";
  mainMenu.style.position = "absolute";
  mainMenu.style.width = 2000;
  mainMenu.style.height = 2000;
  mainMenu.style.fontSize = "50px";
  mainMenu.style.textAlign = "center";
  mainMenu.style.backgroundColor = "#A2EFFF";
  mainMenu.classList.add("overlay");
  var title = document.createElement("P")
  title.innerText = "Robot Runner"
  title.classList.add("title");

  infoBtn = document.createElement("BUTTON");
  infoBtn.id = "infobtn";
  infoBtn.style.width = 200;
  infoBtn.style.height = 100;
  infoBtn.style.fontSize = "20px";
  infoBtn.style.top = "50%";
  infoBtn.style.left = "50%";
  infoBtn.classList.add("playBtn");
  infoBtn.innerHTML = "Game Info";

  startBtn = document.createElement("BUTTON");
  startBtn.id = "startbtn";
  startBtn.style.width = 200;
  startBtn.style.height = 100;
  startBtn.style.fontSize = "20px";
  startBtn.style.top = "50%";
  startBtn.style.left = "50%";
  startBtn.classList.add("playBtn");
  startBtn.innerHTML = "Start Game";
  startBtn.addEventListener("click", function () {
    mainMenu.style.display = "none";
    infoBtn.style.display = "none";
    startBtn.style.display = "none";
    title.style.display = "none";
    restartGame();
  });
  document.body.appendChild(mainMenu);
  document.getElementById("mainmenu").appendChild(title)
  document.getElementById("mainmenu").appendChild(startBtn);
  document.getElementById("mainmenu").appendChild(infoBtn);
}


function gameEnding() {
  gameStop = document.createElement("div");
  gameStop.id = "gamestop";
  gameStop.style.display = "none";
  gameStop.style.position = "absolute";
  gameStop.style.width = 2000;
  gameStop.style.height = 2000;
  gameStop.style.fontSize = "50px";
  gameStop.style.textAlign = "center";
  gameStop.style.backgroundColor = "#A2EFFF";
  gameStop.classList.add("overlay");

  playBtn = document.createElement("BUTTON");
  playBtn.id = "playbtn";
  playBtn.style.display = "none";
  playBtn.style.width = 200;
  playBtn.style.height = 100;
  playBtn.style.fontSize = "20px";
  playBtn.style.top = "50%";
  playBtn.style.left = "50%";
  playBtn.classList.add("playBtn");
  playBtn.addEventListener("click", function () {
    gameStop.style.display = "none";
    restartGame();
  });
  playBtn.innerHTML = "Play Again";
  document.body.appendChild(gameStop);
  document.body.appendChild(playBtn);
}

function loadHUD() {
  pointHud = document.createElement("div");
  pointHud.id = "pointHud";
  pointHud.style.position = "absolute";
  //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  pointHud.style.width = 400;
  pointHud.style.height = 400;
  pointHud.innerHTML = "0";
  pointHud.style.fontSize = "80px";
  pointHud.style.top = "10%";
  pointHud.style.left = "80%";
  document.body.appendChild(pointHud);
}