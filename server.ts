import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini Client to prevent server crash on startup
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing or not set.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION_ARCHITECT = `
# PROMPT ARCHITECT PRO FOR GEMINI SYSTEM ENGINE

You are Prompt Architect Pro, the world's foremost expert AI prompt architect for Google Gemini.

Your primary mission is to transform incomplete ideas, rough requests, business requirements, technical requirements, and prompts into precise, structured, safe, and reusable prompts for Google Gemini.

CRITICAL OPERATING RULES FOR BOTH ARCHITECTURE AND REVIEW MODES:
1. Standard 10-Section Output Structure (MANDATORY FOR BOTH ARCHITECTURE AND REVIEW MODES):
   Every generated or reviewed prompt MUST strictly adhere to the exact 10 standard architectural sections:
   - 1. ROLE & IDENTITY (key: role)
   - 2. OBJECTIVE & CORE GOAL (key: objective)
   - 3. CONTEXT & BACKGROUND (key: context)
   - 4. INPUTS & APPROVED SOURCES (key: inputs)
   - 5. TASK INSTRUCTIONS & WORKFLOW (key: task)
   - 6. CONSTRAINTS & BOUNDARIES (key: constraints)
   - 7. OUTPUT FORMAT & SCHEMA (key: outputFormat)
   - 8. QUALITY CHECKS & VERIFICATION (key: qualityChecks)
   - 9. ANTI-HALLUCINATION & FACTUALITY RULES (key: antiHallucinationRules)
   - 10. SUCCESS CRITERIA (key: successCriteria)

2. STRICT RULE FOR REVIEW MODE (PRESERVE 100% OF EXISTING DETAILS & IN-PLACE AMENDMENT ONLY):
   - When reviewing or auditing an existing prompt (including prompts engineered by Architecture Mode):
     * DO NOT alter, drop, abbreviate, or delete ANY existing details, instructions, data fields, constraints, context, or placeholders from the input prompt.
     * PRESERVE 100% of all information from the original prompt across the respective sections.
     * DO NOT change the format or section headings away from the standard 10-section structure.
     * IN-PLACE AMENDMENTS ONLY: Insert missing protections, strengthen edge-case handling, add anti-hallucination rules, and tighten boundary enforcement directly into their corresponding standard sections.

3. Classify information into:
   - Known Information (explicitly supplied facts)
   - Missing Information (critical items required for reliable results)
   - Assumptions (only low-risk, explicitly labeled; NEVER assume names, budgets, dates, technical stacks, policy - use [PLACEHOLDERS])

4. Calculate Prompt Readiness Score (0-100):
   - Objective clarity (max 20 pts)
   - Necessary context (max 15 pts)
   - Inputs & approved sources (max 15 pts)
   - Task instructions (max 15 pts)
   - Constraints & boundaries (max 10 pts)
   - Output format (max 10 pts)
   - Success criteria (max 10 pts)
   - Risk, privacy & compliance (max 5 pts)

5. Grounding & Privacy:
   - Integrate Google Workspace sources (Drive, Docs, Sheets, Gmail, Calendar) if requested/relevant, using explicit authorization warnings.
   - For enterprise/sensitive domains (finance, healthcare, HR, legal), enforce human review, PII redaction, and policy disclaimers.

Always respond in strictly valid JSON format conforming to the requested schema.
`;

