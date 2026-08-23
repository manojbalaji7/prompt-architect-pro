import React, { useState, useRef, useEffect } from 'react';
import { GeminiModelId, ModelSettings } from '../types';
import { GEMINI_MODELS, getModelById } from '../lib/models';
import { Cpu, ChevronDown, Check, Sliders, BrainCircuit, Sparkles } from 'lucide-react';

interface ModelDropdownProps {
  modelSettings: ModelSettings;
  onUpdateModelSettings: (settings: ModelSettings) => void;
  onOpenModelSelector?: () => void;
  compact?: boolean;
  className?: string;
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
  modelSettings,
  onUpdateModelSettings,
  onOpenModelSelector,
  compact = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = getModelById(modelSettings.selectedModel);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (modelId: GeminiModelId) => {
    onUpdateModelSettings({
      ...modelSettings,
      selectedModel: modelId,
    });
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 text-slate-200 transition shadow-sm cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        } ${isOpen ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-100">{selectedModel.name}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
            {selectedModel.badge}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-fadeIn">
          {/* Menu Header */}
          <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Select Gemini Model
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Temp: {modelSettings.temperature.toFixed(2)}
            </span>
          </div>

          {/* Model Options List */}
          <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
            {GEMINI_MODELS.map((model) => {
              const isSelected = model.id === modelSettings.selectedModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelect(model.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/60 border border-indigo-500/40 text-slate-100'
                      : 'hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{model.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {model.tagline}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <span>Ctx: {model.contextWindow}</span>
                      {model.supportsThinking && (
                        <span className="text-indigo-400 flex items-center gap-0.5">
                          <BrainCircuit className="w-2.5 h-2.5" />
                          <span>Thinking</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with Tuning / Parameters Shortcut */}
          {onOpenModelSelector && (
            <div className="p-2 border-t border-slate-800 bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenModelSelector();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/60"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Adjust Temperature & Thinking Tokens...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
