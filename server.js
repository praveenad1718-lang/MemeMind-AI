const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.post('/api/explain', async (req, res) => {
  try {
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables' });
    }

    // List models to try sequentially in case of rate limits or high demand
    const models = ['gemini-3.6-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Explain "${promptText}" using a ${style} style. Keep the entire explanation strictly under 3-4 short sentences. Do NOT include full code blocks or subheadings. Be concise and punchy.`
            }]
          }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ result: reply });
        }
      } else {
        lastError = data.error?.message || 'API Error';
        console.warn(`Model ${model} failed with: ${lastError}. Attempting fallback...`);
      }
    }

    // If all models in the loop fail
    res.status(429).json({ error: lastError || 'Google AI servers are currently busy. Please retry in 30 seconds.' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