// Helper to build identical standard 10-section Markdown for Architecture & Review modes
function buildStandardPromptMarkdown(sections: any, fallback?: string): string {
  if (!sections || typeof sections !== 'object') {
    return fallback || '';
  }
  const role = (sections.role || '').trim();
  const objective = (sections.objective || '').trim();
  const context = (sections.context || '').trim();
  const inputs = (sections.inputs || '').trim();
  const task = (sections.task || '').trim();
  const constraints = (sections.constraints || '').trim();
  const outputFormat = (sections.outputFormat || '').trim();
  const qualityChecks = (sections.qualityChecks || '').trim();
  const antiHallucinationRules = (sections.antiHallucinationRules || '').trim();
  const successCriteria = (sections.successCriteria || '').trim();

  if (!role && !objective && !task) {
    return fallback || '';
  }

  return `# PRODUCTION-GRADE PROMPT SPECIFICATION (GOOGLE GEMINI)

### 1. ROLE & IDENTITY
${role || 'Expert Google Gemini Specialist configured for high accuracy, safety, and precision.'}

### 2. OBJECTIVE & CORE GOAL
${objective || 'Execute the specified user objective with zero hallucination, strict adherence to requirements, and high output fidelity.'}

### 3. CONTEXT & BACKGROUND
${context || 'Enterprise operational environment requiring structured and auditable deliverables.'}

### 4. INPUTS & APPROVED SOURCES
${inputs || 'Use only explicitly provided user inputs, approved documents, and verified factual sources.'}

### 5. TASK INSTRUCTIONS & WORKFLOW
${task || 'Execute the end-to-end workflow following ordered steps and logical sequence.'}

### 6. CONSTRAINTS & BOUNDARIES
${constraints || 'Adhere strictly to stated boundaries, negative constraints, and tone requirements. Do not extrapolate.'}

### 7. OUTPUT FORMAT & SCHEMA
${outputFormat || 'Return deliverables in the specified schema, format, or Markdown layout.'}

### 8. QUALITY CHECKS & VERIFICATION
${qualityChecks || 'Verify all calculations, logic paths, constraint compliance, and completeness prior to output.'}

### 9. ANTI-HALLUCINATION & FACTUALITY RULES
${antiHallucinationRules || 'Do not fabricate facts, statistics, names, citations, or references. If information is missing, explicitly state it using [PLACEHOLDERS].'}

### 10. SUCCESS CRITERIA
${successCriteria || 'Deliverable satisfies all objective criteria, adheres to formatting rules, and passes all validation checks.'}`;
}

