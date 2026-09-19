const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

async function callHuggingFace(promptText) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN environment variable is missing.");
  }

    const MODEL_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: promptText,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.error && data.error.includes("loading")) {
      throw new Error("Model is currently spinning up. Please try again in 15 seconds.");
    }
    throw new Error(data.error || "Hugging Face API request failed.");
  }

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.trim();
  } else if (data.generated_text) {
    return data.generated_text.trim();
  }

  throw new Error("Unexpected response structure from model.");
}

// 1. Generate Explanation Route
app.post('/api/explain', async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const formattedPrompt = `<|system|>
You are an AI learning assistant. Explain concepts in a simple, punchy ${style || 'meme'} style under 3-4 short sentences.
<|user|>
Explain: "${prompt}"
<|assistant|>`;

    const result = await callHuggingFace(formattedPrompt);
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

    const formattedPrompt = `<|system|>
You are a helpful coding tutor. Identify bugs in code and give clear, simple fixes.
<|user|>
Debug this code and explain what went wrong simply:\n${code}
<|assistant|>`;

    const result = await callHuggingFace(formattedPrompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quiz', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: "Concept is required" });

    const formattedPrompt = `<|system|>
You are an educational quiz master.
<|user|>
Generate 3 short multiple-choice quiz questions to test understanding of: "${concept}". Include choices (A, B, C) and show correct answers at the end.
<|assistant|>`;

    const result = await callHuggingFace(formattedPrompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: "Concept is required" });

    const formattedPrompt = `<|system|>
You are a learning roadmap expert.
<|user|>
Create a step-by-step learning path for "${concept}". List what to learn before it and what to learn after it using simple arrow steps (Step 1 -> Step 2 -> Step 3).
<|assistant|>`;

    const result = await callHuggingFace(formattedPrompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
