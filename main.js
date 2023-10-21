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
            point = new THREE.Vector3(startX + x * dx, startY + y * dy, 0);
            point.applyAxisAngle(new THREE.Vector3(1, 0, 0), rx); // rotation about x axis
            point.applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); // rotation about y axis
            point.add(offset); // offset
            points.push(point);
        }
    }
    return points;
}

// TODO: test!
function indexToLabel(nails, n, i) {
    // Assume five faces of nails
    const faceNum = Math.floor(i / (n * n));
    const indexInFace = i % (n * n);
    const row = Math.floor(indexInFace / n);
    const col = indexInFace % n;
    return `F${faceNum}(row ${row + 1}, col ${col + 1})`;
}

// TODO: new line every 10 labels
function indicesToLabels(nails, n, indices) {
    return indices.map(i => indexToLabel(nails, n, i));
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

// Add the threads to the scene
const points = [];
points.push(new THREE.Vector3(0, 0, 0));
points.push(new THREE.Vector3(100, 100, 100));
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new MeshLine();
line.setGeometry(lineGeometry);

const resolution = new THREE.Vector2
renderer.getSize(resolution)
const material2 = new MeshLineMaterial({
    color: new THREE.Color(0x000000),
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    lineWidth: 0.1,
    depthTest: false,
    resolution: resolution,
    alphaTest: 0.5
});
const linesObject = new THREE.Mesh(line, material2);
scene.add(linesObject);

// Add an axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    // pointsObject.rotation.y += 0.005;
    renderer.render(scene, camera);
}

animate();