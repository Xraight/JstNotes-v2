import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  AlertCircle,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { Note } from '../../types';
import { streamFeynmanTechnique } from '../../utils/aiService';

interface FeynmanTechniqueProps {
  activeNote: Note | null;
  notes: Note[];
  onBack: () => void;
}

interface DialogueMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const FeynmanTechnique: React.FC<FeynmanTechniqueProps> = ({
  activeNote,
  notes,
  onBack,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || notes[0]?.id || '');
  const [userExplanation, setUserExplanation] = useState<string>('');
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentSelectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleSubmitExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userExplanation.trim() || isLoading) return;

    const currentExpl = userExplanation.trim();
    setUserExplanation('');

    // Append user message
    const updatedMessages: DialogueMessage[] = [
      ...messages,
      { role: 'user', content: currentExpl },
    ];
    setMessages(updatedMessages);

    setIsLoading(true);
    setStreamingResponse('');

    let accumulatedText = '';

    await streamFeynmanTechnique(
      currentSelectedNote?.title || 'Selected Topic',
      currentExpl,
      (chunk: string) => {
        accumulatedText += chunk;
        setStreamingResponse(accumulatedText);
      },
      (error: Error) => {
        console.error('Feynman streaming error:', error);
        setStreamingResponse('Error streaming Feynman feedback.');
      }
    );

    setIsLoading(false);
    setMessages([
      ...updatedMessages,
      { role: 'assistant', content: accumulatedText || 'Concept reviewed.' },
    ]);
    setStreamingResponse('');
  };

  const handleReset = () => {
    setMessages([]);
    setStreamingResponse('');
    setUserExplanation('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Top Header */}
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
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>The Feynman Technique (Streaming Dialogue)</span>
          </span>
        </div>

        {/* Note Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hidden md:inline">Topic Note:</label>
          <select
            value={selectedNoteId}
            onChange={(e) => {
              setSelectedNoteId(e.target.value);
              handleReset();
            }}
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
            onClick={handleReset}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Reset Dialogue"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Philosophy Prompt Banner */}
      <div className="px-6 py-2 bg-amber-500/5 border-b border-amber-500/10 text-xs text-amber-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          <strong>Feynman Rule:</strong> Explain <em className="text-amber-200">"{currentSelectedNote?.title}"</em> in simple, plain language without academic jargon. The AI tutor will find your gaps and test your intuition!
        </span>
      </div>

      {/* Dialogue Conversation Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-4">
        {messages.length === 0 && !streamingResponse && (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
            <h4 className="text-base font-semibold text-slate-300">
              Ready to explain "{currentSelectedNote?.title || 'Concept'}"?
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Type your explanation below as if teaching someone with zero background in the field. Use an analogy, break down cause and effect, and avoid technical shorthand.
            </p>
          </div>
        )}

        {/* Existing Messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500/15 text-slate-100 border border-amber-500/30 rounded-tr-none'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Live Streaming Response Chunk */}
        {streamingResponse && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-500/30 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl max-w-xl text-xs leading-relaxed bg-slate-900 text-slate-200 border border-amber-500/40 rounded-tl-none font-sans shadow-lg shadow-amber-500/5">
              <div className="whitespace-pre-wrap">{streamingResponse}</div>
              <span className="inline-block w-2 h-3 ml-1 bg-amber-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex-shrink-0">
        <form
          onSubmit={handleSubmitExplanation}
          className="max-w-3xl mx-auto flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              placeholder={`Explain ${currentSelectedNote?.title || 'the concept'} in your own simple words...`}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 resize-none font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitExplanation(e);
                }
              }}
            />
          </div>

          <button
            type="submit"
            id="feynman-submit-btn"
            disabled={isLoading || !userExplanation.trim()}
            className="p-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex-shrink-0"
            title="Send Explanation"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
