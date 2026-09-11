import { Note, Flashcard, DeepQuestion, ConcreteExample } from '../types';

export function detectLanguage(text: string): 'es' | 'en' {
  const spanishMarkers = [' de ', ' en ', ' el ', ' la ', ' los ', ' las ', ' para ', ' con ', ' una ', ' uno ', ' por ', ' que ', ' como '];
  const lower = text.toLowerCase();
  let count = 0;
  for (const marker of spanishMarkers) {
    if (lower.includes(marker)) count++;
  }
  return count >= 2 ? 'es' : 'en';
}

export function extractOfflineFlashcards(note: Note): Omit<Flashcard, 'id' | 'interval' | 'repetition' | 'easeFactor' | 'dueDate'>[] {
  const isSpanish = detectLanguage(note.content);
  const lines = note.content.split('\n');
  const cards: Omit<Flashcard, 'id' | 'interval' | 'repetition' | 'easeFactor' | 'dueDate'>[] = [];
  let currentHeading = note.title;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Heading extraction
    if (line.startsWith('#')) {
      currentHeading = line.replace(/^#+\s*/, '').trim();
      continue;
    }

    // Bold term extraction: **Term**: Definition or **Term** is definition
    const boldMatch = line.match(/\*\*(.*?)\*\*\s*(?::|—|-|es|is)\s*(.*)/i);
    if (boldMatch && boldMatch[1] && boldMatch[2]) {
      const term = boldMatch[1].trim();
      const def = boldMatch[2].trim();
      if (def.length > 5) {
        cards.push({
          noteId: note.id,
          question: isSpanish ? `¿Qué es "${term}" y cuál es su función principal?` : `What is "${term}" and what is its primary function?`,
          answer: def,
          sourceContext: currentHeading,
        });
      }
      continue;
    }

    // Bullet points with definitions or key statements
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.replace(/^[-*]\s*/, '').trim();
      if (itemText.includes(':')) {
        const parts = itemText.split(':');
        const concept = parts[0].replace(/\*\*/g, '').trim();
        const explanation = parts.slice(1).join(':').trim();
        if (concept.length > 2 && explanation.length > 8) {
          cards.push({
            noteId: note.id,
            question: isSpanish ? `En el contexto de ${currentHeading}, explica: ${concept}` : `In the context of ${currentHeading}, explain: ${concept}`,
            answer: explanation,
            sourceContext: currentHeading,
          });
        }
      }
    }
  }

  // If few cards were found, generate structural questions from headings
  if (cards.length === 0) {
    cards.push({
      noteId: note.id,
      question: isSpanish ? `¿Cuáles son los principios fundamentales tratados en "${note.title}"?` : `What are the fundamental principles covered in "${note.title}"?`,
      answer: note.content.slice(0, 300) + '...',
      sourceContext: note.title,
    });
  }

  return cards;
}

export function extractOfflineDeepQuestions(note: Note): DeepQuestion[] {
  const isSpanish = detectLanguage(note.content);
  const questions: DeepQuestion[] = [];
  const headings = note.content
    .split('\n')
    .filter((l) => l.trim().startsWith('#'))
    .map((l) => l.replace(/^#+\s*/, '').trim())
    .filter((h) => h.length > 3);

  const mainTopic = headings[0] || note.title;

  if (isSpanish) {
    questions.push({
      id: 'dq-' + Math.random().toString(36).substring(2, 9),
      noteId: note.id,
      concept: mainTopic,
      question: `¿Por qué el mecanismo de "${mainTopic}" es indispensable para el sistema general y qué ocurriría si fallara?`,
      rationale: 'Interrogación elaborativa: obliga a vincular causas estructurales con consecuencias sistémicas.',
    });

    if (headings.length > 1) {
      questions.push({
        id: 'dq-' + Math.random().toString(36).substring(2, 9),
        noteId: note.id,
        concept: headings[1],
        question: `¿De qué manera "${headings[1]}" interactúa directamente con "${mainTopic}" a nivel causal?`,
        rationale: 'Interrogación conectiva: fuerza la integración bidireccional entre conceptos subordinados.',
      });
    }
  } else {
    questions.push({
      id: 'dq-' + Math.random().toString(36).substring(2, 9),
      noteId: note.id,
      concept: mainTopic,
      question: `Why is the underlying mechanism of "${mainTopic}" essential, and what would happen if it were disrupted?`,
      rationale: 'Elaborative interrogation: forces linking structural causes to systemic consequences.',
    });

    if (headings.length > 1) {
      questions.push({
        id: 'dq-' + Math.random().toString(36).substring(2, 9),
        noteId: note.id,
        concept: headings[1],
        question: `How does "${headings[1]}" causally modulate or depend on "${mainTopic}"?`,
        rationale: 'Connective interrogation: establishes mental models across interrelated subtopics.',
      });
    }
  }

  return questions;
}

export function extractOfflineConcreteExamples(note: Note): ConcreteExample[] {
  const isSpanish = detectLanguage(note.content);
  const headings = note.content
    .split('\n')
    .filter((l) => l.trim().startsWith('#'))
    .map((l) => l.replace(/^#+\s*/, '').trim());

  const concept = headings[0] || note.title;

  if (isSpanish) {
    return [
      {
        id: 'ce-' + Math.random().toString(36).substring(2, 9),
        noteId: note.id,
        concept,
        analogy: `Imagina una autopista inteligente: cuando dos ciudades incrementan su comercio, se construyen carriles adicionales y peajes de alta velocidad. Así mismo, las conexiones neuronales o rutas de procesamiento refuerzan su conductancia cuando transmiten información repetidamente.`,
        realWorldExample: `En la vida real, este principio se evidencia en cómo los cirujanos o atletas de élite automatizan secuencias complejas tras meses de práctica deliberada.`,
      },
    ];
  }

  return [
    {
      id: 'ce-' + Math.random().toString(36).substring(2, 9),
      noteId: note.id,
      concept,
      analogy: `Imagine a smart highway network: as transit frequency between two cities increases, additional lanes and express tolls are automatically constructed. Similarly, pathways strengthen their conductance when transmitting signals repeatedly.`,
      realWorldExample: `In real applications, this is seen in how memory caches dynamically promote frequently accessed records to fast L1 cache layers.`,
    },
  ];
}
