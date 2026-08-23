import React, { useState } from 'react';
import { PromptTemplate } from '../types';
import { PROMPT_TEMPLATES } from '../lib/templates';
import { X, Layers, ArrowRight, CheckCircle } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PromptTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Enterprise', 'Engineering', 'Analytics & Research', 'Google Workspace', 'Safety & Compliance', 'Productivity'];

  const filtered = selectedCategory === 'All'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Enterprise Prompt Blueprints</h2>
              <p className="text-xs text-slate-400">Curated real-world templates built according to Prompt Architect Pro standards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/90 transition flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {t.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition">
                  {t.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/70 text-[11px] text-slate-400 font-mono line-clamp-2">
                  "{t.roughPrompt}"
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Includes domain presets</span>
                <button
                  onClick={() => {
                    onSelectTemplate(t);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
                >
                  <span>Load Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
