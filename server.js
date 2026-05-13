require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/generate-quiz", async (req, res) => {
  const { topic, count = 15 } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return res.status(400).json({ error: "Topic is required." });
  }

  const questionCount = Math.max(15, Math.min(25, parseInt(count) || 15));

  const systemPrompt = `You are an expert quiz generator for programmers. Generate exactly ${questionCount} multiple-choice questions about the topic provided.

CRITICAL: Return ONLY a raw JSON array. No markdown, no backticks, no preamble, no explanation. Start with [ and end with ].

Each element must follow this exact schema:
{
  "category": "CATEGORY NAME IN CAPS",
  "text": "Question text here?",
  "hint": "One sentence hint.",
  "code": "optional plain-text code snippet, or null if none needed",
  "options": [
    { "label": "Option text (under 70 chars)", "detail": "// brief comment", "correct": true },
    { "label": "Option text", "detail": "// brief comment", "correct": false },
    { "label": "Option text", "detail": "// brief comment", "correct": false },
    { "label": "Option text", "detail": "// brief comment", "correct": false }
  ],
  "explanation": "Clear explanation. May use <code>tags</code> and <strong>tags</strong>.",
  "correct_title": "Short congratulatory phrase under 40 chars"
}

Rules:
1. Exactly ${questionCount} questions
2. Exactly 4 options per question, exactly 1 correct
3. Mix: ~30% beginner, ~40% intermediate, ~30% advanced
4. At least 6 different category names
5. Code snippets in 40%+ of questions where relevant
6. Code must be plain text — NO HTML inside code strings
7. Plausible but clearly-wrong distractors
8. Cover varied sub-topics of the main subject`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate ${questionCount} quiz questions about: ${topic.trim()}`,
        },
      ],
    });

    const raw = (message.content || []).map((b) => b.text || "").join("");
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const questions = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length < 1) {
      throw new Error("Response was not a valid question array");
    }

    // Validate each question
    questions.forEach((q, i) => {
      if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Question ${i + 1} is malformed`);
      }
      if (!q.options.some((o) => o.correct)) {
        throw new Error(`Question ${i + 1} has no correct answer`);
      }
    });

    res.json({ questions });
  } catch (err) {
    console.error("Generation error:", err.message);
    res.status(500).json({
      error: err.message.includes("JSON")
        ? "Claude returned an unexpected format. Please retry."
        : err.message.includes("API")
        ? "Anthropic API error. Please retry in a moment."
        : "Failed to generate quiz: " + err.message,
    });
  }
});

// Fallback: serve index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Quiz server running at http://localhost:${PORT}`);
});
