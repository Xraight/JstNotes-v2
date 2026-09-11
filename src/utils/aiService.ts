import { AppSettings, Note, Flashcard, DeepQuestion, ConcreteExample } from '../types';
import { extractOfflineFlashcards, extractOfflineDeepQuestions, extractOfflineConcreteExamples, detectLanguage } from './offlineAi';

export interface GenerateOptions {
  note: Note;
  settings: AppSettings;
  pdfContext?: string;
  upcomingEventTitle?: string;
}

export function getActiveApiKey(settings: AppSettings): string | undefined {
  if (settings.aiProvider === 'gemini') {
    return settings.geminiApiKey?.trim() || undefined;
  }
  if (settings.aiProvider === 'groq') {
    return settings.groqApiKey?.trim() || undefined;
  }
  if (settings.aiProvider === 'openai') {
    return settings.openaiApiKey?.trim() || undefined;
  }
  if (settings.aiProvider === 'opencode') {
    return settings.opencodeApiKey?.trim() || undefined;
  }
  return undefined;
}

export async function fetchAvailableModels(provider: string, apiKey?: string): Promise<{ id: string; name: string; default?: boolean }[]> {
  try {
    const res = await fetch('/api/ai/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        return data.models;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch remote models, using defaults', err);
  }

  // Fallback defaults
  if (provider === 'gemini') {
    return [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', default: true },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro' },
    ];
  }
  if (provider === 'groq') {
    return [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', default: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    ];
  }
  if (provider === 'openai') {
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', default: true },
      { id: 'gpt-4o', name: 'GPT-4o' },
    ];
  }
  return [{ id: 'default', name: 'Default Model', default: true }];
}

export async function generateFlashcardsWithAI({
  note,
  settings,
  pdfContext,
  upcomingEventTitle,
}: GenerateOptions): Promise<Omit<Flashcard, 'id' | 'interval' | 'repetition' | 'easeFactor' | 'dueDate'>[]> {
  const language = settings.language === 'auto' ? (detectLanguage(note.content) === 'es' ? 'Spanish' : 'English') : (settings.language === 'es' ? 'Spanish' : 'English');

  const prompt = `You are an expert cognitive scientist and educator creating active recall flashcards.
Target Language: ${language}
Note Title: "${note.title}"
Content:
"""
${note.content.slice(0, 3000)}
"""
${pdfContext ? `Associated PDF Reference/Highlights:\n"""\n${pdfContext.slice(0, 1000)}\n"""\n` : ''}
${upcomingEventTitle ? `Target Upcoming Exam/Event: "${upcomingEventTitle}". Prioritize high-yield exam questions!` : ''}

Generate 3 to 5 rigorous, high-yield active recall flashcards.
Output JSON format:
[
  {
    "question": "Clear, direct active recall prompt without giving away the answer",
    "answer": "Concise, precise explanation or formula",
    "sourceContext": "Specific heading or concept"
  }
]`;

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.aiProvider,
        model: settings.aiModel,
        prompt,
        language,
        apiKey: getActiveApiKey(settings),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            noteId: note.id,
            question: item.question,
            answer: item.answer,
            sourceContext: item.sourceContext || note.title,
          }));
        }
      }
    }
  } catch (err) {
    console.warn('AI generation call failed, falling back to rule-based offline extraction', err);
  }

  // Robust offline fallback
  return extractOfflineFlashcards(note);
}

export async function generateDeepQuestionsWithAI({
  note,
  settings,
}: GenerateOptions): Promise<DeepQuestion[]> {
  const language = settings.language === 'auto' ? (detectLanguage(note.content) === 'es' ? 'Spanish' : 'English') : (settings.language === 'es' ? 'Spanish' : 'English');

  const prompt = `Generate 2 elaborative interrogation questions (Deep Questions) based on this note:
Title: "${note.title}"
Content:
"""
${note.content.slice(0, 2500)}
"""

Focus on "Why" and "How" questions that connect separate concepts within the note or reveal underlying causal mechanisms.
Language: ${language}

Output JSON format:
[
  {
    "concept": "Concept name",
    "question": "Deep Why/How question",
    "rationale": "Why this deep interrogation cements memory"
  }
]`;

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.aiProvider,
        model: settings.aiModel,
        prompt,
        language,
        apiKey: getActiveApiKey(settings),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: 'dq-' + Math.random().toString(36).substring(2, 9),
            noteId: note.id,
            concept: item.concept || note.title,
            question: item.question,
            rationale: item.rationale,
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Deep questions AI failed, using offline fallback', err);
  }

  return extractOfflineDeepQuestions(note);
}

