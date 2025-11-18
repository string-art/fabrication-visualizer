import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Nail box (in cm)
const n = 20;
const cubeSize = 47.3;
const spacing = 2.15;
const offset = cubeSize / 2;

const nails = [];
const nailColors = [];

// Camera
const imgWidth = 800;     // determines aspect ratio
const imgHeight = 600;

const distanceFromCube = 100.0;  // i.e., 1m away from box
const verticalPadding = cubeSize / 2;

// Create faces of nails
createNailFaces();

function createNailFaces() {
    createFaceOfNails(n, n, spacing, spacing, -Math.PI / 2, 0, new THREE.Vector3(0, offset, 0));    // (F1) top face
    createFaceOfNails(n, n, spacing, spacing, 0, Math.PI / 2, new THREE.Vector3(offset, 0, 0));     // (F2) right face
    createFaceOfNails(n, n, spacing, spacing, Math.PI / 2, 0, new THREE.Vector3(0, -offset, 0));    // (F3) bottom face
    createFaceOfNails(n, n, spacing, spacing, 0, -Math.PI / 2, new THREE.Vector3(-offset, 0, 0));   // (F4) left face
    createFaceOfNails(n, n, spacing, spacing, 0, Math.PI, new THREE.Vector3(0, 0, -offset));        // (F5) back face
}

function createFaceOfNails(nx, ny, dx, dy, rx, ry, offset) {
    const points = [];
    const colors = [];
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

            // Determine color
            if (x === 0 && y === 0) {
                colors.push(new THREE.Color(0x964B00));
            } else if (y === 0 && x >= 1) {
                colors.push(new THREE.Color(0xff0000)); // red for nails on the first row (x)
                       } else if (x === 0 && y >= 1) {
                colors.push(new THREE.Color(0x00ff00)); // green for nails on the first column (y)
            } else {
                colors.push(new THREE.Color(0x000000)); // Default black color
            }
        }
    }
    nails.push(...points);
    nailColors.push(...colors);
}

// Set up renderer first
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
container.appendChild(renderer.domElement);

// Set up camera
const fov = Math.atan((cubeSize + 2 * verticalPadding) / (2 * (distanceFromCube + cubeSize * 0.5))) * 180 / Math.PI * 2;
const camera = new THREE.PerspectiveCamera(fov, imgWidth / imgHeight, 1, 1000);
camera.position.set(0, 0, distanceFromCube + cubeSize * 0.5);
camera.lookAt(0, 0, 0);

function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Add event listener and initial resize
window.addEventListener('resize', onWindowResize);
onWindowResize(); // Initial size

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);  // Light grey color

// Add nails to scene
const geometry = new THREE.BufferGeometry().setFromPoints(nails);
geometry.setAttribute('color', new THREE.Float32BufferAttribute(nailColors.flatMap(color => color.toArray()), 3));
const material = new THREE.PointsMaterial({ vertexColors: true, size: 1 }); // Increase size of points
const pointsObject = new THREE.Points(geometry, material);
scene.add(pointsObject);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Controls and animation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.target.set(0, 0, 0);
controls.minDistance = cubeSize;
controls.maxDistance = distanceFromCube * 2;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Threading
let lineSegments = [];
let currentSegmentIndex = -1;
const lines = new THREE.Group();  // Will hold all line segments
scene.add(lines);

let showAllSegments = false;

async function loadStringSequence(file) {
    const text = await file.text();

    // Parse all points into a single array, ignoring line breaks
    const allPoints = text
        .replace(/\n/g, '\t')  // Replace line breaks with tabs
        .split('\t')
        .filter(point => point.trim())  // Remove empty entries
        .map(point => {
            const [face, row, col] = point.slice(1, -1).split(',').map(s => s.trim());
            return {
                face: face.substring(1),
                row: parseInt(row.substring(1))-1,
                col: parseInt(col.substring(1))-1
            };
        });

    // Create segments between consecutive points
    lineSegments = [];
    for (let i = 0; i < allPoints.length - 1; i++) {
        lineSegments.push([allPoints[i], allPoints[i + 1]]);
    }

    currentSegmentIndex = -1;
    updateLineVisualization();
    updateStepCounter();
}

function getNailPosition(face, row, col) {
    const index = (row * n) + col;
    const faceOffset = (face - 1) * (n * n);
    return nails[faceOffset + index];
}

