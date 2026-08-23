import { ModelOption, GeminiModelId } from '../types';

export const GEMINI_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Recommended',
    tagline: 'Frontier speed & hybrid reasoning',
    description: 'Google’s state-of-the-art fast multimodal model with dynamic reasoning capabilities. Excellent for general prompt engineering, complex structured schemas, and rapid iterations.',
    strengths: ['Hybrid reasoning capability', 'Ultra-low latency', 'High structured output adherence', 'Thinking budget control'],
    recommendedFor: 'Default choice for all prompt architecture, audits, and real-time sandbox execution.',
    contextWindow: '1M tokens',
    supportsThinking: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Reasoning & Code',
    tagline: 'State-of-the-art for complex reasoning & code',
    description: 'Engineered for difficult multi-step analytical reasoning, deep mathematical problem-solving, advanced coding architectures, and extensive regulatory compliance checking.',
    strengths: ['Complex multi-step logic', 'Large codebase comprehension', 'Exhaustive edge-case analysis'],
    recommendedFor: 'Complex prompts involving legal contracts, enterprise architecture, security policies, and deep code generation.',
    contextWindow: '2M tokens',
    supportsThinking: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: 'Ultra Lightweight',
    tagline: 'Maximum efficiency & minimal latency',
    description: 'Lightweight model tailored for extreme cost sensitivity, high-frequency utility tasks, simple data extraction, and quick classifications.',
    strengths: ['Lowest latency', 'Maximum token efficiency', 'Fastest turnaround'],
    recommendedFor: 'Micro-prompts, tag extraction, classification gates, and rapid unit testing.',
    contextWindow: '1M tokens',
    supportsThinking: false,
  },
];

export const DEFAULT_MODEL_ID: GeminiModelId = 'gemini-3.7-flash';

export const getModelById = (id: string): ModelOption => {
  return GEMINI_MODELS.find((m) => m.id === id) || GEMINI_MODELS[0];
};
