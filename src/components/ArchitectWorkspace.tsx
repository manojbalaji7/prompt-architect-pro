import React, { useState, useEffect } from 'react';
import { ArchitectResult, PromptTemplate, ModelSettings, GeminiModelId } from '../types';
import { getModelById } from '../lib/models';
import { ReadinessMeter } from './ReadinessMeter';
import { ClassificationBadges } from './ClassificationBadges';
import { ClarificationCard } from './ClarificationCard';
import { StructuredPromptViewer } from './StructuredPromptViewer';
import { ModelDropdown } from './ModelDropdown';
import { 
  Compass, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Info, 
  RotateCcw,
  Zap,
  Globe,
  Lock,
  FileCheck
} from 'lucide-react';

interface ArchitectWorkspaceProps {
  initialInput?: string;
  onGenerate: (roughPrompt: string, contextConfig?: any, force?: boolean) => Promise<void>;
  architectResult: ArchitectResult | null;
  isLoading: boolean;
  onSendToSandbox: (prompt: string) => void;
  onRefinePrompt: (type: string, custom?: string) => Promise<void>;
  isRefining: boolean;
  onOpenTemplates: () => void;
  modelSettings: ModelSettings;
  onOpenModelSelector: () => void;
  onUpdateModelSettings: (settings: ModelSettings) => void;
}

