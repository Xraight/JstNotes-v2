import React, { useState } from 'react';
import {
  BookOpen,
  Share2,
  Calendar,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Note, PDFDocument, CalendarEvent } from '../../types';
import { ConceptMiniMap } from '../Graph/ConceptMiniMap';

interface ContextPanelProps {
  activeNote: Note | null;
  activePdf: PDFDocument | null;
  notes: Note[];
  pdfs: PDFDocument[];
  calendarEvents: CalendarEvent[];
  onNavigateToPdfPage: (pdfTitle: string, pageNumber: number) => void;
  onSelectNote: (noteId: string) => void;
  onOpenStudyTools: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  activeNote,
  activePdf,
  notes,
  pdfs,
  calendarEvents,
  onNavigateToPdfPage,
  onSelectNote,
  onOpenStudyTools,
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'concept-map' | 'events'>('outline');

  // Filter calendar events linked to current note
  const linkedEvents = calendarEvents.filter(
    (e) => activeNote && e.linkedNoteIds.includes(activeNote.id)
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border-l border-slate-800 text-xs text-slate-300 w-72 flex-shrink-0 select-none">
      {/* Tab Navigation */}
      <div className="h-10 px-2 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="tab-pdf-outline"
            onClick={() => setActiveTab('outline')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'outline'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="PDF Table of Contents (Outline)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ToC</span>
          </button>
          <button
            type="button"
            id="tab-concept-map"
            onClick={() => setActiveTab('concept-map')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              activeTab === 'concept-map'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Concept Map (Dual Coding Mini-Graph)"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Concept Map</span>
          </button>
          <button
            type="button"
            id="tab-context-events"
            onClick={() => setActiveTab('events')}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors relative ${
              activeTab === 'events'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Linked Calendar Events & Exams"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events</span>
            {linkedEvents.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* 1. PDF Outline (ToC navigation) */}
        {activeTab === 'outline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>PDF Outline</span>
              </span>
              {activePdf && (
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                  {activePdf.title}
                </span>
              )}
            </div>

            {activePdf && activePdf.outline && activePdf.outline.length > 0 ? (
              <div className="space-y-1">
                {activePdf.outline.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    id={`toc-item-${item.id}`}
                    onClick={() => onNavigateToPdfPage(activePdf.title, item.pageNumber)}
                    className="w-full text-left p-2 rounded hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                      <span className="text-slate-300 text-xs truncate group-hover:text-slate-100">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-400 bg-slate-950/60 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                      p.{item.pageNumber}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs">No PDF Outline Available</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Open a PDF document with Table of Contents to navigate sections.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. Concept Map (Dual Coding Mini-Graph) */}
        {activeTab === 'concept-map' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Concept Map (Dual Coding)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">D3.js</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interactive neighborhood of this note. Click any connected node to switch context:
            </p>

            {/* D3 Mini Map */}
            <ConceptMiniMap
              activeNote={activeNote}
              notes={notes}
              pdfs={pdfs}
              onSelectNote={onSelectNote}
            />

            {/* Context Backlinks */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Mentions & References
              </span>
              <div className="mt-1.5 space-y-1">
                {notes
                  .filter((n) => activeNote && n.id !== activeNote.id && n.content.includes(activeNote.title))
                  .map((backlink) => (
                    <button
                      key={backlink.id}
                      type="button"
                      onClick={() => onSelectNote(backlink.id)}
                      className="w-full text-left p-1.5 rounded bg-slate-950/60 hover:bg-slate-800 text-[11px] text-amber-300 flex items-center justify-between truncate"
                    >
                      <span className="truncate">← {backlink.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-500 ml-1 flex-shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Linked Calendar Events */}
        {activeTab === 'events' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Linked Events & Exams</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Priority</span>
            </div>

            {linkedEvents.length > 0 ? (
              <div className="space-y-2">
                {linkedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          evt.type === 'exam'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {evt.type}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {evt.date} {evt.time || ''}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-200 text-xs leading-snug">
                      {evt.title}
                    </h4>
                    <button
                      type="button"
                      id={`study-for-event-${evt.id}`}
                      onClick={onOpenStudyTools}
                      className="w-full mt-1 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-semibold text-center transition-colors cursor-pointer"
                    >
                      Prioritize in Study Queue
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <AlertCircle className="w-7 h-7 text-slate-700 mx-auto mb-2" />
                <p className="text-xs">No Events Linked to this Note</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Connect exams or deadlines in the Calendar view to trigger Calendar Priority reviews.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
