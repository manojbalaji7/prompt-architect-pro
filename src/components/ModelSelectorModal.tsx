import React from 'react';
import { GeminiModelId, ModelSettings } from '../types';
import { GEMINI_MODELS, getModelById } from '../lib/models';
import { 
  Cpu, 
  X, 
  Check, 
  Sliders, 
  Zap, 
  Sparkles, 
  BrainCircuit, 
  Gauge, 
  ShieldCheck, 
  Layers,
  Thermometer
} from 'lucide-react';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ModelSettings;
  onUpdateSettings: (settings: ModelSettings) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const currentModel = getModelById(settings.selectedModel);

  const handleSelectModel = (modelId: GeminiModelId) => {
    onUpdateSettings({
      ...settings,
      selectedModel: modelId,
    });
  };

  const handleTemperatureChange = (temp: number) => {
    onUpdateSettings({
      ...settings,
      temperature: temp,
    });
  };

  const handleThinkingBudgetChange = (budget: number) => {
    onUpdateSettings({
      ...settings,
      thinkingBudget: budget,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Select Google Gemini Model & Parameters</h2>
              <p className="text-xs text-slate-400">Choose the foundation model engine for prompt architecture, auditing, and sandbox execution.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Model Cards Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Available Gemini Model Engines</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {GEMINI_MODELS.map((model) => {
                const isSelected = settings.selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950/90'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition">
                            {model.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isSelected
                                ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {model.badge}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        {model.tagline}
                      </p>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {model.description}
                      </p>

                      {/* Strengths tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {model.strengths.slice(0, 3).map((st, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Context: <strong className="text-slate-400">{model.contextWindow}</strong></span>
                      {model.supportsThinking && (
                        <span className="text-indigo-400 flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" />
                          <span>Thinking enabled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Tuning Parameters */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runtime Model Parameters</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Active: <strong className="text-indigo-300">{currentModel.name}</strong>
              </span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Temperature: {settings.temperature.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleTemperatureChange(0.0)}
                    className={`px-2 py-0.5 rounded border transition ${
                      settings.temperature === 0.0 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    0.0 (Deterministic)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemperatureChange(0.2)}
                    className={`px-2 py-0.5 rounded border transition ${
                      settings.temperature === 0.2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    0.2 (Precision)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemperatureChange(0.7)}
                    className={`px-2 py-0.5 rounded border transition ${
                      settings.temperature === 0.7 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    0.7 (Creative)
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.temperature}
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Lower values (0.0 - 0.2) ensure high consistency, strict schema compliance, and reduced variance. Higher values (0.7+) promote creative phrasing and diverse iterations.
              </p>
            </div>

            {/* Thinking Budget (if supported by active model) */}
            {currentModel.supportsThinking && (
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold">Reasoning / Thinking Budget: {settings.thinkingBudget || 0} tokens</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    {settings.thinkingBudget && settings.thinkingBudget > 0 ? 'Active Reasoning' : 'Standard Fast Generation'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[0, 1024, 2048, 4096].map((budget) => (
                    <button
                      key={budget}
                      type="button"
                      onClick={() => handleThinkingBudgetChange(budget)}
                      className={`text-xs px-3 py-1 rounded-lg border transition ${
                        (settings.thinkingBudget || 0) === budget
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {budget === 0 ? '0 (Off - Fastest)' : `${budget} tokens`}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Allocates reasoning tokens for {currentModel.name} to internally deliberate complex architectural constraints, edge cases, and safety checks before generating the final output.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Model changes apply immediately to Architecture, Auditing, and Sandbox execution.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
