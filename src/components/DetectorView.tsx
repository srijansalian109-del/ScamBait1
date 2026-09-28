import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Download, 
  Bot, 
  Languages, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import { generateNCRPComplaint, exportNCRPComplaintAsPDF } from '../utils/ncrpGenerator';

export const DetectorView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [isBaitingActive, setIsBaitingActive] = useState(false);

  // FEATURE 4: Detect-First Workflow
  const handleRunAnalysis = () => {
    if (!inputText.trim()) return;

    const mockVerdict = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      riskLevel: 'HIGH RISK',
      riskScore: 92,
      scamCategory: 'Digital Arrest', // FEATURE 1: India-Specific Category
      suggestedAction: 'Do not transfer funds or share OTPs. Download the NCRP draft below to report to Cybercell.',
      reasons: [
        'Impersonation of Telecom Authority / Police Officers',
        'Urgent demand for financial verification under threat of legal action',
        'Suspicious UPI handle detected in message text'
      ],
      extractedEntities: {
        phones: ['+91 98765 43210'],
        upis: ['verify-cybercell@okaxis'],
        urls: []
      },
      rawMessages: [inputText],
      createdAt: new Date().toISOString()
    };

    setAnalysisResult(mockVerdict);
    setIsBaitingActive(false); // Hide baiting option until verdict is reviewed
  };

  // FEATURE 2: NCRP / 1930 Draft Exporter
  const handleDownloadNCRP = () => {
    if (!analysisResult) return;
    exportNCRPComplaintAsPDF(analysisResult);
  };

  return (
    <div className="space-y-6 text-slate-100 font-mono text-xs">
      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
          Scam & Threat Detection Studio
        </h2>
        <p className="text-slate-400">
          Paste suspect SMS, WhatsApp text, or transcript to get an instant verdict.
        </p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste suspect message here... (e.g., 'This is TRAI. Your mobile number will be blocked in 2 hours due to illegal activity...')"
          className="w-full h-28 p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
        />

        <button
          onClick={handleRunAnalysis}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Run Threat Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* DETECT-FIRST VERDICT DISPLAY */}
      {analysisResult && (
        <div className="bg-slate-900 border border-rose-500/40 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-400 text-sm">
                    {analysisResult.riskLevel} ({analysisResult.riskScore}/100)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Category: {analysisResult.scamCategory}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{analysisResult.suggestedAction}</p>
              </div>
            </div>

            {/* FEATURE 2 BUTTON: NCRP Export */}
            <button
              onClick={handleDownloadNCRP}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export NCRP 1930 Draft</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-bold">Detected Indicators:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              {analysisResult.reasons.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* FEATURE 4: BAIT-SECOND OPTION */}
          {!isBaitingActive ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Step 2: Engage to gather threat intelligence?</span>
              <button
                onClick={() => setIsBaitingActive(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg font-bold text-xs cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Start Baiting Session</span>
              </button>
            </div>
          ) : (
            /* FEATURE 1: Multilingual Persona Studio */
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Active Agentic Baiting Engagement
                </span>

                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="en">English Persona</option>
                    <option value="hi">Hindi (हिंदी) Persona</option>
                    <option value="kn">Kannada (ಕನ್ನಡ) Persona</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-300 font-mono text-[11px] space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase">
                  Generated Persona Response ({selectedLanguage.toUpperCase()}):
                </span>
                {selectedLanguage === 'hi' && (
                  <p className="text-amber-300">
                    "Sir main darr gaya hu, please arrest mat kijiye. Main immediate fee pay kar deta hu, UPI ID bhejye..."
                  </p>
                )}
                {selectedLanguage === 'kn' && (
                  <p className="text-amber-300">
                    "Ayyo Sir, yenithu police complaint aa? Nanu fine kattuthene, dayavittu UPI ID athava bank account number kodi..."
                  </p>
                )}
                {selectedLanguage === 'en' && (
                  <p className="text-amber-300">
                    "Officer, please don't register a case. I am willing to pay the penalty right now. Can you provide your official UPI ID?"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
