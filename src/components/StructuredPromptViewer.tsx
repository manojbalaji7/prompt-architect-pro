import React, { useState } from 'react';
import { OptimizedPromptSections } from '../types';
import { 
  Copy, 
  Check, 
  Download, 
  Code2, 
  Sparkles, 
  PlayCircle, 
  ShieldAlert, 
  FileText, 
  Layers, 
  FileCode, 
  ExternalLink,
  Edit3,
  Sliders,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StructuredPromptViewerProps {
  promptText: string;
  structuredSections?: OptimizedPromptSections;
  onSendToSandbox: (prompt: string) => void;
  onRefine: (type: string, custom?: string) => void;
  isRefining?: boolean;
  targetModel?: string;
}

export const StructuredPromptViewer: React.FC<StructuredPromptViewerProps> = ({
  promptText,
  structuredSections,
  onSendToSandbox,
  onRefine,
  isRefining = false,
  targetModel = 'gemini-3.7-flash',
}) => {
  const [activeTab, setActiveTab] = useState<'full' | 'sections' | 'xml' | 'gemini_sdk'>('full');
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeRefinement, setActiveRefinement] = useState<string | null>(null);
  const [customRefineInput, setCustomRefineInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Copy handler with celebratory confetti
  const handleCopyAll = () => {
    navigator.clipboard.writeText(getFormattedOutput());
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#06b6d4'],
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const handleCopySection = (name: string, content: string) => {
    navigator.clipboard.writeText(`### ${name}\n\n${content}`);
    setCopiedSection(name);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getFormattedOutput()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `optimized-gemini-prompt-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert to XML / Semantic Tags
  const generateXmlFormat = () => {
    if (!structuredSections) return promptText;
    return `<prompt_specification>
  <role>
${structuredSections.role}
  </role>

  <objective>
${structuredSections.objective}
  </objective>

  <context>
${structuredSections.context}
  </context>

  <inputs>
${structuredSections.inputs}
  </inputs>

  <task>
${structuredSections.task}
  </task>

  <constraints>
${structuredSections.constraints}
  </constraints>

  <output_format>
${structuredSections.outputFormat}
  </output_format>

  <quality_checks>
${structuredSections.qualityChecks}
  </quality_checks>

  <anti_hallucination_rules>
${structuredSections.antiHallucinationRules}
  </anti_hallucination_rules>

  <success_criteria>
${structuredSections.successCriteria}
  </success_criteria>
</prompt_specification>`;
  };

  // Generate Gemini SDK Code Snippet
  const generateGeminiSdkSnippet = () => {
    const cleanPrompt = promptText.replace(/`/g, '\\`').replace(/\${/g, '\\${');
    return `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function runPrompt(userInputData: string) {
  const response = await ai.models.generateContent({
    model: "${targetModel}",
    contents: \`\${userInputData}\`,
    config: {
      systemInstruction: \`${cleanPrompt}\`,
      temperature: 0.2, // Low temperature for high precision & consistency
    }
  });

  console.log(response.text);
  return response.text;
}`;
  };

  const getFormattedOutput = () => {
    switch (activeTab) {
      case 'xml':
        return generateXmlFormat();
      case 'gemini_sdk':
        return generateGeminiSdkSnippet();
      default:
        return promptText;
    }
  };

  const sectionDefs = structuredSections
    ? [
        { key: 'role', title: 'ROLE', desc: 'Expertise, persona & boundaries', content: structuredSections.role, icon: '🛡️' },
        { key: 'objective', title: 'OBJECTIVE', desc: 'Exact intended outcome & definition of success', content: structuredSections.objective, icon: '🎯' },
        { key: 'context', title: 'CONTEXT', desc: 'Background, audience & environment', content: structuredSections.context, icon: '🌐' },
        { key: 'inputs', title: 'INPUTS', desc: 'Expected data formats & approved sources', content: structuredSections.inputs, icon: '📥' },
        { key: 'task', title: 'TASK', desc: 'Ordered, unambiguous stage instructions', content: structuredSections.task, icon: '📋' },
        { key: 'constraints', title: 'CONSTRAINTS', desc: 'Scope, exclusions, tone & boundaries', content: structuredSections.constraints, icon: '🔒' },
        { key: 'outputFormat', title: 'OUTPUT FORMAT', desc: 'Exact deliverable structure & schema', content: structuredSections.outputFormat, icon: '📊' },
        { key: 'qualityChecks', title: 'QUALITY CHECKS', desc: 'Pre-flight verification checklist', content: structuredSections.qualityChecks, icon: '✨' },
        { key: 'antiHallucinationRules', title: 'ANTI-HALLUCINATION RULES', desc: 'Factual grounding & fabrication prevention', content: structuredSections.antiHallucinationRules, icon: '🚫' },
        { key: 'successCriteria', title: 'SUCCESS CRITERIA', desc: 'Measurable acceptance checks', content: structuredSections.successCriteria, icon: '🏆' },
      ]
    : [];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Optimized Gemini Prompt</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10-Section Architecture
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Structured, grounded, and hardened for Google Gemini</p>
          </div>
        </div>

        {/* View Format Selector */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('full')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'full'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Markdown
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'sections'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modular Cards
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'xml'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            XML Tags
          </button>
          <button
            onClick={() => setActiveTab('gemini_sdk')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'gemini_sdk'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gemini SDK
          </button>
        </div>
      </div>

      {/* Quick Architecture Refinement Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-300">Quick Modifiers:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            disabled={isRefining}
            onClick={() => onRefine('workspace')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-indigo-300 transition whitespace-nowrap disabled:opacity-50"
            title="Add Google Drive, Docs, Sheets integration instructions and rules"
          >
            <span>+ Google Workspace</span>
          </button>

          <button
            disabled={isRefining}
            onClick={() => onRefine('anti_hallucination')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-emerald-500/50 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-emerald-300 transition whitespace-nowrap disabled:opacity-50"
            title="Harden anti-hallucination, mandatory citations, and ungrounded fact prevention"
          >
            <span>+ Anti-Hallucination Guard</span>
          </button>

          <button
            disabled={isRefining}
            onClick={() => onRefine('enterprise_privacy')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-amber-500/50 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition whitespace-nowrap disabled:opacity-50"
            title="Inject enterprise PII redaction, human-in-the-loop audit, and confidentiality gates"
          >
            <span>+ Enterprise Privacy</span>
          </button>

          <button
            disabled={isRefining}
            onClick={() => onRefine('json_schema')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition whitespace-nowrap disabled:opacity-50"
            title="Format deliverable into strict JSON Schema format"
          >
            <span>+ Strict JSON Output</span>
          </button>

          <button
            disabled={isRefining}
            onClick={() => onRefine('concise')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-purple-500/50 hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-purple-300 transition whitespace-nowrap disabled:opacity-50"
            title="Trim redundant phrasing while keeping 100% of instruction precision"
          >
            <span>+ Concise Mode</span>
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/50 hover:bg-indigo-900/60 text-[11px] font-medium text-indigo-300 transition whitespace-nowrap"
          >
            <Edit3 className="w-3 h-3" />
            <span>Custom Refine</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 max-h-[550px] overflow-y-auto bg-slate-950/30">
        {isRefining && (
          <div className="flex items-center justify-center gap-2.5 py-8 text-indigo-400 animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Prompt Architect Pro is refining your prompt...</span>
          </div>
        )}

        {!isRefining && activeTab === 'sections' && structuredSections && (
          <div className="space-y-3.5">
            {sectionDefs.map((sec) => (
              <div
                key={sec.key}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sec.icon}</span>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      {sec.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                      • {sec.desc}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopySection(sec.title, sec.content)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/40 transition"
                  >
                    {copiedSection === sec.title ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isRefining && activeTab !== 'sections' && (
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-slate-800 selection:bg-indigo-500/30 selection:text-indigo-200">
            {getFormattedOutput()}
          </pre>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyAll}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Prompt</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Download as Markdown file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onSendToSandbox(promptText)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Test in Execution Sandbox</span>
        </button>
      </div>

      {/* Custom Refinement Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>Custom Prompt Architectural Refinement</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter any specific constraint, custom rule, or domain modification you would like Prompt Architect Pro to inject.
            </p>
            <textarea
              value={customRefineInput}
              onChange={(e) => setCustomRefineInput(e.target.value)}
              placeholder="e.g. Add multi-step CoT reasoning, require citations in IEEE format, enforce German language output..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customRefineInput.trim()) {
                    onRefine('custom', customRefineInput.trim());
                    setShowCustomModal(false);
                    setCustomRefineInput('');
                  }
                }}
                disabled={!customRefineInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition"
              >
                Apply Refinement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