function updateLineVisualization() {
    lines.clear();

    if (currentSegmentIndex < 0) return;

    if (showAllSegments) {
        // Show all segments up to current index
        for (let segIdx = 0; segIdx <= currentSegmentIndex; segIdx++) {
            const segment = lineSegments[segIdx];
            const points = [
                getNailPosition(segment[0].face, segment[0].row, segment[0].col),
                getNailPosition(segment[1].face, segment[1].row, segment[1].col)
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            if (segIdx === currentSegmentIndex) {
                // Apply gradient to the current segment
                const colors = new Float32Array([
                    0, 0, 1,  // Start color (blue)
                    1, 0, 0   // End color (red)
                ]);
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                const material = new THREE.LineBasicMaterial({ vertexColors: true });
                const line = new THREE.Line(geometry, material);
                lines.add(line);
            } else {
                // Default color for previous segments
                const material = new THREE.LineBasicMaterial({ color: 0x000000 });
                const line = new THREE.Line(geometry, material);
                lines.add(line);
            }
        }
    } else {
        // Show only current segment (existing behavior)
        const segment = lineSegments[currentSegmentIndex];
        const points = [
            getNailPosition(segment[0].face, segment[0].row, segment[0].col),
            getNailPosition(segment[1].face, segment[1].row, segment[1].col)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const colors = new Float32Array([
            0, 0, 1,  // Start color (blue)
            1, 0, 0   // End color (red)
        ]);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        const line = new THREE.Line(geometry, material);
        lines.add(line);
    }
}

function updateInstructions() {
    const instructionElement = document.getElementById('instructionText');
    if (currentSegmentIndex < 0 || currentSegmentIndex >= lineSegments.length) {
        instructionElement.textContent = "No thread instruction available.";
        return;
    }

    const segment = lineSegments[currentSegmentIndex];
    const startNail = segment[0];
    const endNail = segment[1];

    instructionElement.textContent = `(F${startNail.face}, R${startNail.row+1}, C${startNail.col+1}) to (F${endNail.face}, R${endNail.row+1}, C${endNail.col+1})`;
}

function updateStepCounter() {
    const counter = document.getElementById('stepCounter');
    counter.textContent = `Step: ${currentSegmentIndex + 1}/${lineSegments.length}`;

    // Update the max value for the jump input
    const jumpInput = document.getElementById('jumpToStep');
    jumpInput.max = lineSegments.length;
}

// Modify the keyboard event listeners and add button listeners
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowRight':
            handleNext();
            break;
        case 'ArrowLeft':
            handlePrev();
            break;
    }
});

function handleNext() {
    if (currentSegmentIndex < lineSegments.length - 1) {
        currentSegmentIndex++;
        updateLineVisualization();
        updateInstructions();
        updateStepCounter();
    }
}

function handlePrev() {
    if (currentSegmentIndex >= 0) {
        currentSegmentIndex--;
        updateLineVisualization();
        updateInstructions();
        updateStepCounter();
    }
}

function handleJump() {
    const jumpInput = document.getElementById('jumpToStep');
    const stepNumber = parseInt(jumpInput.value);

    // Validate the input
    if (isNaN(stepNumber)) {
        alert('Please enter a valid step number.');
        return;
    }

    if (stepNumber < 1 || stepNumber > lineSegments.length) {
        alert(`Please enter a step number between 1 and ${lineSegments.length}.`);
        return;
    }

    // Jump to the step (stepNumber - 1 because array is 0-indexed)
    currentSegmentIndex = stepNumber - 1;
    updateLineVisualization();
    updateInstructions();
    updateStepCounter();

    // Clear the input field
    jumpInput.value = '';
}

// Add these event listeners after scene setup
document.getElementById('sequenceFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadStringSequence(file);
    }
});

document.getElementById('prevButton').addEventListener('click', handlePrev);
document.getElementById('nextButton').addEventListener('click', handleNext);
document.getElementById('jumpButton').addEventListener('click', handleJump);

// Allow pressing Enter in the jump input field
document.getElementById('jumpToStep').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleJump();
    }
});

// Add this after your existing event listeners
document.getElementById('showAllSegments').addEventListener('change', (event) => {
    showAllSegments = event.target.checked;
    updateLineVisualization();
});

// Remove or comment out this line since we're now using file upload
// loadStringSequence('path/to/your/sequence.txt');