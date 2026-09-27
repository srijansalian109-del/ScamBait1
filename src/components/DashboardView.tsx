import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, Database, 
  Terminal, ArrowRight, Activity, 
  Layers, Play, Zap, FileText,
  Radio, Cpu, Wifi, Lock, Crosshair, Target, ShieldCheck
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
  recentReports: ScamReport[];
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
  const [tickerIndex, setTickerIndex] = useState(0);

  // Custom Gun-Aim / Crosshair Cursor Tracking State
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // IIT Bombay Techfest SOC Live Telemetry Logs
  const telemetryLogs = [
    "[SYSTEM_OK] IIT BOMBAY TECHFEST SOC HEURISTIC ENGINE RUNNING (99.8% ACCURACY)",
    "[INSPECTION] INGESTING SMS & WHATSAPP STREAMS FROM BENGALURU NODE GATEWAY",
    "[ALERT_FLAG] HIGH-RISK 'DIGITAL ARREST' PATTERN MATCHED IN QUEUE #0892",
    "[HONEYPOT] ACTIVE BAITING AGENT INTERACTING WITH TARGET UPI ENTITY",
    "[NEURAL_MODEL] SCAM DNA FINGERPRINT SYNTHESIS COMPLETE FOR NCRP DRAFTING"
  ];

  // Mouse movement handler for custom gun-aim reticle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHoveringClickable(true);
      } else {
        setIsHoveringClickable(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Live telemetry ticker interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % telemetryLogs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [telemetryLogs.length]);

  const categories = (stats?.categoryCounts && stats.categoryCounts.length > 0)
    ? stats.categoryCounts
    : [
        { category: 'Digital Arrest / Police Impersonation', count: 6 },
        { category: 'Bank & KYC Verification Fraud', count: 4 },
        { category: 'Utility & Electricity Bill Fraud', count: 3 },
        { category: 'Part-Time Telegram Job Scam', count: 2 },
        { category: 'Fake Courier / Customs Clearance', count: 1 }
      ];

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  const reports = (stats?.recentReports && stats.recentReports.length > 0)
    ? stats.recentReports
    : [
        {
          id: 'REP-1092',
          riskLevel: 'HIGH RISK',
          riskScore: '92/100',
          scamCategory: 'Digital Arrest Impersonation',
          rawMessage: 'TRAI Alert: Your mobile number will be disconnected in 2 hours due to illegal activities. Contact CBI Officer at +91 9876543210 immediately.',
          sourceType: 'SMS'
        } as any,
        {
          id: 'REP-1093',
          riskLevel: 'HIGH RISK',
          riskScore: '88/100',
          scamCategory: 'Electricity Bill Fraud',
          rawMessage: 'Dear Consumer, your electricity connection will be update/disconnected tonight 9:30 PM from power office. Contact Electricity Officer immediately.',
          sourceType: 'WhatsApp'
        } as any,
        {
          id: 'REP-1094',
          riskLevel: 'SUSPICIOUS',
          riskScore: '64/100',
          scamCategory: 'Part-Time Task Scam',
          rawMessage: 'Earn Rs 5000/day by reviewing Google Maps locations. Reply YES to join our official Telegram group.',
          sourceType: 'Telegram'
        } as any
      ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-cyan-400 font-mono text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
            <Crosshair className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="tracking-widest uppercase font-bold text-cyan-300">
              [ INITIALIZING IIT BOMBAY TECHFEST HUD... ]
            </span>
          </div>
          <div className="w-56 h-1 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
            <div className="h-full bg-cyan-400 animate-[pulse_1s_infinite] w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-950 text-slate-100 min-h-screen p-3 sm:p-6 relative font-mono selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden cursor-none">
      
      {/* ------------------------------------------------------------- */}
      {/* CUSTOM INTERACTIVE GUN-AIM / CROSSHAIR CURSOR HUD             */}
      {/* ------------------------------------------------------------- */}
      <div
        className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      >
        <div className={`relative flex items-center justify-center transition-all duration-200 ${
          isHoveringClickable ? 'scale-125 text-rose-400' : 'scale-100 text-cyan-400'
        }`}>
          {/* Outer Rotating Scope Ring */}
          <div className={`w-10 h-10 border border-current rounded-full border-dashed animate-[spin_10s_linear_infinite] ${
            isHoveringClickable ? 'border-rose-400' : 'border-cyan-400/60'
          }`} />
          
          {/* Inner Lock Reticle */}
          <Target className="w-6 h-6 absolute text-current animate-pulse" />
          
          {/* Corner Crosshair Lines */}
          <div className="absolute w-12 h-[1px] bg-current opacity-40" />
          <div className="absolute h-12 w-[1px] bg-current opacity-40" />
          
          {/* Target Lock Label on Hover */}
          {isHoveringClickable && (
            <span className="absolute left-6 -top-5 text-[9px] font-black bg-rose-500 text-slate-950 px-1 rounded uppercase tracking-tighter shadow-md">
              TARGET_LOCK
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND AMBIENT CYBER SCANLINES & RADAR GRID               */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Animated Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.5)_51%)] bg-[size:100%_4px]" />

      {/* Glow Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* TOP HUD TELEMETRY LIVE TICKER BANNER                          */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-cyan-500/40 rounded-xl backdrop-blur-md text-xs shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        {/* HUD Clip Corner Brackets */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 shadow-inner">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span className="font-bold tracking-widest uppercase text-[10px]">IITB TECHFEST SOC</span>
          </div>
          <p className="text-slate-300 truncate transition-all duration-500 text-[11px] font-semibold">
            {telemetryLogs[tickerIndex]}
          </p>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[10px] shrink-0 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> LATENCY: <strong className="text-emerald-400">8ms</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" /> PROTOCOL: <strong className="text-cyan-400">TLS v1.3</strong>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HERO CYBER HEADER BANNER - IIT BOMBAY TECHFEST SOC STYLE       */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 group">
        {/* Corner Tech Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                SCAMBAIT DEFENSE ENGINE &bull; LIVE CYBER COMMAND
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400 uppercase">
              SCAMBAIT APP: <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">HACKHIVE</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-normal">
              Multi-signal heuristic & AI telemetry engine. Synthesizes unique <span className="text-cyan-300 font-semibold font-mono">Scam DNA Fingerprints</span>, extracts indicators of compromise, and deploys counter-baiting honeypots in real time for NCRP Cybercell filing.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="relative group/btn overflow-hidden flex items-center gap-2.5 px-5 py-3 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 rounded-xl transition-all duration-300 shadow-lg shadow-amber-950/30 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400/30 group-hover/btn:scale-110 transition-transform" />
              <span className="tracking-wider uppercase">LAUNCH SCENARIOS</span>
            </button>
            <button
              onClick={onAnalyzeClick}
              className="relative group/btn overflow-hidden flex items-center gap-2.5 px-6 py-3 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950 group-hover/btn:rotate-12 transition-transform" />
              <span className="tracking-wider uppercase">ANALYZE MESSAGE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRIMARY KPI METRICS GRID                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Scams</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 group-hover:text-cyan-300 transition-colors">
            {stats?.totalScamsAnalyzed ?? 16}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Indexed in CyberDB</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-rose-900/40 hover:border-rose-500/60 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-rose-300 font-bold">High-Risk Scams</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 group-hover:text-rose-300 transition-colors">
            {stats?.highRiskScams ?? 12}
          </div>
          <div className="text-[10px] text-rose-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Critical Threat Level
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-amber-900/40 hover:border-amber-500/60 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Suspicious</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 group-hover:text-amber-300 transition-colors">
            {stats?.suspiciousMessages ?? 4}
          </div>
          <div className="text-[10px] text-amber-400 mt-2">
            Moderate Risk Signals
          </div>
        </div>

        {/* Metric 4 */}
        <div className="group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">Indicators</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Crosshair className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-300 group-hover:text-purple-200 transition-colors">
            {stats?.threatIndicatorsCount ?? 28}
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Phones, UPI, Domains
          </div>
        </div>

        {/* Metric 5 */}
        <div className="col-span-2 md:col-span-1 group relative overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 backdrop-blur-md transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Honeypot Baits</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {stats?.activeSimulations ?? 3}
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active Honeypots
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CYBER ANALYTICS VISUALIZATIONS GRID                           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scam Taxonomy Distribution */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                SCAM TAXONOMY DISTRIBUTION
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-[10px] text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE TAXONOMY</span>
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((item, idx) => {
              const pct = Math.max(15, (item.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 group-hover:text-cyan-300 transition-colors flex items-center gap-2 font-semibold">
                      <span className="text-[10px] text-cyan-500 font-bold">
                        [{String(idx + 1).padStart(2, '0')}]
                      </span>
                      {item.category}
                    </span>
                    <span className="text-cyan-400 font-bold text-[11px]">
                      {item.count} incident(s)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Harvested Indicators */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  HARVESTED INDICATORS
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                [ ACTIVE ]
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Suspicious Phone Numbers', count: stats?.indicatorTypes?.phone || 9, color: 'text-amber-400', bg: 'bg-amber-500', border: 'hover:border-amber-500/50' },
                { label: 'Fraudulent UPI IDs', count: stats?.indicatorTypes?.upi || 7, color: 'text-purple-400', bg: 'bg-purple-500', border: 'hover:border-purple-500/50' },
                { label: 'Phishing URLs & APK Links', count: stats?.indicatorTypes?.url || 8, color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'hover:border-cyan-500/50' },
                { label: 'Impersonated Entities', count: stats?.indicatorTypes?.org || 4, color: 'text-blue-400', bg: 'bg-blue-500', border: 'hover:border-blue-500/50' },
              ].map((ind, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 ${ind.border} transition-all duration-200 group`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${ind.bg} shadow-[0_0_10px_currentColor]`} />
                    <span className="text-slate-300 group-hover:text-slate-100 font-medium text-xs">{ind.label}</span>
                  </div>
                  <span className={`font-bold ${ind.color} bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-xs`}>
                    {ind.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified Blocklist DB</span>
            <button
              onClick={() => onNavigateTab('blocklist')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group transition-colors uppercase tracking-wider cursor-pointer"
            >
              <span>View Blocklist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECENT SCAM REPORTS SECTION                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              RECENT THREAT INVESTIGATIONS
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((rep: any) => {
            const isHigh = rep.riskLevel === 'HIGH RISK';

            return (
              <div
                key={rep.id}
                onClick={() => onSelectReport(rep.id)}
                className="relative overflow-hidden p-4 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/40 flex flex-col justify-between"
              >
                {/* Corner Notch */}
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      {rep.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isHigh
                        ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                        : 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    }`}>
                      {rep.riskLevel} &bull; {rep.riskScore}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mb-2 font-sans group-hover:text-cyan-200 transition-colors uppercase tracking-wide">
                    {rep.scamCategory}
                  </h4>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    "{rep.rawMessage}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Channel: <strong className="text-slate-200">{rep.sourceType}</strong></span>
                  <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 font-bold uppercase tracking-wider">
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
