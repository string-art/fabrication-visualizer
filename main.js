import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Dimensions (in cm)
const n = 10;
const width = 66.0;
const spacing = 6.29;

// Create a box with five faces of nails
const nails = [];
const offset = width / 2;
const rotation = Math.PI / 2;
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, 0, new THREE.Vector3(0, 0, -offset)));           // back face
nails.push(...createFaceOfNails(n, n, spacing, spacing, rotation, 0, new THREE.Vector3(0, -offset, 0)));    // bottom face
nails.push(...createFaceOfNails(n, n, spacing, spacing, rotation, 0, new THREE.Vector3(0, offset, 0)));     // top face
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, rotation, new THREE.Vector3(-offset, 0, 0)));    // left face
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, rotation, new THREE.Vector3(offset, 0, 0)));     // right face

function createFaceOfNails(nx, ny, dx, dy, rx, ry, offset) {
    const points = [];
    const startX = -(nx - 1) * dx / 2;
    const startY = -(ny - 1) * dy / 2;
    // Create grid of points, row by row
    for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
            let point = new THREE.Vector3(startX + x * dx, startY + y * dy, 0);
            point.applyAxisAngle(new THREE.Vector3(1, 0, 0), rx); // rotation about x axis
            point.applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); // rotation about y axis
            point.add(offset); // offset
            points.push(point);
        }
    }
    return points;
}

// TODO: test!
function indexToLabel(n, i) {
    // Assume five faces of nails
    const faceNum = Math.floor(i / (n * n));
    const indexInFace = i % (n * n);
    const row = Math.floor(indexInFace / n);
    const col = indexInFace % n;
    return `F${faceNum}(row ${row + 1}, col ${col + 1})`;
}

// TODO: new line every 10 labels
function indicesToLabels(n, indices) {
    return indices.map(i => indexToLabel(n, i));
}

// Initialize Three.js
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight); // TODO: adjust sizing
document.body.appendChild(renderer.domElement);

const fov = Math.atan(0.5) * 180 / Math.PI * 2;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000); // TODO: adjust sizing
camera.position.set(0, 0, width * 2);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

// Add the nails to the scene
const geometry = new THREE.BufferGeometry().setFromPoints(nails);
const material = new THREE.PointsMaterial({ color: 0xff0000 });
const pointsObject = new THREE.Points(geometry, material);
scene.add(pointsObject);

// Add an axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Create and configure OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enables inertia for smooth controls
controls.dampingFactor = 0.05; // Adjust for how smooth the motion is
controls.screenSpacePanning = false; // Set to true if you want to pan up/down or left/right

// Create an animation loop to update controls and render the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Only required if controls.enableDamping = true, or if auto-rotate is enabled
    renderer.render(scene, camera);
}

// Start the animation loop
animate();