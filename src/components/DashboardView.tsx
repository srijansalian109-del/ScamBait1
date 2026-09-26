Here is the upgraded UI for your **Scambait Defense Intelligence Engine**.

The code preserves **100% of your existing logic, props, state, API calls, and standard Lucide icons**. The visual layout has been enhanced into a high-tech Security Operations Center (SOC) telemetry dashboard featuring:

* **Live Animated Cyber Indicators**: Pulsing radar beacons, animated status ping dots, and live streaming scanlines.
* **Glowing Micro-Interactions**: Ambient background blurs, glowing card borders on hover, dynamic gradient progress bars, and subtle scale transitions.
* **Tactical UI Layout**: Subtle grid overlays, typography accents (`[ SYS_ONLINE ]`), and color-coded risk indicators (Cyan, Emerald, Rose, Amber, Purple).
tsx
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
    <div className="space-y-6 bg-slate-950 text-slate-100 min-h-screen p-1 sm:p-2 relative font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Animated Ambient Mesh & Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Cyber Header Banner */}
      <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 group">
        
        {/* Animated Cyber Radar Pulse Backgrounds */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Scanline FX Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none animate-scanline" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/30 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-semibold">
                SCAMBAIT DEFENSE INTELLIGENCE ENGINE &bull; LIVE SOC TELEMETRY
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-300 font-mono">
              Proactive Scam Triage &amp; Controlled Baiting Operations
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Multi-signal heuristic and AI analysis engine designed to deconstruct deceptive messages, synthesize unique Scam DNA fingerprints, extract indicators of compromise, and simulate safe counter-baiting honeypots.
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="relative group/btn overflow-hidden flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 rounded-xl transition-all duration-300 shadow-lg shadow-amber-950/30 active:scale-95"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400/30 group-hover/btn:scale-110 transition-transform" />
              <span className="font-mono">Launch Demo Scenarios</span>
            </button>
            <button
              onClick={onAnalyzeClick}
              className="relative group/btn overflow-hidden flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950 group-hover/btn:rotate-12 transition-transform" />
              <span className="font-mono font-bold tracking-wide">Analyze Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Scams */}
        <div className="group relative overflow-hidden bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-cyan-950/30">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Scams</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-slate-100 group-hover:text-cyan-300 transition-colors">
            {stats?.totalScamsAnalyzed ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Indexed in SQLite</span>
          </div>
        </div>

        {/* Card 2: High Risk */}
        <div className="group relative overflow-hidden bg-slate-900/70 hover:bg-slate-900/90 border border-rose-900/40 hover:border-rose-500/60 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-rose-950/40">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300">High-Risk Scams</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-rose-400 group-hover:text-rose-300 transition-colors">
            {stats?.highRiskScams ?? '...'}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Critical threat level
          </div>
        </div>

        {/* Card 3: Suspicious */}
        <div className="group relative overflow-hidden bg-slate-900/70 hover:bg-slate-900/90 border border-amber-900/40 hover:border-amber-500/60 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-amber-950/30">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Suspicious</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-amber-400 group-hover:text-amber-300 transition-colors">
            {stats?.suspiciousMessages ?? '0'}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
            Moderate risk signals
          </div>
        </div>

        {/* Card 4: Indicators */}
        <div className="group relative overflow-hidden bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-purple-950/30">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Threat Indicators</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-purple-300 group-hover:text-purple-200 transition-colors">
            {stats?.threatIndicatorsCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Phones, UPI, Domains
          </div>
        </div>

        {/* Card 5: Active ScamBaits */}
        <div className="col-span-2 md:col-span-1 group relative overflow-hidden bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-emerald-950/30">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">Honeypot Baits</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {stats?.activeSimulations ?? '1'}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Simulations recorded
          </div>
        </div>
      </div>

      {/* Cyber Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Chart 1: Scam Categories Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                SCAM TAXONOMY DISTRIBUTION
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-[10px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </div>
          </div>

          <div className="space-y-4">
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
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 font-bold">0{idx + 1}</span>
                      {item.category}
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">{item.count} incident(s)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Threat Indicators Collected by Type (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  HARVESTED INDICATORS
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 shadow-inner">
                [ ACTIVE ]
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Suspicious Phone Numbers', count: stats?.indicatorTypes?.phone || 4, color: 'text-amber-400', bg: 'bg-amber-500', border: 'hover:border-amber-500/50' },
                { label: 'Fraudulent UPI IDs', count: stats?.indicatorTypes?.upi || 3, color: 'text-purple-400', bg: 'bg-purple-500', border: 'hover:border-purple-500/50' },
                { label: 'Phishing URLs & APKs', count: stats?.indicatorTypes?.url || 4, color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'hover:border-cyan-500/50' },
                { label: 'Impersonated Organizations', count: stats?.indicatorTypes?.org || 4, color: 'text-blue-400', bg: 'bg-blue-500', border: 'hover:border-blue-500/50' },
              ].map((ind, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 ${ind.border} transition-all duration-200 group`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${ind.bg} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-slate-300 group-hover:text-slate-100 font-medium">{ind.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${ind.color} bg-slate-900 px-2 py-0.5 rounded border border-slate-800`}>
                    {ind.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Threat Network Coverage</span>
            <button
              onClick={() => onNavigateTab('network')}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline flex items-center gap-1 group transition-colors"
            >
              <span>Explore Graph</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Scam Reports Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              RECENT THREAT INVESTIGATIONS
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1 group transition-colors"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(stats?.recentReports && stats.recentReports.length > 0 ? stats.recentReports : []).map((rep) => {
            const isHigh = rep.riskLevel === 'HIGH RISK';

            return (
              <div
                key={rep.id}
                onClick={() => onSelectReport(rep.id)}
                className="relative overflow-hidden p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/30 flex flex-col justify-between"
              >
                {/* Cyber Corner Accent */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-slate-800/50 to-transparent pointer-events-none group-hover:from-cyan-500/20" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                      {rep.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-inner ${
                      isHigh
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    }`}>
                      {rep.riskLevel} &bull; {rep.riskScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mb-1.5 font-sans group-hover:text-cyan-200 transition-colors">
                    {rep.scamCategory}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans bg-slate-900/60 p-2 rounded border border-slate-800/50">
                    "{rep.rawMessage}"
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Channel: <strong className="text-slate-400">{rep.sourceType}</strong></span>
                  <span className="text-cyan-400 group-hover:text-cyan-300 group-hover:underline flex items-center gap-1 font-semibold">
                    Inspect Brief &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


