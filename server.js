const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Gemini API Helper Function using gemini-3.6-flash
async function generateAIResponse(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `[AI Response - Demo Mode]\n\n${systemPrompt}\n\nUser Question: ${userPrompt}\n\n(Note: Set GEMINI_API_KEY in Render Environment Variables.)`;
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

// 1. Explain Route
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    const systemPrompt = `You are MemeMind AI, an expert computer science tutor. Explain the given topic using the '${style || 'meme'}' style. Use clear breakdowns, bullet points, and engaging examples.`;
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
    const systemPrompt = `You are MemeMind AI, a code debugging expert. Identify errors, suggest corrections, and explain the fix clearly.`;
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
    const systemPrompt = `You are MemeMind AI. Create a 3-question multiple-choice quiz based on the given topic with answer keys and explanations.`;
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
    const systemPrompt = `You are MemeMind AI. Provide a structured step-by-step learning roadmap for the given tech topic or subject.`;
    const result = await generateAIResponse(systemPrompt, concept);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Repository Search / AI Query Route
app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    const systemPrompt = `You are MemeMind AI assistant. Answer the repository or knowledge lookup query concisely.`;
    const result = await generateAIResponse(systemPrompt, query);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
