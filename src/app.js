//Modules
import { GLTFLoader } from "./modules/GLTFLoader";
import * as THREE from "./modules/three.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

//Jump function
import { jump } from "./scripts/Movement/characterMovement.js";

import { init1, cleanScene } from "./renderrobot.js";

//Game variables
let container, clock, mixer, activeAction, previousAction, currentAction;
let camera,
  scene,
  renderer,
  model,
  pointHud,
  gameStop,
  floor,
  playBtn,
  infoBtn,
  startBtn,
  githubBtn,
  mainMenu,
  mainBtn,
  playbtndiv,
  mainbtndiv,
  Titlediv,
  title2,
  title3,
  title4;


//Game state
const state = {
  moveLeft: false,
  moveRight: false,
  isJumping: false,
  bgMusicPlay: false,
};

//For mobile swipe support
var min_horizontal_move = 30;
var max_vertical_move = 30;
var within_ms = 1000;

var start_xPos;
var start_yPos;
var start_time;

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
GameSound();

function init() {
  container = document.createElement("div");
  container.id = "game";
  document.body.appendChild(container);

  //Init mobile
  var content = document.getElementById("game");
  content.addEventListener("touchstart", touch_start);
  content.addEventListener("touchend", touch_end);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.set(0, 8, -2);

  camera.position.z = -25;

  //Object position in screen
  camera.lookAt(new THREE.Vector3(0, 2, 400));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0055ff);

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

  var grassTexture = asloader.load("src/models/desert.jpg", function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(1, 512);
  });

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

  let obstaclePattern = Math.floor(Math.random() * (18 - 1 + 1)) + 1;

  /*
  for (let i = 0; i < random; i++) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x =
        lines[Math.floor(Math.random() * (lines.length + 1 - 1 + 0)) + 0];
      object.position.z = Math.floor(Math.random() * (400 - 300 + 1)) + 300;
      obstacleTypes.push(object);
    });
  }
  */

  //Two obstacles

  mtlLoader.load("PropaneTank.mtl", function (materials) {
    materials.preload();
    objLoader.setMaterials(materials);
  });

  obstacleTypes = [];

  if (obstaclePattern === 1) {
    //Two obstacles

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
  } else if (obstaclePattern === 2) {
    //Three obstacles

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
  } else if (obstaclePattern === 3) {
    //One obstacle

    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 4) {
    //Two obstacle, left and right

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
  } else if (obstaclePattern === 5) {
    // Two from middle

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
  } else if (obstaclePattern === 6) {
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
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 7) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 380;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 360;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 380;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 360;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 380;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 360;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 8) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 9) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 10) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });

    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 11) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 12) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 13) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 14) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 15) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 16) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 400;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 17) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 5;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
    });
  } else if (obstaclePattern === 18) {
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 0;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = 15;
      object.position.z = 300;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -10;
      object.position.z = 350;
      obstacleTypes.push(object);
    });
    objLoader.load("PropaneTank.obj", function (object) {
      object.position.x = -15;
      object.position.z = 325;
      obstacleTypes.push(object);
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

    if (obstacles[i].position.z < -150) {
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

function createSky() {
  const geometry = new THREE.CircleGeometry(2, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffae00,
    side: THREE.DoubleSide,
  });
  const sun = new THREE.Mesh(geometry, material);
  sun.position.set(16, 14, 0);
  const imageLoader = new THREE.TextureLoader();
  scene.background = imageLoader.load("src/sky.jpg");
}

function detectCollision() {
  for (var i = 0; i < obstacles.length; i++) {
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
function GameSound() {
  var gameSound = new Audio();
  gameSound.src =
    "https://freesound.org/data/previews/410/410574_625529-lq.mp3";
  if (typeof gameSound.loop == "boolean") {
    gameSound.loop = true;
  } else {
    gameSound.addEventListener(
      "ended",
      function () {
        this.currentTime = 0;
        this.play();
      },
      false
    );
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
  
  
  
  Titlediv = document.createElement("div");
  Titlediv.style.height = "40%";
  Titlediv.style.top = "20%";
  title2 = document.createElement("div");
  title2.innerHTML = "Game Over!";
  title2.classList.add("title2");

  title3 = document.createElement("div");
  title3.innerHTML = " Your score was: "
  title3.classList.add("title3");

 

  title4 = document.createElement("div");
  title4.innerText = "" + game.points + "";
  title4.classList.add("title4");

  Titlediv.appendChild(title2);
  Titlediv.appendChild(title3);
  Titlediv.appendChild(title4);
  
  gameStop.appendChild(Titlediv);
  gameStop.appendChild(playbtndiv);
  gameStop.appendChild(mainbtndiv);
  document.body.appendChild(gameStop);
  gameStop.style.display = "block";
  playBtn.style.display = "";
  mainBtn.style.display ="";
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
  if (
    (keyCode == 65 || keyCode == 37) &&
    !state.moveLeft &&
    (model.position.x === -15 ||
      model.position.x === 0 ||
      model.position.x === 15)
  ) {
    state.moveLeft = true;
    updatePlayer();
  }
  //Left 68 = D & 39 = ->
  else if (
    (keyCode == 68 || keyCode == 39) &&
    !state.moveRight &&
    (model.position.x === -15 ||
      model.position.x === 0 ||
      model.position.x === 15)
  ) {
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

function updatePlayerMobile() {
  if (state.moveLeft && position < 0) {
    state.moveLeft = false;
    position = 0;
    smoothMoveToLeft(position);
  } else if (state.moveLeft && position >= 0) {
    state.moveLeft = false;
    position = 15;
    smoothMoveToLeft(position);
  } else if (state.moveRight && position > 0) {
    state.moveRight = false;
    position = 0;
    smoothMoveToRight(position);
  } else if (state.moveRight && position <= 0) {
    state.moveRight = false;
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
    model.position.x += 1;
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
    model.position.x -= 1;
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

function touch_start(event) {
  start_xPos = event.touches[0].pageX;
  start_yPos = event.touches[0].pageY;
  start_time = new Date();
}

function touch_end(event) {
  var end_xPos = event.changedTouches[0].pageX;
  var end_yPos = event.changedTouches[0].pageY;
  var end_time = new Date();
  let move_x = end_xPos - start_xPos;
  let move_y = end_yPos - start_yPos;
  let elapsed_time = end_time - start_time;
  if (
    Math.abs(move_x) > min_horizontal_move &&
    Math.abs(move_y) < max_vertical_move &&
    elapsed_time < within_ms
  ) {
    if (move_x < 0) {
      state.moveLeft = true;
      updatePlayerMobile();
    }
  } else {
    state.moveRight = true;
    updatePlayerMobile();
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
  var title = document.createElement("P");
  title.innerText = "Robot Runner";
  title.classList.add("title");

  var infobtndiv = document.createElement("div");
  infoBtn = document.createElement("BUTTON");
  infoBtn.id = "infobtn";
  infoBtn.style.width = 200;
  infoBtn.style.height = 100;
  infoBtn.style.fontSize = "20px";
  infoBtn.style.top = "50%";
  infoBtn.style.left = "50%";
  infoBtn.classList.add("playBtn");
  infoBtn.innerHTML = "Game Info";
  infoBtn.addEventListener("click", function () {
    window.location.href = "gamemanual.html";
  });
  infobtndiv.appendChild(infoBtn);

  var githubdiv = document.createElement("div");
  githubBtn = document.createElement("BUTTON");
  githubBtn.id = "githubbtn";
  githubBtn.style.width = 200;
  githubBtn.style.height = 100;
  githubBtn.style.fontSize = "20px";
  githubBtn.style.top = "50%";
  githubBtn.style.left = "50%";
  githubBtn.classList.add("playBtn");
  githubBtn.innerHTML = "Source Code";
  githubBtn.addEventListener("click", function () {
    window.location.href = "https://github.com/miikatolonen/vwdrunner";
  });
  githubdiv.appendChild(githubBtn);

  var startbtndiv = document.createElement("div");
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
    infobtndiv.style.display = "none";
    startbtndiv.style.display = "none";
    title.style.display = "none";
    githubdiv.style.display = "none";
    cleanScene()
    restartGame();
  });

  var gamecanvas = document.createElement("div");
  gamecanvas.id = "kontti";
  init1(gamecanvas);

  startbtndiv.appendChild(startBtn);
  document.body.appendChild(mainMenu);
  document.getElementById("mainmenu").appendChild(title);
  document.getElementById("mainmenu").appendChild(gamecanvas);
  document.getElementById("mainmenu").appendChild(startBtn);
  document.getElementById("mainmenu").appendChild(infobtndiv);
  document.getElementById("mainmenu").appendChild(startbtndiv);
  document.getElementById("mainmenu").appendChild(githubdiv);

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
  

 

  playbtndiv = document.createElement("div");
  playbtndiv.style.top=  "50%";
  playBtn = document.createElement("BUTTON");
  playBtn.id = "playbtn";
  playBtn.style.display = "none";
  playBtn.style.width = 200;
  playBtn.style.height = 100;
  playBtn.style.fontSize = "20px";
  playBtn.style.top = "50%";
  playBtn.style.left = "50%";
  playBtn.classList.add("mainbtn");
  playBtn.addEventListener("click", function () {
    gameStop.style.display = "none";
    title2.remove();
    title3.remove();
    title4.remove();
    restartGame();
    
  });
  playbtndiv.appendChild(playBtn);

  mainbtndiv = document.createElement("div")
  mainbtndiv.style.top = "75%";
  mainBtn = document.createElement("BUTTON");
  mainBtn.id ="mainbtn";
  mainBtn.style.display ="none";
  mainBtn.style.width = 200;
  mainBtn.style.height = 100;
  mainBtn.style.fontSize = "20px";
  mainBtn.style.top = "50%";
  mainBtn.style.left = "50%";
  mainBtn.classList.add("mainbtn");
  mainBtn.innerHTML = "Main menu";
  mainBtn.addEventListener("click", function(){
    gameStop.style.display = "none";
    document.getElementById("mainmenu").style.display = "block";
  })
  mainbtndiv.appendChild(mainBtn);

  playBtn.innerHTML = "Play Again";
  document.body.appendChild(gameStop);
  document.body.appendChild(playbtndiv);
  document.body.appendChild(mainbtndiv);
  
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
