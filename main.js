// Three.js setup
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';


let mixer; // Animation mixer
let animations;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#space-scene') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background color (dark space-like color)
scene.background = new THREE.Color(0x000011);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32); // Increased from 3 to 10
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, -100); // Moved further back to accommodate larger size
scene.add(sun);

// Create Planets
const planets = [];
const planetData = [
  { name: 'about-me', color: 0x00ff00, position: [30, 0, -50], size: 3 }, // Increased size
  { name: 'projects', color: 0x0000ff, position: [50, 5, -70], size: 3 }, // Increased size
  { name: 'contact', color: 0xff0000, position: [70, -5, -90], size: 3 }, // Increased size
];

planetData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32); // Use dynamic size
  const material = new THREE.MeshBasicMaterial({ color: data.color });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(...data.position);
  planet.userData = { name: data.name };
  planets.push(planet);
  scene.add(planet);
});

// Load Spaceship
const loader = new GLTFLoader();
let spaceship;

loader.load(
    './models/spaceship.glb',
    (gltf) => {
      spaceship = gltf.scene;
      spaceship.position.set(0, 0, 0);
      spaceship.scale.set(0.1, 0.1, 0.1);
      spaceship.rotation.y = Math.PI / 2;
      scene.add(spaceship);
  
      // Check and set up animations
      if (gltf.animations && gltf.animations.length) {
        // Create an animation mixer
        mixer = new AnimationMixer(spaceship);
        animations = gltf.animations;
  
        // Play the first animation by default
        const action = mixer.clipAction(animations[0]);
        action.play();
  
        // If you want to log available animations
        console.log('Available animations:', animations.map(clip => clip.name));
      }
    },
    undefined,
    (error) => {
      console.error('An error occurred while loading the spaceship model:', error);
    }
  );

  // Adjust camera to accommodate larger objects
  camera.position.set(0, 10, 50);

// Update camera to follow spaceship more closely
function updateCamera() {
  if (spaceship) {
    camera.position.set(
      spaceship.position.x,
      spaceship.position.y + 3, // Slightly above the spaceship
      spaceship.position.z +10 // Closer behind the spaceship
    );
    camera.lookAt(spaceship.position);
  }
}

const clock = new THREE.Clock();

// Animation Loop
function animate() {
    // Get the time delta
    const delta = clock.getDelta();
  
    // Update the animation mixer if it exists
    if (mixer) {
      mixer.update(delta);
    }
  
    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Keyboard Controls for Spaceship Movement
window.addEventListener('keydown', (event) => {
  if (!spaceship) return; // Wait until the spaceship is loaded

  const speed = 0.5;
  switch(event.key) {
    case 'ArrowUp':
      spaceship.position.z -= speed; // Move forward
      break;
    case 'ArrowDown':
      spaceship.position.z += speed; // Move backward
      break;
    case 'ArrowLeft':
      spaceship.position.x -= speed; // Move left
      break;
    case 'ArrowRight':
      spaceship.position.x += speed; // Move right
      break;
    case 'w':
    case 'W':
      spaceship.position.y += speed; // Move up
      break;
    case 's':
    case 'S':
      spaceship.position.y -= speed; // Move down
      break;
  }

  // Proximity Detection with Planets
  planets.forEach((planet) => {
    const distance = spaceship.position.distanceTo(planet.position);
    if (distance < 2) {
      console.log(`Approaching planet: ${planet.userData.name}`);
      window.location.href = `/control-room?planet=${planet.userData.name}`; // Redirect to control room
    }
  });
});

// Adjust Renderer on Window Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});