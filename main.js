import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'

// Nail box (in cm)
const n = 10;
const cubeSize = 66.0;
const spacing = 6.29;
const offset = cubeSize / 2;

const nails = [];

// Camera
const imgWidth = 800;     // determines aspect ratio
const imgHeight = 600;

const distanceFromCube = 100.0;  // i.e., 1m away from box
const verticalPadding = cubeSize / 2;

// Create faces of nails
{
    nails.push(...createFaceOfNails(n, n, spacing, spacing, -Math.PI / 2, 0, new THREE.Vector3(0, offset, 0)));    // (F1) top face
    nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, Math.PI / 2, new THREE.Vector3(offset, 0, 0)));     // (F2) right face
    nails.push(...createFaceOfNails(n, n, spacing, spacing, Math.PI / 2, 0, new THREE.Vector3(0, -offset, 0)));    // (F3) bottom face
    nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, -Math.PI / 2, new THREE.Vector3(-offset, 0, 0)));   // (F4) left face
    nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, Math.PI, new THREE.Vector3(0, 0, -offset)));        // (F5) back face

    function createFaceOfNails(nx, ny, dx, dy, rx, ry, offset) {
        const points = [];
        const startX = -(nx - 1) * dx / 2;
        const startY = -(ny - 1) * dy / 2;
        // Create grid of points, row by row
        for (let y = 0; y < ny; y++) {
            for (let x = 0; x < nx; x++) {
                let point = new THREE.Vector3(startX + x * dx, startY + y * dy, 0);
                point.applyAxisAngle(new THREE.Vector3(1, 0, 0), rx);
                point.applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
                point.add(offset);
                points.push(point);
            }
        }
        return points;
    }
}

// Set up
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000, 1);
renderer.setSize(imgWidth, imgHeight);
document.body.appendChild(renderer.domElement);

// Camera
const fov = Math.atan((cubeSize + 2 * verticalPadding) / (2 * (distanceFromCube + cubeSize * 0.5))) * 180 / Math.PI * 2;
const camera = new THREE.PerspectiveCamera(fov, imgWidth / imgHeight, 1, 1000);
camera.position.set(0, 0, distanceFromCube + cubeSize * 0.5);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

// Add nails to scene
const geometry = new THREE.BufferGeometry().setFromPoints(nails);
const material = new THREE.PointsMaterial({ color: 0xff0000 });
const pointsObject = new THREE.Points(geometry, material);
scene.add(pointsObject);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Controls and animation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();