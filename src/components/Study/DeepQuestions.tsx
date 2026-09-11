import React, { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Send,
  CheckCircle,
  AlertTriangle,
  Award,
  RefreshCw,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Note, DeepQuestion } from '../../types';
import { evaluateActiveRecall, generateDeepQuestions } from '../../utils/aiService';

interface DeepQuestionsProps {
  activeNote: Note | null;
  notes: Note[];
  questions: DeepQuestion[];
  onAddQuestion: (q: DeepQuestion) => void;
  onUpdateQuestion: (q: DeepQuestion) => void;
  onBack: () => void;
}

export const DeepQuestions: React.FC<DeepQuestionsProps> = ({
  activeNote,
  notes,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onBack,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || notes[0]?.id || '');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const currentSelectedNote = notes.find((n) => n.id === selectedNoteId);
  const currentQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  const handleGenerateNewQuestions = async () => {
    if (!currentSelectedNote || isGenerating) return;
    setIsGenerating(true);

    try {
      const generated = await generateDeepQuestions(
        currentSelectedNote.title,
        currentSelectedNote.content
      );

      generated.forEach((q) => {
        onAddQuestion({
          ...q,
          noteId: currentSelectedNote.id,
        });
      });

      if (generated.length > 0) {
        setActiveQuestionId(generated[0].id);
      }
    } catch (e) {
      console.error('Failed to generate deep questions', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);

    try {
      const feedback = await evaluateActiveRecall(
        currentQuestion.question,
        userAnswer.trim(),
        currentQuestion.expectedKeyPoints
      );

      const updated: DeepQuestion = {
        ...currentQuestion,
        userAnswer: userAnswer.trim(),
        score: feedback.score,
        feedback: feedback.feedback,
        misconceptions: feedback.misconceptions,
      };

      onUpdateQuestion(updated);
    } catch (e) {
      console.error('Error evaluating active recall answer', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Deep Questions (Active Recall Assessment)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none max-w-[200px]"
          >
            {notes
              .filter((n) => n.type !== 'folder')
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
          </select>

          <button
            type="button"
            id="generate-deep-questions-btn"
            disabled={isGenerating}
            onClick={handleGenerateNewQuestions}
            className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isGenerating ? 'Generating...' : '+ Generate Questions'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: Left Question List / Right Interactive Test */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Selector Column */}
        <div className="w-72 bg-slate-900/50 border-r border-slate-800 p-3 overflow-y-auto space-y-1.5 flex-shrink-0">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-2 px-1">
            Question Bank ({questions.length})
          </span>

          {questions.map((q, idx) => {
            const isSelected = q.id === activeQuestionId;
            const isAnswered = q.score !== undefined;

            return (
              <button
                key={q.id}
                type="button"
                id={`deep-q-item-${q.id}`}
                onClick={() => {
                  setActiveQuestionId(q.id);
                  setUserAnswer(q.userAnswer || '');
                }}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="font-mono text-slate-500">Q{idx + 1}</span>
                  {isAnswered && (
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        q.score! >= 80
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : q.score! >= 60
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {q.score}%
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                  {q.question}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Active Question Test Stage */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          {currentQuestion ? (
            <div className="space-y-6">
              {/* Question Header Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">
                    Active Recall Inquiry
                  </span>
                  {currentQuestion.score !== undefined && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <Award className="w-3.5 h-3.5" />
                      <span>Score: {currentQuestion.score}/100</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-slate-100 leading-snug">
                  {currentQuestion.question}
                </h3>

                {/* Key Points hint toggle */}
                {currentQuestion.expectedKeyPoints && (
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-300">Key Conceptual Targets: </span>
                    {currentQuestion.expectedKeyPoints.join(' • ')}
                  </div>
                )}
              </div>

              {/* User Answer Form */}
              <form onSubmit={handleEvaluate} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Your Formulation &amp; Scientific Explanation:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Synthesize the underlying mechanisms, why this occurs, and key formulas or relationships..."
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 leading-relaxed font-sans"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    id="submit-deep-answer-btn"
                    disabled={isEvaluating || !userAnswer.trim()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEvaluating ? 'Evaluating with AI...' : 'Evaluate My Explanation'}</span>
                  </button>
                </div>
              </form>

              {/* AI Evaluation Report */}
              {currentQuestion.feedback && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>AI Evaluator Feedback</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Grade: {currentQuestion.score}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentQuestion.feedback}
                  </p>

                  {/* Misconceptions detected */}
                  {currentQuestion.misconceptions && currentQuestion.misconceptions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Misconceptions / Blindspots Detected:</span>
                      </span>
                      <ul className="list-disc ml-5 text-[11px] text-rose-200 space-y-0.5">
                        {currentQuestion.misconceptions.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No Deep Questions Active</p>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Click "+ Generate Questions" to generate conceptual retrieval questions.
              </p>
              <button
                type="button"
                onClick={handleGenerateNewQuestions}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold"
              >
                Generate Questions with AI
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
