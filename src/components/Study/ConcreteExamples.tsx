import React, { useState } from 'react';
import {
  ArrowLeft,
  Lightbulb,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Note, ConcreteExample } from '../../types';
import { generateConcreteExamples } from '../../utils/aiService';

interface ConcreteExamplesProps {
  activeNote: Note | null;
  notes: Note[];
  examples: ConcreteExample[];
  onAddExample: (ex: ConcreteExample) => void;
  onBack: () => void;
}

export const ConcreteExamples: React.FC<ConcreteExamplesProps> = ({
  activeNote,
  notes,
  examples,
  onAddExample,
  onBack,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || notes[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentSelectedNote = notes.find((n) => n.id === selectedNoteId);

  // Filter examples for current note or display all
  const filteredExamples = examples.filter(
    (e) => !selectedNoteId || e.noteId === selectedNoteId
  );

  const handleGenerate = async () => {
    if (!currentSelectedNote || isGenerating) return;
    setIsGenerating(true);

    try {
      const generated = await generateConcreteExamples(
        currentSelectedNote.title,
        currentSelectedNote.content
      );

      generated.forEach((ex) => {
        onAddExample({
          ...ex,
          noteId: currentSelectedNote.id,
        });
      });
    } catch (e) {
      console.error('Failed to generate concrete examples', e);
    } finally {
      setIsGenerating(false);
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
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span>Concrete Examples &amp; Analogies (Elaboration)</span>
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
            id="generate-concrete-examples-btn"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{isGenerating ? 'Synthesizing...' : '+ Generate Examples'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid of Examples */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-100 mb-1">
            Intuitive Analogies &amp; Counterexamples
          </h3>
          <p className="text-xs text-slate-400">
            Cognitive psychology demonstrates that pairing abstract formulas with multiple real-world scenarios dramatically increases long-term retention.
          </p>
        </div>

        {filteredExamples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExamples.map((ex) => (
              <div
                key={ex.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Concept: {ex.concept}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Case Study</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                    {ex.analogy}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {ex.realWorldApplication}
                  </p>
                </div>

                {ex.counterExample && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 bg-amber-500/5 p-2.5 rounded-lg">
                    <span className="font-bold text-amber-400">Boundary / Counterexample: </span>
                    {ex.counterExample}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <Lightbulb className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No Examples for this Concept Yet</p>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Generate real-world analogies and concrete boundary cases with AI.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
            >
              Generate Concrete Examples with AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
