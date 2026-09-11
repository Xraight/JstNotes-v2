import React from 'react';
import {
  Files,
  BookOpen,
  Calendar,
  Search,
  GraduationCap,
  Network,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Palette,
} from 'lucide-react';
import { ActiveView, SidebarTab } from '../../types';

interface ActivityBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  dueReviewsCount: number;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  setActiveView,
  sidebarTab,
  setSidebarTab,
  sidebarOpen,
  setSidebarOpen,
  onOpenSettings,
  dueReviewsCount,
}) => {
  const handleTabClick = (tab: SidebarTab) => {
    setActiveView('workspace');
    if (sidebarTab === tab && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  return (
    <div className="w-12 h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between items-center py-3 select-none z-20 flex-shrink-0">
      {/* Top Main Navigation */}
      <div className="flex flex-col items-center gap-2">
        {/* Explorer / Notes Tree */}
        <button
          type="button"
          id="activity-explorer"
          onClick={() => handleTabClick('explorer')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'workspace' && sidebarTab === 'explorer' && sidebarOpen
              ? 'text-amber-400 bg-slate-900 border-l-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Explorer: Notes Tree"
        >
          <Files className="w-5 h-5" />
          <span className="sr-only">Notes Tree</span>
        </button>

        {/* PDF Library */}
        <button
          type="button"
          id="activity-pdf-library"
          onClick={() => handleTabClick('pdf-library')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'workspace' && sidebarTab === 'pdf-library' && sidebarOpen
              ? 'text-rose-400 bg-slate-900 border-l-2 border-rose-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="PDF Library & Highlights"
        >
          <BookOpen className="w-5 h-5" />
          <span className="sr-only">PDF Library</span>
        </button>

        {/* Calendar */}
        <button
          type="button"
          id="activity-calendar"
          onClick={() => handleTabClick('calendar')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'workspace' && sidebarTab === 'calendar' && sidebarOpen
              ? 'text-emerald-400 bg-slate-900 border-l-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Calendar & Exam Priority"
        >
          <Calendar className="w-5 h-5" />
          <span className="sr-only">Calendar</span>
        </button>

        {/* Note Search */}
        <button
          type="button"
          id="activity-search"
          onClick={() => handleTabClick('search')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'workspace' && sidebarTab === 'search' && sidebarOpen
              ? 'text-cyan-400 bg-slate-900 border-l-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Substring Search across Notes"
        >
          <Search className="w-5 h-5" />
          <span className="sr-only">Search Notes</span>
        </button>

        <div className="w-6 h-px bg-slate-800 my-1" />

        {/* Fullscreen Study Home Dashboard */}
        <button
          type="button"
          id="activity-study-home"
          onClick={() => setActiveView('study-home')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'study-home'
              ? 'text-amber-400 bg-amber-500/15 border-l-2 border-amber-400'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
          title="Study Home Dashboard (SM-2, Active Recall, Feynman)"
        >
          <GraduationCap className="w-5 h-5" />
          {dueReviewsCount > 0 && (
            <span className="absolute top-1 right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center">
              {dueReviewsCount}
            </span>
          )}
          <span className="sr-only">Study Home</span>
        </button>

        {/* Interactive Graph View */}
        <button
          type="button"
          id="activity-graph-view"
          onClick={() => setActiveView('graph-view')}
          className={`p-2.5 rounded-lg transition-colors relative group ${
            activeView === 'graph-view'
              ? 'text-violet-400 bg-violet-500/15 border-l-2 border-violet-400'
              : 'text-slate-400 hover:text-violet-300 hover:bg-slate-900'
          }`}
          title="Force-Directed Knowledge Graph (D3.js)"
        >
          <Network className="w-5 h-5" />
          <span className="sr-only">Graph View</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2">
        {/* Toggle Sidebar */}
        <button
          type="button"
          id="activity-toggle-sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 cursor-pointer"
          title={sidebarOpen ? 'Collapse Primary Sidebar' : 'Expand Primary Sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Quick Themes & Customization */}
        <button
          type="button"
          id="activity-themes"
          onClick={onOpenSettings}
          className="p-2.5 rounded-lg text-amber-400/80 hover:text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer"
          title="Themes & Customization"
        >
          <Palette className="w-5 h-5" />
          <span className="sr-only">Themes &amp; Customization</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          id="activity-settings"
          onClick={onOpenSettings}
          className="p-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
          title="Settings &amp; Workspace Configuration"
        >
          <Settings className="w-5 h-5" />
          <span className="sr-only">Settings</span>
        </button>
      </div>
    </div>
  );
};
