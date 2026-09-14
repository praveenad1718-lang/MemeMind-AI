document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn') || document.querySelector('button');
  const promptInput = document.getElementById('promptInput') || document.querySelector('textarea');
  const answerBox = document.getElementById('answerBox');
  const followupRow = document.getElementById('followupRow');
  const followupInput = document.getElementById('followupInput');
  const followupBtn = document.getElementById('followupBtn');
  const statusDot = document.getElementById('statusDot');

  let selectedStyle = 'meme';

  // Style Selection Handling
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

  // Core Request Handler
  async function requestExplanation(promptText) {
    if (!promptText.trim()) return;

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
        throw new Error(data.error || 'Server error occurred');
      }

      if (answerBox) answerBox.innerText = data.result;
      if (statusDot) statusDot.innerText = '• AI READY';
      if (followupRow) followupRow.classList.remove('hidden');

    } catch (err) {
      console.error('Request Error:', err);
      if (answerBox) answerBox.innerText = `Error: ${err.message}`;
      if (statusDot) statusDot.innerText = '• ERROR';
    }
  }

  // Initial Generate Button Click
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (promptInput && promptInput.value.trim()) {
        requestExplanation(promptInput.value.trim());
      }
    });
  }

  // Follow-up "Explain differently" Button Click
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
});
