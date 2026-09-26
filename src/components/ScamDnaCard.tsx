import React from 'react';
import { Dna, AlertCircle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ScamDnaProfile } from '../types';

interface ScamDnaCardProps {
  dna: ScamDnaProfile;
  reportId?: string;
  onViewSimilar?: (reportId: string) => void;
}

export const ScamDnaCard: React.FC<ScamDnaCardProps> = ({
  dna,
  reportId,
  onViewSimilar
}) => {
  // Generate a deterministic visual matrix/glyph from DNA code & hash
  const seedString = (dna.dnaCode || 'DNA-GEN-0000') + (dna.primaryIdentifier || '');
  const glyphBlocks = Array.from({ length: 16 }).map((_, idx) => {
    const charCode = seedString.charCodeAt(idx % seedString.length) || 42;
    const active = (charCode * (idx + 3)) % 3 !== 0;
    const isSpecial = (charCode * (idx + 7)) % 5 === 0;
    return { active, isSpecial };
  });

  return (
    <div className="bg-slate-900/80 border border-cyan-900/40 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm">
      {/* Background cyber grid detail */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-300">
              SCAM DNA FINGERPRINT
            </h4>
            <p className="text-[11px] text-slate-400">
              Heuristic &amp; behavioral signature identifier
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            {dna.dnaCode || `DNA-${reportId || 'PENDING'}`}
          </span>
        </div>
      </div>

      {/* Main Body with Visual Matrix + Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        {/* Visual Glyph Matrix */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider">
            SYNTHETIC GLYPH
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-900 rounded border border-cyan-950">
            {glyphBlocks.map((block, idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                  block.active
                    ? block.isSpecial
                      ? 'bg-rose-500 shadow-sm shadow-rose-500/30'
                      : 'bg-cyan-400 shadow-sm shadow-cyan-400/30'
                    : 'bg-slate-800/50'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] font-mono text-cyan-400/80 mt-2 truncate max-w-[120px]">
            {dna.similarityHash || 'SIG-PATTERN-MATCH'}
          </div>
        </div>

        {/* Tactical Parameters */}
        <div className="sm:col-span-2 space-y-2.5 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Primary Taxonomy: </span>
            <span className="font-semibold text-slate-200">{dna.category}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px]">Primary Identifier: </span>
            <span className="font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded text-[11px]">
              {dna.primaryIdentifier || 'Unassigned'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block mb-1.5">Detected Tactics Signature:</span>
            <div className="flex flex-wrap gap-1.5">
              {(dna.tactics && dna.tactics.length > 0 ? dna.tactics : ['Behavioral Lure']).map((tac, i) => (
                <span
                  key={i}
                  className="text-[11px] text-slate-300 bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded"
                >
                  {tac}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similarity Match Notice */}
      {dna.similarityScore && dna.similarityScore > 35 ? (
        <div className="mt-3 pt-3 border-t border-slate-800/90 flex items-start gap-2.5 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/30">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-cyan-200">
                Possible related scam pattern detected
              </span>
              <span className="font-mono font-bold text-cyan-300 bg-cyan-900/60 px-1.5 py-0.5 rounded text-[10px]">
                {dna.similarityScore}% SIMILARITY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Correlated with prior incident{' '}
              <span className="font-mono text-cyan-300 font-semibold">{dna.similarReportId || 'SB-2026-00101'}</span>.
            </p>
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              *Prototype similarity metric based on tactic taxonomy and entity overlap, not a verified identity match.
            </p>
          </div>
          {dna.similarReportId && onViewSimilar && (
            <button
              onClick={() => onViewSimilar(dna.similarReportId!)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium self-center"
            >
              View
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>DNA Registration: Active</span>
          <span>Indexed in Threat Repository</span>
        </div>
      )}
    </div>
  );
};
