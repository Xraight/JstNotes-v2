import React, { useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Download,
  Upload,
  Palette,
  Keyboard,
  CheckCircle2,
  Type,
  Code,
  Globe,
  Sliders,
  RotateCcw,
  Check,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Cpu,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Trash2,
} from 'lucide-react';
import {
  Note,
  PDFDocument,
  PDFHighlight,
  Flashcard,
  DeepQuestion,
  ConcreteExample,
  CalendarEvent,
  AppSettings,
  ThemePreset,
  AIProvider,
  getFontFamilyCss,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
  notes: Note[];
  pdfs: PDFDocument[];
  highlights?: PDFHighlight[];
  flashcards: Flashcard[];
  deepQuestions?: DeepQuestion[];
  concreteExamples?: ConcreteExample[];
  calendarEvents?: CalendarEvent[];
  onImportData: (importedData: any) => void;
  onLoadSampleData?: () => void;
  onClearAllData?: () => void;
}

interface ThemeOption {
  id: ThemePreset;
  name: string;
  description: string;
  type: 'dark' | 'light';
  bgHex: string;
  panelHex: string;
  accentHex: string;
  textColorHex: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Slate',
    description: 'Original high-contrast deep navy blue workspace',
    type: 'dark',
    bgHex: '#020617',
    panelHex: '#0f172a',
    accentHex: '#f59e0b',
    textColorHex: '#f8fafc',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Iconic vampire palette with pink and lavender accents',
    type: 'dark',
    bgHex: '#1e1f29',
    panelHex: '#282a36',
    accentHex: '#ff79c6',
    textColorHex: '#f8f8f2',
  },
  {
    id: 'nord',
    name: 'Nord Frost',
    description: 'Arctic night with calming polar blues and icy frost accents',
    type: 'dark',
    bgHex: '#242933',
    panelHex: '#2e3440',
    accentHex: '#88c0d0',
    textColorHex: '#eceff4',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    description: 'Warm soothing pastel palette with peach and mauve',
    type: 'dark',
    bgHex: '#181825',
    panelHex: '#1e1e2e',
    accentHex: '#fab387',
    textColorHex: '#cdd6f4',
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    description: 'Rich dark olive with vibrant lime green & yellow markers',
    type: 'dark',
    bgHex: '#1e1f1c',
    panelHex: '#272822',
    accentHex: '#a6e22e',
    textColorHex: '#f8f8f2',
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    description: 'Daylight ivory cream reading canvas with gentle contrast',
    type: 'light',
    bgHex: '#fdf6e3',
    panelHex: '#eee8d5',
    accentHex: '#b58900',
    textColorHex: '#073642',
  },
  {
    id: 'nord-light',
    name: 'Nord Snow (Clean Light)',
    description: 'Crisp arctic daylight palette with frosty blue accents and pure paper contrast',
    type: 'light',
    bgHex: '#f8fafc',
    panelHex: '#ffffff',
    accentHex: '#0284c7',
    textColorHex: '#0f172a',
  },
];

const FONT_OPTIONS = [
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Code)', fontCategory: 'monospace' },
  { id: 'Inter', label: 'Inter (Clean Sans)', fontCategory: 'sans-serif' },
  { id: 'Fira Code', label: 'Fira Code (Ligatures)', fontCategory: 'monospace' },
  { id: 'Source Code Pro', label: 'Source Code Pro (Adobe)', fontCategory: 'monospace' },
  { id: 'Merriweather', label: 'Merriweather (Book Serif)', fontCategory: 'serif' },
];

