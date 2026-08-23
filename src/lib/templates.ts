import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-workspace-exec-summary',
    title: 'Google Workspace Executive Briefing',
    category: 'Google Workspace',
    description: 'Synthesizes meeting notes, action items, and project docs from Google Drive & Docs into a crisp executive briefing.',
    roughPrompt: 'I need a prompt that reads my team meeting notes in Google Docs and project tracker in Google Sheets, then creates a 1-page executive summary for our VP. It needs key milestones, roadblocks, and next week priorities. Keep it grounded so it doesn\'t make up dates or status.',
    contextPreset: {
      audience: 'VP of Engineering & Product Leadership',
      deliverableType: '1-Page Markdown Briefing with Action Matrix',
      workspaceGrounding: true,
      confidentiality: 'Internal Confidential',
    },
  },
  {
    id: 'template-financial-audit',
    title: 'Enterprise Financial Variance Auditor',
    category: 'Enterprise',
    description: 'Analyzes quarterly budget discrepancies with strict anti-hallucination, mandatory citations, and human audit flags.',
    roughPrompt: 'Create a prompt for Gemini to compare Q3 vs Q4 financial reports. It must flag line items with >10% variance, explain potential causes based solely on the provided notes, and calculate dollar differences without making up figures.',
    contextPreset: {
      audience: 'CFO & Internal Audit Committee',
      deliverableType: 'Variance Analysis Table & Discrepancy Risk Assessment',
      confidentiality: 'Strictly Confidential / Regulatory',
    },
  },
  {
    id: 'template-code-review-security',
    title: 'Production Code & Security Reviewer',
    category: 'Engineering',
    description: 'Performs static code review, vulnerability assessment (OWASP Top 10), and strict compliance checks.',
    roughPrompt: 'Make an expert code review prompt for TypeScript and Go backend services. It should check for OWASP vulnerabilities, race conditions, missing input sanitization, and suggest drop-in code fixes with before/after blocks.',
    contextPreset: {
      audience: 'Senior Software Engineers & Security Architects',
      deliverableType: 'Security Finding Report with Unified Diff Snippets',
      confidentiality: 'Internal Engineering',
    },
  },
  {
    id: 'template-healthcare-protocol',
    title: 'Clinical Protocol Extraction & Synthesis',
    category: 'Safety & Compliance',
    description: 'Extracts guidelines and dosage recommendations from clinical papers with mandatory disclaimers and human physician sign-off.',
    roughPrompt: 'I have clinical trial study PDFs and want Gemini to extract dosage tables, patient inclusion criteria, and adverse reactions. It must have zero hallucination, cite exact paragraph numbers, and include clear warnings that human physician review is required.',
    contextPreset: {
      audience: 'Clinical Research Coordinators',
      deliverableType: 'Structured Protocol Extraction Matrix',
      confidentiality: 'HIPAA Compliant / Clinical Data',
    },
  },
  {
    id: 'template-customer-escalation',
    title: 'Tier-3 Support Escalation Resolution',
    category: 'Productivity',
    description: 'Transforms raw customer bug logs, tickets, and sentiment into technical root cause briefs and empathetic customer replies.',
    roughPrompt: 'Write a prompt that takes an angry enterprise customer ticket, server logs, and Jira issue, then writes both a technical bug summary for developers and a polite, calm response for the account manager to send.',
    contextPreset: {
      audience: 'Customer Success Leads & DevOps Engineering',
      deliverableType: 'Two-part deliverable: Technical Post-mortem & Client Email',
    },
  },
  {
    id: 'template-market-research-synthesis',
    title: 'Competitive Market Research Synthesizer',
    category: 'Analytics & Research',
    description: 'Compares competitor features, pricing models, and market positioning with factual verification and gap identification.',
    roughPrompt: 'We need to analyze 5 competitor SaaS products. Prompt Gemini to create a feature comparison matrix, pricing breakdown, and competitive positioning map using only approved analyst reports and official pricing pages.',
    contextPreset: {
      audience: 'Product Strategy & Marketing Directors',
      deliverableType: 'Competitive Matrix & Strategic Recommendation Memo',
    },
  },
];
