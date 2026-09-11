import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { Flashcard, SM2Rating } from '../../types';
import { calculateSM2 } from '../../utils/sm2';

interface FlashcardSessionProps {
  cards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
  onBack: () => void;
  onGenerateMore?: () => void;
  isGenerating?: boolean;
}

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({
  cards,
  onUpdateCard,
  onBack,
  onGenerateMore,
  isGenerating,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentCard = cards[currentIndex];

  const handleRating = (rating: SM2Rating) => {
    if (!currentCard) return;

    const result = calculateSM2(currentCard, rating);

    const updatedCard: Flashcard = {
      ...currentCard,
      repetition: result.repetition,
      interval: result.interval,
      easeFactor: result.easeFactor,
      dueDate: result.dueDate,
      nextReviewDate: result.dueDate,
      lastReviewed: new Date().toISOString(),
      lastStudied: new Date().toISOString(),
    };

    onUpdateCard(updatedCard);
    setIsFlipped(false);
    setReviewedCount((prev) => prev + 1);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setCompleted(false);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8 text-center">
        <Sparkles className="w-12 h-12 text-amber-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-100">No Flashcards Available</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          Generate flashcards automatically from your notes or PDFs using AI Study Tools.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Back to Dashboard
          </button>
          {onGenerateMore && (
            <button
              type="button"
              id="generate-cards-empty-btn"
              disabled={isGenerating}
              onClick={onGenerateMore}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Session Top Bar */}
      <div className="h-12 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Spaced Repetition Flashcards</span>
          </span>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="text-[11px] font-mono text-slate-400">
              Card {currentIndex + 1} of {cards.length}
            </div>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {onGenerateMore && (
            <button
              type="button"
              id="generate-more-flashcards-btn"
              disabled={isGenerating}
              onClick={onGenerateMore}
              className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isGenerating ? 'Generating...' : '+ AI Generate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        {completed ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Review Complete!</h3>
            <p className="text-sm text-slate-400 mb-6">
              You reviewed <span className="font-bold text-amber-400">{reviewedCount}</span> flashcards. The SM-2 spaced repetition scheduler has updated your retention intervals.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetSession}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold"
              >
                Study Home
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Interactive Flip Card Container */}
            <div
              id="flashcard-card-box"
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[300px] cursor-pointer group perspective"
            >
              <div
                className={`relative w-full min-h-[300px] rounded-2xl p-8 transition-all duration-300 shadow-2xl border flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-slate-900 border-amber-500/40 shadow-amber-500/5'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-black/40'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-800/80">
                  <span className="uppercase tracking-wider font-mono font-semibold text-[10px] text-amber-400">
                    {isFlipped ? 'Answer' : 'Question'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Click card to flip</span>
                  </span>
                </div>

                {/* Card Content */}
                <div className="py-8 text-center">
                  <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed font-sans">
                    {isFlipped
                      ? currentCard.answer || currentCard.back
                      : currentCard.question || currentCard.front}
                  </p>
                </div>

                {/* Card Footer Info */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  <span>Interval: {currentCard.interval}d</span>
                  <span>EF: {currentCard.easeFactor.toFixed(2)}</span>
                  <span>Rep: {currentCard.repetition}</span>
                </div>
              </div>
            </div>

            {/* SM-2 Evaluation Buttons */}
            {isFlipped ? (
              <div className="grid grid-cols-4 gap-3 w-full mt-6 animate-in fade-in slide-in-from-bottom-2">
                <button
                  type="button"
                  id="rating-again-btn"
                  onClick={() => handleRating(SM2Rating.AGAIN)}
                  className="py-3 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex flex-col items-center gap-1 transition-colors"
                >
                  <span className="font-bold">Again</span>
                  <span className="text-[10px] opacity-75 font-mono">&lt; 1d</span>
                </button>

                <button
                  type="button"
                  id="rating-hard-btn"
                  onClick={() => handleRating(SM2Rating.HARD)}
                  className="py-3 px-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 font-semibold text-xs flex flex-col items-center gap-1 transition-colors"
                >
                  <span className="font-bold">Hard</span>
                  <span className="text-[10px] opacity-75 font-mono">1d</span>
                </button>

                <button
                  type="button"
                  id="rating-good-btn"
                  onClick={() => handleRating(SM2Rating.GOOD)}
                  className="py-3 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex flex-col items-center gap-1 transition-colors"
                >
                  <span className="font-bold">Good</span>
                  <span className="text-[10px] opacity-75 font-mono">6d</span>
                </button>

                <button
                  type="button"
                  id="rating-easy-btn"
                  onClick={() => handleRating(SM2Rating.EASY)}
                  className="py-3 px-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex flex-col items-center gap-1 transition-colors"
                >
                  <span className="font-bold">Easy</span>
                  <span className="text-[10px] opacity-75 font-mono">14d</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="show-answer-btn"
                onClick={() => setIsFlipped(true)}
                className="w-full mt-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/15 transition-all cursor-pointer"
              >
                Show Answer (Spacebar / Click)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
