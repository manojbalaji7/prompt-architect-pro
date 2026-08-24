import React, { useState } from 'react';
import { ExecutionResult, ModelSettings, GeminiModelId } from '../types';
import { getModelById } from '../lib/models';
import { ModelDropdown } from './ModelDropdown';
import { 
  PlayCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  Cpu, 
  FileText, 
  RotateCcw,
  Sliders,
  ShieldCheck,
  BrainCircuit,
  Thermometer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExecutionSandboxProps {
  initialPrompt?: string;
  onExecute: (prompt: string, sampleInputs: string, model?: GeminiModelId, temperature?: number, thinkingBudget?: number) => Promise<ExecutionResult | null>;
  isLoading: boolean;
  executionResult: ExecutionResult | null;
  modelSettings: ModelSettings;
  onUpdateModelSettings: (settings: ModelSettings) => void;
  onOpenModelSelector: () => void;
  errorMessage?: string | null;
}

export const ExecutionSandbox: React.FC<ExecutionSandboxProps> = ({
  initialPrompt = '',
  onExecute,
  isLoading,
  executionResult,
  modelSettings,
  onUpdateModelSettings,
  onOpenModelSelector,
  errorMessage,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [sampleInputs, setSampleInputs] = useState('');
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [outputView, setOutputView] = useState<'preview' | 'raw'>('preview');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentModel = getModelById(modelSettings.selectedModel);

  // If initialPrompt changes, update state
  React.useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Live timer for execution feedback
  React.useEffect(() => {
    let interval: any = null;
    if (isLoading) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const res = await onExecute(
      prompt.trim(),
      sampleInputs.trim(),
      modelSettings.selectedModel,
      modelSettings.temperature,
      modelSettings.thinkingBudget
    );
    if (res) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleCopy = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(executionResult.output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Input Grid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Gemini Execution & Verification Sandbox</h2>
              <p className="text-xs text-slate-400">
                Test run your engineered prompt against Google Gemini models to observe live compliance and response fidelity.
              </p>
            </div>
          </div>
        </div>

        {/* Model parameters indicator */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Model: <strong className="text-indigo-300">{currentModel.name}</strong> ({currentModel.badge})</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>Temp: <strong className="text-slate-200">{modelSettings.temperature.toFixed(2)}</strong></span>
            </span>

            {currentModel.supportsThinking && (
              <span className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-indigo-400" />
                <span>Thinking Budget: <strong className="text-slate-200">{modelSettings.thinkingBudget || 0} tokens</strong></span>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenModelSelector}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Configure Parameters
            </button>
          </div>
        </div>

        {/* Inline Error Banner if present */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-rose-100">Execution Error:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRun} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Prompt To Test */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Prompt / System Blueprint</span>
                </label>
                <span className="text-[11px] text-slate-500">{prompt.length} chars</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste or import the prompt to test in Gemini..."
                rows={10}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 leading-relaxed"
              />
            </div>

            {/* Sample Inputs / Test Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supplied Execution Data / Sample Input</span>
                </label>
                <span className="text-[11px] text-slate-500">Optional</span>
              </div>
              <textarea
                value={sampleInputs}
                onChange={(e) => setSampleInputs(e.target.value)}
                placeholder="Paste mock documents, meeting notes, customer ticket logs, code snippets, or user query for this test run..."
                rows={10}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              Direct execution via server-side Google GenAI SDK with automated criteria verification.
            </p>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Executing in {currentModel.name}... ({elapsedSeconds}s)</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Run Execution Test ({currentModel.name})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Execution Results View */}
      {executionResult && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl space-y-0 animate-fadeIn">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-slate-100">Model Response Output</h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{executionResult.durationMs}ms</span>
                </span>
                <span>•</span>
                <span className="text-indigo-300 font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40">
                  {executionResult.model}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setOutputView('preview')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    outputView === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setOutputView('raw')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    outputView === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Raw Text
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                {copiedOutput ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Output</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Compliance & Anti-Hallucination Verification Bar */}
          {executionResult.verifications && executionResult.verifications.length > 0 && (
            <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Quality & Anti-Hallucination Compliance Checks:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {executionResult.verifications.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-xs"
                  >
                    {v.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">{v.criterion}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{v.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Content */}
          <div className="p-5 sm:p-6 max-h-[600px] overflow-y-auto bg-slate-950/20">
            {outputView === 'raw' ? (
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {executionResult.output}
              </pre>
            ) : (
              <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans space-y-3">
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200">
                  {executionResult.output}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

