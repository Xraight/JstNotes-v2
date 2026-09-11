import React, { useState } from 'react';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { Note } from '../../types';

interface SearchPanelProps {
  notes: Note[];
  onSelectNote: (noteId: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ notes, onSelectNote }) => {
  const [query, setQuery] = useState('');

  // Substring search across all notes
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return notes
      .filter((n) => n.type !== 'folder')
      .map((note) => {
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentLower = note.content.toLowerCase();
        const contentMatchIndex = contentLower.indexOf(q);

        if (titleMatch || contentMatchIndex !== -1) {
          // Extract highlighted snippet
          let snippet = '';
          if (contentMatchIndex !== -1) {
            const start = Math.max(0, contentMatchIndex - 40);
            const end = Math.min(note.content.length, contentMatchIndex + q.length + 60);
            snippet = (start > 0 ? '...' : '') + note.content.substring(start, end) + (end < note.content.length ? '...' : '');
          } else {
            snippet = note.content.slice(0, 100) + '...';
          }

          return {
            note,
            snippet,
            matchesTitle: titleMatch,
          };
        }
        return null;
      })
      .filter(Boolean) as { note: Note; snippet: string; matchesTitle: boolean }[];
  }, [query, notes]);

  return (
    <div className="h-full flex flex-col select-none text-xs text-slate-300">
      <div className="h-9 px-3 border-b border-slate-800 flex items-center bg-slate-900/60 flex-shrink-0">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
          Global Note Search
        </span>
      </div>

      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            id="global-note-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words, concepts, LaTeX..."
            autoFocus
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {query.trim() && (
          <div className="text-[10px] text-slate-500 font-mono px-1 mb-1">
            Found {results.length} matching notes
          </div>
        )}

        {results.map(({ note, snippet }) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onSelectNote(note.id)}
            className="w-full text-left p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200 group-hover:text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{note.title}</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Snippet with highlighted search query */}
            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
              {snippet.split(new RegExp(`(${query})`, 'gi')).map((part, pIdx) =>
                part.toLowerCase() === query.toLowerCase() ? (
                  <mark key={pIdx} className="bg-cyan-500/25 text-cyan-300 px-0.5 rounded font-medium">
                    {part}
                  </mark>
                ) : (
                  part
                )
              )}
            </p>
          </button>
        ))}

        {!query.trim() && (
          <div className="py-16 text-center text-slate-500">
            <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs">Type to search notes</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Find text, formulas, or @-mentions across your entire library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
