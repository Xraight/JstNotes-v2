import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini client lazily
function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// Auto-detect models endpoint
app.post("/api/ai/models", async (req, res) => {
  const { provider, apiKey } = req.body;

  try {
    if (provider === "gemini") {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY;
      const models = [
        { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Fast & Balanced)", default: true },
        { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite (Ultra Low Latency)" },
        { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (Deep Reasoning)" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      ];
      return res.json({ models, hasKey: !!keyToUse });
    }

    if (provider === "groq") {
      const keyToUse = apiKey || process.env.GROQ_API_KEY;
      if (keyToUse) {
        try {
          const resp = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${keyToUse}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            const models = (data.data || []).map((m: any) => ({
              id: m.id,
              name: m.id,
            }));
            return res.json({ models });
          }
        } catch (e) {
          console.warn("Could not probe Groq models dynamically, falling back to curated list");
        }
      }
      return res.json({
        models: [
          { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile (Recommended)", default: true },
          { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant (Ultra Fast)" },
          { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k Context)" },
          { id: "gemma2-9b-it", name: "Gemma 2 9B IT" },
        ],
      });
    }

    if (provider === "openai") {
      const keyToUse = apiKey || process.env.OPENAI_API_KEY;
      if (keyToUse) {
        try {
          const resp = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${keyToUse}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            const chatModels = (data.data || [])
              .filter((m: any) => m.id.includes("gpt"))
              .map((m: any) => ({ id: m.id, name: m.id }));
            if (chatModels.length > 0) return res.json({ models: chatModels });
          }
        } catch (e) {
          console.warn("Could not probe OpenAI models, falling back to defaults");
        }
      }
      return res.json({
        models: [
          { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast)", default: true },
          { id: "gpt-4o", name: "GPT-4o (Omni Reasoning)" },
          { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
        ],
      });
    }

    if (provider === "opencode") {
      return res.json({
        models: [
          { id: "opencode-go-v1", name: "OpenCode Go v1 (Academic)", default: true },
          { id: "opencode-go-reason", name: "OpenCode Go Reasoner" },
        ],
      });
    }

    // Default fallback
    res.json({
      models: [
        { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Built-in)", default: true },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch models" });
  }
});

// AI Generation endpoint (Flashcards, Deep Questions, Concrete Examples)
app.post("/api/ai/generate", async (req, res) => {
  const { provider, model, prompt, systemInstruction, language } = req.body;

  try {
    const langNote = language ? `\nRespond in ${language}. Ensure explanations and text match the language of the source notes.` : "";
    const fullSystemInstruction = (systemInstruction || "You are an expert cognitive tutor.") + langNote;

    // 1. Google Gemini via server SDK
    if (provider === "gemini" || !provider) {
      const keyToUse = req.body.apiKey || process.env.GEMINI_API_KEY;
      const ai = getGeminiClient(keyToUse);
      if (!ai) {
        return res.status(400).json({
          error: "Gemini API key is required. Please provide your API Key in Settings > AI & Models or set GEMINI_API_KEY.",
        });
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text || "" });
    }

    // 2. Groq provider
    if (provider === "groq") {
      const apiKey = req.body.apiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Groq API key required" });
      }

      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: fullSystemInstruction },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq error ${resp.status}`);
      }
      const data = await resp.json();
      return res.json({ text: data.choices?.[0]?.message?.content || "" });
    }

    // 3. OpenAI provider
    if (provider === "openai") {
      const apiKey = req.body.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "OpenAI API key required" });
      }

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: fullSystemInstruction },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI error ${resp.status}`);
      }
      const data = await resp.json();
      return res.json({ text: data.choices?.[0]?.message?.content || "" });
    }

    // 4. OpenCode Go provider
    if (provider === "opencode") {
      const apiKey = req.body.apiKey || process.env.OPENCODE_API_KEY;
      return res.json({
        text: `[OpenCode Go simulated evaluation]: Concept analyzed successfully.\n${prompt.slice(0, 150)}...`,
      });
    }

    res.status(400).json({ error: "Unknown provider: " + provider });
  } catch (err: any) {
    console.error("AI Generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI response" });
  }
});

// Streaming Feynman Technique evaluation endpoint
app.post("/api/ai/stream-feynman", async (req, res) => {
  const { concept, userExplanation, provider, model, language, apiKey } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const prompt = `Evaluate this student's Feynman technique explanation of the concept "${concept}".
Student Explanation:
"""
${userExplanation}
"""

Instructions:
1. Did they explain it in simple terms without jargon?
2. Identify any inaccuracies or gaps in their mental model.
3. Provide a clear rating from 1 to 5 stars.
4. Offer a concise, brilliant analogy to seal their understanding.
Language: Respond in ${language || "the same language as the student's explanation"}.`;

  try {
    if (provider === "gemini" || !provider) {
      const keyToUse = apiKey || process.env.GEMINI_API_KEY;
      const ai = getGeminiClient(keyToUse);
      if (!ai) {
        res.write(`data: ${JSON.stringify({ error: "No Gemini API key provided. Please configure your API key in Settings > AI & Models." })}\n\n`);
        return res.end();
      }

      const stream = await ai.models.generateContentStream({
        model: model || "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Richard Feynman evaluating a student's explanation using the Feynman Technique. Be warm, insightful, demanding of clarity, and eliminate jargon.",
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    if (provider === "groq") {
      const keyToUse = apiKey || process.env.GROQ_API_KEY;
      if (!keyToUse) {
        res.write(`data: ${JSON.stringify({ error: "Groq API key not provided" })}\n\n`);
        return res.end();
      }

      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: model || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are Richard Feynman evaluating a student's explanation using the Feynman Technique." },
            { role: "user", content: prompt },
          ],
          stream: true,
        }),
      });

      if (!resp.ok || !resp.body) {
        res.write(`data: ${JSON.stringify({ error: "Groq stream connection failed" })}\n\n`);
        return res.end();
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
              }
            } catch (e) {}
          }
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    // Default fallback mock evaluation if no remote provider
    const fallbackMessage = `Great effort explaining ${concept}!\n\n` +
      `**Clarity:** Good baseline explanation with straightforward intuition.\n` +
      `**Gaps:** Ensure you also touch upon edge cases and physical limits.\n` +
      `**Analogy:** Think of it like a library where books are organized by how frequently they are checked out.\n` +
      `**Score:** 4/5 ⭐⭐⭐⭐`;

    for (const word of fallbackMessage.split(" ")) {
      res.write(`data: ${JSON.stringify({ chunk: word + " " })}\n\n`);
      await new Promise((r) => setTimeout(r, 40));
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Feynman stream error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "Streaming failed" })}\n\n`);
    res.end();
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cognito IDE server running on http://0.0.0.0:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, gracefully shutting down...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 5000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();