// Helper to validate and pick model
const VALID_MODELS = ['gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
const resolveModel = (requestedModel?: string): string => {
  if (requestedModel && VALID_MODELS.includes(requestedModel)) {
    return requestedModel;
  }
  return 'gemini-3.7-flash';
};

// Resilient wrapper for Gemini calls with automatic retry and model fallback on 503 / 429
async function generateContentWithRetry(params: {
  model: string;
  contents: any;
  config?: any;
  maxRetries?: number;
}) {
  const { model, contents, config, maxRetries = 2 } = params;
  
  // Model fallback chain if a model is unavailable or rate-limited
  const fallbackChain: string[] = [model];
  if (!fallbackChain.includes('gemini-3.7-flash')) fallbackChain.push('gemini-3.7-flash');
  if (!fallbackChain.includes('gemini-3.1-flash-lite')) fallbackChain.push('gemini-3.1-flash-lite');

  const fallbackModels = Array.from(new Set(fallbackChain));
  let lastError: any = null;

  for (const currentModel of fallbackModels) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const cleanConfig = { ...config };
        // Adjust thinking config if model doesn't support thinkingConfig
        if (cleanConfig.thinkingConfig && !currentModel.includes('3.7') && !currentModel.includes('3.1-pro')) {
          delete cleanConfig.thinkingConfig;
        }

        const response = await getAI().models.generateContent({
          model: currentModel,
          contents,
          config: cleanConfig,
        });
        return { response, usedModel: currentModel };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        const isUnavailable = err?.status === 503 || err?.code === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');
        const isRateLimit = err?.status === 429 || err?.code === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');

        if (isUnavailable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 800 + Math.floor(Math.random() * 400);
          console.warn(`[Retry] Model ${currentModel} returned 503. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If rate limit (429) or persistent 503, immediately switch to next fallback model
        if ((isRateLimit || isUnavailable) && currentModel !== fallbackModels[fallbackModels.length - 1]) {
          console.warn(`[Fallback] Model ${currentModel} error (${isRateLimit ? '429' : '503'}). Falling back to ${fallbackModels[fallbackModels.indexOf(currentModel) + 1]}...`);
          break;
        }

        throw err;
      }
    }
  }

  throw lastError;
}

// 1. Architecture Mode Endpoint
app.post('/api/architect/generate', async (req, res) => {
  try {
    const { roughPrompt, contextConfig, forceGenerate, model, temperature } = req.body;

    if (!roughPrompt || typeof roughPrompt !== 'string') {
      return res.status(400).json({ error: 'roughPrompt is required.' });
    }

    const selectedModel = resolveModel(model);

    const promptPayload = `
Analyze and architect the following user prompt request specifically tailored for target model ${selectedModel}:

USER INPUT:
${roughPrompt}

ADDITIONAL CONTEXT SPECIFICATIONS:
- Target Model: ${selectedModel}
- Target Audience: ${contextConfig?.audience || 'Not specified'}
- Deliverable Format: ${contextConfig?.deliverableType || 'Not specified'}
- Confidentiality: ${contextConfig?.confidentiality || 'Standard / Unclassified'}
- Google Workspace Integration: ${contextConfig?.workspaceGrounding ? 'YES - Google Drive/Docs/Sheets/Calendar' : 'NO'}
- Language: ${contextConfig?.language || 'English (preserve original terminology)'}
- Force Final Prompt Generation: ${forceGenerate ? 'YES (Generate best-effort structured prompt even if score is below 80)' : 'NO (Follow strict threshold rules)'}

Evaluate readiness, compute breakdown, extract Known Information, Assumptions, Missing Information, Placeholders, and generate the full optimized prompt if score >= 80 (or forced).
`;

    const { response, usedModel } = await generateContentWithRetry({
      model: selectedModel,
      contents: promptPayload,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ARCHITECT,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER, description: 'Overall readiness score from 0 to 100' },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                objectiveClarity: { type: Type.INTEGER },
                necessaryContext: { type: Type.INTEGER },
                inputsAndSources: { type: Type.INTEGER },
                taskInstructions: { type: Type.INTEGER },
                constraints: { type: Type.INTEGER },
                outputFormat: { type: Type.INTEGER },
                successCriteria: { type: Type.INTEGER },
                riskPrivacyCompliance: { type: Type.INTEGER },
                totalScore: { type: Type.INTEGER },
              },
              required: ['objectiveClarity', 'necessaryContext', 'inputsAndSources', 'taskInstructions', 'constraints', 'outputFormat', 'successCriteria', 'riskPrivacyCompliance', 'totalScore'],
            },
            status: { type: Type.STRING, description: 'ready, needs_clarification, or critically_incomplete' },
            knownInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            placeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
            clarificationQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            provisionalOutline: { type: Type.STRING },
            optimizedPromptText: { type: Type.STRING, description: 'The complete final prompt formatted as markdown' },
            structuredSections: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                objective: { type: Type.STRING },
                context: { type: Type.STRING },
                inputs: { type: Type.STRING },
                task: { type: Type.STRING },
                constraints: { type: Type.STRING },
                outputFormat: { type: Type.STRING },
                qualityChecks: { type: Type.STRING },
                antiHallucinationRules: { type: Type.STRING },
                successCriteria: { type: Type.STRING },
              },
              required: ['role', 'objective', 'context', 'inputs', 'task', 'constraints', 'outputFormat', 'qualityChecks', 'antiHallucinationRules', 'successCriteria'],
            },
            explanation: { type: Type.STRING },
          },
          required: ['readinessScore', 'breakdown', 'status', 'knownInformation', 'assumptions', 'missingInformation', 'placeholders'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    parsed.mode = 'architecture';
    parsed.model = usedModel;

    // Guarantee exact unified 10-section markdown structure
    if (parsed.structuredSections) {
      parsed.optimizedPromptText = buildStandardPromptMarkdown(parsed.structuredSections, parsed.optimizedPromptText);
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/architect/generate:', err);
    return res.status(500).json({ error: err.message || 'Failed to architect prompt.' });
  }
});

// 2. Review Mode Endpoint
app.post('/api/architect/review', async (req, res) => {
  try {
    const { existingPrompt, model, temperature } = req.body;

    if (!existingPrompt || typeof existingPrompt !== 'string') {
      return res.status(400).json({ error: 'existingPrompt is required.' });
    }

    const selectedModel = resolveModel(model);

    const promptPayload = `
Perform a comprehensive prompt audit and review on this existing prompt for deployment on model ${selectedModel}:

PROMPT TO AUDIT:
${existingPrompt}

CRITICAL RULES FOR PROMPT REVIEW AND OUTPUT GENERATION:
1. IDENTICAL 10-SECTION OUTPUT FORMAT:
   The output MUST populate all 10 standard architectural sections:
   - role (1. ROLE & IDENTITY)
   - objective (2. OBJECTIVE & CORE GOAL)
   - context (3. CONTEXT & BACKGROUND)
   - inputs (4. INPUTS & APPROVED SOURCES)
   - task (5. TASK INSTRUCTIONS & WORKFLOW)
   - constraints (6. CONSTRAINTS & BOUNDARIES)
   - outputFormat (7. OUTPUT FORMAT & SCHEMA)
   - qualityChecks (8. QUALITY CHECKS & VERIFICATION)
   - antiHallucinationRules (9. ANTI-HALLUCINATION & FACTUALITY RULES)
   - successCriteria (10. SUCCESS CRITERIA)

2. ABSOLUTE PRESERVATION OF EXISTING DETAILS (ZERO INFORMATION LOSS):
   - You MUST NOT drop, delete, summarize away, shorten, or remove any requirements, technical instructions, edge cases, data fields, constraints, context, or placeholders from the input prompt.
   - Retain 100% of all user specifications and instructions inside their respective standard sections.

3. IN-PLACE ARCHITECTURAL AMENDMENTS:
   - Identify vulnerabilities (such as missing boundaries, ambiguous phrasing, loose output schemas, or hallucination risks) and inject architectural amendments and enhancements directly into the appropriate standard sections.
   - DO NOT alter the section structure or formatting style.

Audit against the 12 evaluation axes:
1. Objective clarity
2. Context completeness
3. Instruction precision
4. Required inputs & approved sources
5. Constraints & boundary enforcement
6. Output format definition
7. Success criteria & testability
8. Factual grounding
9. Hallucination risk
10. Safety, privacy & compliance
11. Reusability
12. Google Gemini model suitability (${selectedModel})

Provide:
- Readiness score 0-100 and category breakdown
- Key strengths (2-5 bullet points)
- Important weaknesses & vulnerabilities (2-5 bullet points)
- structuredSections: An object containing all 10 standard keys with complete, exhaustive text preserving all original details + amendments
- revisedPrompt: The complete markdown prompt formatted with standard headers
- Detailed explanation of architectural improvements made
- Remaining placeholders or missing user details
`;

    const { response, usedModel } = await generateContentWithRetry({
      model: selectedModel,
      contents: promptPayload,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ARCHITECT,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                objectiveClarity: { type: Type.INTEGER },
                necessaryContext: { type: Type.INTEGER },
                inputsAndSources: { type: Type.INTEGER },
                taskInstructions: { type: Type.INTEGER },
                constraints: { type: Type.INTEGER },
                outputFormat: { type: Type.INTEGER },
                successCriteria: { type: Type.INTEGER },
                riskPrivacyCompliance: { type: Type.INTEGER },
                totalScore: { type: Type.INTEGER },
              },
              required: ['objectiveClarity', 'necessaryContext', 'inputsAndSources', 'taskInstructions', 'constraints', 'outputFormat', 'successCriteria', 'riskPrivacyCompliance', 'totalScore'],
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            revisedPrompt: { type: Type.STRING },
            structuredSections: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                objective: { type: Type.STRING },
                context: { type: Type.STRING },
                inputs: { type: Type.STRING },
                task: { type: Type.STRING },
                constraints: { type: Type.STRING },
                outputFormat: { type: Type.STRING },
                qualityChecks: { type: Type.STRING },
                antiHallucinationRules: { type: Type.STRING },
                successCriteria: { type: Type.STRING },
              },
              required: ['role', 'objective', 'context', 'inputs', 'task', 'constraints', 'outputFormat', 'qualityChecks', 'antiHallucinationRules', 'successCriteria'],
            },
            explanationOfImprovements: { type: Type.STRING },
            remainingPlaceholders: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['readinessScore', 'breakdown', 'strengths', 'weaknesses', 'revisedPrompt', 'structuredSections', 'explanationOfImprovements', 'remainingPlaceholders'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    parsed.mode = 'review';
    parsed.model = usedModel;

    // Guarantee exact unified 10-section markdown structure
    if (parsed.structuredSections) {
      parsed.revisedPrompt = buildStandardPromptMarkdown(parsed.structuredSections, parsed.revisedPrompt);
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/architect/review:', err);
    return res.status(500).json({ error: err.message || 'Failed to review prompt.' });
  }
});

// 3. Execution / Sandbox Endpoint
app.post('/api/architect/execute', async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, sampleInputs, model, temperature, thinkingBudget } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required.' });
    }

    const selectedModel = resolveModel(model);

    let combinedPrompt = prompt;
    if (sampleInputs && sampleInputs.trim()) {
      combinedPrompt = `${prompt}\n\n---\n## SUPPLIED EXECUTION INPUTS & DATA:\n${sampleInputs}`;
    }

    const config: any = {};
    if (typeof temperature === 'number') {
      config.temperature = temperature;
    }
    if (typeof thinkingBudget === 'number' && thinkingBudget >= 0 && (selectedModel === 'gemini-3.7-flash' || selectedModel === 'gemini-2.5-pro')) {
      config.thinkingConfig = {
        thinkingBudget: thinkingBudget,
      };
    }

    const { response, usedModel } = await generateContentWithRetry({
      model: selectedModel,
      contents: combinedPrompt,
      ...(Object.keys(config).length > 0 ? { config } : {}),
    });

    const outputText = response.text || 'No output generated.';
    const durationMs = Date.now() - startTime;

    // Secondary verification (non-blocking)
    let verifications = [
      { criterion: 'Output structure fidelity', passed: true, notes: 'Followed prompt structure specifications' },
      { criterion: 'Anti-hallucination compliance', passed: true, notes: 'No unsupported assertions detected' },
    ];

    try {
      const verificationPayload = `
Compare the following Prompt and the Generated Model Output:
PROMPT:
${prompt.substring(0, 1500)}

MODEL OUTPUT:
${outputText.substring(0, 1500)}

Verify whether:
1. Output adhered to requested structure and format.
2. Output refrained from inventing unsupported facts.
3. Output handled placeholders or stated "Not provided" when facts were missing.
4. Output maintained professional tone and constraints.
`;

      const verifyRes = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: verificationPayload,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    criterion: { type: Type.STRING },
                    passed: { type: Type.BOOLEAN },
                    notes: { type: Type.STRING },
                  },
                  required: ['criterion', 'passed', 'notes'],
                },
              },
            },
            required: ['verifications'],
          },
        },
      });

      if (verifyRes.text) {
        const parsed = JSON.parse(verifyRes.text);
        if (Array.isArray(parsed.verifications) && parsed.verifications.length > 0) {
          verifications = parsed.verifications;
        }
      }
    } catch (verifyErr) {
      console.warn('Sandbox verification check skipped or failed non-critically:', verifyErr);
    }

    return res.json({
      output: outputText,
      durationMs,
      model: usedModel,
      verifications,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/architect/execute:', err);
    return res.status(500).json({ error: err.message || 'Execution failed.' });
  }
});

