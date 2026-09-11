import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Pin,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FilePlus,
  MoreVertical,
  BookOpen,
} from 'lucide-react';
import { Note } from '../../types';

interface NotesTreeProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onDoubleClickNote?: (noteId: string) => void;
  onCreateNote: (parentId: string | null, type: 'note' | 'folder') => void;
  onDeleteNote: (noteId: string) => void;
  onRenameNote: (noteId: string, newTitle: string) => void;
  onTogglePin: (noteId: string) => void;
  onMoveNote: (noteId: string, newParentId: string | null) => void;
}

export const NotesTree: React.FC<NotesTreeProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onDoubleClickNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  onTogglePin,
  onMoveNote,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-neuro': true,
    'folder-quantum': true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const startRename = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
  };

  const submitRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameNote(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedNoteId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const sourceId = e.dataTransfer.getData('text/plain') || draggedNoteId;
    if (sourceId && sourceId !== targetFolderId) {
      onMoveNote(sourceId, targetFolderId);
    }
    setDraggedNoteId(null);
  };

  // Recursive Tree Node Renderer
  const renderTree = (parentId: string | null, depth = 0) => {
    const children = notes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => {
        // Pinned notes first, then folders, then files
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.title.localeCompare(b.title);
      });

    return children.map((item) => {
      const isFolder = item.type === 'folder';
      const isPdfNote = item.type === 'pdf_note';
      const isExpanded = expandedFolders[item.id] ?? true;
      const isActive = activeNoteId === item.id;
      const isDragOver = dragOverFolderId === item.id;

      return (
        <div key={item.id} className="relative select-none text-xs">
          {/* Node Row */}
          <div
            id={`tree-node-${item.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => isFolder && handleDragOver(e, item.id)}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => isFolder && handleDrop(e, item.id)}
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.id);
              } else {
                onSelectNote(item.id);
              }
            }}
            onDoubleClick={() => {
              if (!isFolder) {
                onDoubleClickNote ? onDoubleClickNote(item.id) : onSelectNote(item.id);
              }
            }}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`flex items-center justify-between py-1.5 pr-2 rounded-md group cursor-pointer transition-colors ${
              isActive
                ? 'bg-amber-500/15 text-amber-300 font-medium border-l-2 border-amber-400'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
            } ${isDragOver ? 'bg-amber-500/20 ring-1 ring-amber-400' : ''}`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-1">
              {/* Folder toggle chevron */}
              {isFolder ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.id);
                  }}
                  className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-3.5" />
              )}

              {/* Icon */}
              {isFolder ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )
              ) : isPdfNote ? (
                <BookOpen className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 flex-shrink-0" />
              )}

              {/* Title / Inline Rename Input */}
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editTitle}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={submitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="bg-slate-950 border border-amber-400 rounded px-1 text-xs text-slate-100 outline-none w-full"
                />
              ) : (
                <span className="truncate flex-1 text-[12px]">{item.title}</span>
              )}

              {/* Pinned Indicator */}
              {item.pinned && (
                <Pin className="w-2.5 h-2.5 text-amber-400 flex-shrink-0 fill-amber-400/30" />
              )}

              {/* PDF Badge tag */}
              {isPdfNote && (
                <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono font-bold flex-shrink-0">
                  PDF
                </span>
              )}
            </div>

            {/* Action buttons on hover */}
            <div className="hidden group-hover:flex items-center gap-1 opacity-80 hover:opacity-100 flex-shrink-0">
              {isFolder && (
                <button
                  type="button"
                  title="Create note in this folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNote(item.id, 'note');
                    if (!isExpanded) toggleFolder(item.id);
                  }}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                title={item.pinned ? 'Unpin' : 'Pin to top'}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(item.id);
                }}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(item);
                }}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${item.title}"?`)) {
                    onDeleteNote(item.id);
                  }
                }}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Children nodes if folder is expanded */}
          {isFolder && isExpanded && (
            <div className="relative border-l border-slate-800/80 ml-4 my-0.5">
              {renderTree(item.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      onDragOver={(e) => handleDragOver(e, null)}
      onDrop={(e) => handleDrop(e, null)}
      className="h-full flex flex-col select-none"
    >
      {/* Sidebar Header & Creation Controls */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="create-note-root"
            onClick={() => onCreateNote(null, 'note')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="New Note (Root)"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="create-folder-root"
            onClick={() => onCreateNote(null, 'folder')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {renderTree(null, 0)}
      </div>

      {/* Drag & Drop Hint */}
      <div className="p-2 border-t border-slate-800/60 text-[10px] text-slate-500 text-center font-mono">
        Drag notes to organize • Double-click to open
      </div>
    </div>
  );
};
