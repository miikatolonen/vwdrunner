import { GLTFLoader } from "./modules/GLTFLoader";
import * as THREE from './modules/three.module'

let container,
    clock,
    gui,
    mixer,
    actions,
    activeAction,
    previousAction;
let camera, scene, renderer, model, face;

const velocity = new THREE.Vector3();

let prevTime = performance.now();

//Position of Character, 0 -> middle of the screen
let position = 0;

const api = { state: "Walking" };

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
    mixer.clipAction(animations[6]).play();

    //Default position
    model.position.set(position, 0, 0);
}

function fadeToAction(name, duration) {
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {
        previousAction.fadeOut(duration);
    }

    activeAction
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

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}

//MovementListener 65 -> (A), 68 -> (D), 37 -> (->), 39 -> (<-)
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    console.log(position);
    //Right 65 = A & 37 = <-
    if (keyCode == 65 || keyCode == 37) {
        if (position <= 15) {
            position += 0.5;
            model.position.set(position, 0, 0);
        }
    }
    //Left 68 = D & 39 = ->
    else if (keyCode == 68 || keyCode == 39) {
        if (position >= -15) {
            position -= 0.5;
            model.position.set(position, 0, 0);
        }
    }
    //Jump
    else if (keyCode == 87 || keyCode == 32) {
    
        for (let i = 0 ; i < 10 ; i += 0.00000002) {
            model.position.set(position, i, 0);
        }
        
    }
}