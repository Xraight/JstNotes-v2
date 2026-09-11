import React from 'react';
import {
  GraduationCap,
  Flame,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  Lightbulb,
  Shuffle,
  Share2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Note, Flashcard, DeepQuestion, CalendarEvent } from '../../types';

interface StudyHomeProps {
  notes: Note[];
  flashcards: Flashcard[];
  deepQuestions: DeepQuestion[];
  calendarEvents: CalendarEvent[];
  activeNote: Note | null;
  onStartFlashcards: (interleaved?: boolean) => void;
  onOpenFeynman: () => void;
  onOpenDeepQuestions: () => void;
  onOpenConcreteExamples: () => void;
  onOpenGraphView: () => void;
  onSelectNote: (noteId: string) => void;
  onGenerateFlashcards: () => void;
  isGenerating?: boolean;
}

export const StudyHome: React.FC<StudyHomeProps> = ({
  notes,
  flashcards,
  deepQuestions,
  calendarEvents,
  activeNote,
  onStartFlashcards,
  onOpenFeynman,
  onOpenDeepQuestions,
  onOpenConcreteExamples,
  onOpenGraphView,
  onSelectNote,
  onGenerateFlashcards,
  isGenerating,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Due flashcards (nextReviewDate <= today)
  const dueCards = flashcards.filter(
    (card) => !card.nextReviewDate || card.nextReviewDate <= today
  );

  // Cards by mastery
  const learningCards = flashcards.filter((c) => c.repetition <= 1);
  const reviewingCards = flashcards.filter((c) => c.repetition > 1 && c.interval < 21);
  const masteredCards = flashcards.filter((c) => c.interval >= 21);

  // Upcoming exams for Calendar Priority
  const upcomingExams = calendarEvents
    .filter((e) => e.type === 'exam' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto select-none p-6 md:p-8">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Evidence-Based Cognitive Science Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-sans">
              Study Workstation
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Harness Spaced Repetition (SM-2), Active Recall, Interleaved Practice, and the Feynman Technique.
            </p>
          </div>

          {/* Retention Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl flex-shrink-0">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Streak</div>
                <div className="text-sm font-bold text-slate-100">7 Days</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
              <Clock className="w-5 h-5 text-rose-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Reviews Due</div>
                <div className="text-sm font-bold text-rose-400">{dueCards.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Mastered</div>
                <div className="text-sm font-bold text-emerald-400">{masteredCards.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Priority Alert (Exams First) */}
        {upcomingExams.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30 font-mono">
                    Exam Priority
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {upcomingExams[0].title}
                  </span>
                  <span className="text-[11px] font-mono text-rose-400">
                    ({upcomingExams[0].date})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Questions and flashcards linked to this exam will be scheduled with highest priority.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="study-exam-priority-btn"
              onClick={() => onStartFlashcards(false)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 flex-shrink-0 cursor-pointer"
            >
              <span>Drill Priority Cards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Grid: 6 Evidence-Based Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Spaced Repetition (SM-2) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {dueCards.length} Due Now
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                Spaced Repetition (SM-2)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SuperMemo-2 algorithmic review scheduler. Mathematically predicts the forgetting curve to review each item right before memory decay.
              </p>

              {/* Mastery bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Learning ({learningCards.length})</span>
                  <span>Reviewing ({reviewingCards.length})</span>
                  <span>Mastered ({masteredCards.length})</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full flex overflow-hidden">
                  <div style={{ width: `${(learningCards.length / Math.max(1, flashcards.length)) * 100}%` }} className="bg-rose-500" />
                  <div style={{ width: `${(reviewingCards.length / Math.max(1, flashcards.length)) * 100}%` }} className="bg-amber-500" />
                  <div style={{ width: `${(masteredCards.length / Math.max(1, flashcards.length)) * 100}%` }} className="bg-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="start-sm2-review-btn"
                onClick={() => onStartFlashcards(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Review Due Cards ({dueCards.length})
              </button>
            </div>
          </div>

          {/* Card 2: Deep Questions (Active Recall) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/25">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  {deepQuestions.length} Questions
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                Deep Questions (Active Recall)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates rigorous conceptual inquiries. Tests underlying mechanisms, scores student formulations, and catches cognitive blindspots.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="start-deep-questions-btn"
                onClick={onOpenDeepQuestions}
                className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Open Question Bank
              </button>
            </div>
          </div>

          {/* Card 3: Feynman Technique (Streaming) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Streaming SSE
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                The Feynman Technique
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explain complex topics in plain language as if to a child. The AI tutor streams real-time critique, questions your analogies, and highlights jargon traps.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="start-feynman-btn"
                onClick={onOpenFeynman}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Start Socratic Session
              </button>
            </div>
          </div>

          {/* Card 4: Interleaved Practice */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/25">
                  <Shuffle className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                  Anti-Fatigue
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                Interleaved Practice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mixes concepts across neuroscience, quantum mechanics, and mathematics. Forces your brain to categorize problem types rather than running on autopilot.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="start-interleaved-btn"
                onClick={() => onStartFlashcards(true)}
                className="w-full py-2.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Start Interleaved Drill
              </button>
            </div>
          </div>

          {/* Card 5: Concrete Examples (Elaboration) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Elaboration
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                Concrete Examples &amp; Analogies
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bridges abstract formulas and real-world intuition using concrete analogies, edge cases, and boundary counterexamples.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="start-concrete-examples-btn"
                onClick={onOpenConcreteExamples}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Explore Analogies
              </button>
            </div>
          </div>

          {/* Card 6: Dual Coding / Knowledge Graph */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/25">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  Visual D3
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Dual Coding (Concept Graph)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects verbal descriptions with structural network visualization. Observe cross-disciplinary clusters and concept hubs.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                id="open-graph-from-study-home"
                onClick={onOpenGraphView}
                className="w-full py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Open Full Knowledge Graph
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
