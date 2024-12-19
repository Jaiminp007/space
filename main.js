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
  rotateLeft: false,
  rotateRight: false
};

const velocity = new THREE.Vector3();
const maxSpeed = 0.5;
const acceleration = 0.1;
const deceleration = 0.1;
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
renderer.setPixelRatio(window.devicePixelRatio);
scene.background = new THREE.Color(0x000011);

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Enhanced sun setup
const sunTexture = textureLoader.load('https://space-assets-1.s3.amazonaws.com/sun_texture.jpg');
const sunGeometry = new THREE.SphereGeometry(25, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    emissive: 0xffff00,
    emissiveIntensity: 0.5  // Reduced from 1.0
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, -100);
scene.add(sun);

// Add sun light
const sunLight = new THREE.PointLight(0xffffff, 1, 300);  // Reduced from 2 to 1
sunLight.position.copy(sun.position);
scene.add(sunLight);

// Planet class
class Planet {
  constructor(data) {
      this.name = data.name;
      this.orbitRadius = data.orbitRadius || Math.sqrt(
          Math.pow(data.position[0], 2) + 
          Math.pow(data.position[2], 2)
      );
      this.rotationSpeed = data.rotationSpeed || 0.01;
      this.orbitSpeed = data.orbitSpeed || 0.005;
      this.orbitOffset = data.orbitOffset || 0; // Starting position in the orbit
      
      // Create orbit group
      this.orbitGroup = new THREE.Group();
      this.orbitGroup.position.copy(sun.position);
      
      // Create planet with texture
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const texture = textureLoader.load(this.getTextureUrl(data.name));
      const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.2,
          roughness: 0.8
      });
      
      this.mesh = new THREE.Mesh(geometry, material);
      
      // Set initial position based on orbit offset
      const angle = this.orbitOffset;
      this.mesh.position.x = Math.cos(angle) * this.orbitRadius;
      this.mesh.position.z = Math.sin(angle) * this.orbitRadius;
      
      this.mesh.userData = { name: data.name };
      
      // Create a group for the planet to handle rotation separately
      this.planetGroup = new THREE.Group();
      this.planetGroup.add(this.mesh);
      this.orbitGroup.add(this.planetGroup);
      
      this.createOrbitLine();
  }
  
  createOrbitLine() {
      const segments = 128; // Increased for smoother orbit lines
      const orbitPoints = [];
      
      for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          orbitPoints.push(
              new THREE.Vector3(
                  Math.cos(theta) * this.orbitRadius,
                  0,
                  Math.sin(theta) * this.orbitRadius
              )
          );
      }
      
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3
      });
      
      this.orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      this.orbitLine.position.copy(sun.position);
  }
  
  getTextureUrl(name) {
      const textureMap = {
          'about-me': './assets/planet1.jpg',
          'projects': './assets/planet2.jpg',
          'contact': './assets/planet3.jpg'
      };
      return textureMap[name];
  }
  
  update(deltaTime) {
      // Rotate the planet on its axis
      this.mesh.rotation.y += this.rotationSpeed * deltaTime;
      
      // Update orbit position
      this.orbitGroup.rotation.y += this.orbitSpeed * deltaTime;
      
      // Calculate actual position for collision detection
      const orbital = this.orbitGroup.rotation.y + this.orbitOffset;
      const x = Math.cos(orbital) * this.orbitRadius;
      const z = Math.sin(orbital) * this.orbitRadius;
      
      this.mesh.userData.actualPosition = new THREE.Vector3(
          x + sun.position.x,
          this.mesh.position.y + sun.position.y,
          z + sun.position.z
      );
  }
}

