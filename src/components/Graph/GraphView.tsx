import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  ArrowLeft,
  BookOpen,
  FileText,
  Folder,
} from 'lucide-react';
import { Note, PDFDocument } from '../../types';

interface GraphViewProps {
  notes: Note[];
  pdfs: PDFDocument[];
  onSelectNote: (noteId: string) => void;
  onBack: () => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'folder' | 'note' | 'pdf_note' | 'pdf';
  category: string;
  degree: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: 'parent' | 'mention' | 'pdf';
}

export const GraphView: React.FC<GraphViewProps> = ({
  notes,
  pdfs,
  onSelectNote,
  onBack,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'pdfs'>('all');
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 600;

    // 1. Build Nodes map
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Helper to determine category
    const getCategory = (note: Note): string => {
      if (note.title.toLowerCase().includes('neuro') || note.title.toLowerCase().includes('hebb') || note.title.toLowerCase().includes('action')) {
        return 'Neuroscience';
      }
      if (note.title.toLowerCase().includes('quantum') || note.title.toLowerCase().includes('schro') || note.title.toLowerCase().includes('bloch')) {
        return 'Quantum';
      }
      return 'General';
    };

    // Add Note nodes
    notes.forEach((note) => {
      if (filterType === 'pdfs' && note.type !== 'pdf_note') return;

      nodesMap.set(note.id, {
        id: note.id,
        title: note.title,
        type: note.type,
        category: getCategory(note),
        degree: 0,
      });
    });

    // Add PDF nodes
    if (filterType !== 'notes') {
      pdfs.forEach((pdf) => {
        const pId = `pdf-${pdf.id}`;
        nodesMap.set(pId, {
          id: pId,
          title: pdf.title,
          type: 'pdf',
          category: 'Document',
          degree: 0,
        });
      });
    }

    // Add Links: Parent/Child
    notes.forEach((note) => {
      if (note.parentId && nodesMap.has(note.id) && nodesMap.has(note.parentId)) {
        links.push({
          source: note.id,
          target: note.parentId,
          type: 'parent',
        });
      }
    });

    // Add Links: @-Mentions
    notes.forEach((note) => {
      if (!nodesMap.has(note.id)) return;

      notes.forEach((other) => {
        if (other.id === note.id || !nodesMap.has(other.id)) return;
        if (note.content.includes(`@${other.title}`) || (note.content.includes(other.title) && other.title.length > 5)) {
          links.push({
            source: note.id,
            target: other.id,
            type: 'mention',
          });
        }
      });
    });

    // Add Links: PDFs
    if (filterType !== 'notes') {
      pdfs.forEach((pdf) => {
        const pId = `pdf-${pdf.id}`;
        if (!nodesMap.has(pId)) return;

        pdf.linkedNoteIds.forEach((nId) => {
          if (nodesMap.has(nId)) {
            links.push({
              source: nId,
              target: pId,
              type: 'pdf',
            });
          }
        });
      });
    }

    // Calculate node degree (number of connections)
    links.forEach((l: any) => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      if (nodesMap.has(srcId)) nodesMap.get(srcId)!.degree += 1;
      if (nodesMap.has(tgtId)) nodesMap.get(tgtId)!.degree += 1;
    });

    const nodes = Array.from(nodesMap.values());

    // Setup D3
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // D3 Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => (d.type === 'parent' ? 70 : 100))
      )
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide((d) => Math.max(16, d.degree * 4 + 14)));

    // Render Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.type === 'mention') return '#f59e0b'; // Amber dashed
        if (d.type === 'pdf') return '#f43f5e'; // Rose
        return '#334155'; // Slate-700
      })
      .attr('stroke-width', (d) => (d.type === 'mention' ? 1.8 : 1.2))
      .attr('stroke-dasharray', (d) => (d.type === 'mention' ? '4,3' : 'none'))
      .attr('stroke-opacity', 0.7);

    // Drag behavior for nodes
    const drag = (sim: d3.Simulation<GraphNode, undefined>) => {
      function dragstarted(event: any, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: GraphNode) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };

    // Render Nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('click', (_, d) => {
        setSelectedNodeInfo(d);
        if (d.type !== 'pdf' && d.type !== 'folder') {
          onSelectNote(d.id);
        }
      });

    // Node circles with radius scaling by degree
    node
      .append('circle')
      .attr('r', (d) => Math.max(8, Math.min(22, 9 + d.degree * 2.5)))
      .attr('fill', (d) => {
        if (d.type === 'pdf') return '#f43f5e';
        if (d.type === 'folder') return '#fbbf24';
        if (d.category === 'Neuroscience') return '#38bdf8';
        if (d.category === 'Quantum') return '#a855f7';
        return '#10b981';
      })
      .attr('stroke', '#020617')
      .attr('stroke-width', 2.5)
      .attr('class', 'transition-transform duration-150 hover:scale-125');

    // Node labels
    node
      .append('text')
      .text((d) => d.title)
      .attr('x', (d) => Math.max(8, Math.min(22, 9 + d.degree * 2.5)) + 6)
      .attr('y', 4)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none')
      .attr('stroke', '#020617')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke fill');

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [notes, pdfs, filterType, onSelectNote]);

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="h-12 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Network className="w-4 h-4 text-violet-400" />
            <span>Interactive Knowledge Graph (D3.js)</span>
          </span>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                filterType === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Nodes
            </button>
            <button
              type="button"
              onClick={() => setFilterType('notes')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                filterType === 'notes' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Notes Only
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pdfs')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                filterType === 'pdfs' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PDFs &amp; Annotations
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Legend */}
        <div className="absolute bottom-4 left-6 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 shadow-2xl backdrop-blur-md">
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            Graph Legend
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Neuroscience Note</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Quantum Physics Note</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>General Knowledge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>PDF Document</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-amber-400 border-t border-dashed border-amber-400" />
            <span>@-Mention / Link</span>
          </div>
        </div>

        {/* Selected Node Details Tooltip */}
        {selectedNodeInfo && (
          <div className="absolute top-4 right-6 bg-slate-900 border border-slate-700 rounded-xl p-4 w-64 shadow-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                {selectedNodeInfo.type}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedNodeInfo.degree} Connections
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-100">{selectedNodeInfo.title}</h4>
            <div className="text-xs text-slate-400 font-sans">
              Category: <span className="text-slate-200">{selectedNodeInfo.category}</span>
            </div>
            {selectedNodeInfo.type !== 'pdf' && selectedNodeInfo.type !== 'folder' && (
              <button
                type="button"
                onClick={() => onSelectNote(selectedNodeInfo.id)}
                className="w-full mt-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Open in Editor
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
