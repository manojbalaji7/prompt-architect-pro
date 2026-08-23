import React from 'react';
import { OperatingMode, ModelSettings } from '../types';
import { ModelDropdown } from './ModelDropdown';
import { Sparkles, Compass, ShieldCheck, PlayCircle, History, Layers } from 'lucide-react';

interface HeaderProps {
  currentMode: OperatingMode;
  onModeChange: (mode: OperatingMode) => void;
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
  onOpenModelSelector: () => void;
  modelSettings: ModelSettings;
  onUpdateModelSettings: (settings: ModelSettings) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenTemplates,
  onOpenHistory,
  onOpenModelSelector,
  modelSettings,
  onUpdateModelSettings,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">Prompt Architect Pro</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Gemini Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Precision Prompt Engineering & Readiness Engine</p>
            </div>
          </div>

          {/* Action buttons on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <ModelDropdown
              modelSettings={modelSettings}
              onUpdateModelSettings={onUpdateModelSettings}
              onOpenModelSelector={onOpenModelSelector}
              compact
            />
            <button
              onClick={onOpenTemplates}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Templates"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative"
              title="History"
            >
              <History className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Operating Modes Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner w-full md:w-auto justify-center">
          <button
            onClick={() => onModeChange('architecture')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'architecture'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Architecture Mode</span>
          </button>

          <button
            onClick={() => onModeChange('review')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'review'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/30 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prompt Review Mode</span>
          </button>

          <button
            onClick={() => onModeChange('execution')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentMode === 'execution'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Execution Sandbox</span>
          </button>
        </div>

        {/* Model Selector & Action Controls on Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Model Selector Dropdown */}
          <ModelDropdown
            modelSettings={modelSettings}
            onUpdateModelSettings={onUpdateModelSettings}
            onOpenModelSelector={onOpenModelSelector}
          />

          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition relative"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

