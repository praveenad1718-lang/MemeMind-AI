// --- 1. Three.js 3D Wireframe Background Setup ---
const canvas = document.getElementById('bg3dCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 3D Geometry Configuration
const geometry = new THREE.TorusKnotGeometry(12, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ 
  color: 0x8b5cf6, 
  wireframe: true, 
  opacity: 0.08, 
  transparent: true 
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

camera.position.z = 50;

function animate() {
  requestAnimationFrame(animate);
  torusKnot.rotation.x += 0.002;
  torusKnot.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 2. Frontend Application Logic ---
let selectedStyle = 'meme';

function selectStyle(element, style) {
  document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedStyle = style;
}

async function handleApiCall(endpoint, bodyData) {
  const outputContainer = document.getElementById('outputContainer');
  const statusBadge = document.getElementById('statusBadge');

  outputContainer.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating response...';
  statusBadge.className = 'status-badge badge-loading';
  statusBadge.innerText = '• GENERATING';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    outputContainer.innerHTML = `<pre class="m-0 text-light">${data.result}</pre>`;
    statusBadge.className = 'status-badge badge-ready';
    statusBadge.innerText = '• AI READY';
  } catch (error) {
    outputContainer.innerHTML = `<span class="text-danger">⚠️ ${error.message}</span>`;
    statusBadge.className = 'status-badge badge-error';
    statusBadge.innerText = '• ERROR';
  }
}

// Feature Handlers
function runExplain() {
  const prompt = document.getElementById('explainInput').value;
  if (!prompt) return alert('Please enter a concept.');
  handleApiCall('/api/explain', { prompt, style: selectedStyle });
}

function runDebug() {
  const code = document.getElementById('debugInput').value;
  if (!code) return alert('Please enter code to debug.');
  handleApiCall('/api/debug', { code });
}

function runQuiz() {
  const concept = document.getElementById('quizInput').value;
  if (!concept) return alert('Please enter a quiz topic.');
  handleApiCall('/api/quiz', { concept });
}

function runRoadmap() {
  const concept = document.getElementById('roadmapInput').value;
  if (!concept) return alert('Please enter a roadmap topic.');
  handleApiCall('/api/roadmap', { concept });
}

function runRepo() {
  const query = document.getElementById('repoInput').value;
  if (!query) return alert('Please enter a search query.');
  handleApiCall('/api/repository', { query });
}
