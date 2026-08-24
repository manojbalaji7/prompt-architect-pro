import React, { useState, useEffect } from 'react';
import { ReviewResult, ModelSettings, GeminiModelId } from '../types';
import { getModelById } from '../lib/models';
import { ReadinessMeter } from './ReadinessMeter';
import { ModelDropdown } from './ModelDropdown';
import { StructuredPromptViewer } from './StructuredPromptViewer';
import { ClarificationCard } from './ClarificationCard';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw, 
  SplitSquareVertical,
  Maximize2,
  FileCheck2,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewWorkspaceProps {
  initialInput?: string;
  onReview: (existingPrompt: string, force?: boolean) => Promise<void>;
  reviewResult: ReviewResult | null;
  isLoading: boolean;
  onSendToSandbox: (prompt: string) => void;
  modelSettings: ModelSettings;
  onOpenModelSelector: () => void;
  onUpdateModelSettings: (settings: ModelSettings) => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  initialInput,
  onReview,
  reviewResult,
  isLoading,
  onSendToSandbox,
  modelSettings,
  onOpenModelSelector,
  onUpdateModelSettings,
}) => {
  const [existingPrompt, setExistingPrompt] = useState(initialInput || '');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRevised, setCopiedRevised] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'diff'>('structured');

  useEffect(() => {
    if (typeof initialInput === 'string') {
      setExistingPrompt(initialInput);
    }
  }, [initialInput]);

  const currentModel = getModelById(modelSettings.selectedModel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingPrompt.trim()) return;
    await onReview(existingPrompt.trim());
  };

  const handleAnswerClarifications = async (answers: string) => {
    const enrichedPrompt = `${existingPrompt}\n\n[USER CLARIFICATIONS & ADDITIONAL DETAILS]:\n${answers}`;
    setExistingPrompt(enrichedPrompt);
    await onReview(enrichedPrompt);
  };

  const handleForceGenerate = async () => {
    if (!existingPrompt.trim()) return;
    await onReview(existingPrompt.trim(), true);
  };

  const handleCopyRevised = () => {
    if (!reviewResult) return;
    navigator.clipboard.writeText(reviewResult.revisedPrompt);
    setCopiedRevised(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedRevised(false), 2000);
  };

  const samplePrompts = [
    {
      title: 'Vague Customer Support Bot',
      prompt: 'You are a customer support agent. Help users solve issues with our SaaS app. Be friendly and answer their questions.',
    },
    {
      title: 'Unbounded Market Analyzer',
      prompt: 'Write a comprehensive research report on AI chips in 2026. Give me market share, revenue numbers of Nvidia and AMD, and future projections.',
    },
    {
      title: 'Loose Code Generator',
      prompt: 'Create a Python script to authenticate users with JWT and save passwords to a database. Make sure it is fast.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Prompt Review & Diagnostic Mode</h2>
              <p className="text-xs text-slate-400">
                Audit existing prompts against 12 architectural standards for clarity, hallucination risk, safety, and Gemini suitability.
              </p>
            </div>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500">Audit sample:</span>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setExistingPrompt(s.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
            >
              {s.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={existingPrompt}
              onChange={(e) => setExistingPrompt(e.target.value)}
              placeholder="Paste your existing prompt here to audit its strengths, weaknesses, vulnerabilities, and generate a revised production-grade version..."
              rows={5}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition leading-relaxed"
            />
            {existingPrompt && (
              <button
                type="button"
                onClick={() => setExistingPrompt('')}
                className="absolute top-3 right-3 text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              Evaluates 12 axes: clarity, hallucination vulnerability, boundary scope, data grounding, and structure.
            </span>

            <button
              type="submit"
              disabled={isLoading || !existingPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Auditing Prompt...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit & Revise Prompt</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Review Results Section */}
      {reviewResult && (
        <div className="space-y-5 animate-fadeIn">
          {/* Readiness Score Breakdown */}
          <ReadinessMeter score={reviewResult.readinessScore} breakdown={reviewResult.breakdown} />

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Key Strengths Identified</h3>
              </div>
              <ul className="space-y-1.5 pl-1">
                {reviewResult.strengths.map((s, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Vulnerabilities & Missing Safeguards</h3>
              </div>
              <ul className="space-y-1.5 pl-1">
                {reviewResult.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">⚠</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Explanation of Architectural Changes */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural Amendments & Improvements Summary</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {reviewResult.explanationOfImprovements}
            </p>
          </div>

          {/* Remaining Placeholders Banner */}
          {reviewResult.remainingPlaceholders && reviewResult.remainingPlaceholders.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-amber-300">Remaining User Placeholders:</span>
              {reviewResult.remainingPlaceholders.map((ph, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-200 text-xs font-mono"
                >
                  {ph}
                </span>
              ))}
            </div>
          )}

          {/* Clarification Box if score < 80% and questions exist in Review Mode */}
          {reviewResult.readinessScore < 80 && reviewResult.clarificationQuestions && reviewResult.clarificationQuestions.length > 0 && (
            <ClarificationCard
              questions={reviewResult.clarificationQuestions}
              provisionalOutline={reviewResult.provisionalOutline}
              onAnswerAndRefine={handleAnswerClarifications}
              isLoading={isLoading}
              onForceGenerate={handleForceGenerate}
            />
          )}

          {/* Revised Output Presentation (When score >= 80 or force generated) */}
          {reviewResult.revisedPrompt && (
            <>
              {/* View Mode Toggle Bar */}
              <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 ml-2">Output Presentation:</span>
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewMode('structured')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        viewMode === 'structured'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Standard 10-Section Specification
                    </button>
                    <button
                      onClick={() => setViewMode('diff')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        viewMode === 'diff'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Side-by-Side Comparison
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onSendToSandbox(reviewResult.revisedPrompt!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Test in Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Standard 10-Section Structured Prompt Viewer */}
              {viewMode === 'structured' ? (
                <StructuredPromptViewer
                  promptText={reviewResult.revisedPrompt}
                  structuredSections={reviewResult.structuredSections}
                  onSendToSandbox={onSendToSandbox}
                  onRefine={() => {}}
                  targetModel={modelSettings.selectedModel}
                />
              ) : (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-100">Side-by-Side Architectural Diff</h3>
                    </div>

                    <button
                      onClick={handleCopyRevised}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      {copiedRevised ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied Revised!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Revised</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                    {/* Original */}
                    <div className="p-4 space-y-2 bg-slate-950/40">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Input Prompt Submitted</span>
                        <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/40">
                          Pre-Review
                        </span>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto p-3 bg-slate-950 rounded-lg border border-slate-900 leading-relaxed">
                        {existingPrompt}
                      </pre>
                    </div>

                    {/* Revised */}
                    <div className="p-4 space-y-2 bg-slate-950/20">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Amended Standard 10-Section Specification</span>
                        <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40">
                          Standardized & Hardened
                        </span>
                      </div>
                      <pre className="text-xs font-mono text-slate-100 whitespace-pre-wrap max-h-96 overflow-y-auto p-3 bg-slate-950 rounded-lg border border-slate-900 leading-relaxed">
                        {reviewResult.revisedPrompt}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
