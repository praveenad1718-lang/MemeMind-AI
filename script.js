document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn') || document.querySelector('button');
  const answerBox = document.getElementById('answerBox');
  const followupRow = document.getElementById('followupRow');
  const statusDot = document.getElementById('statusDot');

  let selectedStyle = 'meme';

  // Style selector logic
  document.querySelectorAll('.style-card, [data-style]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.style-card, [data-style]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedStyle = card.dataset.style || card.innerText.toLowerCase().includes('story') ? 'story' : 
                      card.innerText.toLowerCase().includes('real') ? 'real' : 'meme';
    });
  });

  async function sendRequest(promptText) {
    if (!promptText) return;

    if (statusDot) statusDot.innerText = '• THINKING...';
    if (answerBox) answerBox.innerHTML = '<p class="placeholder">Generating explanation...</p>';

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, style: selectedStyle })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      if (answerBox) answerBox.innerText = data.result;
      if (statusDot) statusDot.innerText = '• AI READY';
      if (followupRow) followupRow.classList.remove('hidden');

    } catch (err) {
      console.error(err);
      if (answerBox) answerBox.innerText = `Error: ${err.message}`;
      if (statusDot) statusDot.innerText = '• ERROR';
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const input = document.getElementById('promptInput') || document.querySelector('textarea');
      if (input && input.value.trim()) {
        sendRequest(input.value.trim());
      }
    });
  }
});
