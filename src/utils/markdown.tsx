import React, { useState } from 'react';
import katex from 'katex';
import { FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { Note } from '../types';

interface MarkdownRendererProps {
  content: string;
  notes: Note[];
  onNavigateToNote: (noteIdOrTitle: string) => void;
  onNavigateToPdfPage?: (pdfTitle: string, pageNumber: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  notes,
  onNavigateToNote,
  onNavigateToPdfPage,
}) => {
  // Helper to render LaTeX math safely with KaTeX
  const renderLatex = (formula: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      return `<span class="text-rose-400 font-mono text-xs">[LaTeX Error: ${formula}]</span>`;
    }
  };

  // Pre-process LaTeX blocks: $$...$$
  let processed = content;

  // Split into lines to parse markdown blocks
  const lines = processed.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let inMathBlock = false;
  let mathBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950/80 font-mono text-xs">
            {codeLanguage && (
              <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                {codeLanguage}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-emerald-400 leading-relaxed font-mono">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Multi-line Math Block handling: $$ ... $$
    if (inMathBlock) {
      if (line.trim().endsWith('$$')) {
        const mathContent = line.trim().replace(/\$\$$/, '');
        if (mathContent) mathBuffer.push(mathContent);
        const formula = mathBuffer.join('\n').trim();
        const html = renderLatex(formula, true);
        elements.push(
          <div
            key={`math-block-${i}`}
            className="my-3 px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center overflow-x-auto text-amber-200"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        mathBuffer = [];
        inMathBlock = false;
      } else {
        mathBuffer.push(line);
      }
      continue;
    }

    if (line.trim() === '$$') {
      inMathBlock = true;
      mathBuffer = [];
      continue;
    }

    // Single-line Display / Block Math: $$...$$
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const math = line.trim().slice(2, -2).trim();
      const html = renderLatex(math, true);
      elements.push(
        <div
          key={`math-block-${i}`}
          className="my-3 px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center overflow-x-auto text-amber-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      continue;
    } else if (line.trim().startsWith('$$') && !line.trim().endsWith('$$')) {
      inMathBlock = true;
      mathBuffer = [line.trim().slice(2)];
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-slate-100 mt-5 mb-2 pb-1 border-b border-slate-800 tracking-tight">
          {renderInlineText(line.replace('# ', ''), notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-semibold text-slate-200 mt-4 mb-2 tracking-tight">
          {renderInlineText(line.replace('## ', ''), notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-medium text-slate-200 mt-3 mb-1.5">
          {renderInlineText(line.replace('### ', ''), notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-2.5 pl-3.5 border-l-2 border-amber-500/80 bg-amber-500/5 py-1 text-slate-300 italic text-sm">
          {renderInlineText(line.replace('> ', ''), notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s*/, '');
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm text-slate-300 my-0.5 leading-relaxed">
          {renderInlineText(text, notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s*(.*)/);
    if (numMatch) {
      elements.push(
        <li key={`num-li-${i}`} className="ml-5 list-decimal text-sm text-slate-300 my-0.5 leading-relaxed">
          {renderInlineText(numMatch[2], notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
        </li>
      );
      continue;
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <div key={`p-${i}`} className="text-sm text-slate-300 leading-relaxed my-1">
        {renderInlineText(line, notes, onNavigateToNote, onNavigateToPdfPage, renderLatex)}
      </div>
    );
  }

  return <div className="space-y-1 select-text">{elements}</div>;
};

// Mention badge with hover breadcrumb preview
const MentionBadge: React.FC<{
  title: string;
  notes: Note[];
  onNavigateToNote: (idOrTitle: string) => void;
}> = ({ title, notes, onNavigateToNote }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const targetNote = notes.find((n) => n.title.toLowerCase() === title.toLowerCase());

  // Compute breadcrumbs path
  const getBreadcrumbs = (note: Note): string[] => {
    const crumbs: string[] = [note.title];
    let curr = note;
    while (curr.parentId) {
      const parent = notes.find((n) => n.id === curr.parentId);
      if (parent) {
        crumbs.unshift(parent.title);
        curr = parent;
      } else {
        break;
      }
    }
    return crumbs;
  };

  const crumbs = targetNote ? getBreadcrumbs(targetNote) : ['Notes', title];

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        id={`mention-${title.replace(/\s+/g, '-')}`}
        onClick={() => onNavigateToNote(targetNote ? targetNote.id : title)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer"
      >
        <span className="text-amber-400 font-bold">@</span>
        <span>{title}</span>
      </button>

      {showTooltip && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-2.5 bg-slate-900 text-slate-200 rounded-lg shadow-xl border border-slate-700 text-xs backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-100 block">
          <span className="flex items-center gap-1 text-[10px] text-slate-400 pb-1 border-b border-slate-800 mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />}
                <span className={idx === crumbs.length - 1 ? 'text-amber-400 font-medium' : ''}>{crumb}</span>
              </React.Fragment>
            ))}
          </span>
          <span className="font-semibold text-slate-100 flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{targetNote ? targetNote.title : title}</span>
          </span>
          <span className="block text-slate-400 text-[11px] line-clamp-2">
            {targetNote ? targetNote.content.replace(/[#*`]/g, '').slice(0, 100) : 'Note reference'}
          </span>
        </span>
      )}
    </span>
  );
};

// PDF Badge linking to page
const PdfBadge: React.FC<{
  pdfTitle: string;
  pageNumber: number;
  onNavigateToPdfPage?: (pdfTitle: string, pageNumber: number) => void;
}> = ({ pdfTitle, pageNumber, onNavigateToPdfPage }) => {
  return (
    <button
      type="button"
      id={`pdf-badge-${pageNumber}`}
      onClick={() => onNavigateToPdfPage?.(pdfTitle, pageNumber)}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded text-xs font-mono font-medium bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer"
      title={`Open PDF at Page ${pageNumber}`}
    >
      <FileText className="w-3 h-3 text-rose-400" />
      <span className="truncate max-w-[130px]">{pdfTitle}</span>
      <span className="px-1 py-0.2 bg-rose-950/60 rounded text-[10px] font-bold text-rose-300">p.{pageNumber}</span>
      <ExternalLink className="w-2.5 h-2.5 text-rose-400" />
    </button>
  );
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderInlineText(
  text: string,
  notes: Note[],
  onNavigateToNote: (idOrTitle: string) => void,
  onNavigateToPdfPage?: (pdfTitle: string, pageNumber: number) => void,
  renderLatex?: (formula: string, displayMode: boolean) => string
): React.ReactNode {
  // Regex to match:
  // 1. PDF badges: [PDF: Title p. X]
  // 2. Mentions: @[Note Title] or @KnownNoteTitle or @Word
  // 3. Inline LaTeX: $math$
  // 4. Bold: **text**
  // 5. Italic: *text*
  // 6. Inline code: `code`

  const parts: React.ReactNode[] = [];
  const knownTitles = notes
    .filter((n) => n.type !== 'folder' && n.title)
    .map((n) => n.title)
    .sort((a, b) => b.length - a.length);

  const titlePattern = knownTitles.length > 0 ? knownTitles.map(escapeRegex).join('|') : '';
  const mentionPattern = titlePattern
    ? `(@\\[(.*?)\\]|@(${titlePattern})|@([a-zA-Z0-9_\\u00C0-\\u017F\\-]+))`
    : `(@\\[(.*?)\\]|@([a-zA-Z0-9_\\u00C0-\\u017F\\-]+))`;

  const regex = new RegExp(
    `(\\[PDF:\\s*(.*?)\\s*p\\.\\s*(\\d+)\\])|${mentionPattern}|(\\$([^$\\n]+)\\$)|(\\*\\*(.*?)\\*\\*)|(\\*(.*?)\\*)|(\`([^\`]+)\`)`,
    'g'
  );

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // 1. PDF badge: [PDF: Title p. X]
    if (match[1]) {
      const pdfTitle = match[2];
      const pageNumber = parseInt(match[3], 10);
      parts.push(
        <PdfBadge
          key={`pdf-${match.index}`}
          pdfTitle={pdfTitle}
          pageNumber={pageNumber}
          onNavigateToPdfPage={onNavigateToPdfPage}
        />
      );
    }
    // 2. Mention @Note
    else if (match[4]) {
      const mentionTitle = (match[5] || match[6] || match[7] || '').trim();
      parts.push(
        <MentionBadge
          key={`mention-${match.index}`}
          title={mentionTitle}
          notes={notes}
          onNavigateToNote={onNavigateToNote}
        />
      );
    }
    // 3. Inline LaTeX: $math$
    else if (match[8]) {
      const formula = match[9];
      const html = renderLatex ? renderLatex(formula, false) : formula;
      parts.push(
        <span
          key={`latex-${match.index}`}
          className="mx-0.5 inline-block text-amber-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // 4. Bold: **text**
    else if (match[10]) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-100">
          {match[11]}
        </strong>
      );
    }
    // 5. Italic: *text*
    else if (match[12]) {
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-slate-300">
          {match[13]}
        </em>
      );
    }
    // 6. Code: `code`
    else if (match[14]) {
      parts.push(
        <code key={`code-${match.index}`} className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-xs border border-slate-700">
          {match[15]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
