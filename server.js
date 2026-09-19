try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Serve static frontend files (index.html, styles.css, script.js)
app.use(express.static(path.join(__dirname)));

// Helper function to call OpenAI/Ollama/Gemini-compatible API or generate fallback response
async function generateAIResponse(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    // Return a structured response if no API key is provided yet
    return `[AI Response - Mock Mode]\n\nSystem: ${systemPrompt}\nPrompt: ${userPrompt}\n\n(Note: Set OPENAI_API_KEY or GEMINI_API_KEY in your .env file to enable live AI responses.)`;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Request Error:', error);
    throw error;
  }
}

// ================= API ENDPOINTS =================

// 1. EXPLAIN API
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

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
    res.status(500).json({ error: error.message || 'Failed to generate explanation.' });
  }
});

// 2. DEBUG API
app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code snippet is required.' });
    }

    const systemPrompt = 'You are MemeMind AI Debugger. Identify bugs, explain why they happen, and provide corrected code with clear explanations.';
    const result = await generateAIResponse(systemPrompt, `Debug this code snippet:\n\n${code}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to debug code.' });
  }
});

// 3. QUIZ API
app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) {
      return res.status(400).json({ error: 'Concept/Topic is required.' });
    }

    const systemPrompt = 'You are MemeMind AI Quiz Master. Generate 3 multiple-choice questions with answer choices and explanations.';
    const result = await generateAIResponse(systemPrompt, `Create a quiz for the topic: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create quiz.' });
  }
});

// 4. ROADMAP API
app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const systemPrompt = 'You are MemeMind AI Roadmap Guide. Create a step-by-step structured learning roadmap broken into Beginner, Intermediate, and Advanced stages.';
    const result = await generateAIResponse(systemPrompt, `Generate a learning roadmap for: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate roadmap.' });
  }
});

// 5. REPOSITORY API
app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const systemPrompt = 'You are MemeMind AI Repository Search. Provide key technical summaries, references, and code snippets relevant to the user query.';
    const result = await generateAIResponse(systemPrompt, `Search repository for: ${query}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to search repository.' });
  }
});

// Fallback Route to serve index.html for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
