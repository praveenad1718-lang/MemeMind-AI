const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

async function generateAIResponse(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `[AI Response - Demo Mode]\n\n${systemPrompt}\n\nUser Question: ${userPrompt}`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API call failed.');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI Error: ${error.message}`);
  }
}

// 1. Explain Route (Concise System Prompt)
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    const systemPrompt = `You are MemeMind AI, a CS tutor. Explain the topic using '${style || 'meme'}' style. Keep your response short, punchy, and under 150 words (maximum 3-5 short bullet points or a brief story). Do not write long essays.`;
    const result = await generateAIResponse(systemPrompt, prompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Debug Route
app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    const systemPrompt = `You are MemeMind AI code debugger. State the bug directly and provide the corrected code briefly without long explanations.`;
    const result = await generateAIResponse(systemPrompt, code);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Quiz Route
app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    const systemPrompt = `You are MemeMind AI. Create a short 3-question multiple-choice quiz. Keep answers and explanations concise.`;
    const result = await generateAIResponse(systemPrompt, concept);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Roadmap Route
app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    const systemPrompt = `You are MemeMind AI. Provide a concise step-by-step roadmap with no more than 5 key steps.`;
    const result = await generateAIResponse(systemPrompt, concept);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Repository Route
app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    const systemPrompt = `You are MemeMind AI assistant. Give a short, 2-3 sentence answer.`;
    const result = await generateAIResponse(systemPrompt, query);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
