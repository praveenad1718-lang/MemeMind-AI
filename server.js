const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Universal Hugging Face Router Call Helper
async function callHuggingFace(promptText) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN environment variable is missing on Render.");
  }

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        { role: "system", content: "You are an educational AI assistant for MemeMind AI." },
        { role: "user", content: promptText }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "Hugging Face API request failed.");
  }

  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  throw new Error("Invalid response format received from Hugging Face.");
}

// 1. Generate Explanation Route
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const promptQuery = `Explain "${prompt}" in a concise ${style || 'meme'} style under 3 sentences.`;
    const result = await callHuggingFace(promptQuery);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Debug My Code Route
app.post('/api/debug', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const promptQuery = `Identify the bug in this code and give a clear, simple fix:\n${code}`;
    const result = await callHuggingFace(promptQuery);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Quiz Generator Route
app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: "Concept is required" });

    const promptQuery = `Generate 3 short multiple-choice quiz questions to test understanding of: "${concept}". Include options (A, B, C) and show correct answers at the end.`;
    const result = await callHuggingFace(promptQuery);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Concept Roadmap Route
app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: "Concept is required" });

    const promptQuery = `Create a step-by-step learning roadmap for "${concept}". List prerequisites first, followed by key steps formatted as: Step 1 -> Step 2 -> Step 3.`;
    const result = await callHuggingFace(promptQuery);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