// Create planets with the enhanced Planet class
function createPlanets() {
  const planetData = [
      { 
          name: 'about-me', 
          color: 0x00ff00,
          orbitRadius: 60, // Reduced from 100
          size: 7,
          orbitSpeed: 0.10,
          rotationSpeed: 0.1,
          orbitOffset: 0
      },
      { 
          name: 'projects', 
          color: 0x0000ff,
          orbitRadius: 90, // Reduced from 150
          size: 7,
          orbitSpeed: 0.10,
          rotationSpeed: 0.1,
          orbitOffset: Math.PI * 2/3
      },
      { 
          name: 'contact', 
          color: 0xff0000,
          orbitRadius: 120, // Reduced from 200
          size: 7,
          orbitSpeed: 0.10,
          rotationSpeed: 0.1,
          orbitOffset: Math.PI * 4/3
      }
  ];
  
  planetData.forEach(data => {
      const planet = new Planet(data);
      planets.push(planet);
      scene.add(planet.orbitGroup);
      scene.add(planet.orbitLine);
  });
}

sun.position.set(0, 0, -100); // Moved closer compared to previous -150
sunLight.position.copy(sun.position);

// Update camera's far clipping plane to see further planets
camera.far = 2000;
camera.updateProjectionMatrix();

// Lighting setup
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);  // Reduced from 0.5
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);  // Reduced from 1.0
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);
}
// Load spaceship (keeping your existing implementation)
function loadSpaceship() {
    const loader = new GLTFLoader();
    loader.load(
        './models/spaceship.glb',
        (gltf) => {
            spaceship = gltf.scene;
            spaceship.position.set(100, 15, 100);
            spaceship.scale.set(0.1, 0.1, 0.1);
            spaceship.rotation.y = 360;
            scene.add(spaceship);

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

// Keeping your existing movement and control functions
let verticalMovement = 0;
let canScroll = true;
let scrollTimeout = null;

// Your existing event listeners (wheel, keyboard controls, etc.)
window.addEventListener('wheel', (event) => {
    if (canScroll) {
        verticalMovement = event.deltaY < 0 ? 1 : -1;
        canScroll = false;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            verticalMovement = 0;
            canScroll = true;
        }, 500);
    }
});

function updateSpaceshipMovement() {
    if (!spaceship) return;

    if (moveState.rotateLeft) spaceship.rotation.y += rotationSpeed;
    if (moveState.rotateRight) spaceship.rotation.y -= rotationSpeed;

    const direction = new THREE.Vector3(1, 0, 0);
    direction.applyQuaternion(spaceship.quaternion);

    if (moveState.forward) {
        velocity.addScaledVector(direction, acceleration);
    }
    if (moveState.backward) {
        velocity.addScaledVector(direction, -acceleration);
    }
    
    spaceship.position.y += verticalMovement * (acceleration + 0.07);

    velocity.clampLength(0, maxSpeed);
    spaceship.position.add(velocity);
    velocity.multiplyScalar(deceleration);
}

function updateCamera() {
    if (!spaceship) return;
    const cameraOffset = new THREE.Vector3(10, 0, 0);
    cameraOffset.applyQuaternion(spaceship.quaternion);
    const targetPosition = spaceship.position.clone().sub(cameraOffset);
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(spaceship.position);
}

function checkProximity() {
  if (!spaceship) return;

  const spaceshipPosition = spaceship.position.clone();

  planets.forEach(planet => {
      const planetPosition = planet.mesh.userData.actualPosition.clone();
      const distance = spaceshipPosition.distanceTo(planetPosition);

      if (distance < 20) { // Adjust the threshold as needed
          const planetName = planet.name;

          // Redirect to corresponding page
          switch (planetName) {
              case 'about-me':
                  window.location.href = './planets/about.html';
                  break;
              case 'projects':
                  window.location.href = './planets/project.html';
                  break;
              case 'contact':
                  window.location.href = './planets/contact.html';
                  break;
          }
      }
  });
}


// Enhanced animation loop
function animate() {
  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);
  
  // Update planets
  planets.forEach(planet => planet.update(delta));
  
  // Update sun rotation
  sun.rotation.y += 0.002 * delta;
  
  updateSpaceshipMovement();
  updateCamera();
  checkProximity(); // Add this call
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// Setup keyboard controls (keeping your existing implementation)
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
                moveState.rotateLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
                moveState.rotateRight = true;
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