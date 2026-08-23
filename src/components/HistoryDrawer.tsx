import React, { useState } from 'react';
import { PromptHistoryItem } from '../types';
import { X, History, Trash2, ArrowRight, Sparkles, ShieldCheck, Copy, Check, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptHistoryItem[];
  onLoadItem: (item: PromptHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onClearHistory,
  onDeleteItem,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (e: React.MouseEvent, item: PromptHistoryItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.optimizedPrompt);
    setCopiedId(item.id);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Session Prompt Vault</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition"
                title="Clear all saved prompts"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">No prompts saved yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Prompts engineered or audited during this session will automatically be stored here for instant restoration and testing.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2.5 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      item.mode === 'review'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {item.mode === 'review' ? 'Audit Mode' : 'Architecture'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Score: {item.readinessScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition ml-1"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-200 line-clamp-1">
                  {item.title || 'Untitled Prompt'}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 font-mono bg-slate-900/60 p-2 rounded border border-slate-900 leading-relaxed">
                  {item.roughInput}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <button
                    onClick={(e) => handleCopy(e, item)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onLoadItem(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition cursor-pointer"
                  >
                    <span>Load into {item.mode === 'review' ? 'Review' : 'Studio'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
