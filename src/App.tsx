import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DetectorView } from './components/DetectorView';
import { BlocklistView } from './components/BlocklistView';
import { ScamBaitSimulator } from './components/ScamBaitSimulator';
import { ThreatSearch } from './components/ThreatSearch';
import { ThreatNetworkGraph } from './components/ThreatNetworkGraph';
import { ReportsView } from './components/ReportsView';
import { ReportDetailModal } from './components/ReportDetailModal';
import { DemoSelectorModal } from './components/DemoSelectorModal';
import { DemoScenario } from './data/demoScenarios';
import { ExtractedIntel, ChatMessage } from './types';
import { Shield, Lock, Terminal, Activity, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Detector preloaded state
  const [detectorMessage, setDetectorMessage] = useState<string>('');
  const [detectorSourceType, setDetectorSourceType] = useState<string>('SMS');

  // Simulator active session state
  const [simulatorMessage, setSimulatorMessage] = useState<string>(
    'SBI ALERT: Dear Customer, Your SBI NetBanking account will be blocked today due to pending KYC. Update immediately at http://sbi-kyc-verify.online or send ₹1 to kycverify.sbi@okaxis to activate.'
  );
  const [simulatorCategory, setSimulatorCategory] = useState<string>('Bank Impersonation');
  const [simulatorReportId, setSimulatorReportId] = useState<string | undefined>('SB-2026-00101');

  // System status
  const [healthStatus, setHealthStatus] = useState<{
    databaseReady: boolean;
    geminiAiReady: boolean;
  }>({
    databaseReady: true,
    geminiAiReady: false
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus({
          databaseReady: !!data.databaseReady,
          geminiAiReady: !!data.geminiAiReady
        });
      })
      .catch((err) => console.warn('Health check error:', err));
  }, []);

  const handleOpenDemo = () => {
    setDemoModalOpen(true);
  };

  const handleSelectDemoScenario = (scen: DemoScenario) => {
    setDetectorMessage(scen.message);
    setDetectorSourceType(scen.sourceType);
    setActiveTab('detector');
  };

  const handleStartSimulation = (message: string, category: string, reportId?: string) => {
    setSimulatorMessage(message);
    setSimulatorCategory(category);
    setSimulatorReportId(reportId);
    setActiveTab('scambait');
  };

  const handleSimulationConcludeAndSave = async (extracted: ExtractedIntel, history: ChatMessage[]) => {
    // Optionally create or update report with newly extracted intelligence
    console.log('Simulation concluded with extracted artifacts:', extracted);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDemo={handleOpenDemo}
        onQuickAnalyze={() => {
          setActiveTab('detector');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Capability Banner */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-slate-300">
              OPERATIONAL STATUS: <strong className="text-emerald-400">DEFENSIVE REGISTRY ONLINE</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">SQLite v3.45</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.geminiAiReady ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
              <span className="text-slate-400">
                AI Engine: {healthStatus.geminiAiReady ? 'Gemini 3.8 Flash Active' : 'Local Rule Engine Active'}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Environment: College Hackathon Demo</span>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onAnalyzeClick={() => setActiveTab('detector')}
            onOpenDemo={handleOpenDemo}
            onSelectReport={(id) => setSelectedReportId(id)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'detector' && (
          <DetectorView
            initialText={detectorMessage}
            initialSourceType={detectorSourceType}
            onStartSimulation={handleStartSimulation}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewReport={(id) => setSelectedReportId(id)}
          />
        )}

        {activeTab === 'scambait' && (
          <ScamBaitSimulator
            initialMessage={simulatorMessage}
            scamCategory={simulatorCategory}
            reportId={simulatorReportId}
            onConcludeAndSave={handleSimulationConcludeAndSave}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatSearch
            onSelectReport={(id) => setSelectedReportId(id)}
          />
        )}

        {activeTab === 'network' && (
          <ThreatNetworkGraph
            onSelectReport={(id) => setSelectedReportId(id)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            onSelectReport={(id) => setSelectedReportId(id)}
            onNewAnalysis={() => setActiveTab('detector')}
          />
        )}
      </main>

      {/* Report Detail Modal */}
      {selectedReportId && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onStartSimulation={(report) => {
            handleStartSimulation(report.rawMessage, report.scamCategory, report.id);
          }}
          onViewInNetwork={() => {
            setActiveTab('network');
          }}
        />
      )}

      {/* Demo Scenario Picker Modal */}
      <DemoSelectorModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectScenario={handleSelectDemoScenario}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-slate-400 font-semibold">ScamBait Defensive Intelligence System</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <p className="text-center sm:text-right max-w-md text-[11px] text-slate-500">
            Defensive cybersecurity and scam awareness education platform. All honeypot simulations are isolated and benign. No real credentials or monetary transactions are supported.
          </p>
        </div>
      </footer>
    </div>
  );
}