export const ArchitectWorkspace: React.FC<ArchitectWorkspaceProps> = ({
  initialInput,
  onGenerate,
  architectResult,
  isLoading,
  onSendToSandbox,
  onRefinePrompt,
  isRefining,
  onOpenTemplates,
  modelSettings,
  onOpenModelSelector,
  onUpdateModelSettings,
}) => {
  const [roughPrompt, setRoughPrompt] = useState(initialInput || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [audience, setAudience] = useState('');
  const [deliverableType, setDeliverableType] = useState('');
  const [confidentiality, setConfidentiality] = useState('Standard');
  const [workspaceGrounding, setWorkspaceGrounding] = useState(false);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (typeof initialInput === 'string') {
      setRoughPrompt(initialInput);
    }
  }, [initialInput]);

  const currentModel = getModelById(modelSettings.selectedModel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roughPrompt.trim()) return;
    await onGenerate(
      roughPrompt.trim(),
      {
        audience: audience.trim() || undefined,
        deliverableType: deliverableType.trim() || undefined,
        confidentiality,
        workspaceGrounding,
        language,
      },
      false
    );
  };

  const handleForceGenerate = async () => {
    if (!roughPrompt.trim()) return;
    await onGenerate(
      roughPrompt.trim(),
      {
        audience: audience.trim() || undefined,
        deliverableType: deliverableType.trim() || undefined,
        confidentiality,
        workspaceGrounding,
        language,
      },
      true
    );
  };

  const handleAnswerAndRefine = async (aggregatedAnswers: string) => {
    const updated = `${roughPrompt}\n\n## CLARIFICATION DETAILS PROVIDED:\n${aggregatedAnswers}`;
    setRoughPrompt(updated);
    await onGenerate(
      updated,
      {
        audience: audience.trim() || undefined,
        deliverableType: deliverableType.trim() || undefined,
        confidentiality,
        workspaceGrounding,
        language,
      },
      false
    );
  };

  const sampleIdeas = [
    {
      title: 'Drive & Sheets Briefing',
      text: 'Read Google Drive quarterly review docs and project tracker in Sheets, then write a 1-page briefing for leadership with key milestones and risks.',
      workspace: true,
    },
    {
      title: 'Financial Variance Report',
      text: 'Analyze Q3 vs Q4 budget statements. Flag line items with >10% variance and summarize root causes without making up ungrounded numbers.',
      confidentiality: 'Confidential',
    },
    {
      title: 'Code Security Audit',
      text: 'Review TypeScript API routes for OWASP Top 10 vulnerabilities, input sanitization, and suggest drop-in secure fixes.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input Console */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Prompt Architecture Studio</h2>
              <p className="text-xs text-slate-400">
                Transform rough ideas, business needs, and task requirements into production-ready Gemini prompts.
              </p>
            </div>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500">Quick suggestions:</span>
          {sampleIdeas.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setRoughPrompt(s.text);
                if (s.workspace) setWorkspaceGrounding(true);
                if (s.confidentiality) setConfidentiality(s.confidentiality);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
            >
              {s.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={roughPrompt}
              onChange={(e) => setRoughPrompt(e.target.value)}
              placeholder="Describe what you want Gemini to accomplish (e.g. 'I need a prompt for reviewing pull requests', 'Synthesize customer tickets into release notes', 'Audit financial reports with zero hallucination')..."
              rows={4}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition leading-relaxed"
            />
            {roughPrompt && (
              <button
                type="button"
                onClick={() => setRoughPrompt('')}
                className="absolute top-3 right-3 text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Context Options Toggle */}
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Optional Context & Governance Parameters</span>
                {(audience || deliverableType || workspaceGrounding || confidentiality !== 'Standard') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                {showAdvanced ? 'Hide' : 'Configure Audience, Workspace, Privacy'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Senior Executives, Software Engineers"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deliverable Format</label>
                  <input
                    type="text"
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                    placeholder="e.g. 1-Page Markdown, JSON Schema, Executive Table"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Confidentiality / Domain</label>
                  <select
                    value={confidentiality}
                    onChange={(e) => setConfidentiality(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Standard">Standard / General Use</option>
                    <option value="Internal Confidential">Internal Confidential (Enterprise)</option>
                    <option value="Regulated / Legal / Healthcare">Regulated / HIPAA / Legal (Strict Disclaimers)</option>
                    <option value="Financial Audit">Financial Audit (Zero Hallucination)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workspaceGrounding}
                      onChange={(e) => setWorkspaceGrounding(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      Enable Google Workspace Grounding Rules (Drive, Docs, Sheets, Gmail, Calendar)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Language:</span>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-28 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Calculates readiness score, classifies facts vs placeholders, and engineers complete Gemini prompts.
            </p>

            <button
              type="submit"
              disabled={isLoading || !roughPrompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer ml-auto"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Architecting Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Architect Production Prompt</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Architect Output Results */}
      {architectResult && (
        <div className="space-y-5 animate-fadeIn">
          {/* Readiness Score & 8-Factor Breakdown */}
          <ReadinessMeter
            score={architectResult.readinessScore}
            breakdown={architectResult.breakdown}
          />

          {/* Information Classification (Known, Assumptions, Missing, Placeholders) */}
          <ClassificationBadges
            knownInformation={architectResult.knownInformation}
            assumptions={architectResult.assumptions}
            missingInformation={architectResult.missingInformation}
            placeholders={architectResult.placeholders}
          />

          {/* Clarification Box if score < 80% and questions exist */}
          {architectResult.readinessScore < 80 && architectResult.clarificationQuestions && architectResult.clarificationQuestions.length > 0 && (
            <ClarificationCard
              questions={architectResult.clarificationQuestions}
              provisionalOutline={architectResult.provisionalOutline}
              onAnswerAndRefine={handleAnswerAndRefine}
              isLoading={isLoading}
              onForceGenerate={handleForceGenerate}
            />
          )}

          {/* Optimized Prompt Output (When score >= 80 or force generated) */}
          {architectResult.optimizedPromptText && (
            <StructuredPromptViewer
              promptText={architectResult.optimizedPromptText}
              structuredSections={architectResult.structuredSections}
              onSendToSandbox={onSendToSandbox}
              onRefine={onRefinePrompt}
              isRefining={isRefining}
              targetModel={modelSettings.selectedModel}
            />
          )}
        </div>
      )}
    </div>
  );
};
