const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateAIResponse(systemPrompt, userPrompt) {
  if (!process.env.GEMINI_API_KEY) {
    return `[Demo Mode]\n${systemPrompt}\nUser Question: ${userPrompt}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\nUser Request: ${userPrompt}`,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini SDK Error:', error);
    throw new Error(`AI Error: ${error.message}`);
  }
}

app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    const systemPrompt = `You are MemeMind AI, an expert CS tutor. Explain using '${style || 'meme'}' style.`;
    const result = await generateAIResponse(systemPrompt, prompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await generateAIResponse('You are a code debugging expert.', code);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    const result = await generateAIResponse('Create a 3-question multiple choice quiz with answer key.', concept);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    const result = await generateAIResponse('Provide a structured step-by-step roadmap.', concept);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/repository', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await generateAIResponse('Answer the knowledge query concisely.', query);
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
