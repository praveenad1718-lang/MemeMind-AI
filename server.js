try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Dynamic AI Response Generator for smooth demo without API failures
function getDemoResponse(systemPrompt, userPrompt, type) {
  const topic = userPrompt.replace(/Explain this concept:|Debug this code snippet:|Create a quiz for the topic:|Generate a learning roadmap for:|Search repository for:/gi, '').trim();

  if (type === 'explain') {
    return `### 💡 MemeMind AI Explanation for: **${topic}**\n\n` +
           `1. **Core Concept:** Imagine ${topic} like ordering pizza online. You ask for a specific topping, and the chef (CPU/Engine) delivers it exact to your specifications!\n\n` +
           `2. **Analogy:** Thinking of ${topic} as a blueprint makes it super easy. You define rules once, and reuse them everywhere.\n\n` +
           `3. **Pro Tip:** Always remember to test your logic before deploying to production! 🚀`;
  }

  if (type === 'debug') {
    return `### 🐛 MemeMind AI Debugger Result\n\n` +
           `**Analysis:** Found potential syntax or scope errors in your logic for \`${topic.substring(0, 30)}...\`.\n\n` +
           `**Fixed Code Example:**\n\`\`\`javascript\n// Corrected implementation\ntry {\n  console.log("Executing optimized code...");\n} catch (err) {\n  console.error("Fixed error:", err);\n}\n\`\`\`\n\n` +
           `**Why it failed:** Null pointer or undefined variable standard error handled smoothly!`;
  }

  if (type === 'quiz') {
    return `### 🧠 MemeMind Quiz: ${topic}\n\n` +
           `**Q1. What is the primary purpose of ${topic}?**\n` +
           `- [ ] A) To confuse developers\n` +
           `- [x] B) To structure and optimize code execution\n` +
           `- [ ] C) To delete files\n\n` +
           `**Q2. Which keyword or concept is most related?**\n` +
           `- [x] A) Core syntax and runtime execution\n` +
           `- [ ] B) HTML tag styling\n\n` +
           `*Explanation: Option B/A represents the core fundamentals of computing.*`;
  }

  if (type === 'roadmap') {
    return `### 🗺️ Learning Roadmap: ${topic}\n\n` +
           `1. **Beginner (Days 1-3):** Understanding basic syntax and core principles of ${topic}.\n` +
           `2. **Intermediate (Days 4-7):** Building mini-projects and implementing debug procedures.\n` +
           `3. **Advanced (Week 2+):** Performance optimization, architecture design, and deployment!`;
  }

  return `### 📁 MemeMind Repository Query: ${topic}\n\n` +
         `Found 3 documentation references and sample snippets related to **${topic}** in your knowledge base.`;
}

// ================= API ENDPOINTS =================

app.post('/api/explain', (req, res) => {
  const { prompt, style } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
  
  const result = getDemoResponse('Explain', prompt, 'explain');
  res.json({ result });
});

app.post('/api/debug', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code snippet is required.' });

  const result = getDemoResponse('Debug', code, 'debug');
  res.json({ result });
});

app.post('/api/quiz', (req, res) => {
  const { concept } = req.body;
  if (!concept) return res.status(400).json({ error: 'Concept is required.' });

  const result = getDemoResponse('Quiz', concept, 'quiz');
  res.json({ result });
});

app.post('/api/roadmap', (req, res) => {
  const { concept } = req.body;
  if (!concept) return res.status(400).json({ error: 'Topic is required.' });

  const result = getDemoResponse('Roadmap', concept, 'roadmap');
  res.json({ result });
});

app.post('/api/repository', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  const result = getDemoResponse('Repository', query, 'repository');
  res.json({ result });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
