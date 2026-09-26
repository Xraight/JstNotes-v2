import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_NOTES,
  INITIAL_PDFS,
  INITIAL_FLASHCARDS,
  INITIAL_DEEP_QUESTIONS,
  INITIAL_CONCRETE_EXAMPLES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_HIGHLIGHTS,
  INITIAL_SETTINGS,
} from './data/initialData';
import { SAMPLE_KNOWLEDGE_BASE } from './data/sampleKnowledgeBase';
import {
  Note,
  PDFDocument,
  PDFHighlight,
  Flashcard,
  DeepQuestion,
  ConcreteExample,
  CalendarEvent,
  ActiveView,
  SidebarTab,
  AppSettings,
  getFontFamilyCss,
} from './types';

import { ActivityBar } from './components/Sidebar/ActivityBar';
import { NotesTree } from './components/Sidebar/NotesTree';
import { PDFLibrary } from './components/Sidebar/PDFLibrary';
import { MiniCalendar } from './components/Sidebar/MiniCalendar';
import { SearchPanel } from './components/Sidebar/SearchPanel';

import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { PDFViewer } from './components/PDFViewer/PDFViewer';
import { ContextPanel } from './components/Editor/ContextPanel';

import { StudyHome } from './components/Study/StudyHome';
import { FlashcardSession } from './components/Study/FlashcardSession';
import { FeynmanTechnique } from './components/Study/FeynmanTechnique';
import { DeepQuestions } from './components/Study/DeepQuestions';
import { ConcreteExamples } from './components/Study/ConcreteExamples';
import { GraphView } from './components/Graph/GraphView';
import { SettingsModal } from './components/SettingsModal';
import { generateFlashcards } from './utils/aiService';

