import React, { useState, useEffect } from 'react';
import { 
  X, ShieldAlert, ShieldCheck, Dna, FileText, Share2, 
  Terminal, Copy, Check, Download, ExternalLink, Phone, CreditCard, Globe, Building2 
} from 'lucide-react';
import { ScamReport, ThreatIndicatorItem, ScamDnaProfile } from '../types';
import { ScamDnaCard } from './ScamDnaCard';

interface ReportDetailModalProps {
  reportId: string;
  onClose: () => void;
  onStartSimulation?: (report: ScamReport) => void;
  onViewInNetwork?: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  reportId,
  onClose,
  onStartSimulation,
  onViewInNetwork
}) => {
  const [data, setData] = useState<{
    report: ScamReport;
    indicators: ThreatIndicatorItem[];
    scamDna: ScamDnaProfile | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        const resData = await res.json();
        if (isMounted) setData(resData);
      } catch (err) {
        console.error('Error loading report:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReport();
    return () => { isMounted = false; };
  }, [reportId]);

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-100">{reportId}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  INTELLIGENCE BRIEF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full threat signature and forensic artifact dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="p-1.5 text-xs text-slate-400 hover:text-cyan-300 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 transition-colors flex items-center gap-1.5 px-2.5"
              title="Copy complete JSON Dossier"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{copied ? 'Copied' : 'JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              Retrieving report artifacts from SQLite registry...
            </div>
          ) : data && data.report ? (
            <>
              {/* Primary Score & Taxonomy Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Scam Taxonomy</span>
                  <h3 className="text-base font-bold text-slate-100">{data.report.scamCategory}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Source: <strong className="text-slate-200">{data.report.sourceType}</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Reported: {new Date(data.report.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      data.report.riskLevel === 'HIGH RISK'
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    }`}>
                      {data.report.riskLevel}
                    </span>
                    <span className="text-xl font-mono font-black text-slate-100">
                      {data.report.riskScore}/100
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                    Confidence: {(data.report.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Raw Message Box */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Raw Intercepted Message
                </span>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 leading-relaxed">
                  {data.report.rawMessage}
                </div>
              </div>

              {/* Scam DNA Card */}
              {data.scamDna && (
                <div>
                  <ScamDnaCard dna={data.scamDna} reportId={data.report.id} />
                </div>
              )}

              {/* Extracted Indicators Table */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Extracted Threat Indicators ({data.indicators.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.indicators.map((ind) => (
                    <div
                      key={ind.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded mr-2 border ${
                          ind.type === 'phone' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                          ind.type === 'upi' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                          ind.type === 'url' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
                          'text-blue-400 border-blue-500/30 bg-blue-500/10'
                        }`}>
                          {ind.type}
                        </span>
                        <span className="font-mono text-slate-200">{ind.value}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Seen {ind.timesSeen}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation Assessment */}
              <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/30 rounded-lg text-xs text-slate-300">
                <strong className="text-cyan-300 block mb-1 font-mono uppercase text-[11px]">
                  Analysis Assessment:
                </strong>
                {data.report.explanation}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400">
              Report not found or removed.
            </div>
          )}
        </div>

        {/* Footer actions */}
        {data && data.report && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                if (onViewInNetwork) onViewInNetwork(data.report.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect in Scam Network</span>
            </button>

            {onStartSimulation && data.report.riskScore >= 40 && (
              <button
                onClick={() => {
                  onClose();
                  onStartSimulation(data.report);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-950" />
                <span>Launch ScamBait Honeypot</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
