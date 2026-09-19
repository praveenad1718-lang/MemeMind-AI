const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Universal Router API Call Helper
async function callHuggingFace(promptText) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN environment variable is missing on Render.");
  }

  // Uses Hugging Face's router for open models like Qwen or Mistral
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-7B-Instruct", // Reliable, open model (no access form required)
      messages: [
        { role: "system", content: "You are an educational assistant for MemeMind AI." },
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
    console.error("Error in /api/explain:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
