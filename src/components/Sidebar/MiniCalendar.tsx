import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarEvent, Note } from '../../types';

interface MiniCalendarProps {
  events: CalendarEvent[];
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  activeNote: Note | null;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  events,
  notes,
  onSelectNote,
  onAddEvent,
  onDeleteEvent,
  activeNote,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)
  const [showAddForm, setShowAddForm] = useState(false);

  // New event form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-12');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<'exam' | 'assignment' | 'review' | 'lecture'>('exam');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNote?.id || '');

  // Days in month calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: CalendarEvent = {
      id: 'event-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      date,
      time,
      type,
      priority,
      linkedNoteIds: selectedNoteId ? [selectedNoteId] : [],
      completed: false,
    };

    onAddEvent(newEvent);
    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="h-full flex flex-col select-none text-xs text-slate-300">
      {/* Header */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
          Calendar &amp; Exams
        </span>
        <button
          type="button"
          id="add-calendar-event-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Event</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Month Navigator */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-200 text-xs">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] text-slate-500 mb-1 font-mono">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px]">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter((e) => e.date === dateStr);
              const hasExam = dayEvents.some((e) => e.type === 'exam');
              const isToday = dateStr === '2026-09-10';

              return (
                <div
                  key={day}
                  className={`h-6 flex flex-col items-center justify-center rounded text-[11px] relative cursor-pointer ${
                    isToday
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : dayEvents.length > 0
                      ? 'bg-slate-800 text-slate-100 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60'
                  }`}
                  title={dayEvents.map((e) => `${e.type.toUpperCase()}: ${e.title}`).join('\n')}
                >
                  <span>{day}</span>
                  {dayEvents.length > 0 && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                        hasExam ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Event Form Modal / Accordion */}
        {showAddForm && (
          <form
            onSubmit={handleSubmitNewEvent}
            className="p-3 bg-slate-900 border border-slate-700 rounded-lg space-y-2.5 animate-in fade-in"
          >
            <div className="font-semibold text-slate-200 text-xs">New Linked Event</div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Title / Exam Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Examen Parcial..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                >
                  <option value="exam">Exam (Highest Priority)</option>
                  <option value="assignment">Assignment</option>
                  <option value="review">Review</option>
                  <option value="lecture">Lecture</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Link to Note</label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
              >
                <option value="">-- Select Note --</option>
                {notes
                  .filter((n) => n.type !== 'folder')
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs"
              >
                Save Event
              </button>
            </div>
          </form>
        )}

        {/* Upcoming Events List */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-2">
            Upcoming Events ({events.length})
          </span>
          <div className="space-y-2">
            {events
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evt) => {
                const linkedNote = notes.find((n) => evt.linkedNoteIds.includes(n.id));

                return (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5 group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          evt.type === 'exam'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {evt.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evt.date}
                        </span>
                        <button
                          type="button"
                          title="Delete Event"
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-0.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-slate-200 text-xs leading-snug">
                      {evt.title}
                    </h4>

                    {linkedNote && (
                      <button
                        type="button"
                        onClick={() => onSelectNote(linkedNote.id)}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline pt-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="truncate">{linkedNote.title}</span>
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
