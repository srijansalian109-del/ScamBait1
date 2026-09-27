from pathlib import Path

out = Path("/mnt/data/DashboardView_immersive.tsx")

code = r"""import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, Database,
  Terminal, ArrowRight, Activity,
  Layers, Play, Zap, FileText,
  Radio, Cpu, Wifi, Lock, Crosshair
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

  // Existing live telemetry data and logic retained.
  const telemetryLogs = [
    "[SYSTEM_OK] HEURISTIC ENGINE RUNNING AT 99.8% ACCURACY",
    "[INSPECTION] INGESTING SMS STREAM FROM REGIONAL GATEWAY",
    "[ALERT_FLAG] UPI PATTERN MATCH DETECTED IN QUEUE #0892",
    "[HONEYPOT] ACTIVE BAITING SESSION RESPONDING TO TARGET ENTITY",
    "[NEURAL_MODEL] SCAM DNA FINGERPRINT SYNTHESIS COMPLETE"
  ];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % telemetryLogs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [telemetryLogs.length]);

  const categories = (stats?.categoryCounts && stats.categoryCounts.length > 0)
    ? stats.categoryCounts
    : [
        { category: 'Bank Impersonation', count: 4 },
        { category: 'Utility & Bill Fraud', count: 3 },
        { category: 'Parcel & Delivery Scam', count: 2 },
        { category: 'Part-Time Task Scam', count: 2 },
        { category: 'Lottery & Prize Scam', count: 1 }
      ];

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  const reports = (stats?.recentReports && stats.recentReports.length > 0)
    ? stats.recentReports
    : [
        {
          id: 'REP-1092',
          riskLevel: 'HIGH RISK',
          riskScore: '89/100',
          scamCategory: 'Bank Impersonation',
          rawMessage: 'URGENT: Your account access has been limited due to suspicious activity. Verify immediately.',
          sourceType: 'SMS'
        } as any
      ];

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#03050a] text-cyan-300">
        <style>{`
          @keyframes cyber-grid-drift {
            0% { transform: translate3d(0,0,0); }
            100% { transform: translate3d(48px,48px,0); }
          }
          @keyframes scan-line {
            0% { transform: translateY(-10vh); opacity: 0; }
            15% { opacity: .7; }
            85% { opacity: .35; }
            100% { transform: translateY(110vh); opacity: 0; }
          }
          @keyframes float-node {
            0%,100% { transform: translateY(0) scale(1); opacity:.25; }
            50% { transform: translateY(-18px) scale(1.08); opacity:.7; }
          }
        `}</style>

        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,229,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,.09) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            animation: 'cyber-grid-drift 18s linear infinite'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,229,255,.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(124,58,237,.10),transparent_35%)]" />
        <div className="absolute left-[12%] top-[25%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(0,229,255,.25)]" style={{ animation: 'float-node 4s ease-in-out infinite' }} />
        <div className="absolute right-[18%] top-[38%] h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_24px_8px_rgba(124,58,237,.22)]" style={{ animation: 'float-node 5s ease-in-out infinite .5s' }} />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" style={{ animation: 'scan-line 4s linear infinite' }} />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5 shadow-[0_0_80px_rgba(0,229,255,.12)]">
            <div className="absolute inset-2 rounded-full border border-cyan-400/20 border-t-cyan-300 animate-spin" />
            <div className="absolute inset-0 rounded-full border border-cyan-400/10 animate-ping" />
            <Cpu className="h-9 w-9 text-cyan-300" />
          </div>
          <div className="text-center">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[.35em] text-cyan-500/70">
              SCAMBAIT // SECURITY OPERATIONS
            </div>
            <div className="font-mono text-sm font-bold tracking-[.22em] text-cyan-200">
              INITIALIZING THREAT INTELLIGENCE
            </div>
          </div>
          <div className="h-1 w-64 overflow-hidden rounded-full bg-white/5 ring-1 ring-cyan-400/20">
            <div className="h-full w-2/3 animate-pulse bg-gradient-to-r from-cyan-400 to-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#03050a] px-3 py-3 font-sans text-slate-100 selection:bg-cyan-400/20 selection:text-cyan-200 sm:px-5 lg:px-7">
      <style>{`
        @keyframes cyber-grid-drift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 64px 64px, 64px 64px; }
        }
        @keyframes ambient-pulse {
          0%,100% { opacity:.18; transform:scale(1); }
          50% { opacity:.32; transform:scale(1.08); }
        }
        @keyframes scan-line {
          0% { transform:translateY(-15vh); opacity:0; }
          12% { opacity:.55; }
          80% { opacity:.22; }
          100% { transform:translateY(115vh); opacity:0; }
        }
        @keyframes data-flow {
          0% { transform:translateX(-120%); opacity:0; }
          15% { opacity:.65; }
          85% { opacity:.2; }
          100% { transform:translateX(120%); opacity:0; }
        }
        @keyframes node-float {
          0%,100% { transform:translateY(0); opacity:.25; }
          50% { transform:translateY(-12px); opacity:.65; }
        }
        @keyframes pulse-ring {
          0% { transform:scale(.85); opacity:.45; }
          70%,100% { transform:scale(1.5); opacity:0; }
        }
        @keyframes reveal-up {
          from { opacity:0; transform:translateY(14px); }
          to { opacity:1; transform:translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Persistent cinematic background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,229,255,.065) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,.065) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            animation: 'cyber-grid-drift 22s linear infinite'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,.11),transparent_32%),radial-gradient(circle_at_100%_60%,rgba(124,58,237,.09),transparent_30%),radial-gradient(circle_at_0%_80%,rgba(0,229,255,.06),transparent_30%)]" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" style={{ animation: 'ambient-pulse 8s ease-in-out infinite' }} />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[130px]" style={{ animation: 'ambient-pulse 10s ease-in-out infinite 1s' }} />
        <div className="absolute left-[10%] top-[18%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_20px_5px_rgba(0,229,255,.25)]" style={{ animation: 'node-float 5s ease-in-out infinite' }} />
        <div className="absolute right-[14%] top-[30%] h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_20px_5px_rgba(124,58,237,.2)]" style={{ animation: 'node-float 6s ease-in-out infinite 1s' }} />
        <div className="absolute left-[25%] bottom-[20%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_16px_4px_rgba(0,229,255,.2)]" style={{ animation: 'node-float 7s ease-in-out infinite 2s' }} />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" style={{ animation: 'scan-line 7s linear infinite' }} />
        <div className="absolute left-0 right-0 top-[38%] h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" style={{ animation: 'data-flow 9s linear infinite 2s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] space-y-5">
        {/* Live command ribbon */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#070b12]/80 shadow-[0_20px_80px_rgba(0,0,0,.3)] backdrop-blur-xl">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-400/10 to-transparent" />
          <div className="flex min-h-12 flex-col justify-between gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-emerald-300">LIVE SOC FEED</span>
              </div>
              <p className="truncate font-mono text-[10px] tracking-wide text-slate-400 sm:text-[11px]">
                {telemetryLogs[tickerIndex]}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
              <span className="flex items-center gap-1.5"><Wifi className="h-3 w-3 text-emerald-400" />12ms</span>
              <span className="hidden items-center gap-1.5 sm:flex"><Lock className="h-3 w-3 text-cyan-400" />TLS 1.3</span>
              <span className="flex items-center gap-1.5"><Radio className="h-3 w-3 text-cyan-400" />MONITORING</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#060a12]/80 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl">
          <div className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(120deg, transparent 0%, rgba(0,229,255,.04) 45%, transparent 65%), radial-gradient(circle at 78% 45%, rgba(0,229,255,.12), transparent 25%), radial-gradient(circle at 92% 15%, rgba(124,58,237,.12), transparent 20%)'
            }}
          />
          <div className="absolute right-[-5%] top-[-15%] h-[34rem] w-[34rem] rounded-full border border-cyan-400/10" />
          <div className="absolute right-[3%] top-[-5%] h-[25rem] w-[25rem] rounded-full border border-cyan-400/10" />
          <div className="absolute right-[14%] top-[12%] h-[12rem] w-[12rem] rounded-full border border-cyan-400/15" />
          <div className="absolute right-[19.5%] top-[31%] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_30px_8px_rgba(0,229,255,.3)]" />
          <div className="absolute right-[10%] top-[21%] h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_25px_7px_rgba(124,58,237,.25)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-6 sm:p-9 lg:p-12">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[.22em] text-cyan-300">
                  CYBER DEFENSE // THREAT INTELLIGENCE
                </span>
              </div>
              <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-slate-600 sm:flex">
                <span>NODE 07</span><span className="text-cyan-500">•</span><span>SECURE</span>
              </div>
            </div>

            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
              <div className="max-w-3xl" style={{ animation: 'reveal-up .7s ease-out both' }}>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[.32em] text-cyan-500/80">
                  TURNING SCAMS INTO INTELLIGENCE
                </div>
                <h1 className="max-w-3xl text-5xl font-black uppercase leading-[.88] tracking-[-.055em] text-white sm:text-7xl lg:text-[6.2rem]">
                  SCAM<span className="text-cyan-300 drop-shadow-[0_0_28px_rgba(0,229,255,.35)]">BAIT</span>
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  A cybersecurity intelligence cockpit for analyzing suspicious messages,
                  extracting threat indicators, studying scam patterns, and running controlled
                  awareness simulations.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={onOpenDemo}
                    className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-amber-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/60 hover:bg-amber-300/15 hover:shadow-[0_0_35px_rgba(251,191,36,.12)] active:scale-[.98]"
                  >
                    <Play className="h-4 w-4 fill-amber-300/30 text-amber-300 transition-transform group-hover:scale-110" />
                    Launch Demo Scenarios
                  </button>
                  <button
                    onClick={onAnalyzeClick}
                    className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-400 px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-[#021017] transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-200 hover:to-cyan-300 hover:shadow-[0_0_40px_rgba(0,229,255,.2)] active:scale-[.98]"
                  >
                    <Zap className="h-4 w-4 fill-current transition-transform group-hover:rotate-12" />
                    Analyze Message
                  </button>
                </div>
              </div>

              {/* Hero intelligence diagram */}
              <div className="relative mx-auto hidden h-64 w-full max-w-md lg:block">
                <div className="absolute inset-8 rounded-full border border-cyan-400/10" />
                <div className="absolute inset-16 rounded-full border border-cyan-400/15 border-dashed" />
                <div className="absolute inset-24 rounded-full border border-violet-400/15" />
                <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/5 shadow-[0_0_70px_rgba(0,229,255,.12)]">
                  <ShieldAlert className="h-9 w-9 text-cyan-300" />
                </div>
                {[
                  ['THREAT', 'top-0 left-1/2 -translate-x-1/2'],
                  ['MESSAGE', 'bottom-3 left-4'],
                  ['SCAM DNA', 'bottom-3 right-3'],
                  ['HONEYPOT', 'top-8 right-2']
                ].map(([label, pos], i) => (
                  <div key={label} className={`absolute ${pos}`}>
                    <div className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-md">
                      <div className="mb-1 h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_10px_cyan]" />
                      <span className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-slate-400">{label}</span>
                    </div>
                    <div className="absolute left-1/2 top-1/2 h-px w-16 origin-left -rotate-12 bg-gradient-to-r from-cyan-400/30 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPI command metrics */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {[
            {
              label: 'Total Scams',
              value: stats?.totalScamsAnalyzed ?? 5,
              note: 'Indexed in SQLite',
              icon: Database,
              tone: 'cyan'
            },
            {
              label: 'High-Risk Scams',
              value: stats?.highRiskScams ?? 4,
              note: 'Critical threat level',
              icon: ShieldAlert,
              tone: 'rose'
            },
            {
              label: 'Suspicious',
              value: stats?.suspiciousMessages ?? 0,
              note: 'Moderate risk signals',
              icon: AlertTriangle,
              tone: 'amber'
            },
            {
              label: 'Threat Indicators',
              value: stats?.threatIndicatorsCount ?? 13,
              note: 'Phones, UPI, domains',
              icon: Crosshair,
              tone: 'violet'
            },
            {
              label: 'Honeypot Baits',
              value: stats?.activeSimulations ?? 1,
              note: 'Simulations active',
              icon: Terminal,
              tone: 'emerald'
            }
          ].map((metric) => {
            const toneMap: Record<string, string> = {
              cyan: 'text-cyan-300 border-cyan-400/15 hover:border-cyan-400/40 bg-cyan-400/[.025]',
              rose: 'text-rose-300 border-rose-400/15 hover:border-rose-400/40 bg-rose-400/[.025]',
              amber: 'text-amber-300 border-amber-400/15 hover:border-amber-400/40 bg-amber-400/[.025]',
              violet: 'text-violet-300 border-violet-400/15 hover:border-violet-400/40 bg-violet-400/[.025]',
              emerald: 'text-emerald-300 border-emerald-400/15 hover:border-emerald-400/40 bg-emerald-400/[.025]'
            };
            const iconTone = toneMap[metric.tone].split(' ')[0];

            return (
              <div
                key={metric.label}
                className={`group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[.035] ${toneMap[metric.tone]}`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">{metric.label}</span>
                  <div className={`rounded-lg border border-white/5 bg-white/[.025] p-2 ${iconTone}`}>
                    <metric.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className={`font-mono text-3xl font-black tracking-tight ${iconTone}`}>{metric.value}</div>
                <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-slate-600">
                  <span className={`h-1.5 w-1.5 rounded-full ${metric.tone === 'rose' ? 'bg-rose-400' : 'bg-cyan-400'} animate-pulse`} />
                  {metric.note}
                </div>
              </div>
            );
          })}
        </section>

        {/* Intelligence section */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_.85fr]">
          {/* Scam taxonomy */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070b12]/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/5 blur-3xl" />
            <div className="relative mb-6 flex items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[.24em] text-cyan-500/70">THREAT CLASSIFICATION</div>
                <h2 className="text-sm font-black uppercase tracking-[.13em] text-white">Scam Taxonomy Distribution</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.15em] text-cyan-300 sm:flex">
                <Activity className="h-3 w-3 animate-pulse" />
                Live Telemetry
              </div>
            </div>

            <div className="relative space-y-5">
              {categories.map((item, idx) => {
                const pct = Math.max(12, (item.count / maxCount) * 100);
                return (
                  <div key={idx} className="group space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors group-hover:text-cyan-200">
                        <span className="text-cyan-500/50">[{String(idx + 1).padStart(2, '0')}]</span>
                        <span className="truncate">{item.category}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-cyan-300">{item.count} INCIDENTS</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-violet-400 shadow-[0_0_18px_rgba(0,229,255,.28)] transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" style={{ animation: 'data-flow 2.5s linear infinite' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicators */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070b12]/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-6">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/5 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[.24em] text-emerald-500/70">IOC EXTRACTION</div>
                  <h2 className="text-sm font-black uppercase tracking-[.13em] text-white">Harvested Indicators</h2>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[.14em] text-emerald-300">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Suspicious Phone Numbers', count: stats?.indicatorTypes?.phone || 4, dot: 'bg-amber-400', text: 'text-amber-300' },
                  { label: 'Fraudulent UPI IDs', count: stats?.indicatorTypes?.upi || 3, dot: 'bg-violet-400', text: 'text-violet-300' },
                  { label: 'Phishing URLs & APKs', count: stats?.indicatorTypes?.url || 4, dot: 'bg-cyan-400', text: 'text-cyan-300' },
                  { label: 'Impersonated Organizations', count: stats?.indicatorTypes?.org || 4, dot: 'bg-blue-400', text: 'text-blue-300' }
                ].map((ind, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-black/25 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[.025]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${ind.dot} shadow-[0_0_12px_currentColor]`} />
                      <span className="truncate text-[11px] font-medium text-slate-400 transition-colors group-hover:text-slate-200">{ind.label}</span>
                    </div>
                    <span className={`ml-3 rounded-lg border border-white/5 bg-white/[.025] px-2.5 py-1 font-mono text-[10px] font-bold ${ind.text}`}>
                      {ind.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-5">
                <span className="font-mono text-[9px] uppercase tracking-[.14em] text-slate-600">Threat network coverage</span>
                <button
                  onClick={() => onNavigateTab('network')}
                  className="group flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Explore Graph
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Investigation stream */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070b12]/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="mb-5 flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-2 text-cyan-300">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[.24em] text-cyan-500/70">CASE STREAM</div>
                <h2 className="text-sm font-black uppercase tracking-[.13em] text-white">Recent Threat Investigations</h2>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="group flex items-center gap-2 self-start rounded-lg border border-white/5 bg-white/[.02] px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[.15em] text-cyan-300 transition-all hover:border-cyan-400/20 hover:bg-cyan-400/5 sm:self-auto"
            >
              View All Reports
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((rep: any) => {
              const isHigh = rep.riskLevel === 'HIGH RISK';

              return (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/7 bg-black/25 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-white/[.025] hover:shadow-[0_18px_50px_rgba(0,0,0,.35)]"
                >
                  <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-cyan-400/0 transition-colors group-hover:border-cyan-400/40" />
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[.13em] text-cyan-300">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400/70" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      </span>
                      {rep.id}
                    </span>
                    <span className={`rounded-full border px-2 py-1 font-mono text-[8px] font-bold tracking-wider ${
                      isHigh
                        ? 'border-rose-400/25 bg-rose-400/5 text-rose-300'
                        : 'border-amber-400/25 bg-amber-400/5 text-amber-300'
                    }`}>
                      {rep.riskLevel} • {rep.riskScore}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xs font-black uppercase tracking-[.08em] text-slate-200 transition-colors group-hover:text-cyan-200">
                    {rep.scamCategory}
                  </h3>

                  <div className="rounded-xl border border-white/5 bg-white/[.018] p-3">
                    <p className="line-clamp-3 text-[10px] leading-5 text-slate-500 transition-colors group-hover:text-slate-400">
                      "{rep.rawMessage}"
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[8px] uppercase tracking-[.13em]">
                    <span className="text-slate-600">Channel: <strong className="text-slate-400">{rep.sourceType}</strong></span>
                    <span className="flex items-center gap-1 text-cyan-400 transition-transform group-hover:translate-x-1">
                      Inspect Brief <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer status strip */}
        <div className="flex flex-col gap-2 border-t border-white/5 px-1 py-3 font-mono text-[8px] uppercase tracking-[.18em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>SCAMBAIT // DEFENSIVE CYBERSECURITY INTELLIGENCE PLATFORM</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.6)]" />
            SYSTEM OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
};
"""

out.write_text(code, encoding="utf-8")
print(f"Created: {out}")
print(f"Lines: {len(code.splitlines())}")