const HIGHLIGHT_COLORS = [
  { hex: '#facc15', label: 'Amber Yellow' },
  { hex: '#10b981', label: 'Emerald Green' },
  { hex: '#38bdf8', label: 'Cyan Blue' },
  { hex: '#f43f5e', label: 'Rose Pink' },
  { hex: '#a855f7', label: 'Purple Violet' },
  { hex: '#fb923c', label: 'Warm Orange' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  notes,
  pdfs,
  highlights,
  flashcards,
  deepQuestions,
  concreteExamples,
  calendarEvents,
  onImportData,
  onLoadSampleData,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'editor' | 'ai' | 'css' | 'shortcuts' | 'backup'>('themes');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getCurrentApiKey = (): string => {
    if (settings.aiProvider === 'gemini') return settings.geminiApiKey || '';
    if (settings.aiProvider === 'groq') return settings.groqApiKey || '';
    if (settings.aiProvider === 'openai') return settings.openaiApiKey || '';
    if (settings.aiProvider === 'opencode') return settings.opencodeApiKey || '';
    return '';
  };

  const handleUpdateApiKey = (value: string) => {
    setTestResult(null);
    if (settings.aiProvider === 'gemini') {
      onUpdateSettings({ ...settings, geminiApiKey: value });
    } else if (settings.aiProvider === 'groq') {
      onUpdateSettings({ ...settings, groqApiKey: value });
    } else if (settings.aiProvider === 'openai') {
      onUpdateSettings({ ...settings, openaiApiKey: value });
    } else if (settings.aiProvider === 'opencode') {
      onUpdateSettings({ ...settings, opencodeApiKey: value });
    }
  };

  const handleTestAiConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const keyToTest = getCurrentApiKey();
    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.aiProvider,
          apiKey: keyToTest || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.models?.length || 0;
        setTestResult({
          success: true,
          message: `Connected successfully! Detected ${count} available models for ${settings.aiProvider.toUpperCase()}.`,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: err.error || 'Failed to authenticate with provider. Please verify your API key.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Network error verifying API key.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  const handleExportData = () => {
    const data = {
      notes,
      pdfs,
      highlights: highlights || [],
      flashcards,
      deepQuestions: deepQuestions || [],
      concreteExamples: concreteExamples || [],
      calendarEvents: calendarEvents || [],
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognito-ide-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.notes && Array.isArray(json.notes)) {
          onImportData(json);
          setImportStatus('Workspace restored successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid backup file format.');
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm md:text-base">Workspace Customization</h3>
              <p className="text-[11px] text-slate-400">Personalize themes, editor typography, AI parameters, and shortcuts</p>
            </div>
          </div>
          <button
            type="button"
            id="settings-close-x-btn"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-1 overflow-x-auto bg-slate-950/40 text-xs flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'themes'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Editor &amp; Font</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI &amp; Models</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'css'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Custom CSS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup &amp; Reset</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* TAB 1: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Color Themes</h4>
                <p className="text-[11px] text-slate-400">
                  Select a tailored dark or daylight color palette. Switches apply instantly across the entire IDE.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = settings.theme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => onUpdateSettings({ ...settings, theme: theme.id })}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-400 bg-slate-800/80 shadow-lg ring-1 ring-amber-400/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-xs">{theme.name}</span>
                            <span
                              className={`text-[9px] uppercase px-1 py-0.5 rounded font-mono ${
                                theme.type === 'light'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {theme.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {theme.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Color Palette Preview Swatch Bar */}
                      <div className="h-6 rounded-lg overflow-hidden border border-slate-800 flex shadow-inner">
                        <div
                          style={{ backgroundColor: theme.bgHex }}
                          className="flex-1 flex items-center justify-center text-[9px] font-mono text-slate-400"
                          title="Background Canvas"
                        >
                          BG
                        </div>
                        <div
                          style={{ backgroundColor: theme.panelHex }}
                          className="flex-1 flex items-center justify-center text-[9px] font-mono text-slate-400"
                          title="Panels"
                        >
                          UI
                        </div>
                        <div
                          style={{ backgroundColor: theme.accentHex }}
                          className="w-12 flex items-center justify-center text-[9px] font-mono font-bold text-slate-950"
                          title="Accent"
                        >
                          ACC
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EDITOR & FONT */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Font Family */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-200 block text-xs">Editor Typography</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id })}
                      className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                        settings.fontFamily === f.id
                          ? 'border-amber-400 bg-slate-800/80 text-amber-300 font-semibold ring-1 ring-amber-400/40'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-900'
                      }`}
                      style={{ fontFamily: getFontFamilyCss(f.id) }}
                    >
                      <span className="text-xs">{f.label}</span>
                      {settings.fontFamily === f.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 text-xs">Font Size</label>
                  <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs">
                    {settings.fontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-slate-500 font-mono">12px</span>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value, 10) })
                    }
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">22px</span>
                </div>
              </div>

              {/* Toggles: Line Numbers & Live Preview */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-200 block text-xs">Behavior &amp; View</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <div>
                      <span className="font-medium text-slate-200 block">Line Numbers</span>
                      <span className="text-[11px] text-slate-400">Display gutter line numbering in Markdown editor</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.lineNumbers}
                      onChange={(e) => onUpdateSettings({ ...settings, lineNumbers: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                    <div>
                      <span className="font-medium text-slate-200 block">Default Split Preview</span>
                      <span className="text-[11px] text-slate-400">Automatically open new notes with live side-by-side Markdown render</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.livePreviewSplit}
                      onChange={(e) => onUpdateSettings({ ...settings, livePreviewSplit: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Default PDF Highlight Color */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-200 block text-xs">Default PDF Annotation Highlight Color</label>
                <div className="flex items-center gap-3">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, defaultHighlightColor: c.hex })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border-2 ${
                        settings.defaultHighlightColor === c.hex
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {settings.defaultHighlightColor === c.hex && (
                        <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & MODELS */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {/* AI Engine Status Banner */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cognitive AI Engine &amp; API Key</span>
                  </span>
                  <span
                    className={`flex items-center gap-1.5 font-mono text-[11px] font-bold ${
                      getCurrentApiKey() ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {getCurrentApiKey() ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        API Key Configured
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        API Key Required
                      </>
                    )}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Provide your own API Key to power SuperMemo-2 flashcards, elaborative interrogation, analogies, and real-time Feynman evaluations.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-200 block text-xs">AI Provider</label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => {
                    const newProvider = e.target.value as AIProvider;
                    setTestResult(null);
                    onUpdateSettings({
                      ...settings,
                      aiProvider: newProvider,
                      aiModel:
                        newProvider === 'gemini'
                          ? 'gemini-3.8-flash'
                          : newProvider === 'groq'
                          ? 'llama-3.3-70b-versatile'
                          : newProvider === 'openai'
                          ? 'gpt-4o-mini'
                          : 'default',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="gemini">Google Gemini (Google AI Studio)</option>
                  <option value="groq">Groq Cloud (Ultra-Fast Llama 3.3)</option>
                  <option value="openai">OpenAI (GPT-4o Mini / GPT-4o)</option>
                  <option value="opencode">OpenCode Local / Custom Endpoint</option>
                </select>
              </div>

              {/* User-Provided API Key Input */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {settings.aiProvider === 'gemini'
                        ? 'Google Gemini API Key'
                        : settings.aiProvider === 'groq'
                        ? 'Groq API Key'
                        : settings.aiProvider === 'openai'
                        ? 'OpenAI API Key'
                        : 'OpenCode API Token'}
                    </span>
                  </label>
                  {settings.aiProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      Get Gemini Key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {settings.aiProvider === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      Get Groq Key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {settings.aiProvider === 'openai' && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      Get OpenAI Key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="user-ai-api-key-input"
                    value={getCurrentApiKey()}
                    onChange={(e) => handleUpdateApiKey(e.target.value)}
                    placeholder={
                      settings.aiProvider === 'gemini'
                        ? 'AIzaSy...'
                        : settings.aiProvider === 'groq'
                        ? 'gsk_...'
                        : settings.aiProvider === 'openai'
                        ? 'sk-...'
                        : 'Enter API token...'
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400 select-text"
                  />
                  <button
                    type="button"
                    id="toggle-api-key-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showApiKey ? 'Hide Key' : 'Show Key'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Your key is securely stored in your local browser storage and only used to authenticate your AI requests.
                </p>
              </div>

              {/* Recommended Models & Custom Model Choice */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 block text-xs">Model Selection</label>
                  <span className="text-[10px] text-slate-400 font-mono">Select preset or enter custom</span>
                </div>

                {/* Quick Presets based on Provider */}
                <div className="flex flex-wrap gap-1.5">
                  {settings.aiProvider === 'gemini' && (
                    <>
                      {[
                        { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Recommended)' },
                        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
                        { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
                        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onUpdateSettings({ ...settings, aiModel: m.id })}
                          className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                            settings.aiModel === m.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </>
                  )}

                  {settings.aiProvider === 'groq' && (
                    <>
                      {[
                        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
                        { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
                        { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onUpdateSettings({ ...settings, aiModel: m.id })}
                          className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                            settings.aiModel === m.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </>
                  )}

                  {settings.aiProvider === 'openai' && (
                    <>
                      {[
                        { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                        { id: 'gpt-4o', label: 'GPT-4o' },
                        { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onUpdateSettings({ ...settings, aiModel: m.id })}
                          className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                            settings.aiModel === m.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Custom Model Input */}
                <input
                  type="text"
                  id="user-ai-model-input"
                  value={settings.aiModel}
                  onChange={(e) => onUpdateSettings({ ...settings, aiModel: e.target.value })}
                  placeholder="Custom model ID (e.g. gemini-3.8-flash)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>

              {/* Test Connection Button */}
              <div className="pt-1">
                <button
                  type="button"
                  id="test-ai-connection-btn"
                  disabled={testingConnection}
                  onClick={handleTestAiConnection}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                  <span>{testingConnection ? 'Testing Connection...' : 'Test Connection & Models'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-lg text-[11px] border flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Language Preference */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-200 block text-xs">AI Study Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="auto">Auto-detect from Note Language</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM CSS */}
          {activeTab === 'css' && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">User Stylesheet Injection</h4>
                <p className="text-[11px] text-slate-400">
                  Write custom CSS rules to customize preview elements, badges, or LaTeX formulas. Injected directly into the DOM in real-time.
                </p>
              </div>

              <textarea
                value={settings.customCss}
                onChange={(e) => onUpdateSettings({ ...settings, customCss: e.target.value })}
                rows={10}
                placeholder="/* Add custom CSS rules here */&#10;.ide-badge-pdf { font-weight: bold; }"
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono text-xs leading-relaxed outline-none focus:border-amber-400 resize-y"
              />
            </div>
          )}

          {/* TAB 5: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">IDE Productivity Shortcuts</h4>
                <p className="text-[11px] text-slate-400">
                  Speed up note taking, LaTeX equation formatting, and spaced repetition review cycles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>Note Mention Autocomplete</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">@</kbd>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>LaTeX Math Block</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">$$...$$</kbd>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>Flip Flashcard</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">Spacebar</kbd>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>Rate Again / Hard / Good</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">1 / 2 / 3</kbd>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>Rate Easy / Mastered</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">4 / 5</kbd>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span>PDF Ctrl + Zoom</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-300 font-bold">Ctrl + Scroll</kbd>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & RESET */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Export */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Full JSON Workspace</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Downloads notes, LaTeX math equations, PDF annotations, and SM-2 retention curves as a portable backup file.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Restore Workspace from File</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Select a previously exported Cognito IDE JSON file to restore your full knowledge base.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose JSON Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                {importStatus && (
                  <div className="text-xs font-mono text-emerald-400 mt-2">{importStatus}</div>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <span className="font-semibold text-rose-300 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset Customizations</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Revert all themes, typography, font sizes, and layout options to initial factory defaults without deleting your notes.
                </p>
                <button
                  type="button"
                  onClick={onResetSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Settings to Defaults
                </button>
              </div>

              {/* Load Sample Knowledge Base */}
              {onLoadSampleData && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <span className="font-semibold text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Load Sample Knowledge Base (Demo Library)</span>
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Populate your workspace with a complete academic demonstration library containing cognitive neuroscience notes, quantum computing models, simulated PDFs, and SM-2 flashcard decks.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Load demo knowledge base? This will populate sample notes, PDFs, and flashcard decks into your workspace.')) {
                        onLoadSampleData();
                        setImportStatus('Sample knowledge base loaded successfully!');
                        setTimeout(() => setImportStatus(null), 3000);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Load Demo Library
                  </button>
                </div>
              )}

              {/* Clear All Data */}
              {onClearAllData && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                  <span className="font-semibold text-rose-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Clear Workspace (Fresh Start)</span>
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Permanently delete all custom notes, PDFs, and flashcards, returning to a pristine clean workspace with only the Quickstart guide.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('WARNING: Are you sure you want to clear all notes and PDFs? This cannot be undone unless you have a backup.')) {
                        onClearAllData();
                        setImportStatus('Workspace reset to clean slate.');
                        setTimeout(() => setImportStatus(null), 3000);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear All Workspace Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Theme: <span className="text-amber-400 font-semibold">{settings.theme}</span> | Font:{' '}
            <span className="text-slate-300">{settings.fontFamily} ({settings.fontSize}px)</span>
          </div>
          <button
            type="button"
            id="settings-done-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/10"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
