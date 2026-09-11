import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  Highlighter,
  Trash2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  Hand,
  MousePointer,
  FileText,
  Link,
  X,
} from 'lucide-react';
import { PDFDocument, PDFHighlight } from '../../types';

interface PDFViewerProps {
  pdf: PDFDocument | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  highlights: PDFHighlight[];
  onAddHighlight: (highlight: PDFHighlight) => void;
  onDeleteHighlight: (highlightId: string) => void;
  onOpenLinkedNote?: (noteId: string) => void;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
  targetHighlightId?: string | null;
  onClose?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Cyan', value: '#38bdf8' },
  { name: 'Pink', value: '#f43f5e' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Purple', value: '#c084fc' },
];

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdf,
  currentPage,
  onPageChange,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  onOpenLinkedNote,
  highlightColor,
  onHighlightColorChange,
  targetHighlightId,
  onClose,
}) => {
  // Zoom state: 30% to 400%
  const [zoom, setZoom] = useState<number>(100);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Text search
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // Rectangle selection for highlights
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Active hover/context menu highlight
  const [activeHighlightTooltip, setActiveHighlightTooltip] = useState<PDFHighlight | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers (capped between 30% and 400%)
  const handleZoomIn = () => setZoom((prev) => Math.min(400, prev + 15));
  const handleZoomOut = () => setZoom((prev) => Math.max(30, prev - 15));
  const handleZoomReset = () => setZoom(100);
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const targetZoom = Math.max(30, Math.min(400, Math.round((containerWidth / 750) * 100)));
      setZoom(targetZoom);
    }
  };

  // Ctrl + Wheel to zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom((prev) => Math.max(30, Math.min(400, prev + delta)));
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Pan handlers
  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (isPanMode && containerRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      containerRef.current.scrollLeft -= dx;
      containerRef.current.scrollTop -= dy;
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
  };

  // Horizontal pan buttons
  const handlePanLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };
  const handlePanRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  // Highlight rectangle drawing
  const handleMouseDownSelect = (e: React.MouseEvent) => {
    if (isPanMode || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handleMouseMoveSelect = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handleMouseUpSelect = () => {
    if (!isSelecting || !selectionBox || !pageContainerRef.current || !pdf) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const widthPx = Math.abs(selectionBox.currentX - selectionBox.startX);
    const heightPx = Math.abs(selectionBox.currentY - selectionBox.startY);

    // Only create highlight if rectangle is sufficiently large
    if (widthPx > 15 && heightPx > 10) {
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);

      const percentX = (minX / rect.width) * 100;
      const percentY = (minY / rect.height) * 100;
      const percentW = (widthPx / rect.width) * 100;
      const percentH = (heightPx / rect.height) * 100;

      // Extract text from page or prompt
      const pageData = pdf.pagesData?.find((p) => p.pageNumber === currentPage);
      const sampleText = pageData
        ? pageData.contentText.slice(0, 180) + '...'
        : `Excerpt from ${pdf.title}, p. ${currentPage}`;

      const newHighlight: PDFHighlight = {
        id: 'hl-' + Math.random().toString(36).substring(2, 9),
        pdfId: pdf.id,
        pageNumber: currentPage,
        rect: {
          x: parseFloat(percentX.toFixed(2)),
          y: parseFloat(percentY.toFixed(2)),
          width: parseFloat(percentW.toFixed(2)),
          height: parseFloat(percentH.toFixed(2)),
        },
        color: highlightColor,
        capturedText: sampleText,
        createdAt: new Date().toISOString(),
      };

      onAddHighlight(newHighlight);
    }

    setIsSelecting(false);
    setSelectionBox(null);
  };

  // Get current page content
  const pageData = pdf?.pagesData?.find((p) => p.pageNumber === currentPage);
  const totalPages = pdf?.pageCount || 1;

  // Highlights on current page
  const pageHighlights = highlights.filter(
    (h) => h.pdfId === pdf?.id && h.pageNumber === currentPage
  );

  // Search matches
  const searchMatches = React.useMemo(() => {
    if (!searchQuery.trim() || !pageData) return [];
    const text = pageData.contentText.toLowerCase();
    const q = searchQuery.toLowerCase();
    const indices: number[] = [];
    let pos = text.indexOf(q);
    while (pos !== -1) {
      indices.push(pos);
      pos = text.indexOf(q, pos + q.length);
    }
    return indices;
  }, [searchQuery, pageData]);

  const handleNextSearch = () => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
    }
  };

  const handlePrevSearch = () => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
    }
  };

  if (!pdf) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8 text-center border-l border-slate-800">
        <FileText className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-base font-medium text-slate-300">No PDF Document Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select a PDF from the sidebar library or click a [PDF: ...] badge in any note to open it here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-shrink-0 text-xs text-slate-300">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="pdf-prev-page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-slate-200"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
            <span className="font-semibold text-slate-200">{currentPage}</span>
            <span className="text-slate-500">/</span>
            <span>{totalPages}</span>
          </div>
          <button
            type="button"
            id="pdf-next-page"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-slate-200"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Zoom Controls & Pan */}
        <div className="flex items-center gap-1 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
          <button
            type="button"
            id="pdf-zoom-out"
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom Out (Ctrl+Scroll Down)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] font-medium text-slate-200">
            {zoom}%
          </span>
          <button
            type="button"
            id="pdf-zoom-in"
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom In (Ctrl+Scroll Up)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-slate-800 mx-0.5" />
          <button
            type="button"
            id="pdf-zoom-reset"
            onClick={handleZoomReset}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="pdf-fit-width"
            onClick={handleFitWidth}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Fit Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-slate-800 mx-0.5" />

          {/* Pan Tool Toggle & Horizontal Buttons */}
          <button
            type="button"
            id="pdf-pan-mode"
            onClick={() => setIsPanMode(!isPanMode)}
            className={`p-1 rounded transition-colors ${
              isPanMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={isPanMode ? 'Pan Tool Active (Click & Drag)' : 'Switch to Hand Pan Tool'}
          >
            {isPanMode ? <Hand className="w-3.5 h-3.5" /> : <MousePointer className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            id="pdf-pan-left"
            onClick={handlePanLeft}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Pan Left"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            id="pdf-pan-right"
            onClick={handlePanRight}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Pan Right"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Color Picker & Search Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Highlight Color Picker */}
          <div className="flex items-center gap-1 bg-slate-950/60 px-1.5 py-1 rounded border border-slate-800">
            <Highlighter className="w-3 h-3 text-slate-400 mr-0.5" />
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                id={`hl-color-${c.name.toLowerCase()}`}
                onClick={() => onHighlightColorChange(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  highlightColor === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={`Highlight Color: ${c.name}`}
              />
            ))}
          </div>

          {/* Search Button */}
          <button
            type="button"
            id="pdf-search-toggle"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showSearch ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Search Text in PDF"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Close / Hide Viewer Button */}
          {onClose && (
            <button
              type="button"
              id="pdf-close-viewer-btn"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
              title="Close PDF Viewer (Reclaim space for Editor)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Search Bar */}
      {showSearch && (
        <div className="px-3 py-1.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              id="pdf-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentMatchIndex(0);
              }}
              placeholder="Search in current page..."
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
            />
            {searchQuery && (
              <span className="text-[11px] text-slate-400 font-mono">
                {searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : '0 matches'}
              </span>
            )}
            <button
              type="button"
              id="pdf-search-prev"
              disabled={searchMatches.length === 0}
              onClick={handlePrevSearch}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Previous Match"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="pdf-search-next"
              disabled={searchMatches.length === 0}
              onClick={handleNextSearch}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Next Match"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch(false)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Document Viewport */}
      <div
        ref={containerRef}
        id="pdf-document-viewport"
        onMouseDown={handleMouseDownPan}
        onMouseMove={handleMouseMovePan}
        onMouseUp={handleMouseUpPan}
        className={`flex-1 overflow-auto p-6 flex justify-center items-start ${
          isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
        }`}
      >
        {/* PDF Page Sheet */}
        <div
          ref={pageContainerRef}
          id="pdf-page-sheet"
          onMouseDown={handleMouseDownSelect}
          onMouseMove={handleMouseMoveSelect}
          onMouseUp={handleMouseUpSelect}
          style={{
            width: `${(750 * zoom) / 100}px`,
            minHeight: `${(1000 * zoom) / 100}px`,
            transformOrigin: 'top center',
          }}
          className="relative bg-white text-slate-900 rounded-sm shadow-2xl p-10 border border-slate-300 select-text transition-all duration-75"
        >
          {/* Header watermark */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-2 mb-6 font-serif">
            <span className="truncate max-w-[380px]">{pdf.title}</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {/* Render Page Text & Simulated Typesetting */}
          {pageData ? (
            <div className="space-y-4 font-serif text-sm leading-relaxed text-slate-800">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                {pageData.title}
              </h2>

              {pageData.contentText.split('\n\n').map((paragraph, pIdx) => {
                // If search query active, highlight occurrences
                if (searchQuery.trim()) {
                  const parts = paragraph.split(new RegExp(`(${searchQuery})`, 'gi'));
                  return (
                    <p key={pIdx} className="text-justify leading-7">
                      {parts.map((part, partIdx) =>
                        part.toLowerCase() === searchQuery.toLowerCase() ? (
                          <mark
                            key={partIdx}
                            className="bg-amber-300 text-slate-900 font-medium px-0.5 rounded"
                          >
                            {part}
                          </mark>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                }

                return (
                  <p key={pIdx} className="text-justify leading-7">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Page {currentPage} Content
            </div>
          )}

          {/* Highlights Overlay */}
          {pageHighlights.map((hl) => {
            const isTargeted = targetHighlightId === hl.id;
            return (
              <div
                key={hl.id}
                id={`highlight-box-${hl.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHighlightTooltip(activeHighlightTooltip?.id === hl.id ? null : hl);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm('Delete this highlight?')) {
                    onDeleteHighlight(hl.id);
                  }
                }}
                style={{
                  left: `${hl.rect.x}%`,
                  top: `${hl.rect.y}%`,
                  width: `${hl.rect.width}%`,
                  height: `${hl.rect.height}%`,
                  backgroundColor: hl.color,
                  opacity: isTargeted ? 0.65 : 0.45,
                }}
                className={`absolute rounded-sm mix-blend-multiply cursor-pointer hover:opacity-75 transition-all ${
                  isTargeted ? 'ring-2 ring-rose-500 animate-pulse' : ''
                }`}
                title="Click to inspect or right-click to delete"
              />
            );
          })}

          {/* Live Drag-Selection Rectangle Preview */}
          {isSelecting && selectionBox && (
            <div
              style={{
                left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
                top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
                width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
                height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
                backgroundColor: highlightColor,
                opacity: 0.4,
              }}
              className="absolute border border-dashed border-slate-900 pointer-events-none rounded-sm"
            />
          )}

          {/* Active Highlight Popup Tooltip */}
          {activeHighlightTooltip && (
            <div
              style={{
                left: `${activeHighlightTooltip.rect.x}%`,
                top: `${Math.max(0, activeHighlightTooltip.rect.y - 12)}%`,
              }}
              className="absolute z-40 bg-slate-900 text-slate-100 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-xs w-64 max-w-xs animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
                <div className="flex items-center gap-1 font-semibold text-amber-400">
                  <Bookmark className="w-3 h-3" />
                  <span>Highlight (p. {activeHighlightTooltip.pageNumber})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHighlightTooltip(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 italic mb-2 line-clamp-3">
                "{activeHighlightTooltip.capturedText}"
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                {activeHighlightTooltip.noteId && onOpenLinkedNote ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLinkedNote(activeHighlightTooltip.noteId!);
                      setActiveHighlightTooltip(null);
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    <Link className="w-2.5 h-2.5" />
                    <span>Open Linked Note</span>
                  </button>
                ) : (
                  <span className="text-slate-500">Unlinked</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteHighlight(activeHighlightTooltip.id);
                    setActiveHighlightTooltip(null);
                  }}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer watermark */}
          <div className="absolute bottom-4 left-10 right-10 flex justify-between text-[9px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
            <span>Cognito IDE Workstation Reader</span>
            <span>Ref: {pdf.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