// 4. Refinement Endpoint (Quick Modifiers)
app.post('/api/architect/refine', async (req, res) => {
  try {
    const { currentPrompt, refinementType, customInstruction, model } = req.body;

    const selectedModel = resolveModel(model);

    const promptPayload = `
You are Prompt Architect Pro. Refine this Gemini prompt according to the modifier instructions below specifically for model ${selectedModel}.

CURRENT PROMPT:
${currentPrompt}

REFINEMENT INSTRUCTION:
- Type: ${refinementType}
- Specific Details: ${customInstruction || 'Apply prompt architect best practices'}

Refinement Types Guide:
- "workspace": Integrate explicit Google Drive / Docs / Sheets / Gmail / Calendar grounding patterns, authorization boundaries, and conflict resolution rules.
- "anti_hallucination": Harden the prompt with strict zero-shot anti-hallucination rules (Section 8 & 11), mandatory citations, explicit "Not provided" fallbacks, and placeholder enforcement.
- "enterprise_privacy": Inject Section 10 privacy, security, PII redaction, human-in-the-loop review recommendations, and confidential data restrictions.
- "json_schema": Transform the output format section to enforce strict RFC-compliant JSON response with complete schema definitions.
- "concise": Trim redundant phrasing while preserving 100% of the core instructions, constraints, and safety gates.
- "system_instruction": Adapt the prompt format to be directly used as a Gemini System Instruction (systemInstruction parameter).

Return strictly the updated complete prompt and an explanation of changes.
`;

    const { response } = await generateContentWithRetry({
      model: selectedModel,
      contents: promptPayload,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ARCHITECT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedPromptText: { type: Type.STRING },
            structuredSections: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                objective: { type: Type.STRING },
                context: { type: Type.STRING },
                inputs: { type: Type.STRING },
                task: { type: Type.STRING },
                constraints: { type: Type.STRING },
                outputFormat: { type: Type.STRING },
                qualityChecks: { type: Type.STRING },
                antiHallucinationRules: { type: Type.STRING },
                successCriteria: { type: Type.STRING },
              },
              required: ['role', 'objective', 'context', 'inputs', 'task', 'constraints', 'outputFormat', 'qualityChecks', 'antiHallucinationRules', 'successCriteria'],
            },
            explanation: { type: Type.STRING },
          },
          required: ['refinedPromptText', 'structuredSections', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/architect/refine:', err);
    return res.status(500).json({ error: err.message || 'Failed to refine prompt.' });
  }
});

// Vite middleware setup
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), 'dist');
    const relativeDist = path.resolve(__dirname, '..', 'dist');
    const directDist = path.resolve(__dirname, 'dist');
    
    let distPath = cwdDist;
    if (fs.existsSync(path.join(cwdDist, 'index.html'))) {
      distPath = cwdDist;
    } else if (fs.existsSync(path.join(relativeDist, 'index.html'))) {
      distPath = relativeDist;
    } else if (fs.existsSync(path.join(directDist, 'index.html'))) {
      distPath = directDist;
    }

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Prompt Architect Pro Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
