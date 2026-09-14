const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, script.js, style.css)
app.use(express.static(path.join(__dirname, './')));

// Initialize Google Gen AI client with API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Route for concept explanations
app.post('/api/explain', async (req, res) => {
  try {
    // Check multiple possible key names from frontend payload
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Call active standard production model
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Explain "${promptText}" using a ${style} style. Keep it clear, concise, engaging, and structured for a student.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Fallback route to serve index.html for frontend single-page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Bind to Render's dynamic port environment variable
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
