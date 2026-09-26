import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Shield, AlertTriangle, Send, Bot, User, 
  Sparkles, CheckCircle2, Copy, Check, Radio, Flame, 
  ExternalLink, Phone, CreditCard, Globe, Building2, MapPin, Tag
} from 'lucide-react';
import { ChatMessage, ExtractedIntel, PersonaConfig } from '../types';

interface ScamBaitSimulatorProps {
  initialMessage?: string;
  scamCategory?: string;
  reportId?: string;
  onConcludeAndSave?: (extracted: ExtractedIntel, history: ChatMessage[]) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ScamBaitSimulator: React.FC<ScamBaitSimulatorProps> = ({
  initialMessage = 'SBI ALERT: Your NetBanking will be blocked today due to pending KYC. Update at http://sbi-kyc-verify.online or send ₹1 to kycverify.sbi@okaxis immediately.',
  scamCategory = 'Bank Impersonation',
  reportId,
  onConcludeAndSave,
  onNavigateTab
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [extractedIntel, setExtractedIntel] = useState<ExtractedIntel>({
    phones: [],
    upiIds: [],
    domains: [],
    organizations: [],
    locations: [],
    tacticsObserved: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userCustomText, setUserCustomText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('confused_elder');
  const [availablePersonas, setAvailablePersonas] = useState<PersonaConfig[]>([]);
  const [isSimConcluded, setIsSimConcluded] = useState(false);
  const [copiedIndicator, setCopiedIndicator] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Start simulation session on mount or when initial message changes
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialMessage,
            category: scamCategory,
            reportId,
            personaId: selectedPersona
          })
        });
        const data = await res.json();
        if (isMounted && data.conversationId) {
          setConversationId(data.conversationId);
          setMessages(data.messages || []);
          setExtractedIntel(data.extractedIntel || {
            phones: [],
            upiIds: [],
            domains: [],
            organizations: [],
            locations: [],
            tacticsObserved: []
          });
          if (data.availablePersonas) {
            setAvailablePersonas(data.availablePersonas);
          }
        }
      } catch (err) {
        console.error('Failed to init simulation:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [initialMessage, scamCategory, reportId]);

  const handleGenerateReply = async () => {
    if (!conversationId || isLoading || isSimConcluded) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/conversation/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          action: 'generate_bait',
          personaId: selectedPersona
        })
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        setExtractedIntel(data.extractedIntel);
      }
    } catch (err) {
      console.error('Error generating reply:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCustomText.trim() || !conversationId || isLoading || isSimConcluded) return;

    const text = userCustomText.trim();
    setUserCustomText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/conversation/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          action: 'user_input',
          userText: text,
          personaId: selectedPersona
        })
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        setExtractedIntel(data.extractedIntel);
      }
    } catch (err) {
      console.error('Error sending custom message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSimulation = async () => {
    if (!conversationId) return;

    try {
      await fetch('/api/conversation/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          action: 'end_simulation'
        })
      });
      setIsSimConcluded(true);
      if (onConcludeAndSave) {
        onConcludeAndSave(extractedIntel, messages);
      }
    } catch (err) {
      console.error('Error ending simulation:', err);
    }
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIndicator(val);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  const currentPersonaObj = availablePersonas.find(p => p.id === selectedPersona);

  return (
    <div className="space-y-4">
      {/* Simulation Safety & Protocol Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                SAFE AI SCAMBAIT SIMULATOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                SANDBOX ISOLATED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controlled honeypot environment to bait threat actors and extract indicators without real exposure.
            </p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Active Persona:</span>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            disabled={isSimConcluded}
            className="text-xs bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            <option value="confused_elder">Mrs. Margaret / Sharmaji (Confused Elder)</option>
            <option value="anxious_customer">Devraj (Worried Account Holder)</option>
            <option value="eager_freelancer">Sneha (Eager Job/Task Seeker)</option>
            <option value="cautious_citizen">Arvind (Methodical Citizen)</option>
          </select>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200/90">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">DEFENSIVE CYBERSECURITY MANDATE:</strong> No real OTPs, PINs, passwords, or banking credentials are ever transmitted. Real payments and real-world actions are strictly prohibited. All handles generated or revealed are tracked as simulated intelligence artifacts.
        </div>
      </div>

      {/* Main 2-Column Grid: Simulator Chat + Real-Time Threat Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat Interface (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-[580px] overflow-hidden backdrop-blur-sm">
          {/* Chat Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div>
                <span className="text-xs font-mono font-semibold text-slate-200">
                  Target Channel: {scamCategory}
                </span>
                <span className="text-[11px] text-slate-500 ml-2 font-mono">
                  {conversationId ? `SESSION: ${conversationId}` : 'INITIALIZING...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSimConcluded ? (
                <button
                  onClick={handleEndSimulation}
                  className="px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors"
                >
                  End Simulation
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Simulation Concluded
                </span>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isScammer = msg.sender === 'scammer';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isScammer ? 'justify-start' : 'justify-end'}`}
                >
                  {isScammer && (
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                      <Flame className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      isScammer
                        ? 'bg-slate-950/90 border border-rose-900/40 text-slate-200'
                        : 'bg-cyan-950/70 border border-cyan-800/50 text-cyan-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/60 text-[10px] font-mono">
                      <span className={isScammer ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                        {isScammer ? 'THREAT ACTOR (SCAMMER)' : `SCAMBAIT AI (${currentPersonaObj?.name || 'Persona'})`}
                      </span>
                      <span className="text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isScammer && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono py-2 px-3 bg-cyan-950/30 rounded-lg w-fit border border-cyan-900/30">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating counter-inquiry &amp; parsing threat stream...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action / Input Footer */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            {!isSimConcluded ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateReply}
                    disabled={isLoading}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Generate AI Reply (Safe Persona Bait)</span>
                  </button>

                  <button
                    onClick={handleEndSimulation}
                    className="py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                  >
                    Finish Simulation
                  </button>
                </div>

                <form onSubmit={handleSendCustomText} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userCustomText}
                    onChange={(e) => setUserCustomText(e.target.value)}
                    placeholder="Or type custom bait message into simulator..."
                    disabled={isLoading}
                    className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!userCustomText.trim() || isLoading}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 disabled:opacity-40 rounded-lg transition-colors border border-slate-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-emerald-400 font-medium mb-1">
                  Simulation concluded successfully! Extracted threat artifacts have been saved.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('reports')}
                    className="px-3 py-1.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg transition-colors"
                  >
                    View in Reports Registry
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('network')}
                    className="px-3 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors"
                  >
                    View in Threat Network
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Threat Intelligence Extraction Panel (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
                  THREAT INTELLIGENCE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/80">
                LIVE HARVEST
              </span>
            </div>

            {/* Extracted Intel Categories */}
            <div className="space-y-4 text-xs">
              {/* Phone Numbers */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-400" />
                  <span>SUSPICIOUS PHONE NUMBERS ({extractedIntel.phones.length})</span>
                </div>
                {extractedIntel.phones.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic pl-5">None extracted yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {extractedIntel.phones.map((phone, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                      >
                        <span className="font-mono text-slate-200">{phone}</span>
                        <button
                          onClick={() => copyToClipboard(phone)}
                          className="text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Copy phone number"
                        >
                          {copiedIndicator === phone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPI IDs */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>PAYMENT / UPI HANDLES ({extractedIntel.upiIds.length})</span>
                </div>
                {extractedIntel.upiIds.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic pl-5">None extracted yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {extractedIntel.upiIds.map((upi, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                      >
                        <span className="font-mono text-amber-300">{upi}</span>
                        <button
                          onClick={() => copyToClipboard(upi)}
                          className="text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Copy UPI ID"
                        >
                          {copiedIndicator === upi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Domains / URLs */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SUSPICIOUS DOMAINS / APKS ({extractedIntel.domains.length})</span>
                </div>
                {extractedIntel.domains.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic pl-5">None extracted yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {extractedIntel.domains.map((dom, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                      >
                        <span className="font-mono text-cyan-300 truncate max-w-[190px]">{dom}</span>
                        <button
                          onClick={() => copyToClipboard(dom)}
                          className="text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Copy domain"
                        >
                          {copiedIndicator === dom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Impersonated Entities */}
              {extractedIntel.organizations.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>IMPERSONATED ENTITIES</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedIntel.organizations.map((org, i) => (
                      <span key={i} className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observed Tactics */}
              {extractedIntel.tacticsObserved.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>ACTIVE SOCIAL ENGINEERING TACTICS</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedIntel.tacticsObserved.map((tac, i) => (
                      <span key={i} className="text-[11px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                        {tac}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Threat Intelligence DB Sync</span>
            <span className="text-emerald-400 font-mono">AUTOMATIC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
