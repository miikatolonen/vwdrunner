
import { GLTFLoader } from './modules/GLTFLoader'
import * as THREE from '../node_modules/three/src/Three';
import GorillaModel from './models/gorilla/gorilla.gltf'
import { menu } from './scripts/menu'

let camera, scene, renderer, gltfloader;
let cube;            
            
            
    const gameSettings = {
        "dead": false,
        "x-speed": 0.1,
        "camera-position-z": 10,
        input: {left: 0, right: 0}
    }
       
    init();

     // initialize all THREEjs components
    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = gameSettings["camera-position-z"]
        camera.up.set = [0, 0, 1]
        // player model, change cube to player model later
        const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		cube = new THREE.Mesh( geometry, material );
		scene.add( cube );
                
        // init renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth,
            Math.round(window.innerHeight * 0.8));

        // load gorilla
        gltfloader = new GLTFLoader();
        gltfloader.load(GorillaModel, function (gltf) {
            scene.add ( gltf.scene );
        })
                       
        // add eventlistener for movement and render canvas
        window.onload = function () {

        document.body.appendChild(renderer.domElement)

        document.addEventListener('keydown', function(event) {
            if(event.keyCode == 37) {
                 gameSettings.input.left = true
                }
            if(event.keyCode == 39) {
                gameSettings.input.right = true
                }
            if (event.keyCode == 27){
                menu();
                }
            });

            document.addEventListener('keyup', function(event) {
                if(event.keyCode == 37) {
                    gameSettings.input.left = false
                }
                if(event.keyCode == 39) {
                    gameSettings.input.right = false
                }            
            });
            render();
            }
    }

    function updatePlayer() {
        if (gameSettings.input.left) {                
            cube.rotation.y -= 0.1
        }
        else if (gameSettings.input.right) {
            cube.rotation.y += 0.1
        } 
    }

    const render = function () {
        updatePlayer();
        renderer.render(scene, camera);
        requestAnimationFrame(render);                   
    }



           


            
