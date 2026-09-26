import React from 'react';
import { Play, X, Shield, ArrowRight, Phone, CreditCard, Globe } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../data/demoScenarios';

interface DemoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoSelectorModal: React.FC<DemoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Play className="w-4 h-4 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                HACKATHON DEMO SCENARIOS
              </h3>
              <p className="text-xs text-slate-400">
                Select a realistic threat scenario to test the full end-to-end triage and baiting pipeline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          {DEMO_SCENARIOS.map((scen, idx) => (
            <div
              key={scen.id}
              onClick={() => {
                onSelectScenario(scen);
                onClose();
              }}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 cursor-pointer transition-all duration-200 group flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                    {scen.sourceType}
                  </span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    {idx + 1}. {scen.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                  {scen.summary}
                </p>
                <div className="text-[11px] font-mono text-slate-500 line-clamp-1 italic bg-slate-900/40 p-1.5 rounded">
                  &ldquo;{scen.message}&rdquo;
                </div>
              </div>

              <div className="self-center shrink-0">
                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-400 text-slate-400 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Flow: Paste &rarr; Analyze &rarr; Risk Score &rarr; Start ScamBait &rarr; Extract Intel &rarr; Scam DNA</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
