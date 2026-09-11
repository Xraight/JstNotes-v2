import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Note, PDFDocument } from '../../types';

interface ConceptMiniMapProps {
  activeNote: Note | null;
  notes: Note[];
  pdfs: PDFDocument[];
  onSelectNote: (noteId: string) => void;
}

interface MiniNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'active' | 'parent' | 'mention' | 'pdf';
  x?: number;
  y?: number;
}

interface MiniLink extends d3.SimulationLinkDatum<MiniNode> {
  type: 'parent' | 'mention' | 'pdf';
}

export const ConceptMiniMap: React.FC<ConceptMiniMapProps> = ({
  activeNote,
  notes,
  pdfs,
  onSelectNote,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !activeNote) return;

    const width = svgRef.current.clientWidth || 260;
    const height = 190;

    // Collect related nodes:
    // 1. Center node: active note
    // 2. Parent note (if any)
    // 3. Mentioned notes in content (@Mention)
    // 4. Mentioning notes (backlinks)
    // 5. Linked PDFs

    const nodesMap = new Map<string, MiniNode>();
    const links: MiniLink[] = [];

    // Active node
    nodesMap.set(activeNote.id, {
      id: activeNote.id,
      title: activeNote.title,
      type: 'active',
    });

    // Parent
    if (activeNote.parentId) {
      const parent = notes.find((n) => n.id === activeNote.parentId);
      if (parent) {
        nodesMap.set(parent.id, { id: parent.id, title: parent.title, type: 'parent' });
        links.push({ source: activeNote.id, target: parent.id, type: 'parent' });
      }
    }

    // Mentions inside active note
    notes.forEach((other) => {
      if (other.id === activeNote.id) return;
      if (activeNote.content.includes(`@${other.title}`) || activeNote.content.includes(other.title)) {
        nodesMap.set(other.id, { id: other.id, title: other.title, type: 'mention' });
        links.push({ source: activeNote.id, target: other.id, type: 'mention' });
      } else if (other.content.includes(`@${activeNote.title}`)) {
        // Backlink
        nodesMap.set(other.id, { id: other.id, title: other.title, type: 'mention' });
        links.push({ source: other.id, target: activeNote.id, type: 'mention' });
      }
    });

    // Linked PDFs
    pdfs.forEach((pdf) => {
      if (pdf.linkedNoteIds.includes(activeNote.id) || activeNote.content.includes(pdf.title)) {
        const pId = `pdf-${pdf.id}`;
        nodesMap.set(pId, { id: pId, title: pdf.title, type: 'pdf' });
        links.push({ source: activeNote.id, target: pId, type: 'pdf' });
      }
    });

    const nodes = Array.from(nodesMap.values());

    // D3 simulation
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const simulation = d3
      .forceSimulation<MiniNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<MiniNode, MiniLink>(links)
          .id((d) => d.id)
          .distance(50)
      )
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(20));

    // Links: gray (parent), yellow (mention), red (pdf)
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.type === 'mention') return '#eab308'; // yellow
        if (d.type === 'pdf') return '#ef4444'; // red
        return '#64748b'; // gray
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-dasharray', (d) => (d.type === 'mention' ? '3,2' : 'none'));

    // Nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => {
        if (d.type !== 'pdf') {
          onSelectNote(d.id);
        }
      });

    node
      .append('circle')
      .attr('r', (d) => (d.type === 'active' ? 9 : 6))
      .attr('fill', (d) => {
        if (d.type === 'active') return '#f59e0b';
        if (d.type === 'mention') return '#eab308';
        if (d.type === 'pdf') return '#ef4444';
        return '#94a3b8';
      })
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);

    node
      .append('text')
      .text((d) => (d.title.length > 14 ? d.title.slice(0, 12) + '…' : d.title))
      .attr('x', 9)
      .attr('y', 3)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '9px')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none');

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
  }, [activeNote, notes, pdfs, onSelectNote]);

  return (
    <div className="w-full h-[190px] bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-1.5 left-2 flex items-center gap-2 text-[9px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> Parent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> @-Mention
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> PDF
        </span>
      </div>
    </div>
  );
};
