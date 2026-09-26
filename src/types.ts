export type NodeType = 'note' | 'folder' | 'pdf_note';

export interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  type: NodeType;
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean;
  pinned?: boolean;
  tags?: string[];
  pdfId?: string;
  pdfPage?: number;
}

export interface PDFOutlineItem {
  id: string;
  title: string;
  pageNumber: number;
  children?: PDFOutlineItem[];
}

export interface PDFHighlight {
  id: string;
  pdfId: string;
  pageNumber: number;
  rect: {
    x: number;      // percentage (0 - 100)
    y: number;      // percentage (0 - 100)
    width: number;  // percentage
    height: number; // percentage
  };
  color: string;
  capturedText: string;
  noteId?: string;
  createdAt: string;
}

export interface PDFDocument {
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  pagesData?: { pageNumber: number; title: string; contentText: string }[];
  fileDataUrl?: string; // real base64 or object URL
  linkedNoteIds: string[];
  outline: PDFOutlineItem[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'exam' | 'assignment' | 'review' | 'lecture';
  linkedNoteIds: string[];
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export enum SM2Rating {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
  MASTERED = 5,
}

export interface Flashcard {
  id: string;
  noteId: string;
  question: string;
  answer: string;
  front?: string;
  back?: string;
  sourceContext?: string;
  interval: number;       // days
  repetition: number;     // repetitions
  easeFactor: number;     // default 2.5
  dueDate: string;        // YYYY-MM-DD
  nextReviewDate?: string;
  lastStudied?: string;
  lastReviewed?: string;
  linkedEventId?: string; // Priority exam link
  ratingHistory?: number[];
}

export interface DeepQuestion {
  id: string;
  noteId: string;
  concept: string;
  question: string;
  rationale?: string;
  expectedKeyPoints?: string[];
  userAnswer?: string;
  aiEvaluation?: string;
  score?: number;
  feedback?: string;
  misconceptions?: string[];
}

export interface ConcreteExample {
  id: string;
  noteId: string;
  concept: string;
  analogy: string;
  realWorldExample?: string;
  realWorldApplication?: string;
  counterExample?: string;
}

export interface StudyStats {
  dailyStreak: number;
  lastStudyDate: string;
  totalReviews: number;
  activityHistory: { date: string; count: number }[];
}

export type ThemePreset =
  | 'midnight'
  | 'dracula'
  | 'nord'
  | 'catppuccin'
  | 'monokai'
  | 'solarized-light'
  | 'nord-light';

export type AIProvider = 'gemini' | 'groq' | 'openai' | 'opencode';

export interface AppSettings {
  theme: ThemePreset;
  fontFamily: string;
  fontSize: number;
  lineNumbers: boolean;
  livePreviewSplit: boolean;
  defaultHighlightColor: string;
  aiProvider: AIProvider;
  aiModel: string;
  geminiApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
  opencodeApiKey?: string;
  customCss: string;
  language: string; // 'auto' | 'es' | 'en'
}

export function getFontFamilyCss(font: string): string {
  switch (font) {
    case 'JetBrains Mono':
      return "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    case 'Fira Code':
      return "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    case 'Source Code Pro':
      return "'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    case 'Inter':
      return "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    case 'Merriweather':
      return "'Merriweather', Georgia, Cambria, 'Times New Roman', Times, serif";
    default:
      if (font && font.includes(',')) return font;
      return font ? `'${font}', system-ui, sans-serif` : "'JetBrains Mono', monospace";
  }
}

export type ActiveView =
  | 'workspace'
  | 'study-home'
  | 'graph-view'
  | 'flashcards'
  | 'feynman'
  | 'deep-questions'
  | 'concrete-examples';
export type SidebarTab = 'explorer' | 'pdf-library' | 'calendar' | 'search';
