import React, { useState } from 'react';
import { ReadinessScoreBreakdown } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

interface ReadinessMeterProps {
  score: number;
  breakdown: ReadinessScoreBreakdown;
  compact?: boolean;
}

export const ReadinessMeter: React.FC<ReadinessMeterProps> = ({ score, breakdown, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Threshold rules from specification:
  // 90-100: Ready, generate prompt immediately
  // 80-89: Generate prompt, label assumptions & placeholders, ask 1 follow-up
  // 50-79: Provisional outline, do not create supposedly final prompt, ask targeted questions
  // <50: Incomplete, ask focused questions
  const getThresholdTier = (val: number) => {
    if (val >= 90) {
      return {
        label: 'Production Ready (90-100%)',
        badge: 'Ready to Deploy',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        ringColor: '#10b981',
        desc: 'Sufficient context and constraints are defined. Full optimized prompt generated.',
      };
    }
    if (val >= 80) {
      return {
        label: 'High Readiness (80-89%)',
        badge: 'Optimized with Placeholders',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        ringColor: '#06b6d4',
        desc: 'Solid foundation. Missing details are encapsulated in standardized [PLACEHOLDERS].',
      };
    }
    if (val >= 50) {
      return {
        label: 'Provisional (50-79%)',
        badge: 'Clarification Needed',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        ringColor: '#f59e0b',
        desc: 'Missing key instructions or inputs. Answering questions will elevate to production grade.',
      };
    }
    return {
      label: 'Critical Gaps (<50%)',
      badge: 'Incomplete Request',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      ringColor: '#f43f5e',
      desc: 'Significant missing requirements. Please supply more context or answers below.',
    };
  };

  const tier = getThresholdTier(score);

  const categories = [
    { key: 'objectiveClarity', label: 'Objective Clarity', score: breakdown.objectiveClarity, max: 20, desc: 'Exact outcome, measurable goals, and purpose' },
    { key: 'necessaryContext', label: 'Necessary Context', score: breakdown.necessaryContext, max: 15, desc: 'Target audience, business/technical background' },
    { key: 'inputsAndSources', label: 'Inputs & Approved Sources', score: breakdown.inputsAndSources, max: 15, desc: 'Expected data feeds, docs, files, Workspace sources' },
    { key: 'taskInstructions', label: 'Task Instructions', score: breakdown.taskInstructions, max: 15, desc: 'Step-by-step logic, stages, and dependencies' },
    { key: 'constraints', label: 'Constraints & Scope', score: breakdown.constraints, max: 10, desc: 'Exclusions, length, tone, boundary rules' },
    { key: 'outputFormat', label: 'Output Structure', score: breakdown.outputFormat, max: 10, desc: 'Specific tables, fields, markdown/JSON schemas' },
    { key: 'successCriteria', label: 'Success Criteria', score: breakdown.successCriteria, max: 10, desc: 'Objective verification and quality checklist' },
    { key: 'riskPrivacyCompliance', label: 'Privacy & Security', score: breakdown.riskPrivacyCompliance, max: 5, desc: 'PII handling, audit trail, regulatory disclaimers' },
  ];

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial Score Gauge */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={tier.ringColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-100 tracking-tight">{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">Prompt Readiness Score</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tier.bg}`}>
                {tier.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">{tier.desc}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition border border-slate-700/60"
        >
          <span>{isExpanded ? 'Hide Breakdown' : '8-Factor Breakdown'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded 8-Factor Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-fadeIn">
          {categories.map((cat) => {
            const ratio = cat.score / cat.max;
            let statusColor = 'bg-emerald-500 text-emerald-300';
            let barBg = 'bg-emerald-500';
            if (ratio < 0.5) {
              statusColor = 'bg-rose-500 text-rose-300';
              barBg = 'bg-rose-500';
            } else if (ratio < 0.8) {
              statusColor = 'bg-amber-500 text-amber-300';
              barBg = 'bg-amber-500';
            }

            return (
              <div
                key={cat.key}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300 truncate">{cat.label}</span>
                  <span className="text-xs font-bold text-slate-200">
                    {cat.score} <span className="text-slate-500 font-normal text-[10px]">/ {cat.max}</span>
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 my-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barBg}`}
                    style={{ width: `${Math.min(100, Math.max(5, (cat.score / cat.max) * 100))}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
