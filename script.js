// ---------- 3D MODEL (Three.js) ----------
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.IcosahedronGeometry(1.4, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x8fa6ff,
  wireframe: true,
});
const shape = new THREE.Mesh(geometry, material);
scene.add(shape);

const coreGeometry = new THREE.IcosahedronGeometry(0.6, 0);
const coreMaterial = new THREE.MeshBasicMaterial({
  color: 0xff9fd6,
  transparent: true,
  opacity: 0.5,
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

function animate() {
  requestAnimationFrame(animate);
  shape.rotation.x += 0.004;
  shape.rotation.y += 0.006;
  core.rotation.y -= 0.008;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// ---------- APP STATE ----------
let selectedStyle = "meme";
let selectedSubject = "Python";
let lastConcept = "";
let lastAnswer = "";
let currentChatId = null;

// ---------- DOM ELEMENTS ----------
const styleButtons = document.querySelectorAll(".style-btn");
const subjectButtons = document.querySelectorAll(".subject-btn");
const conceptInput = document.getElementById("conceptInput");
const generateBtn = document.getElementById("generateBtn");
const answerBox = document.getElementById("answerBox");
const statusDot = document.getElementById("statusDot");
const followupRow = document.getElementById("followupRow");
const followupInput = document.getElementById("followupInput");
const followupBtn = document.getElementById("followupBtn");
const historyList = document.getElementById("historyList");
const historySearch = document.getElementById("historySearch");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const currentChatMeta = document.getElementById("currentChatMeta");

// ---------- LOCAL STORAGE REPOSITORY ----------
function getChats() {
  return JSON.parse(localStorage.getItem("mememindChats") || "[]");
}

function saveChats(chats) {
  localStorage.setItem("mememindChats", JSON.stringify(chats));
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function formatDate(iso) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function saveChatToRepository(answer) {
  const chats = getChats();
  if (currentChatId) {
    const existing = chats.find((chat) => chat.id === currentChatId);
    if (existing) {
      existing.answer = answer;
      existing.updatedAt = new Date().toISOString();
      existing.followups = existing.followups || [];
      saveChats(chats);
      renderHistory();
      return;
    }
  }

  currentChatId = Date.now();
  chats.unshift({
    id: currentChatId,
    subject: selectedSubject,
    concept: lastConcept,
    style: selectedStyle,
    answer,
    followups: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  saveChats(chats);
  renderHistory();
}

function renderHistory() {
  const query = historySearch.value.trim().toLowerCase();
  const chats = getChats().filter((chat) => {
    const matchesSubject = chat.subject === selectedSubject;
    const matchesSearch =
      !query ||
      chat.concept.toLowerCase().includes(query) ||
      chat.answer.toLowerCase().includes(query);
    return matchesSubject && matchesSearch;
  });

  if (!chats.length) {
    historyList.innerHTML = `<p class="placeholder">No saved chats for ${selectedSubject}${query ? " matching your search" : ""}.</p>`;
    return;
  }

  historyList.innerHTML = chats
    .map(
      (chat) => `
    <div class="history-item">
      <button class="history-open" data-id="${chat.id}">
        <span class="history-icon">📘</span>
        <span class="history-info">
          <strong>${escapeHtml(chat.concept)}</strong>
          <small>${escapeHtml(chat.style)} • ${formatDate(chat.updatedAt || chat.createdAt)}</small>
        </span>
      </button>
      <button class="history-delete" data-id="${chat.id}">🗑️</button>
    </div>`
    )
    .join("");
}

// ---------- SELECTION EVENT LISTENERS ----------
subjectButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    subjectButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSubject = btn.dataset.subject;
    renderHistory();
  });
});

styleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    styleButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedStyle = btn.dataset.style;
  });
});

function setLoading(isLoading, message) {
  generateBtn.disabled = isLoading;
  statusDot.textContent = isLoading ? "● THINKING…" : "● AI READY";
  statusDot.style.color = isLoading ? "#ffcf7f" : "#5cf0a0";
  if (isLoading) answerBox.innerHTML = `<p class="placeholder">${message}</p>`;
}

// ---------- GENERATE ACTION ----------
generateBtn.addEventListener("click", async () => {
  const concept = conceptInput.value.trim();
  if (!concept) {
    answerBox.innerHTML = `<p style="color:#ff8f8f">Please enter a topic first!</p>`;
    return;
  }

  lastConcept = concept;
  setLoading(true, "Generating explanation with Ollama...");

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, style: selectedStyle, subject: selectedSubject }),
    });

    const data = await res.json();

    if (!res.ok) {
      answerBox.innerHTML = `<p style="color:#ff8f8f">${escapeHtml(data.error || "Server Error")}</p>`;
    } else {
      lastAnswer = data.answer;
      answerBox.textContent = data.answer;
      saveChatToRepository(data.answer);
    }
  } catch (err) {
    console.error("Fetch failure error details:", err);
    answerBox.innerHTML = `<p style="color:#ff8f8f">Could not reach server. Verify server logs and press F12 for console errors.</p>`;
  } finally {
    setLoading(false);
  }
});

renderHistory();