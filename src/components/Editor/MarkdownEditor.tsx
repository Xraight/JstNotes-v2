import React, { useState, useRef, useEffect } from 'react';
import {
  Columns2,
  Eye,
  Edit3,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Hash,
  List,
  Bold,
  Italic,
  Code,
  FileText,
  Save,
} from 'lucide-react';
import { Note, getFontFamilyCss } from '../../types';
import { MarkdownRenderer } from '../../utils/markdown';

interface MarkdownEditorProps {
  note: Note | null;
  notes: Note[];
  onUpdateContent: (newContent: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onNavigateToNote: (idOrTitle: string) => void;
  onNavigateToPdfPage?: (pdfTitle: string, pageNumber: number) => void;
  onOpenStudyTools?: () => void;
  lineNumbers?: boolean;
  fontFamily?: string;
  fontSize?: number;
  livePreviewSplit?: boolean;
  isPdfViewerOpen?: boolean;
  onTogglePdfViewer?: () => void;
  hasActivePdf?: boolean;
  activePdfTitle?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  note,
  notes,
  onUpdateContent,
  onUpdateTitle,
  onNavigateToNote,
  onNavigateToPdfPage,
  onOpenStudyTools,
  lineNumbers = true,
  fontFamily,
  fontSize = 14,
  livePreviewSplit = true,
  isPdfViewerOpen = false,
  onTogglePdfViewer,
  hasActivePdf = false,
  activePdfTitle,
}) => {
  const resolvedFont = getFontFamilyCss(fontFamily || 'JetBrains Mono');

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>(
    livePreviewSplit ? 'split' : 'edit'
  );
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // @-mentions autocomplete state
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionMenuPos, setMentionMenuPos] = useState({ top: 0, left: 0 });
  const [selectedMentionIdx, setSelectedMentionIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute breadcrumbs
  const getBreadcrumbs = (currNote: Note | null): { id: string; title: string }[] => {
    if (!currNote) return [];
    const crumbs: { id: string; title: string }[] = [{ id: currNote.id, title: currNote.title }];
    let curr = currNote;
    while (curr.parentId) {
      const parent = notes.find((n) => n.id === curr.parentId);
      if (parent) {
        crumbs.unshift({ id: parent.id, title: parent.title });
        curr = parent;
      } else {
        break;
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs(note);

  // Filter notes for mention dropdown
  const filteredMentionNotes = notes
    .filter((n) => n.type !== 'folder' && n.id !== note?.id)
    .filter((n) => n.title.toLowerCase().includes(mentionQuery.toLowerCase()))
    .slice(0, 6);

  // Track cursor position and @ trigger
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onUpdateContent(val);

    const selStart = e.target.selectionStart;
    const textBefore = val.substring(0, selStart);

    // Compute line and column
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });

    // Check if user is typing an @ mention
    const lastAtIdx = textBefore.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const charBeforeAt = lastAtIdx > 0 ? textBefore[lastAtIdx - 1] : ' ';
      const textAfterAt = textBefore.substring(lastAtIdx + 1);

      // Trigger autocomplete if preceded by space or start of line and no newline after @
      if ((charBeforeAt === ' ' || charBeforeAt === '\n') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setShowMentionMenu(true);
        setSelectedMentionIdx(0);
        return;
      }
    }

    setShowMentionMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionMenu && filteredMentionNotes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIdx((prev) => (prev + 1) % filteredMentionNotes.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIdx((prev) => (prev - 1 + filteredMentionNotes.length) % filteredMentionNotes.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMentionNotes[selectedMentionIdx].title);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionMenu(false);
        return;
      }
    }
  };

  const insertMention = (noteTitle: string) => {
    if (!textareaRef.current || !note) return;
    const val = note.content;
    const selStart = textareaRef.current.selectionStart;
    const textBefore = val.substring(0, selStart);
    const lastAtIdx = textBefore.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const textAfter = val.substring(selStart);
      const newText = val.substring(0, lastAtIdx) + `@${noteTitle} ` + textAfter;
      onUpdateContent(newText);
      setShowMentionMenu(false);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = lastAtIdx + noteTitle.length + 2;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const insertMarkdownSnippet = (prefix: string, suffix = '') => {
    if (!textareaRef.current || !note) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = note.content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    const newContent = note.content.substring(0, start) + replacement + note.content.substring(end);
    onUpdateContent(newContent);

    setTimeout(() => {
      ta.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
      ta.focus();
    }, 10);
  };

  const handleCopyMarkdown = () => {
    if (!note) return;
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-8 text-center">
        <FileText className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-sm font-medium text-slate-400">No Note Selected</h3>
        <p className="text-xs text-slate-600 max-w-xs mt-1">
          Select a note from the sidebar explorer or press Ctrl+K to jump to any concept.
        </p>
      </div>
    );
  }

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;
  const lineCount = note.content.split('\n').length;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden text-slate-200">
      {/* Top Breadcrumb & Control Header */}
      <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 text-xs">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-slate-400 text-[11px]">
          <span className="font-semibold text-slate-500">Workspace</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <button
                type="button"
                id={`breadcrumb-${crumb.id}`}
                onClick={() => onNavigateToNote(crumb.id)}
                className={`truncate hover:text-slate-200 cursor-pointer ${
                  idx === breadcrumbs.length - 1 ? 'text-amber-400 font-medium' : ''
                }`}
              >
                {crumb.title}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Quick Study Launch */}
          {onOpenStudyTools && (
            <button
              type="button"
              id="editor-study-tools-btn"
              onClick={onOpenStudyTools}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-medium transition-colors"
              title="Launch AI Study Tools for this note"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">AI Study</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            id="editor-copy-btn"
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Copy Note Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle PDF Split Viewer Button */}
          {onTogglePdfViewer && (
            <button
              type="button"
              id="editor-toggle-pdf-pane-btn"
              onClick={onTogglePdfViewer}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isPdfViewerOpen && hasActivePdf
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : hasActivePdf
                  ? 'bg-slate-800/90 text-slate-300 hover:text-amber-300 hover:bg-slate-800 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={
                hasActivePdf
                  ? isPdfViewerOpen
                    ? 'Hide PDF (Give full space to Editor)'
                    : 'Show PDF split side-by-side'
                  : 'Open PDF Viewer'
              }
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasActivePdf ? (isPdfViewerOpen ? 'Hide PDF' : 'Show PDF') : 'PDF'}
              </span>
            </button>
          )}

          {/* View Mode Toggle: Split | Edit | Preview */}
          <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800">
            <button
              type="button"
              id="view-mode-split"
              onClick={() => setViewMode('split')}
              className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Split Preview"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              type="button"
              id="view-mode-edit"
              onClick={() => setViewMode('edit')}
              className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                viewMode === 'edit' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Editor Only"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Edit</span>
            </button>
            <button
              type="button"
              id="view-mode-preview"
              onClick={() => setViewMode('preview')}
              className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Note Title Input */}
      <div className="px-6 pt-4 pb-2 bg-slate-950 flex-shrink-0">
        <input
          type="text"
          id="editor-note-title"
          value={note.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Untitled Note..."
          style={{ fontFamily: resolvedFont }}
          className="w-full bg-transparent text-xl font-bold text-slate-100 border-none outline-none focus:ring-0 placeholder-slate-600 tracking-tight"
        />
        {/* Quick formatting toolbar */}
        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('## ')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 flex items-center gap-0.5"
            title="Heading 2"
          >
            <Hash className="w-3 h-3" /> H2
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('**', '**')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 flex items-center gap-0.5"
            title="Bold"
          >
            <Bold className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('*', '*')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 flex items-center gap-0.5"
            title="Italic"
          >
            <Italic className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('- ')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 flex items-center gap-0.5"
            title="Bullet List"
          >
            <List className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('$$\n', '\n$$')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-amber-400 font-mono text-[10px]"
            title="Insert Block LaTeX"
          >
            $$ LaTeX
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('`', '`')}
            className="px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200"
            title="Inline Code"
          >
            <Code className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (textareaRef.current) {
                const pos = textareaRef.current.selectionStart;
                const newText = note.content.substring(0, pos) + '@' + note.content.substring(pos);
                onUpdateContent(newText);
                setShowMentionMenu(true);
                setMentionQuery('');
              }
            }}
            className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[10px] font-semibold"
            title="Insert @-Mention"
          >
            @ Mention
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Split / Edit / Preview) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            className={`h-full flex overflow-hidden ${
              viewMode === 'split' ? 'w-1/2 border-r border-slate-800' : 'w-full'
            }`}
          >
            {/* Line numbers column */}
            {lineNumbers && (
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="py-4 px-2 select-none text-right font-mono text-slate-600 bg-slate-950/40 border-r border-slate-900 leading-6 min-w-[40px]"
              >
                {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}

            {/* Markdown Textarea */}
            <div className="relative flex-1 h-full">
              <textarea
                ref={textareaRef}
                id="editor-textarea"
                value={note.content}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Write in Markdown or LaTeX ($...$ and $$...$$). Type @ to link notes..."
                spellCheck={false}
                style={{
                  fontFamily: resolvedFont,
                  fontSize: `${fontSize}px`,
                }}
                className="w-full h-full p-4 bg-transparent text-slate-200 leading-6 resize-none outline-none focus:ring-0 border-none select-text"
              />

              {/* @-Mention Autocomplete Popup Menu */}
              {showMentionMenu && filteredMentionNotes.length > 0 && (
                <div className="absolute z-50 bottom-12 left-8 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 text-xs animate-in fade-in duration-75">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 mb-1 flex justify-between items-center">
                    <span>Link to Note (@)</span>
                    <span className="text-slate-500 lowercase font-normal">Enter / Tab to select</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredMentionNotes.map((target, idx) => (
                      <button
                        key={target.id}
                        type="button"
                        id={`mention-option-${target.id}`}
                        onClick={() => insertMention(target.title)}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 cursor-pointer transition-colors ${
                          idx === selectedMentionIdx ? 'bg-amber-500/20 text-amber-200 font-medium' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{target.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            id="editor-preview-pane"
            style={{
              fontFamily: resolvedFont,
              fontSize: `${fontSize}px`,
              ['--app-font-family' as any]: resolvedFont,
            }}
            className={`h-full overflow-y-auto p-6 bg-slate-950/40 app-font-custom ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="max-w-3xl mx-auto">
              <MarkdownRenderer
                content={note.content}
                notes={notes}
                onNavigateToNote={onNavigateToNote}
                onNavigateToPdfPage={onNavigateToPdfPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 px-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="text-slate-600">|</span>
          <span>{wordCount} words</span>
          <span className="text-slate-600">|</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Save className="w-3 h-3" /> Auto-Saved
          </span>
          <span className="text-slate-600">|</span>
          <span>UTF-8</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400">Markdown + KaTeX</span>
        </div>
      </div>
    </div>
  );
};
