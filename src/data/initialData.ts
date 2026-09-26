import {
  Note,
  PDFDocument,
  PDFHighlight,
  CalendarEvent,
  Flashcard,
  DeepQuestion,
  ConcreteExample,
  AppSettings,
  StudyStats,
} from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'midnight',
  fontFamily: 'JetBrains Mono',
  fontSize: 14,
  lineNumbers: true,
  livePreviewSplit: true,
  defaultHighlightColor: '#facc15', // yellow
  aiProvider: 'gemini',
  aiModel: 'gemini-3.8-flash',
  geminiApiKey: '',
  groqApiKey: '',
  openaiApiKey: '',
  opencodeApiKey: '',
  customCss: `/* Custom IDE Overlays */
.ide-badge-pdf {
  font-family: ui-monospace, monospace;
}
`,
  language: 'auto',
};

// Default empty PDF library for fresh workspaces
export const INITIAL_PDFS: PDFDocument[] = [];

// Default empty highlights
export const INITIAL_HIGHLIGHTS: PDFHighlight[] = [];

// Default clean initial note introducing the workstation
export const INITIAL_NOTES: Note[] = [
  {
    id: 'folder-welcome',
    title: 'Quickstart & Guides',
    content: '',
    type: 'folder',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'welcome-to-cognito-ide',
    title: 'Welcome to JstNotes',
    parentId: 'folder-welcome',
    type: 'note',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: `# Welcome to JstNotes (Cognito IDE) 🚀

**JstNotes** is an IDE-style note-taking workstation engineered for rigorous learning, academic research, and technical synthesis.

---

## ⚡ Core Capabilities

### 1. Markdown & LaTeX Typesetting
Write standard GitHub Flavored Markdown with first-class **KaTeX** math formulas:

- **Inline math**: Euler's identity is $e^{i\\pi} + 1 = 0$, and Schrödinger's equation: $i\\hbar \\frac{\\partial}{\\partial t} |\\psi(t)\\rangle = \\hat{H} |\\psi(t)\\rangle$.
- **Block display math**:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\text{SM-2 Interval Formula: } I_n = 
\\begin{cases} 
1 & n = 1 \\\\
6 & n = 2 \\\\
I_{n-1} \\times EF & n > 2 
\\end{cases}
$$

### 2. Bidirectional Note Linking
Link concepts together with **@-mentions**. Type \`@\` anywhere in the editor to search and reference other notes:
- \`@[Welcome to JstNotes]\`
- References appear in the interactive **D3 Knowledge Graph** and in the right-side **Concept Map**.

### 3. Integrated PDF Workspace & Visual Annotations
- Click **PDF Library** on the left Activity Bar to import textbooks, research papers, or syllabus slides.
- Click and drag rectangular boxes directly across PDF pages to highlight text and create instant citations.
- Bidirectional navigation: click any highlight to open its linked note, or click a citation badge in a note to jump directly to that page in the PDF.

### 4. Cognitive Science Study Suite
Access the **Study Workstation** from the Activity Bar (graduation cap icon):
- **Spaced Repetition (SM-2)**: Algorithmically reviews flashcards right before memory decay. Press \`Space\` to flip, and \`1\`-\`5\` to grade recall.
- **Deep Questions Bank**: Formulate and score active recall explanations for complex concepts.
- **The Feynman Technique**: Stream real-time AI critique to explain tough ideas in plain language without jargon traps.

### 5. Interactive D3 Knowledge Graph
- Click the **Graph View** icon on the activity bar to explore your concept topology.
- Nodes scale with connectivity degree, clustering related ideas through force-directed physics.

---

## ⌨️ Productivity Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Search Notes** | \`Ctrl + K\` |
| **Mention Autocomplete** | \`@\` |
| **Flip Flashcard** | \`Spacebar\` |
| **Grade Recall** | \`1\` (Again), \`2\` (Hard), \`3\` (Good), \`4\` (Easy), \`5\` (Mastered) |
| **PDF Zoom In / Out** | \`Ctrl + +\` / \`Ctrl + -\` or \`Ctrl + Scroll\` |
| **PDF Zoom Reset** | \`Ctrl + 0\` |

> **Pro Tip**: Need sample data to explore? Open **Settings (gear icon) ➔ Backup & Reset ➔ Load Sample Knowledge Base** to test with pre-loaded cognitive neuroscience & quantum computing notes!
`,
  },
];

// Clean starter flashcards explaining core learning principles
export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-welcome-1',
    noteId: 'welcome-to-cognito-ide',
    question: 'How does the SuperMemo-2 (SM-2) spaced repetition algorithm optimize memory retention?',
    answer: 'SM-2 calculates optimal review intervals (I_n) and ease factors (EF) based on recall difficulty ratings (1-5), scheduling reviews right before the predicted memory decay curve drops.',
    sourceContext: 'Cognitive Science Study Suite',
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'fc-welcome-2',
    noteId: 'welcome-to-cognito-ide',
    question: 'How do you insert block LaTeX equations in JstNotes?',
    answer: 'Enclose the LaTeX formula in double dollar signs ($$...$$) on separate lines. KaTeX renders it as a centered display equation with full symbol support.',
    sourceContext: 'Markdown & LaTeX Typesetting',
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_DEEP_QUESTIONS: DeepQuestion[] = [];
export const INITIAL_CONCRETE_EXAMPLES: ConcreteExample[] = [];
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const INITIAL_STUDY_STATS: StudyStats = {
  dailyStreak: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalReviews: 0,
  activityHistory: [
    { date: new Date().toISOString().split('T')[0], count: 0 },
  ],
};
