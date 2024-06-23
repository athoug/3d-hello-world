import * as THREE from 'three';

// to move around the scene we will need to add orbit control
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// we need three things in every three project:
// 1. a scene
const scene = new THREE.Scene();

// 2. a camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// 3. a renderer
const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#app'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// move the camera along the z-axes
camera.position.setZ(10);

// we want to add more interactivity to our scene so we will import orbit controls (go up 👆🏼)
// instantiate the orbit control
const controls = new OrbitControls(camera, renderer.domElement);

// 2. Load the Earth texture
const loader = new THREE.TextureLoader();
const earthTexture = loader.load('./public/images/earth.jpg');
const bumpMap = loader.load('./public/images/earth-bump-map.jpg');
const specularMap = loader.load('./public/images/earth-specular-map.jpg');

scene.position.setZ(3);
camera.position.setY(3);

// 3. Create the sphere geometry and apply the texture
const geometry = new THREE.SphereGeometry(1.5, 32, 32); // Radius, width segments, height segments
const material = new THREE.MeshPhongMaterial({
	map: earthTexture,
	bumpMap: bumpMap,
	bumpScale: 0.5,
	specularMap: specularMap,
	shininess: 100,
	// side: THREE.BackSide,
	specular: new THREE.Color('grey'), // Adjust specular color for shininess
});

const earth = new THREE.Mesh(geometry, material);
earth.receiveShadow = true;

// 4. Add the sphere to the scene
scene.add(earth);

// 5. Add a light source
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1); // Point light with intensity
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

// Optional: Add a helper to visualize the light source
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

// 6. add function to populate scene with stars
function addStar() {
	const geometry = new THREE.SphereGeometry(0.08, 14, 14);
	const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const star = new THREE.Mesh(geometry, material);

	// randomly position the stars by generating a random x, y, z for each star
	const [x, y, z] = Array(3)
		.fill()
		.map(() => THREE.MathUtils.randFloatSpread(100));

	star.position.set(x, y, z);
	scene.add(star);
}

// now we just need to decide how many stars we want
Array(300).fill().forEach(addStar);

// 7. Add a font to the scene
const fontLoader = new FontLoader();
let textMesh;
fontLoader.load('./public/fonts/Karla.json', (font) => {
	const textGeometry = new TextGeometry('Hello World!', {
		font: font,
		size: 0.25, // size of the text
		depth: 0.5, // thickness of the text
	});

	// Center the text geometry
	textGeometry.computeBoundingBox();
	const boundingBox = textGeometry.boundingBox;
	const centerOffsetX = -0.5 * (boundingBox.max.x - boundingBox.min.x);
	const centerOffsetY = -0.5 * (boundingBox.max.y - boundingBox.min.y);
	const centerOffsetZ = -0.5 * (boundingBox.max.z - boundingBox.min.z);
	textGeometry.translate(centerOffsetX, centerOffsetY, centerOffsetZ);

	// const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
	textMesh = new THREE.Mesh(textGeometry, [
		new THREE.MeshPhongMaterial({ color: 0xffffff }),
		new THREE.MeshPhongMaterial({ color: 0x0000ff }),
	]);

	textMesh.castShadow = true;
	// Position the text
	textMesh.position.set(0, 2, 0);
	scene.add(textMesh);
});

// 8. Render the scene
function animate() {
	// animate the earth
	earth.rotation.y += 0.005;

	// Animate textMesh if it has been created
	if (textMesh) {
		// textMesh.rotation.z += 0.01; // Rotate around Y-axis
		textMesh.rotation.y += 0.005; // Rotate around X-axis
	}

	// we need to call controls update to reflect the changes
	// now you can pan around with your mouse
	controls.update();
	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
