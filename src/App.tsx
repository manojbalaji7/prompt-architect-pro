/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  OperatingMode, 
  ArchitectResult, 
  ReviewResult, 
  ExecutionResult, 
  PromptHistoryItem, 
  PromptTemplate,
  ModelSettings,
  GeminiModelId
} from './types';
import { Header } from './components/Header';
import { ArchitectWorkspace } from './components/ArchitectWorkspace';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { ExecutionSandbox } from './components/ExecutionSandbox';
import { TemplateModal } from './components/TemplateModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'prompt_architect_pro_history_v1';
const SETTINGS_STORAGE_KEY = 'prompt_architect_pro_model_settings_v1';

export default function App() {
  const [currentMode, setCurrentMode] = useState<OperatingMode>('architecture');
  const [architectInput, setArchitectInput] = useState<string>('');
  const [reviewInput, setReviewInput] = useState<string>('');
  const [architectResult, setArchitectResult] = useState<ArchitectResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('');
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Model & Inference parameters state
  const [modelSettings, setModelSettings] = useState<ModelSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      selectedModel: 'gemini-3.7-flash',
      temperature: 0.2,
      thinkingBudget: 0,
    };
  });

  const handleUpdateModelSettings = (newSettings: ModelSettings) => {
    setModelSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {}
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from storage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryItem = (item: PromptHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist history', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // 1. Generate & Architect Prompt
  const handleGeneratePrompt = async (roughPrompt: string, contextConfig?: any, force?: boolean) => {
    setArchitectInput(roughPrompt);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/architect/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roughPrompt, 
          contextConfig, 
          forceGenerate: force,
          model: modelSettings.selectedModel,
          temperature: modelSettings.temperature,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to architect prompt.');
      }

      const data: ArchitectResult = await response.json();
      setArchitectResult(data);

      if (data.optimizedPromptText) {
        setSandboxPrompt(data.optimizedPromptText);
        saveHistoryItem({
          id: `arch-${Date.now()}`,
          title: roughPrompt.slice(0, 45) + (roughPrompt.length > 45 ? '...' : ''),
          timestamp: Date.now(),
          mode: 'architecture',
          readinessScore: data.readinessScore,
          roughInput: roughPrompt,
          optimizedPrompt: data.optimizedPromptText,
          placeholders: data.placeholders || [],
          architectResult: data,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while contacting Prompt Architect engine.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Review Existing Prompt
  const handleReviewPrompt = async (existingPrompt: string) => {
    setReviewInput(existingPrompt);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/architect/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          existingPrompt,
          model: modelSettings.selectedModel,
          temperature: modelSettings.temperature,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to review prompt.');
      }

      const data: ReviewResult = await response.json();
      setReviewResult(data);

      if (data.revisedPrompt) {
        setSandboxPrompt(data.revisedPrompt);
        saveHistoryItem({
          id: `rev-${Date.now()}`,
          title: `Audit: ${existingPrompt.slice(0, 35)}...`,
          timestamp: Date.now(),
          mode: 'review',
          readinessScore: data.readinessScore,
          roughInput: existingPrompt,
          optimizedPrompt: data.revisedPrompt,
          placeholders: data.remainingPlaceholders || [],
          reviewResult: data,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error auditing prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Execute in Sandbox
  const handleExecutePrompt = async (
    prompt: string, 
    sampleInputs: string,
    overrideModel?: GeminiModelId,
    overrideTemp?: number,
    overrideThinking?: number
  ): Promise<ExecutionResult | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/architect/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          sampleInputs,
          model: overrideModel || modelSettings.selectedModel,
          temperature: typeof overrideTemp === 'number' ? overrideTemp : modelSettings.temperature,
          thinkingBudget: typeof overrideThinking === 'number' ? overrideThinking : modelSettings.thinkingBudget,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to execute prompt in Gemini.');
      }

      const data: ExecutionResult = await response.json();
      setExecutionResult(data);
      return data;
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Prompt Architectural Refinement
  const handleRefinePrompt = async (type: string, custom?: string) => {
    if (!architectResult?.optimizedPromptText) return;
    setIsRefining(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/architect/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrompt: architectResult.optimizedPromptText,
          refinementType: type,
          customInstruction: custom,
          model: modelSettings.selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to refine prompt.');
      }

      const data = await response.json();
      if (data.refinedPromptText) {
        setArchitectResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            optimizedPromptText: data.refinedPromptText,
            structuredSections: data.structuredSections,
          };
        });
        setSandboxPrompt(data.refinedPromptText);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSendToSandbox = (prompt: string) => {
    setSandboxPrompt(prompt);
    setCurrentMode('execution');
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setCurrentMode('architecture');
    handleGeneratePrompt(template.roughPrompt, template.contextPreset, true);
  };

  const handleLoadHistoryItem = (item: PromptHistoryItem) => {
    setSandboxPrompt(item.optimizedPrompt);

    if (item.mode === 'review') {
      setCurrentMode('review');
      setReviewInput(item.roughInput);
      if (item.reviewResult) {
        setReviewResult(item.reviewResult);
      } else {
        // Synthesize full structured review result from saved item
        setReviewResult({
          mode: 'review',
          readinessScore: item.readinessScore,
          breakdown: {
            objectiveClarity: Math.round(item.readinessScore * 0.2),
            necessaryContext: Math.round(item.readinessScore * 0.15),
            inputsAndSources: Math.round(item.readinessScore * 0.15),
            taskInstructions: Math.round(item.readinessScore * 0.15),
            constraints: Math.round(item.readinessScore * 0.1),
            outputFormat: Math.round(item.readinessScore * 0.1),
            successCriteria: Math.round(item.readinessScore * 0.1),
            riskPrivacyCompliance: Math.round(item.readinessScore * 0.05),
            totalScore: item.readinessScore,
          },
          strengths: ['Retained from saved session audit.'],
          weaknesses: ['Restored from session history.'],
          revisedPrompt: item.optimizedPrompt,
          explanationOfImprovements: 'Restored from previous audit session.',
          remainingPlaceholders: item.placeholders || [],
        });
      }
    } else {
      setCurrentMode('architecture');
      setArchitectInput(item.roughInput);
      if (item.architectResult) {
        setArchitectResult(item.architectResult);
      } else {
        // Synthesize full structured architect result from saved item
        setArchitectResult({
          mode: 'architecture',
          readinessScore: item.readinessScore,
          breakdown: {
            objectiveClarity: Math.round(item.readinessScore * 0.2),
            necessaryContext: Math.round(item.readinessScore * 0.15),
            inputsAndSources: Math.round(item.readinessScore * 0.15),
            taskInstructions: Math.round(item.readinessScore * 0.15),
            constraints: Math.round(item.readinessScore * 0.1),
            outputFormat: Math.round(item.readinessScore * 0.1),
            successCriteria: Math.round(item.readinessScore * 0.1),
            riskPrivacyCompliance: Math.round(item.readinessScore * 0.05),
            totalScore: item.readinessScore,
          },
          status: item.readinessScore >= 80 ? 'ready' : 'needs_clarification',
          knownInformation: ['Loaded from saved prompt session.'],
          assumptions: [],
          missingInformation: [],
          placeholders: item.placeholders || [],
          optimizedPromptText: item.optimizedPrompt,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenModelSelector={() => setIsModelModalOpen(true)}
        modelSettings={modelSettings}
        onUpdateModelSettings={handleUpdateModelSettings}
        savedCount={history.length}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Engine Alert</h4>
                <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher based on current Operating Mode */}
        {currentMode === 'architecture' && (
          <ArchitectWorkspace
            initialInput={architectInput}
            onGenerate={handleGeneratePrompt}
            architectResult={architectResult}
            isLoading={isLoading}
            onSendToSandbox={handleSendToSandbox}
            onRefinePrompt={handleRefinePrompt}
            isRefining={isRefining}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            modelSettings={modelSettings}
            onOpenModelSelector={() => setIsModelModalOpen(true)}
            onUpdateModelSettings={handleUpdateModelSettings}
          />
        )}

        {currentMode === 'review' && (
          <ReviewWorkspace
            initialInput={reviewInput}
            onReview={handleReviewPrompt}
            reviewResult={reviewResult}
            isLoading={isLoading}
            onSendToSandbox={handleSendToSandbox}
            modelSettings={modelSettings}
            onOpenModelSelector={() => setIsModelModalOpen(true)}
            onUpdateModelSettings={handleUpdateModelSettings}
          />
        )}

        {currentMode === 'execution' && (
          <ExecutionSandbox
            initialPrompt={sandboxPrompt}
            onExecute={handleExecutePrompt}
            isLoading={isLoading}
            executionResult={executionResult}
            modelSettings={modelSettings}
            onUpdateModelSettings={handleUpdateModelSettings}
            onOpenModelSelector={() => setIsModelModalOpen(true)}
            errorMessage={errorMessage}
          />
        )}
      </main>

      {/* Model & Parameters Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        settings={modelSettings}
        onUpdateSettings={handleUpdateModelSettings}
      />

      {/* Template Presets Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Session History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />
    </div>
  );
}

