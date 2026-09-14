const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, './')));

// Initialize Google Gen AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Route
app.post('/api/explain', async (req, res) => {
  try {
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Corrected model string with full path format
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: `Explain "${promptText}" using a ${style} style. Keep it clear, engaging, and easy to understand for a student.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Port Binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
