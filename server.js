const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.post('/api/explain', async (req, res) => {
  try {
    const promptText = req.body.prompt || req.body.concept || req.body.topic || req.body.text;
    const style = req.body.style || 'meme';

    if (!promptText) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Use standard endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.6-flash',
        input: `Explain "${promptText}" using a ${style} style. Keep it clear, concise, engaging, and structured for a student.`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API Error' });
    }

    // Extract text output from response
    const reply = data.output?.[0]?.text || data.choices?.[0]?.message?.content || JSON.stringify(data);
    res.json({ result: reply });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
