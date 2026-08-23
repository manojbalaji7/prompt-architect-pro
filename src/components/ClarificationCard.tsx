import React, { useState } from 'react';
import { HelpCircle, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

interface ClarificationCardProps {
  questions: string[];
  provisionalOutline?: string;
  onAnswerAndRefine: (answers: string) => void;
  isLoading: boolean;
  onForceGenerate: () => void;
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({
  questions = [],
  provisionalOutline,
  onAnswerAndRefine,
  isLoading,
  onForceGenerate,
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generalNotes, setGeneralNotes] = useState('');

  const handleAnswerChange = (index: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [index]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let aggregated = '';
    questions.forEach((q, idx) => {
      if (answers[idx]?.trim()) {
        aggregated += `\n- Answer to "${q}": ${answers[idx].trim()}`;
      }
    });
    if (generalNotes.trim()) {
      aggregated += `\n- Additional details: ${generalNotes.trim()}`;
    }
    onAnswerAndRefine(aggregated);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/90 border border-amber-500/30 p-5 shadow-xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200">
              Clarification Required for Production Prompt
            </h3>
            <p className="text-xs text-slate-400">
              According to the Prompt Architect policy, answering these targeted questions will elevate your prompt readiness to 90%+.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onForceGenerate}
          disabled={isLoading}
          className="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-600 hover:decoration-slate-400 whitespace-nowrap"
        >
          Generate with Placeholders anyway
        </button>
      </div>

      {provisionalOutline && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Provisional Architecture Outline:
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {provisionalOutline}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="space-y-2.5">
          {questions.map((question, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 focus-within:border-amber-500/50 transition">
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{question}</span>
              </label>
              <input
                type="text"
                value={answers[idx] || ''}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Answers are merged into the prompt specification without assuming arbitrary details.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Re-Architecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Elevate & Generate Prompt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
