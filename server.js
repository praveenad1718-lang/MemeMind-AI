const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, './')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    
    // Change model to an active supported model tag
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain "${prompt}" using a ${style} style.`,
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
