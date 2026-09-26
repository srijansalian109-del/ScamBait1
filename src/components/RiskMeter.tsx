import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { ScoreRuleBreakdown } from '../types';

interface RiskMeterProps {
  score: number;
  riskLevel: 'LOW' | 'SUSPICIOUS' | 'HIGH RISK';
  confidence: number;
  breakdown: ScoreRuleBreakdown[];
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  riskLevel,
  confidence,
  breakdown
}) => {
  const isHigh = riskLevel === 'HIGH RISK';
  const isSuspicious = riskLevel === 'SUSPICIOUS';
  const isLow = riskLevel === 'LOW';

  const levelColor = isHigh
    ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
    : isSuspicious
    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  const gaugeBarColor = isHigh
    ? 'from-amber-500 to-rose-500'
    : isSuspicious
    ? 'from-emerald-500 to-amber-500'
    : 'from-emerald-600 to-emerald-400';

  const LevelIcon = isHigh ? ShieldAlert : isSuspicious ? AlertTriangle : ShieldCheck;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      {/* Top Banner & Main Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${levelColor} flex items-center justify-center`}>
            <LevelIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-mono font-extrabold tracking-tight px-2.5 py-0.5 rounded border ${levelColor}`}>
                {riskLevel}
              </span>
              <span className="text-2xl font-mono font-black text-slate-100">
                {score}<span className="text-sm text-slate-500 font-normal">/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Confidence: <strong className="text-slate-200">{(confidence * 100).toFixed(0)}%</strong></span>
              <span className="text-slate-600">·</span>
              <span>Classification Engine v2.4</span>
            </p>
          </div>
        </div>

        {/* Legend / Range Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 0-29 Low
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> 30-59 Suspicious
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> 60+ High
          </span>
        </div>
      </div>

      {/* Progress Gauge */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
          <span>0 (Safe Baseline)</span>
          <span className="font-semibold text-slate-200">Calculated Threat Index: {score}</span>
          <span>100 (Critical Threat)</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gaugeBarColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
          />
        </div>
      </div>

      {/* Explainable Scoring Breakdown */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
              Explainable Risk Score Breakdown
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Prototype Heuristic Evaluation Rules
          </span>
        </div>

        {breakdown.length === 0 ? (
          <div className="text-xs text-slate-400 py-2">
            No specific penalty rules were triggered. Baseline evaluation applies.
          </div>
        ) : (
          <div className="space-y-2">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-900/60 border border-slate-800/60"
              >
                <div className="flex-1 pr-3">
                  <span className="font-medium text-slate-200">{item.rule}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded text-xs">
                    +{item.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
          <span>Formula: Sum of weighted signals capped at 100</span>
          <span className="font-mono">Total Points Applied: {score}</span>
        </div>
      </div>
    </div>
  );
};