export function App() {
  // --- Persistent Workspace State ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('cognito_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [pdfs, setPdfs] = useState<PDFDocument[]>(() => {
    const saved = localStorage.getItem('cognito_pdfs');
    return saved ? JSON.parse(saved) : INITIAL_PDFS;
  });

  const [highlights, setHighlights] = useState<PDFHighlight[]>(() => {
    const saved = localStorage.getItem('cognito_highlights');
    return saved ? JSON.parse(saved) : INITIAL_HIGHLIGHTS;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('cognito_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [deepQuestions, setDeepQuestions] = useState<DeepQuestion[]>(() => {
    const saved = localStorage.getItem('cognito_deep_questions');
    return saved ? JSON.parse(saved) : INITIAL_DEEP_QUESTIONS;
  });

  const [concreteExamples, setConcreteExamples] = useState<ConcreteExample[]>(() => {
    const saved = localStorage.getItem('cognito_examples');
    return saved ? JSON.parse(saved) : INITIAL_CONCRETE_EXAMPLES;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('cognito_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cognito_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Save to localStorage on state updates
  useEffect(() => {
    localStorage.setItem('cognito_notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('cognito_pdfs', JSON.stringify(pdfs));
  }, [pdfs]);
  useEffect(() => {
    localStorage.setItem('cognito_highlights', JSON.stringify(highlights));
  }, [highlights]);
  useEffect(() => {
    localStorage.setItem('cognito_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);
  useEffect(() => {
    localStorage.setItem('cognito_deep_questions', JSON.stringify(deepQuestions));
  }, [deepQuestions]);
  useEffect(() => {
    localStorage.setItem('cognito_examples', JSON.stringify(concreteExamples));
  }, [concreteExamples]);
  useEffect(() => {
    localStorage.setItem('cognito_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);
  useEffect(() => {
    localStorage.setItem('cognito_settings', JSON.stringify(settings));
  }, [settings]);

  // --- UI Navigation State ---
  const [activeView, setActiveView] = useState<ActiveView>('workspace');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [contextPanelOpen, setContextPanelOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // --- Active Selection State ---
  const [activeNoteId, setActiveNoteId] = useState<string | null>('note-1');
  // --- PDF Viewer State ---
  const [activePdfId, setActivePdfId] = useState<string | null>('pdf-1');
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(true);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(2);
  const [pdfHighlightColor, setPdfHighlightColor] = useState<string>(
    settings.defaultHighlightColor || '#facc15'
  );
  const [targetHighlightId, setTargetHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (settings.defaultHighlightColor) {
      setPdfHighlightColor(settings.defaultHighlightColor);
    }
  }, [settings.defaultHighlightColor]);

  // --- Resizable Split State (Editor vs PDF) ---
  const [splitPercent, setSplitPercent] = useState<number>(50); // 50% editor, 50% PDF
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Flashcards session deck
  const [activeFlashcardDeck, setActiveFlashcardDeck] = useState<Flashcard[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Active Note & PDF objects
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;
  const activePdf = pdfs.find((p) => p.id === activePdfId) || null;
  const isPdfVisible = activePdf !== null && isPdfViewerOpen;

  const handleTogglePdfViewer = () => {
    if (!activePdfId && pdfs.length > 0) {
      setActivePdfId(pdfs[0].id);
      setIsPdfViewerOpen(true);
    } else if (activePdfId && !isPdfViewerOpen) {
      setIsPdfViewerOpen(true);
    } else {
      setIsPdfViewerOpen(false);
    }
  };

  // Due flashcards count
  const today = new Date().toISOString().split('T')[0];
  const dueReviewsCount = flashcards.filter(
    (c) => !c.nextReviewDate || c.nextReviewDate <= today
  ).length;

  // Split resize event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, newPercent)));
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Global shortcut: Ctrl+K / Cmd+K to jump to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveView('workspace');
        setSidebarTab('search');
        setSidebarOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Note Operations ---
  const handleUpdateNoteContent = (content: string) => {
    if (!activeNoteId) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, content, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleUpdateNoteTitle = (title: string) => {
    if (!activeNoteId) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, title, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleCreateNote = (parentId: string | null, type: 'note' | 'folder') => {
    const newId = (type === 'folder' ? 'folder-' : 'note-') + Math.random().toString(36).substring(2, 9);
    const newNote: Note = {
      id: newId,
      title: type === 'folder' ? 'New Folder' : 'Untitled Note',
      content: type === 'folder' ? '' : '# New Note\n\nStart typing Markdown or LaTeX...',
      type,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    if (type !== 'folder') {
      setActiveNoteId(newId);
      setActiveView('workspace');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    // Collect all descendant ids recursively
    const idsToDelete = new Set<string>([noteId]);
    let added = true;
    while (added) {
      added = false;
      for (const n of notes) {
        if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
          idsToDelete.add(n.id);
          added = true;
        }
      }
    }
    setNotes((prev) => prev.filter((n) => !idsToDelete.has(n.id)));
    if (activeNoteId && idsToDelete.has(activeNoteId)) {
      const remaining = notes.filter((n) => !idsToDelete.has(n.id) && n.type !== 'folder');
      setActiveNoteId(remaining[0]?.id || null);
    }
  };

  const handleRenameNote = (noteId: string, newTitle: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, title: newTitle, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleTogglePinNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleMoveNote = (noteId: string, newParentId: string | null) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, parentId: newParentId } : n))
    );
  };

  // --- Bidirectional Navigation ---
  const handleNavigateToNote = (idOrTitle: string) => {
    const found = notes.find(
      (n) => n.id === idOrTitle || n.title.toLowerCase() === idOrTitle.toLowerCase()
    );
    if (found) {
      setActiveNoteId(found.id);
      setActiveView('workspace');

      // If this note is linked to a PDF, synchronize PDF viewer
      const linkedPdf = pdfs.find(
        (p) => p.linkedNoteIds.includes(found.id) || found.content.includes(p.title)
      );
      if (linkedPdf) {
        setActivePdfId(linkedPdf.id);
        setIsPdfViewerOpen(true);
      }
    }
  };

  const handleNavigateToPdfPage = (pdfTitle: string, pageNumber: number) => {
    const targetPdf = pdfs.find(
      (p) =>
        p.title.toLowerCase().includes(pdfTitle.toLowerCase()) ||
        pdfTitle.toLowerCase().includes(p.title.toLowerCase())
    );

    if (targetPdf) {
      setActivePdfId(targetPdf.id);
      setPdfCurrentPage(pageNumber);
      setIsPdfViewerOpen(true);
      setActiveView('workspace');
    }
  };

  // Double click on a PDF note in tree
  const handleDoubleClickNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveView('workspace');
    const note = notes.find((n) => n.id === noteId);
    if (note && note.type === 'pdf_note') {
      const linkedPdf = pdfs.find((p) => p.linkedNoteIds.includes(noteId));
      if (linkedPdf) {
        setActivePdfId(linkedPdf.id);
        setIsPdfViewerOpen(true);
      }
    }
  };

  // --- PDF Highlights ---
  const handleAddHighlight = (highlight: PDFHighlight) => {
    // Check if we should also link to active note or insert a reference
    const highlightWithNote = {
      ...highlight,
      noteId: activeNoteId || undefined,
    };
    setHighlights((prev) => [...prev, highlightWithNote]);

    // Insert badge into note content automatically if active
    if (activeNote && activePdf) {
      const badgeText = `\n> "${highlight.capturedText.slice(0, 80)}..." — [PDF: ${activePdf.title} p. ${highlight.pageNumber}]\n`;
      handleUpdateNoteContent(activeNote.content + badgeText);
    }
  };

  const handleDeleteHighlight = (highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  };

  // --- PDF Import & Delete ---
  const handleImportPdf = (file: File) => {
    const newPdfId = 'pdf-' + Math.random().toString(36).substring(2, 9);
    const matchingNoteId = 'note-pdf-' + Math.random().toString(36).substring(2, 9);
    const linked = activeNoteId ? [activeNoteId, matchingNoteId] : [matchingNoteId];

    const newPdf: PDFDocument = {
      id: newPdfId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      pageCount: 5,
      linkedNoteIds: linked,
      createdAt: new Date().toISOString(),
      outline: [
        { id: 'sec-1', title: 'Chapter 1: Overview & Fundamentals', pageNumber: 1 },
        { id: 'sec-2', title: 'Chapter 2: Methods & Equations', pageNumber: 2 },
        { id: 'sec-3', title: 'Chapter 3: Results & Conclusions', pageNumber: 4 },
      ],
      pagesData: [
        {
          pageNumber: 1,
          title: 'Introduction and Scope',
          contentText: `Document: ${file.name}\nImported into workspace.\n\nAbstract and initial theoretical foundation.`,
        },
        {
          pageNumber: 2,
          title: 'Core Methodology',
          contentText: `Detailed analysis and experimental framework for ${file.name}. Key equations and parameter spaces.`,
        },
      ],
    };

    setPdfs((prev) => [...prev, newPdf]);
    setActivePdfId(newPdfId);
    setPdfCurrentPage(1);

    // Create matching PDF Note in tree
    const newPdfNote: Note = {
      id: matchingNoteId,
      title: `[PDF] ${newPdf.title}`,
      content: `# ${newPdf.title}\n\nAnnotated notes for [PDF: ${newPdf.title} p. 1].\n\n- Primary Reference Document\n- Double-click from sidebar to inspect`,
      type: 'pdf_note',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newPdfNote]);
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== pdfId));
    setHighlights((prev) => prev.filter((h) => h.pdfId !== pdfId));
    if (activePdfId === pdfId) {
      const remaining = pdfs.filter((p) => p.id !== pdfId);
      setActivePdfId(remaining[0]?.id || null);
    }
  };

  // --- AI Flashcards Generation ---
  const handleGenerateFlashcardsForActiveNote = async () => {
    if (!activeNote || isGeneratingAi) return;
    setIsGeneratingAi(true);

    try {
      const generated = await generateFlashcards(activeNote.title, activeNote.content);
      const withNoteId = generated.map((c) => ({
        ...c,
        noteId: activeNote.id,
      }));

      setFlashcards((prev) => [...prev, ...withNoteId]);
      setActiveFlashcardDeck(withNoteId);
      setActiveView('flashcards');
    } catch (e) {
      console.error('Error generating flashcards', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Start flashcard session
  const handleStartFlashcardsSession = (interleaved = false) => {
    if (interleaved) {
      // Shuffle cards across all topics
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setActiveFlashcardDeck(shuffled);
    } else {
      // Due cards first
      const dueCards = flashcards.filter(
        (card) => !card.nextReviewDate || card.nextReviewDate <= today
      );
      setActiveFlashcardDeck(dueCards.length > 0 ? dueCards : flashcards);
    }
    setActiveView('flashcards');
  };

  return (
    <div
      className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none app-font-custom"
      data-theme={settings.theme}
      style={{
        fontFamily: getFontFamilyCss(settings.fontFamily),
        ['--app-font-family' as any]: getFontFamilyCss(settings.fontFamily),
      }}
    >
      {/* Custom CSS Injection from user preferences */}
      {settings.customCss && <style>{settings.customCss}</style>}

      {/* 1. IDE Activity Bar */}
      <ActivityBar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dueReviewsCount={dueReviewsCount}
      />

      {/* 2. Primary Collapsible Sidebar (Notes Tree, PDF Library, Calendar, Search) */}
      {sidebarOpen && activeView === 'workspace' && (
        <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-10 animate-in slide-in-from-left-2 duration-150">
          {sidebarTab === 'explorer' && (
            <NotesTree
              notes={notes}
              activeNoteId={activeNoteId}
              onSelectNote={(id) => {
                setActiveNoteId(id);
                setActiveView('workspace');
              }}
              onDoubleClickNote={handleDoubleClickNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onRenameNote={handleRenameNote}
              onTogglePin={handleTogglePinNote}
              onMoveNote={handleMoveNote}
            />
          )}

          {sidebarTab === 'pdf-library' && (
            <PDFLibrary
              pdfs={pdfs}
              activePdfId={activePdfId}
              onSelectPdf={(id) => {
                setActivePdfId(id);
                setPdfCurrentPage(1);
                setIsPdfViewerOpen(true);
                setActiveView('workspace');
              }}
              onImportPdf={handleImportPdf}
              onDeletePdf={handleDeletePdf}
              activeNote={activeNote}
              highlights={highlights}
            />
          )}

          {sidebarTab === 'calendar' && (
            <MiniCalendar
              events={calendarEvents}
              notes={notes}
              onSelectNote={handleNavigateToNote}
              onAddEvent={(evt) => setCalendarEvents((prev) => [...prev, evt])}
              onDeleteEvent={(id) => setCalendarEvents((prev) => prev.filter((e) => e.id !== id))}
              activeNote={activeNote}
            />
          )}

          {sidebarTab === 'search' && (
            <SearchPanel notes={notes} onSelectNote={handleNavigateToNote} />
          )}
        </div>
      )}

      {/* 3. Main Center Workspace Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col relative">
        {/* Workspace Mode: Resizable Split (Editor + PDF Viewer) + Context Panel */}
        {activeView === 'workspace' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Split Container */}
            <div ref={splitContainerRef} className="flex-1 flex overflow-hidden relative">
              {/* Left Pane: Markdown Editor */}
              <div
                style={{ width: isPdfVisible ? `${splitPercent}%` : '100%' }}
                className="h-full flex flex-col overflow-hidden transition-[width] duration-150"
              >
                <MarkdownEditor
                  note={activeNote}
                  notes={notes}
                  onUpdateContent={handleUpdateNoteContent}
                  onUpdateTitle={handleUpdateNoteTitle}
                  onNavigateToNote={handleNavigateToNote}
                  onNavigateToPdfPage={handleNavigateToPdfPage}
                  onOpenStudyTools={() => setActiveView('study-home')}
                  lineNumbers={settings.lineNumbers}
                  fontFamily={settings.fontFamily}
                  fontSize={settings.fontSize}
                  livePreviewSplit={settings.livePreviewSplit}
                  isPdfViewerOpen={isPdfViewerOpen}
                  onTogglePdfViewer={handleTogglePdfViewer}
                  hasActivePdf={activePdf !== null}
                  activePdfTitle={activePdf?.title}
                />
              </div>

              {/* Resizable Divider Handle (only when PDF is visible) */}
              {isPdfVisible && (
                <div
                  onMouseDown={() => setIsDraggingSplit(true)}
                  className={`w-1.5 h-full cursor-col-resize hover:bg-amber-500/60 transition-colors z-20 flex-shrink-0 flex items-center justify-center ${
                    isDraggingSplit ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                  title="Drag to resize Editor / PDF split"
                >
                  <div className="w-0.5 h-6 bg-slate-600 rounded-full" />
                </div>
              )}

              {/* Right Pane: PDF Viewer (only when PDF is visible) */}
              {isPdfVisible && (
                <div
                  style={{ width: `${100 - splitPercent}%` }}
                  className="h-full flex flex-col overflow-hidden transition-[width] duration-150"
                >
                  <PDFViewer
                    pdf={activePdf}
                    currentPage={pdfCurrentPage}
                    onPageChange={setPdfCurrentPage}
                    highlights={highlights}
                    onAddHighlight={handleAddHighlight}
                    onDeleteHighlight={handleDeleteHighlight}
                    onOpenLinkedNote={handleNavigateToNote}
                    highlightColor={pdfHighlightColor}
                    onHighlightColorChange={setPdfHighlightColor}
                    targetHighlightId={targetHighlightId}
                    onClose={() => setIsPdfViewerOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Context Panel Toggle Button & Container */}
            {contextPanelOpen && (
              <ContextPanel
                activeNote={activeNote}
                activePdf={activePdf}
                notes={notes}
                pdfs={pdfs}
                calendarEvents={calendarEvents}
                onNavigateToPdfPage={handleNavigateToPdfPage}
                onSelectNote={handleNavigateToNote}
                onOpenStudyTools={() => setActiveView('study-home')}
              />
            )}
          </div>
        )}

        {/* Full-Screen AI Study Home Dashboard */}
        {activeView === 'study-home' && (
          <StudyHome
            notes={notes}
            flashcards={flashcards}
            deepQuestions={deepQuestions}
            calendarEvents={calendarEvents}
            activeNote={activeNote}
            onStartFlashcards={handleStartFlashcardsSession}
            onOpenFeynman={() => setActiveView('feynman')}
            onOpenDeepQuestions={() => setActiveView('deep-questions')}
            onOpenConcreteExamples={() => setActiveView('concrete-examples')}
            onOpenGraphView={() => setActiveView('graph-view')}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setActiveView('workspace');
            }}
            onGenerateFlashcards={handleGenerateFlashcardsForActiveNote}
            isGenerating={isGeneratingAi}
          />
        )}

        {/* Flashcards SM-2 Session */}
        {activeView === 'flashcards' && (
          <FlashcardSession
            cards={activeFlashcardDeck.length > 0 ? activeFlashcardDeck : flashcards}
            onUpdateCard={(updated) => {
              setFlashcards((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
              setActiveFlashcardDeck((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
            }}
            onBack={() => setActiveView('study-home')}
            onGenerateMore={handleGenerateFlashcardsForActiveNote}
            isGenerating={isGeneratingAi}
          />
        )}

        {/* Feynman Technique Streaming Socratic Dialogue */}
        {activeView === 'feynman' && (
          <FeynmanTechnique
            activeNote={activeNote}
            notes={notes}
            onBack={() => setActiveView('study-home')}
          />
        )}

        {/* Deep Questions (Active Recall) */}
        {activeView === 'deep-questions' && (
          <DeepQuestions
            activeNote={activeNote}
            notes={notes}
            questions={deepQuestions}
            onAddQuestion={(q) => setDeepQuestions((prev) => [...prev, q])}
            onUpdateQuestion={(q) =>
              setDeepQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)))
            }
            onBack={() => setActiveView('study-home')}
          />
        )}

        {/* Concrete Examples (Elaboration) */}
        {activeView === 'concrete-examples' && (
          <ConcreteExamples
            activeNote={activeNote}
            notes={notes}
            examples={concreteExamples}
            onAddExample={(ex) => setConcreteExamples((prev) => [...prev, ex])}
            onBack={() => setActiveView('study-home')}
          />
        )}

        {/* Interactive Knowledge Graph View (D3.js) */}
        {activeView === 'graph-view' && (
          <GraphView
            notes={notes}
            pdfs={pdfs}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setActiveView('workspace');
            }}
            onBack={() => setActiveView('workspace')}
          />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onResetSettings={() => setSettings(INITIAL_SETTINGS)}
        notes={notes}
        pdfs={pdfs}
        highlights={highlights}
        flashcards={flashcards}
        deepQuestions={deepQuestions}
        concreteExamples={concreteExamples}
        calendarEvents={calendarEvents}
        onImportData={(imported) => {
          if (imported.notes && Array.isArray(imported.notes)) setNotes(imported.notes);
          if (imported.pdfs && Array.isArray(imported.pdfs)) setPdfs(imported.pdfs);
          if (imported.flashcards && Array.isArray(imported.flashcards)) setFlashcards(imported.flashcards);
          if (imported.highlights && Array.isArray(imported.highlights)) setHighlights(imported.highlights);
          if (imported.deepQuestions && Array.isArray(imported.deepQuestions)) setDeepQuestions(imported.deepQuestions);
          if (imported.concreteExamples && Array.isArray(imported.concreteExamples)) setConcreteExamples(imported.concreteExamples);
          if (imported.calendarEvents && Array.isArray(imported.calendarEvents)) setCalendarEvents(imported.calendarEvents);
          if (imported.settings) setSettings(imported.settings);
        }}
        onLoadSampleData={() => {
          setNotes(SAMPLE_KNOWLEDGE_BASE.notes);
          setPdfs(SAMPLE_KNOWLEDGE_BASE.pdfs);
          setHighlights(SAMPLE_KNOWLEDGE_BASE.highlights);
          setFlashcards(SAMPLE_KNOWLEDGE_BASE.flashcards);
          setDeepQuestions(SAMPLE_KNOWLEDGE_BASE.deepQuestions);
          setConcreteExamples(SAMPLE_KNOWLEDGE_BASE.concreteExamples);
          setCalendarEvents(SAMPLE_KNOWLEDGE_BASE.calendarEvents);
          setActiveNoteId(SAMPLE_KNOWLEDGE_BASE.notes[1]?.id || SAMPLE_KNOWLEDGE_BASE.notes[0]?.id || null);
          setActivePdfId(SAMPLE_KNOWLEDGE_BASE.pdfs[0]?.id || null);
        }}
        onClearAllData={() => {
          setNotes(INITIAL_NOTES);
          setPdfs(INITIAL_PDFS);
          setHighlights(INITIAL_HIGHLIGHTS);
          setFlashcards(INITIAL_FLASHCARDS);
          setDeepQuestions(INITIAL_DEEP_QUESTIONS);
          setConcreteExamples(INITIAL_CONCRETE_EXAMPLES);
          setCalendarEvents(INITIAL_CALENDAR_EVENTS);
          setActiveNoteId(INITIAL_NOTES[1]?.id || INITIAL_NOTES[0]?.id || null);
          setActivePdfId(null);
          localStorage.removeItem('cognito_notes');
          localStorage.removeItem('cognito_pdfs');
          localStorage.removeItem('cognito_highlights');
          localStorage.removeItem('cognito_flashcards');
          localStorage.removeItem('cognito_deep_questions');
          localStorage.removeItem('cognito_examples');
          localStorage.removeItem('cognito_events');
        }}
      />
    </div>
  );
}

export default App;
