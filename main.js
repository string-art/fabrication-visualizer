// Initialize Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a box with five faces of nails
const nails = [];
const n = 10;
const spacing = 6.29; // in cm
const offset = 33.0;
const rotation = Math.PI / 2;
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, 0, new THREE.Vector3(0, 0, -offset)));           // back face
nails.push(...createFaceOfNails(n, n, spacing, spacing, rotation, 0, new THREE.Vector3(0, -offset, 0)));    // bottom face
nails.push(...createFaceOfNails(n, n, spacing, spacing, rotation, 0, new THREE.Vector3(0, offset, 0)));     // top face
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, rotation, new THREE.Vector3(-offset, 0, 0)));    // left face
nails.push(...createFaceOfNails(n, n, spacing, spacing, 0, rotation, new THREE.Vector3(offset, 0, 0)));     // right face

// TODO: add labels to the nails
function createFaceOfNails(nx, ny, dx, dy, rx, ry, offset) {
    const points = [];
    const startX = -(nx - 1) * dx / 2;
    const startY = -(ny - 1) * dy / 2;
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

// Add the nails to the scene
const geometry = new THREE.BufferGeometry().setFromPoints(nails);
const material = new THREE.PointsMaterial({ color: 0xff0000 });
const pointsObject = new THREE.Points(geometry, material);
scene.add(pointsObject);

camera.position.z = 150;

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