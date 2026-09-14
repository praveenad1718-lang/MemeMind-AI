
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, script.js, style.css)
app.use(express.static(path.join(__dirname, './')));

// Initialize Google Gen AI client with API key from Render environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Endpoint for generating concept explanations
app.post('/api/explain', async (req, res) => {
  try {
    // Check multiple possible frontend payload keys to prevent missing prompt errors
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Call Gemini model using active stable model tag
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain "${promptText}" using a ${style} style. Keep it concise, clear, engaging, and easy to understand for a student.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Fallback route to serve index.html for web application routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Bind to dynamic port assigned by Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
