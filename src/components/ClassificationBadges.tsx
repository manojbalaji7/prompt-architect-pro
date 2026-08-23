import React, { useState } from 'react';
import { CheckCircle, AlertCircle, HelpCircle, Copy, Check, Tag } from 'lucide-react';

interface ClassificationBadgesProps {
  knownInformation: string[];
  assumptions: string[];
  missingInformation: string[];
  placeholders: string[];
}

export const ClassificationBadges: React.FC<ClassificationBadgesProps> = ({
  knownInformation = [],
  assumptions = [],
  missingInformation = [],
  placeholders = [],
}) => {
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlaceholder(text);
    setTimeout(() => setCopiedPlaceholder(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* 4-column classification grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Known Information */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-emerald-900/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Known Information</h4>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
              {knownInformation.length} facts
            </span>
          </div>
          {knownInformation.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No explicit facts detected in request.</p>
          ) : (
            <ul className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
              {knownInformation.map((info, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. Assumptions (Labeled) */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-amber-900/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-amber-900/30">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Explicit Assumptions</h4>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
              {assumptions.length}
            </span>
          </div>
          {assumptions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">None. Zero unverified assumptions made.</p>
          ) : (
            <ul className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
              {assumptions.map((item, idx) => (
                <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. Missing Information */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-rose-900/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-rose-900/30">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Missing Information</h4>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/50">
              {missingInformation.length}
            </span>
          </div>
          {missingInformation.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">All essential requirements are satisfied.</p>
          ) : (
            <ul className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
              {missingInformation.map((item, idx) => (
                <li key={idx} className="text-xs text-rose-300/90 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-rose-500 font-bold">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Placeholders Banner */}
      {placeholders.length > 0 && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mr-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Standardized Placeholders:</span>
          </div>
          {placeholders.map((ph, idx) => (
            <button
              key={idx}
              onClick={() => handleCopy(ph)}
              className="group flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 border border-indigo-500/30 text-indigo-200 text-xs font-mono hover:border-indigo-400 hover:bg-indigo-900/40 transition"
              title="Click to copy placeholder"
            >
              <span>{ph}</span>
              {copiedPlaceholder === ph ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
