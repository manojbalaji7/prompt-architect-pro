export type OperatingMode = 'architecture' | 'review' | 'execution';

export type GeminiModelId = 
  | 'gemini-3.7-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  strengths: string[];
  recommendedFor: string;
  contextWindow: string;
  supportsThinking?: boolean;
}

export interface ModelSettings {
  selectedModel: GeminiModelId;
  temperature: number; // 0.0 to 1.0
  thinkingBudget?: number; // 0 to 8192
}

export interface ReadinessScoreBreakdown {
  objectiveClarity: number;      // max 20
  necessaryContext: number;      // max 15
  inputsAndSources: number;      // max 15
  taskInstructions: number;      // max 15
  constraints: number;           // max 10
  outputFormat: number;          // max 10
  successCriteria: number;       // max 10
  riskPrivacyCompliance: number; // max 5
  totalScore: number;            // 0 - 100
  notes?: Record<string, string>;
}

export interface OptimizedPromptSections {
  role: string;
  objective: string;
  context: string;
  inputs: string;
  task: string;
  constraints: string;
  outputFormat: string;
  qualityChecks: string;
  antiHallucinationRules: string;
  successCriteria: string;
}

export interface ArchitectResult {
  mode: 'architecture';
  readinessScore: number;
  breakdown: ReadinessScoreBreakdown;
  knownInformation: string[];
  assumptions: string[];
  missingInformation: string[];
  placeholders: string[];
  status: 'ready' | 'needs_clarification' | 'critically_incomplete';
  clarificationQuestions?: string[];
  provisionalOutline?: string;
  optimizedPromptText?: string;
  structuredSections?: OptimizedPromptSections;
  explanation?: string;
}

export interface ReviewResult {
  mode: 'review';
  readinessScore: number;
  breakdown: ReadinessScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  revisedPrompt?: string;
  structuredSections?: OptimizedPromptSections;
  explanationOfImprovements: string;
  remainingPlaceholders: string[];
  clarificationQuestions?: string[];
  provisionalOutline?: string;
  status?: 'ready' | 'needs_clarification' | 'critically_incomplete';
}

export interface ExecutionVerification {
  criterion: string;
  passed: boolean;
  notes: string;
}

export interface ExecutionResult {
  output: string;
  durationMs: number;
  model: string;
  verifications?: ExecutionVerification[];
  timestamp: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Enterprise' | 'Engineering' | 'Analytics & Research' | 'Google Workspace' | 'Safety & Compliance' | 'Productivity';
  description: string;
  roughPrompt: string;
  contextPreset?: {
    audience?: string;
    deliverableType?: string;
    confidentiality?: string;
    workspaceGrounding?: boolean;
    language?: string;
  };
}

export interface PromptHistoryItem {
  id: string;
  title: string;
  timestamp: number;
  mode: OperatingMode;
  readinessScore: number;
  roughInput: string;
  optimizedPrompt: string;
  placeholders: string[];
  architectResult?: ArchitectResult;
  reviewResult?: ReviewResult;
}
