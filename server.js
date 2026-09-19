try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to call Hugging Face / OpenAI / Gemini API
async function generateAIResponse(systemPrompt, userPrompt) {
  const hfToken = process.env.HF_TOKEN;
  const openAiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  // 1. If Hugging Face Token is provided
  if (hfToken) {
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfToken}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Hugging Face API request failed.');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('HF API Error:', error);
      throw error;
    }
  }

  // 2. Standard OpenAI/Gemini fallback
  if (openAiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API request failed');
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // 3. Demo fallback if no key is found
  return `[AI Response - Demo Mode]\n\nSystem: ${systemPrompt}\nPrompt: ${userPrompt}\n\n(Note: Set HF_TOKEN in your Render environment variables to enable live AI responses.)`;
}

// ================= API ENDPOINTS =================

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
    res.status(500).json({ error: error.message || 'Failed to generate explanation.' });
  }
});

app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code snippet is required.' });

    const systemPrompt = 'You are MemeMind AI Debugger. Identify bugs, explain why they happen, and provide corrected code with clear explanations.';
    const result = await generateAIResponse(systemPrompt, `Debug this code snippet:\n\n${code}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to debug code.' });
  }
});

app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: 'Concept/Topic is required.' });

    const systemPrompt = 'You are MemeMind AI Quiz Master. Generate 3 multiple-choice questions with answer choices and explanations.';
    const result = await generateAIResponse(systemPrompt, `Create a quiz for the topic: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create quiz.' });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: 'Topic is required.' });

    const systemPrompt = 'You are MemeMind AI Roadmap Guide. Create a step-by-step structured learning roadmap broken into Beginner, Intermediate, and Advanced stages.';
    const result = await generateAIResponse(systemPrompt, `Generate a learning roadmap for: ${concept}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate roadmap.' });
  }
});

app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required.' });

    const systemPrompt = 'You are MemeMind AI Repository Search. Provide key technical summaries, references, and code snippets relevant to the user query.';
    const result = await generateAIResponse(systemPrompt, `Search repository for: ${query}`);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to search repository.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
