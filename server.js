const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Available models fallback order
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'models/gemini-2.0-flash',
  'models/gemini-1.5-flash'
];

app.post('/api/explain', async (req, res) => {
  try {
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let lastError = null;
    let responseText = null;

    // Try candidate models sequentially until one works
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Explain "${promptText}" using a ${style} style. Keep it concise, engaging, and clear for a student.`,
        });

        if (response && response.text) {
          responseText = response.text;
          console.log(`Successfully generated content using model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
      }
    }

    if (responseText) {
      return res.json({ result: responseText });
    }

    throw lastError || new Error('All model fallbacks failed.');
  } catch (error) {
    console.error('API Final Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
