import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, ShieldAlert, ShieldCheck, 
  Terminal, Sparkles, Database, Share2, CheckCircle2, 
  Trash2, Phone, CreditCard, Globe, Building2, Tag, 
  Check, Copy, ArrowRight, Play, RefreshCw 
} from 'lucide-react';
import { AnalysisResult, ThreatEntity } from '../types';
import { DEMO_SCENARIOS, DemoScenario } from '../data/demoScenarios';
import { RiskMeter } from './RiskMeter';
import { ScamDnaCard } from './ScamDnaCard';

interface DetectorViewProps {
  initialText?: string;
  initialSourceType?: string;
  onStartSimulation: (message: string, category: string, reportId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onViewReport: (reportId: string) => void;
}

export const DetectorView: React.FC<DetectorViewProps> = ({
  initialText = '',
  initialSourceType = 'SMS',
  onStartSimulation,
  onNavigateTab,
  onViewReport
}) => {
  const [message, setMessage] = useState(initialText);
  const [sourceType, setSourceType] = useState(initialSourceType);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setErrorMsg('Please paste or type a suspicious message to analyze.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setIsSavedToDb(false);
    setSavedReportId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          sourceType
        })
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data: AnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg('Failed to complete analysis. Ensure server is active.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectScenario = (scen: DemoScenario) => {
    setMessage(scen.message);
    setSourceType(scen.sourceType);
    setAnalysis(null);
    setIsSavedToDb(false);
    setErrorMsg(null);
  };

  const handleSaveToDatabase = async () => {
    if (!analysis) return;

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          rawMessage: message,
          riskScore: analysis.riskScore,
          riskLevel: analysis.riskLevel,
          scamCategory: analysis.scamCategory,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          tactics: analysis.detectedTactics,
          entities: analysis.extractedEntities,
          scamDna: analysis.scamDna
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSavedToDb(true);
        setSavedReportId(data.reportId);
      }
    } catch (err) {
      console.error('Error saving report to DB:', err);
    }
  };

  const copyEntityValue = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedEntity(val);
    setTimeout(() => setCopiedEntity(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                MULTI-SIGNAL SCAM DETECTOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                HEURISTIC + GEMINI AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Submit raw SMS, WhatsApp alerts, phishing emails, or social media recruitment messages for threat deconstruction.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Demo Scenarios Selector */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
            <Play className="w-3.5 h-3.5 fill-amber-400/20" />
            <span>SELECT PRESET DEMO SCENARIO (FOR HACKATHON DEMO)</span>
          </div>
          <span className="text-[11px] text-slate-500">Auto-populates sample threats</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEMO_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
            >
              <span className="text-[10px] font-mono text-amber-400 block mb-1">
                {scen.tag}
              </span>
              <span className="text-xs font-medium text-slate-200 group-hover:text-amber-200 line-clamp-1 block">
                {scen.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
        {/* Source Channel Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Message Channel:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['SMS', 'WhatsApp', 'Email', 'Social Media'].map((src) => (
                <button
                  key={src}
                  onClick={() => setSourceType(src)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    sourceType === src
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <button
              onClick={() => { setMessage(''); setAnalysis(null); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 self-end transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Input</span>
            </button>
          )}
        </div>

        {/* Big Textarea */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Paste suspicious message here (e.g., Bank KYC alert, Electricity disconnection threat, FedEx customs fee, or Telegram job offer)..."
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-500 font-mono">
            Analyzes urgency patterns, extortion threats, payment handles, and known database indicators.
          </span>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !message.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Multi-Signal Analysis...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-slate-950" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
          {/* Risk Meter Component */}
          <RiskMeter
            score={analysis.riskScore}
            riskLevel={analysis.riskLevel}
            confidence={analysis.confidence}
            breakdown={analysis.scoreBreakdown}
          />

          {/* Primary Forensic Assessment & Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 cols: Reasons & Qualitative Findings */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    FORENSIC THREAT ASSESSMENT
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    Category: <strong className="text-cyan-300">{analysis.scamCategory}</strong>
                  </span>
                  {analysis.aiPowered ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                      GEMINI DEEP ANALYSIS
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      LOCAL RULE-BASED ENGINE
                    </span>
                  )}
                </div>
              </div>

              {/* Explanation Quote */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed font-sans">
                {analysis.explanation}
              </div>

              {/* Why the message is suspicious (Reasons List) */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Observed Red Flags &amp; Tactics:
                </h4>
                <div className="space-y-1.5">
                  {analysis.reasons.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs py-1.5 px-3 rounded bg-slate-950/70 border border-slate-800/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200 font-medium">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Deep Insights if available */}
              {analysis.aiInsights && (
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/30 rounded-lg space-y-2 text-xs">
                  <span className="font-mono text-[11px] font-bold text-cyan-300 uppercase block">
                    Advanced Social Engineering Profile:
                  </span>
                  {analysis.aiInsights.psychologicalTriggers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-[11px]">Psychological Triggers:</span>
                      {analysis.aiInsights.psychologicalTriggers.map((t, idx) => (
                        <span key={idx} className="text-[11px] text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {analysis.aiInsights.victimTargeting && (
                    <p className="text-slate-300 text-[11px]">
                      <strong className="text-slate-400">Target Demographic:</strong> {analysis.aiInsights.victimTargeting}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 col: Extracted Entities List */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      EXTRACTED THREAT ARTIFACTS
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    ({analysis.extractedEntities.length})
                  </span>
                </div>

                {analysis.extractedEntities.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-6 text-center">
                    No explicit phone numbers, UPI IDs, or external domains detected in payload.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analysis.extractedEntities.map((ent, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          ent.isKnownThreat
                            ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                              {ent.type}
                            </span>
                            {ent.isKnownThreat && (
                              <span className="text-[9px] font-mono bg-rose-500/20 text-rose-400 px-1 rounded border border-rose-500/40 font-bold">
                                PRIOR THREAT
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-cyan-300 font-semibold truncate block">
                            {ent.value}
                          </span>
                        </div>

                        <button
                          onClick={() => copyEntityValue(ent.value)}
                          className="text-slate-400 hover:text-cyan-300 p-1"
                          title="Copy value"
                        >
                          {copiedEntity === ent.value ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 font-mono">
                Indexed for Threat Registry Search
              </div>
            </div>
          </div>

          {/* Scam DNA Fingerprint Card */}
          <ScamDnaCard
            dna={analysis.scamDna}
            onViewSimilar={(repId) => onViewReport(repId)}
          />

          {/* Action Decision Matrix Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-slate-200">
                RECOMMENDED OPERATIONAL RESPONSE:
              </span>
              <p className="text-xs text-slate-400">
                {analysis.riskLevel === 'HIGH RISK'
                  ? 'High risk threat detected. Deploy safe ScamBait AI honeypot to extract secondary threat infrastructure.'
                  : 'Suspicious payload. Log indicators to database and alert user against clicking any external links.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Save to DB button */}
              <button
                onClick={handleSaveToDatabase}
                disabled={isSavedToDb}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 rounded-lg transition-colors border border-slate-700"
              >
                {isSavedToDb ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved ({savedReportId})</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save to Threat DB</span>
                  </>
                )}
              </button>

              {/* Start ScamBait Simulation button */}
              <button
                onClick={() => onStartSimulation(message, analysis.scamCategory, savedReportId || undefined)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>START SCAMBAIT SIMULATION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
