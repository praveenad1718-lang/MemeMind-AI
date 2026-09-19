try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to call Google Gemini API
async function generateAIResponse(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `[AI Response - Demo Mode]\n\n${systemPrompt}\n\nUser Question: ${userPrompt}\n\n(Note: Set GEMINI_API_KEY in Render Environment Variables for live Gemini responses.)`;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API connection error');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI Error: ${error.message}`);
  }
}

// 1. EXPLAIN API
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    let styleInstruction = 'Explain in a fun, meme-inspired, hilarious way with coding humor.';
    if (style === 'story') {
      styleInstruction = 'Explain using an engaging narrative story with relatable characters.';
    } else if (style === 'real-life') {
      styleInstruction = 'Explain using practical real-world analogies and everyday life comparisons.';
    }

    const systemPrompt = `You are MemeMind AI, a creative computer science tutor. ${styleInstruction}`;
    const result = await generateAIResponse(systemPrompt, `Explain this concept: ${prompt}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. DEBUG API
app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code snippet is required.' });

    const systemPrompt = 'You are MemeMind AI Debugger. Identify bugs, explain why they happen, and provide corrected code with clear explanations.';
    const result = await generateAIResponse(systemPrompt, `Debug this code snippet:\n\n${code}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. QUIZ API
app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: 'Concept/Topic is required.' });

    const systemPrompt = 'You are MemeMind AI Quiz Master. Generate 3 multiple-choice questions with answer choices and explanations.';
    const result = await generateAIResponse(systemPrompt, `Create a quiz for the topic: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ROADMAP API
app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: 'Topic is required.' });

    const systemPrompt = 'You are MemeMind AI Roadmap Guide. Create a step-by-step structured learning roadmap broken into Beginner, Intermediate, and Advanced stages.';
    const result = await generateAIResponse(systemPrompt, `Generate a learning roadmap for: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. REPOSITORY API
app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required.' });

    const systemPrompt = 'You are MemeMind AI Repository Search. Provide key technical summaries, references, and code snippets relevant to the user query.';
    const result = await generateAIResponse(systemPrompt, `Search repository for: ${query}`);

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