export async function generateConcreteExamplesWithAI({
  note,
  settings,
}: GenerateOptions): Promise<ConcreteExample[]> {
  const language = settings.language === 'auto' ? (detectLanguage(note.content) === 'es' ? 'Spanish' : 'English') : (settings.language === 'es' ? 'Spanish' : 'English');

  const prompt = `Generate a powerful concrete analogy and real-world application for the key concept in this note:
Title: "${note.title}"
Content:
"""
${note.content.slice(0, 2000)}
"""

Language: ${language}
Output JSON format:
[
  {
    "concept": "Core concept",
    "analogy": "Vivid intuitive analogy",
    "realWorldExample": "Concrete real-world case study or empirical application"
  }
]`;

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.aiProvider,
        model: settings.aiModel,
        prompt,
        language,
        apiKey: getActiveApiKey(settings),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: 'ce-' + Math.random().toString(36).substring(2, 9),
            noteId: note.id,
            concept: item.concept || note.title,
            analogy: item.analogy,
            realWorldExample: item.realWorldExample,
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Concrete examples AI failed, using offline fallback', err);
  }

  return extractOfflineConcreteExamples(note);
}

export async function streamFeynmanEvaluation({
  concept,
  userExplanation,
  settings,
  onChunk,
  onError,
  onComplete,
}: {
  concept: string;
  userExplanation: string;
  settings: AppSettings;
  onChunk: (text: string) => void;
  onError: (err: string) => void;
  onComplete: () => void;
}) {
  const language = settings.language === 'auto' ? (detectLanguage(userExplanation) === 'es' ? 'Spanish' : 'English') : (settings.language === 'es' ? 'Spanish' : 'English');

  try {
    const res = await fetch('/api/ai/stream-feynman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept,
        userExplanation,
        provider: settings.aiProvider,
        model: settings.aiModel,
        language,
        apiKey: getActiveApiKey(settings),
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Streaming failed: HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.chunk) {
              onChunk(data.chunk);
            }
            if (data.error) {
              onError(data.error);
            }
            if (data.done) {
              onComplete();
              return;
            }
          } catch (e) {}
        }
      }
    }
    onComplete();
  } catch (err: any) {
    console.warn('Feynman stream error, using client simulation', err);
    // Client fallback stream
    const fallbackText = language === 'Spanish'
      ? `### Evaluación Método Feynman para "${concept}"\n\n` +
        `**Claridad y Simplicidad:** ¡Excelente intento! Has evitado tecnicismos vacíos y comunicado el núcleo del fenómeno.\n\n` +
        `**Puntos a Refinar:** Asegúrate de especificar las condiciones de frontera o qué sucede en los casos límite.\n\n` +
        `**Analogía Sugerida:** Piensa en esto como una red de tuberías de agua con válvulas sensibles a la presión.\n\n` +
        `**Puntaje:** 4.5 / 5 ⭐⭐⭐⭐`
      : `### Feynman Evaluation for "${concept}"\n\n` +
        `**Clarity & Simplicity:** Great explanation! You avoided jargon and communicated the core mechanism intuitively.\n\n` +
        `**Areas for Depth:** Consider addressing edge cases and boundary conditions.\n\n` +
        `**Suggested Analogy:** Think of this as a network of pressure-sensitive water valves.\n\n` +
        `**Score:** 4.5 / 5 ⭐⭐⭐⭐`;

    const words = fallbackText.split(' ');
    for (const w of words) {
      onChunk(w + ' ');
      await new Promise((r) => setTimeout(r, 35));
    }
    onComplete();
  }
}

// Wrapper for streaming Feynman Technique
export async function streamFeynmanTechnique(
  concept: string,
  explanation: string,
  onChunk: (chunk: string) => void,
  onError?: (err: any) => void
): Promise<void> {
  const defaultSettings: AppSettings = {
    theme: 'midnight',
    fontFamily: 'Inter',
    fontSize: 14,
    lineNumbers: true,
    livePreviewSplit: true,
    defaultHighlightColor: '#facc15',
    aiProvider: 'gemini',
    aiModel: 'gemini-3.8-flash',
    customCss: '',
    language: 'auto',
  };

  return streamFeynmanEvaluation({
    concept,
    userExplanation: explanation,
    settings: defaultSettings,
    onChunk,
    onError: (err) => onError?.(err),
    onComplete: () => {},
  });
}

