
// Rate-limit tracking flag
let isCoolingDown = false;

async function requestExplanation(promptText) {
  if (!promptText.trim()) return;

  // Prevent spamming requests during cooldown
  if (isCoolingDown) {
    if (answerBox) answerBox.innerText = "⏳ Please wait 15–20 seconds before generating again.";
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

    // Catch 429 Rate Limit directly
    if (response.status === 429) {
      startCooldown(25);
      throw new Error("Quota reached! Cooldown active—try again in 25 seconds.");
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

// 25-Second UI Cooldown Handler
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
