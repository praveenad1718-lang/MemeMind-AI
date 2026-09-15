document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('promptInput');
  const answerBox = document.getElementById('answerBox');
  const followupRow = document.getElementById('followupRow');
  const followupInput = document.getElementById('followupInput');
  const followupBtn = document.getElementById('followupBtn');
  const saveToRepoBtn = document.getElementById('saveToRepoBtn');
  const statusDot = document.getElementById('statusDot');

  const repoPillsContainer = document.getElementById('repoPills');
  const addRepoBtn = document.getElementById('addRepoBtn');
  const deleteRepoBtn = document.getElementById('deleteRepoBtn');
  const activeRepoNameEl = document.getElementById('activeRepoName');
  const repoSavedListEl = document.getElementById('repoSavedList');

  let selectedStyle = 'meme';
  let isCoolingDown = false;

  // LocalStorage Repositories Setup
  let repositories = JSON.parse(localStorage.getItem('memeMindRepos')) || ['Python', 'Java', 'C++', 'English'];
  let activeRepo = repositories[0] || 'Python';
  let repoData = JSON.parse(localStorage.getItem('memeMindRepoData')) || {};

  function renderRepos() {
    repoPillsContainer.innerHTML = '';
    repositories.forEach(repo => {
      const pill = document.createElement('button');
      pill.className = `repo-pill ${repo === activeRepo ? 'active' : ''}`;
      pill.innerText = `📦 ${repo}`;
      pill.addEventListener('click', () => {
        activeRepo = repo;
        renderRepos();
        renderSavedItems();
      });
      repoPillsContainer.appendChild(pill);
    });
    if (activeRepoNameEl) activeRepoNameEl.innerText = activeRepo;
  }

  function renderSavedItems() {
    repoSavedListEl.innerHTML = '';
    const items = repoData[activeRepo] || [];
    if (items.length === 0) {
      repoSavedListEl.innerHTML = '<p class="placeholder">No saved explanations in this repo yet.</p>';
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'saved-item-card';
      card.innerHTML = `
        <div class="saved-item-header">
          <strong>${item.prompt}</strong>
          <div class="saved-actions">
            <span class="badge">${item.style}</span>
            <button class="delete-btn" onclick="deleteSavedItem(${index})">🗑️ Delete</button>
          </div>
        </div>
        <p class="saved-item-text">${item.response}</p>
      `;
      repoSavedListEl.appendChild(card);
    });
  }

  // Global Delete Chat Handler
  window.deleteSavedItem = function(index) {
    if (repoData[activeRepo]) {
      repoData[activeRepo].splice(index, 1);
      localStorage.setItem('memeMindRepoData', JSON.stringify(repoData));
      renderSavedItems();
    }
  };

  // Create Repo Handler
  if (addRepoBtn) {
    addRepoBtn.addEventListener('click', () => {
      const newRepo = prompt('Enter new repository name (e.g. Web-Dev, Physics):');
      if (newRepo && newRepo.trim()) {
        const formattedName = newRepo.trim().replace(/\s+/g, '-');
        if (!repositories.includes(formattedName)) {
          repositories.push(formattedName);
          activeRepo = formattedName;
          localStorage.setItem('memeMindRepos', JSON.stringify(repositories));
          renderRepos();
          renderSavedItems();
        }
      }
    });
  }

  // Delete Entire Active Repo Handler
  if (deleteRepoBtn) {
    deleteRepoBtn.addEventListener('click', () => {
      if (repositories.length <= 1) {
        alert("At least one repository must remain!");
        return;
      }

      if (confirm(`Are you sure you want to delete the "${activeRepo}" repository and all its saved chats?`)) {
        delete repoData[activeRepo];
        localStorage.setItem('memeMindRepoData', JSON.stringify(repoData));

        repositories = repositories.filter(r => r !== activeRepo);
        activeRepo = repositories[0];
        localStorage.setItem('memeMindRepos', JSON.stringify(repositories));

        renderRepos();
        renderSavedItems();
      }
    });
  }

  // Style Selection Handler
  const styleCards = document.querySelectorAll('.style-card, [data-style]');
  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      styleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const text = card.innerText.toLowerCase();
      if (card.dataset.style) {
        selectedStyle = card.dataset.style;
      } else if (text.includes('story')) {
        selectedStyle = 'story';
      } else if (text.includes('real')) {
        selectedStyle = 'real life';
      } else {
        selectedStyle = 'meme';
      }
    });
  });

  // Core Request Function
  async function requestExplanation(promptText) {
    if (!promptText.trim()) return;

    if (isCoolingDown) {
      if (answerBox) answerBox.innerText = "⏳ Please wait for the rate limit cooldown to finish.";
      return;
    }

    if (statusDot) statusDot.innerText = '• THINKING...';
    if (answerBox) answerBox.innerHTML = '<p class="placeholder">Generating explanation...</p>';

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, style: selectedStyle })
      });

      const data = await response.json();

      if (response.status === 429) {
        startCooldown(25);
        throw new Error("Quota exceeded! Cooldown active—try again in 25 seconds.");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      if (answerBox) answerBox.innerText = data.result;
      if (statusDot) statusDot.innerText = '• AI READY';
      if (followupRow) followupRow.classList.remove('hidden');

    } catch (err) {
      console.error('Request Error:', err);
      if (answerBox) answerBox.innerText = `⚠️ ${err.message}`;
      if (statusDot) statusDot.innerText = '• RATE LIMITED';
    }
  }

  function startCooldown(seconds) {
    isCoolingDown = true;
    if (generateBtn) generateBtn.disabled = true;

    let remaining = seconds;
    const timer = setInterval(() => {
      remaining--;
      if (generateBtn) generateBtn.innerText = `⏳ Wait ${remaining}s...`;

      if (remaining <= 0) {
        clearInterval(timer);
        isCoolingDown = false;
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.innerText = '✨ Generate Learning →';
        }
        if (statusDot) statusDot.innerText = '• AI READY';
      }
    }, 1000);
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (promptInput && promptInput.value.trim()) {
        requestExplanation(promptInput.value.trim());
      }
    });
  }

  if (followupBtn) {
    followupBtn.addEventListener('click', () => {
      const mainText = promptInput ? promptInput.value.trim() : '';
      const followText = followupInput ? followupInput.value.trim() : '';
      const combinedPrompt = followText 
        ? `${mainText} (Focus specifically on: ${followText})`
        : mainText;

      if (combinedPrompt) {
        requestExplanation(combinedPrompt);
      }
    });
  }

  if (saveToRepoBtn) {
    saveToRepoBtn.addEventListener('click', () => {
      const currentPrompt = promptInput ? promptInput.value.trim() : 'Topic';
      const currentAnswer = answerBox ? answerBox.innerText : '';

      if (!currentAnswer || currentAnswer.includes('Generating') || currentAnswer.includes('⚠️')) return;

      if (!repoData[activeRepo]) {
        repoData[activeRepo] = [];
      }

      repoData[activeRepo].push({
        prompt: currentPrompt,
        response: currentAnswer,
        style: selectedStyle
      });

      localStorage.setItem('memeMindRepoData', JSON.stringify(repoData));
      renderSavedItems();
      alert(`Saved to repository: ${activeRepo}`);
    });
  }

  // Three.js 3D Background Initialization
  const bgCanvas = document.getElementById('bg');
  if (bgCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    camera.position.setZ(30);

    function animate() {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.005;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  renderRepos();
  renderSavedItems();
});
