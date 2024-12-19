// Import Three.js and supporting modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

// Constants for spaceship movement
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};
const velocity = new THREE.Vector3();
const maxSpeed = 0.5;
const acceleration = 0.02;
const deceleration = 0.98;
const rotationSpeed = 0.03;

// Three.js core components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#space-scene') });
const clock = new THREE.Clock();

let mixer, spaceship, animations;
const planets = [];

// Renderer setup
renderer.setSize(window.innerWidth, window.innerHeight);
scene.background = new THREE.Color(0x000011); // Space-like background color
document.body.appendChild(renderer.domElement);

// Lighting setup
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);
}

// Planet setup
function createPlanets() {
  const planetData = [
    { name: 'about-me', color: 0x00ff00, position: [30, 0, -50], size: 3 },
    { name: 'projects', color: 0x0000ff, position: [50, 5, -70], size: 3 },
    { name: 'contact', color: 0xff0000, position: [70, -5, -90], size: 3 },
  ];

  planetData.forEach((data) => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...data.position);
    planet.userData = { name: data.name };
    planets.push(planet);
    scene.add(planet);
  });
}

function loadSpaceship() {
  const loader = new GLTFLoader();
  loader.load(
    './models/spaceship.glb',
    (gltf) => {
      spaceship = gltf.scene;
      spaceship.position.set(0, 0, 0);
      spaceship.scale.set(0.1, 0.1, 0.1);

      // Set spaceship to face forward (-Z axis)
      spaceship.rotation.y = 0; // Ensure facing forward

      scene.add(spaceship);

      // Animation setup
      if (gltf.animations && gltf.animations.length) {
        mixer = new AnimationMixer(spaceship);
        animations = gltf.animations;
        const action = mixer.clipAction(animations[0]);
        action.play();
      }
    },
    undefined,
    (error) => {
      console.error('Error loading spaceship model:', error);
    }
  );
}

let verticalMovement = 0; // Track the vertical movement
let canScroll = true;  // Flag to prevent continuous movement within the timeout
let scrollTimeout = null; // Track the vertical movement

window.addEventListener('wheel', (event) => {
  if (canScroll) {
    // Only allow vertical movement within the range of verticalLimit
    if (event.deltaY < 0) {
      // Scroll up, move spaceship upwards (increase Y)
      verticalMovement = 1; // Start moving upwards
    } else if (event.deltaY > 0) {
      // Scroll down, move spaceship downwards (decrease Y)
      verticalMovement = -1; // Start moving downwards
    }

    // Prevent further scrolling for 0.5 seconds
    canScroll = false;

    // Set a timeout to reset vertical movement after 0.5 seconds
    clearTimeout(scrollTimeout); // Clear the previous timeout if any
    scrollTimeout = setTimeout(() => {
      verticalMovement = 0;  // Stop vertical movement after 0.5 seconds
      canScroll = true;  // Allow scrolling again
    }, 1000); // 500ms = 0.5 seconds
  }
});


// Update spaceship movement and handle planet proximity
let proximityTriggered = false; // Debounce for proximity detection
function updateSpaceshipMovement() {
  if (!spaceship) return;

  // Handle rotation
  if (moveState.rotateLeft) spaceship.rotation.y += rotationSpeed;
  if (moveState.rotateRight) spaceship.rotation.y -= rotationSpeed;

  // Calculate movement direction (aligned with spaceship's orientation)
  const direction = new THREE.Vector3(1, 0, 0);
  direction.applyQuaternion(spaceship.quaternion);

  // Apply movement
  if (moveState.forward) {
    velocity.addScaledVector(direction, acceleration);
  }
  if (moveState.backward) {
    velocity.addScaledVector(direction, -acceleration);
  }
  // if (moveState.up) {
  //   velocity.y += acceleration;
  // }
  // if (moveState.down) {
  //   velocity.y -= acceleration;
  // }
  spaceship.position.y += verticalMovement * (acceleration + 0.05);

  // Clamp velocity and update position
  velocity.clampLength(0, maxSpeed);
  spaceship.position.add(velocity);
  velocity.multiplyScalar(deceleration);
}


// Update camera to follow the spaceship
// Update camera to follow the spaceship dynamically
function updateCamera() {
  if (!spaceship) return;

  // Camera follows behind the spaceship
  const cameraOffset = new THREE.Vector3(10, 0, 0); // Adjust as needed for better view
  cameraOffset.applyQuaternion(spaceship.quaternion);

  const targetPosition = spaceship.position.clone().sub(cameraOffset); // Offset behind spaceship
  camera.position.lerp(targetPosition, 0.1); // Smooth follow
  camera.lookAt(spaceship.position);
}



// Animation loop
function animate() {
  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  updateSpaceshipMovement();
  updateCamera();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// Handle keyboard input
// Handle keyboard input
function setupKeyboardControls() {
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        moveState.forward = true;
        break;
      case 'ArrowDown':
      case 's':
        moveState.backward = true;
        break;
      case 'ArrowLeft':
      case 'a':
        moveState.rotateLeft = true;  // Rotating left when left arrow is pressed
        break;
      case 'ArrowRight':
      case 'd':
        moveState.rotateRight = true; // Rotating right when right arrow is pressed
        break;
      case 'Shift':
        moveState.up = true;
        break;
      case 'Control':
        moveState.down = true;
        break;
    }
  });

  window.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        moveState.forward = false;
        break;
      case 'ArrowDown':
      case 's':
        moveState.backward = false;
        break;
      case 'ArrowLeft':
      case 'a':
        moveState.rotateLeft = false;
        break;
      case 'ArrowRight':
      case 'd':
        moveState.rotateRight = false;
        break;
      case 'Shift':
        moveState.up = false;
        break;
      case 'Control':
        moveState.down = false;
        break;
    }
  });
}


// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Initialize scene
function init() {
  setupLighting();
  createPlanets();
  loadSpaceship();
  setupKeyboardControls();
  animate();
}

init();