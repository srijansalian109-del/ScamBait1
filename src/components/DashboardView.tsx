import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, Database, 
  Terminal, Share2, ArrowRight, Activity, TrendingUp, 
  Layers, Lock, Play, Zap, FileText, CheckCircle2 
} from 'lucide-react';
import { ScamReport } from '../types';

interface DashboardStats {
  totalScamsAnalyzed: number;
  highRiskScams: number;
  suspiciousMessages: number;
  threatIndicatorsCount: number;
  activeSimulations: number;
  categoryCounts: { category: string; count: number }[];
  indicatorTypes: Record<string, number>;
  recentReports: any[];
}

interface DashboardViewProps {
  onAnalyzeClick: () => void;
  onOpenDemo: () => void;
  onSelectReport: (reportId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onAnalyzeClick,
  onOpenDemo,
  onSelectReport,
  onNavigateTab
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const total = stats?.totalScamsAnalyzed || 5;
  const highRisk = stats?.highRiskScams || 4;
  const suspicious = stats?.suspiciousMessages || 0;
  const lowRisk = Math.max(0, total - highRisk - suspicious);
  const indicatorsTotal = stats?.threatIndicatorsCount || 13;

  return (
    <div className="space-y-6">
      {/* Hero Cyber Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Subtle grid accent background */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-semibold">
                SCAMBAIT DEFENSE INTELLIGENCE ENGINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
              Proactive Scam Triage &amp; Controlled Baiting Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Multi-signal heuristic and AI analysis engine designed to deconstruct deceptive messages, synthesize unique Scam DNA fingerprints, extract indicators of compromise, and simulate safe counter-baiting honeypots.
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition-all shadow-sm"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>Launch Demo Scenarios</span>
            </button>
            <button
              onClick={onAnalyzeClick}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Analyze Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Scams */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Scams</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-100">
            {stats?.totalScamsAnalyzed ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span>Indexed in SQLite</span>
          </div>
        </div>

        {/* Card 2: High Risk */}
        <div className="bg-slate-900/90 border border-rose-900/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300">High-Risk Scams</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-black text-rose-400">
            {stats?.highRiskScams ?? '...'}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 font-mono">
            Critical threat level
          </div>
        </div>

        {/* Card 3: Suspicious */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-400">
            {stats?.suspiciousMessages ?? '0'}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
            Moderate risk signals
          </div>
        </div>

        {/* Card 4: Indicators */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Threat Indicators</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-purple-300">
            {stats?.threatIndicatorsCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Phones, UPI, Domains
          </div>
        </div>

        {/* Card 5: Active ScamBaits */}
        <div className="col-span-2 md:col-span-1 bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">Honeypot Baits</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {stats?.activeSimulations ?? '1'}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            Simulations recorded
          </div>
        </div>
      </div>

      {/* Cyber Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Scam Categories Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                SCAM TAXONOMY DISTRIBUTION
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
          </div>

          <div className="space-y-3.5">
            {(stats?.categoryCounts && stats.categoryCounts.length > 0 ? stats.categoryCounts : [
              { category: 'Bank Impersonation', count: 4 },
              { category: 'Utility & Bill Fraud', count: 3 },
              { category: 'Parcel & Delivery Scam', count: 2 },
              { category: 'Part-Time Task Scam', count: 2 },
              { category: 'Lottery & Prize Scam', count: 1 }
            ]).map((item, idx) => {
              const maxCount = Math.max(...(stats?.categoryCounts?.map(c => c.count) || [4]));
              const pct = Math.max(10, (item.count / Math.max(1, maxCount)) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.category}</span>
                    <span className="font-mono text-cyan-400">{item.count} incident(s)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Threat Indicators Collected by Type (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  HARVESTED INDICATORS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Suspicious Phone Numbers', count: stats?.indicatorTypes?.phone || 4, color: 'text-amber-400', bg: 'bg-amber-500' },
                { label: 'Fraudulent UPI IDs', count: stats?.indicatorTypes?.upi || 3, color: 'text-purple-400', bg: 'bg-purple-500' },
                { label: 'Phishing URLs & APKs', count: stats?.indicatorTypes?.url || 4, color: 'text-cyan-400', bg: 'bg-cyan-500' },
                { label: 'Impersonated Organizations', count: stats?.indicatorTypes?.org || 4, color: 'text-blue-400', bg: 'bg-blue-500' },
              ].map((ind, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ind.bg}`} />
                    <span className="text-slate-300">{ind.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${ind.color}`}>
                    {ind.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Threat Network Coverage</span>
            <button
              onClick={() => onNavigateTab('network')}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline flex items-center gap-1"
            >
              <span>Explore Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Scam Reports Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              RECENT THREAT INVESTIGATIONS
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(stats?.recentReports && stats.recentReports.length > 0 ? stats.recentReports : []).map((rep) => {
            const isHigh = rep.riskLevel === 'HIGH RISK';

            return (
              <div
                key={rep.id}
                onClick={() => onSelectReport(rep.id)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                      {rep.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isHigh
                        ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}>
                      {rep.riskLevel} · {rep.riskScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mb-1">
                    {rep.scamCategory}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {rep.rawMessage}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Channel: {rep.sourceType}</span>
                  <span className="text-cyan-400 group-hover:underline">Inspect Brief &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