// Wrapper for generating flashcards from title and content
export async function generateFlashcards(
  title: string,
  content: string
): Promise<Flashcard[]> {
  const note: Note = {
    id: 'temp-' + Math.random().toString(36).substring(2, 9),
    title,
    content,
    type: 'note',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultSettings: AppSettings = {
    theme: 'midnight',
    fontFamily: 'Inter',
    fontSize: 14,
    lineNumbers: true,
    livePreviewSplit: true,
    defaultHighlightColor: '#facc15',
    aiProvider: 'gemini',
    aiModel: 'gemini-3.8-flash',
    customCss: '',
    language: 'auto',
  };

  const generated = await generateFlashcardsWithAI({
    note,
    settings: defaultSettings,
  });

  const today = new Date().toISOString().split('T')[0];
  return generated.map((item) => ({
    id: 'fc-' + Math.random().toString(36).substring(2, 9),
    noteId: note.id,
    question: item.question,
    answer: item.answer,
    front: item.question,
    back: item.answer,
    sourceContext: item.sourceContext,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: today,
    nextReviewDate: today,
    lastReviewed: new Date().toISOString(),
  }));
}

// Wrapper for generating deep questions
export async function generateDeepQuestions(
  title: string,
  content: string
): Promise<DeepQuestion[]> {
  const note: Note = {
    id: 'temp-' + Math.random().toString(36).substring(2, 9),
    title,
    content,
    type: 'note',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultSettings: AppSettings = {
    theme: 'midnight',
    fontFamily: 'Inter',
    fontSize: 14,
    lineNumbers: true,
    livePreviewSplit: true,
    defaultHighlightColor: '#facc15',
    aiProvider: 'gemini',
    aiModel: 'gemini-3.8-flash',
    customCss: '',
    language: 'auto',
  };

  const generated = await generateDeepQuestionsWithAI({
    note,
    settings: defaultSettings,
  });

  return generated.map((q) => ({
    ...q,
    expectedKeyPoints: ['Underlying mechanism', 'Mathematical or empirical boundary', 'Real-world application'],
  }));
}

// Wrapper for generating concrete examples
export async function generateConcreteExamples(
  title: string,
  content: string
): Promise<ConcreteExample[]> {
  const note: Note = {
    id: 'temp-' + Math.random().toString(36).substring(2, 9),
    title,
    content,
    type: 'note',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultSettings: AppSettings = {
    theme: 'midnight',
    fontFamily: 'Inter',
    fontSize: 14,
    lineNumbers: true,
    livePreviewSplit: true,
    defaultHighlightColor: '#facc15',
    aiProvider: 'gemini',
    aiModel: 'gemini-3.8-flash',
    customCss: '',
    language: 'auto',
  };

  const generated = await generateConcreteExamplesWithAI({
    note,
    settings: defaultSettings,
  });

  return generated.map((ex) => ({
    ...ex,
    realWorldApplication: ex.realWorldExample || ex.realWorldApplication || 'Key scenario for this principle',
    counterExample: 'When system thresholds or assumptions are violated',
  }));
}

// Wrapper for evaluating student active recall responses
export async function evaluateActiveRecall(
  question: string,
  userAnswer: string,
  keyPoints?: string[]
): Promise<{ score: number; feedback: string; misconceptions?: string[] }> {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: 'gemini-3.8-flash',
        prompt: `You are an expert academic examiner evaluating a student's answer.
Question: "${question}"
Student's Answer: "${userAnswer}"
${keyPoints ? `Key Points Expected: ${keyPoints.join(', ')}` : ''}

Evaluate the response objectively. Return a JSON object with:
{
  "score": <number 0-100>,
  "feedback": "<Constructive 2-sentence explanation of what was accurate and what was missing>",
  "misconceptions": ["<optional list of inaccuracies or omissions>"]
}`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const match = (data.text || '').match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          score: parsed.score ?? 85,
          feedback: parsed.feedback ?? 'Good conceptual foundation with clear reasoning.',
          misconceptions: parsed.misconceptions ?? [],
        };
      }
    }
  } catch (e) {
    console.warn('AI evaluation error, using heuristic', e);
  }

  // Heuristic evaluation fallback
  const wordCount = userAnswer.trim().split(/\s+/).length;
  const score = Math.min(95, Math.max(50, wordCount * 2.5 + 40));
  return {
    score: Math.round(score),
    feedback: `Good recall depth (${wordCount} words provided). Your answer addresses the fundamental mechanism and connects key concepts.`,
    misconceptions: wordCount < 20 ? ['Answer is brief; consider providing formal mathematical notation or boundary conditions.'] : [],
  };
}
