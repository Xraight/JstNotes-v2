import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Filter,
  FileText,
  Highlighter,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { PDFDocument, PDFHighlight, Note } from '../../types';

interface PDFLibraryProps {
  pdfs: PDFDocument[];
  activePdfId: string | null;
  onSelectPdf: (pdfId: string) => void;
  onImportPdf: (file: File) => void;
  onDeletePdf: (pdfId: string) => void;
  activeNote: Note | null;
  highlights: PDFHighlight[];
}

export const PDFLibrary: React.FC<PDFLibraryProps> = ({
  pdfs,
  activePdfId,
  onSelectPdf,
  onImportPdf,
  onDeletePdf,
  activeNote,
  highlights,
}) => {
  const [filterByCurrentNote, setFilterByCurrentNote] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportPdf(e.target.files[0]);
      e.target.value = '';
    }
  };

  // Filter PDFs
  const filteredPdfs = filterByCurrentNote && activeNote
    ? pdfs.filter((p) => p.linkedNoteIds.includes(activeNote.id) || activeNote.content.includes(p.title))
    : pdfs;

  return (
    <div className="h-full flex flex-col select-none text-xs text-slate-300">
      {/* Header with Import & Filter */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
          PDF Library
        </span>
        <div className="flex items-center gap-1.5">
          {/* Filter Toggle */}
          <button
            type="button"
            id="filter-pdf-current-note"
            onClick={() => setFilterByCurrentNote(!filterByCurrentNote)}
            className={`p-1 rounded transition-colors ${
              filterByCurrentNote
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={filterByCurrentNote ? 'Show all PDFs' : 'Filter by current note only'}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          {/* Import Button */}
          <button
            type="button"
            id="import-pdf-btn"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
            title="Import PDF document"
          >
            <Plus className="w-3 h-3" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter status banner */}
      {filterByCurrentNote && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
          <span className="truncate">Filtered: {activeNote?.title || 'Current Note'}</span>
          <button
            type="button"
            onClick={() => setFilterByCurrentNote(false)}
            className="text-amber-400 hover:underline text-[10px] font-semibold ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* PDF List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredPdfs.length > 0 ? (
          filteredPdfs.map((pdf) => {
            const isActive = activePdfId === pdf.id;
            const pdfHighlightsCount = highlights.filter((h) => h.pdfId === pdf.id).length;

            return (
              <div
                key={pdf.id}
                id={`pdf-item-${pdf.id}`}
                onClick={() => onSelectPdf(pdf.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all group ${
                  isActive
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <BookOpen
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'
                      }`}
                    />
                    <span className="font-medium text-xs truncate">{pdf.title}</span>
                  </div>

                  <button
                    type="button"
                    title="Delete PDF"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${pdf.title}" from library?`)) {
                        onDeletePdf(pdf.id);
                      }
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                  <span>{pdf.pageCount} pages</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Highlighter className="w-2.5 h-2.5" />
                    {pdfHighlightsCount} highlights
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 px-4">
            <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs">No PDFs Found</p>
            <p className="text-[11px] text-slate-600 mt-1">
              {filterByCurrentNote
                ? 'No PDFs are linked to the currently selected note.'
                : 'Import a PDF document to read, highlight, and link with your notes.'}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs inline-flex items-center gap-1 font-medium"
            >
              <Upload className="w-3 h-3" /> Import File
            </button>
          </div>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImportPdf(e.dataTransfer.files[0]);
          }
        }}
        className="m-2 p-3 border border-dashed border-slate-800 rounded-lg text-center text-[10px] text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-colors"
      >
        Drop PDF file here to import
      </div>
    </div>
  );
};
