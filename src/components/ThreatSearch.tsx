import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, ShieldCheck, AlertTriangle, Phone, 
  CreditCard, Globe, Building2, CheckCircle2, Copy, Check, Filter, ExternalLink 
} from 'lucide-react';
import { ThreatIndicatorItem } from '../types';

interface ThreatSearchProps {
  onSelectReport?: (reportId: string) => void;
}

export const ThreatSearch: React.FC<ThreatSearchProps> = ({ onSelectReport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // All indicators list
  const [indicators, setIndicators] = useState<ThreatIndicatorItem[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [copiedVal, setCopiedVal] = useState<string | null>(null);

  const fetchAllThreats = async () => {
    try {
      const res = await fetch('/api/threats');
      const data = await res.json();
      if (Array.isArray(data)) {
        setIndicators(data);
      }
    } catch (err) {
      console.error('Error fetching threats:', err);
    }
  };

  useEffect(() => {
    fetchAllThreats();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/threats/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error('Error searching threat:', err);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickLookup = (val: string) => {
    setSearchQuery(val);
    setIsSearching(true);
    setHasSearched(true);
    fetch(`/api/threats/search?q=${encodeURIComponent(val)}`)
      .then(res => res.json())
      .then(data => setSearchResult(data))
      .catch(() => setSearchResult(null))
      .finally(() => setIsSearching(false));
  };

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedVal(val);
    setTimeout(() => setCopiedVal(null), 2000);
  };

  const filteredIndicators = indicators.filter(ind => {
    if (filterType === 'ALL') return true;
    return ind.type.toUpperCase() === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-100 font-mono">
              THREAT INTELLIGENCE REGISTRY
            </h2>
            <p className="text-xs text-slate-400">
              Cross-reference suspicious phone numbers, UPI handles, phishing domains, emails, and scam report IDs.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone (+91 98765...), UPI (kycverify@okaxis), domain (sbi-kyc.online), or Report ID (SB-2026-00101)..."
              className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            {isSearching ? 'Searching...' : 'Search Registry'}
          </button>
        </form>

        {/* Quick query tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>Quick queries:</span>
          {['kycverify.sbi@okaxis', '+919876543210', 'courier-customs-pay.club', 'discom.urgent@paytm'].map((q) => (
            <button
              key={q}
              onClick={() => handleQuickLookup(q)}
              className="font-mono text-cyan-400 hover:text-cyan-300 bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Search Verdict Result Card */}
      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          {searchResult && searchResult.found ? (
            <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        ⚠️ PREVIOUSLY REPORTED THREAT INDICATOR
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        searchResult.status === 'VERIFIED_THREAT'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                      }`}>
                        {searchResult.recordType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Query matched: <strong className="text-cyan-300">{searchResult.indicator}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">
                    Incident Correlation: <strong className="text-slate-100 font-mono">{searchResult.reportsCount} report(s)</strong>
                  </span>
                </div>
              </div>

              {/* Correlation Stats Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Detections</span>
                  <span className="text-lg font-mono font-bold text-rose-400">{searchResult.timesSeen}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Primary Scam Category</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block mt-1">
                    {searchResult.scamCategories?.join(', ') || 'Financial Fraud'}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Associated Phones</span>
                  <span className="text-lg font-mono font-bold text-amber-400">{searchResult.associatedPhones?.length || 0}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Associated Domains</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">{searchResult.associatedDomains?.length || 0}</span>
                </div>
              </div>

              {/* Linked Indicators Section */}
              <div className="space-y-2 text-xs">
                {searchResult.associatedPhones?.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[11px]">Associated Phone Numbers: </span>
                    <div className="inline-flex flex-wrap gap-1.5 ml-2">
                      {searchResult.associatedPhones.map((p: string, i: number) => (
                        <span key={i} className="font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {searchResult.associatedDomains?.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[11px]">Associated Phishing Domains: </span>
                    <div className="inline-flex flex-wrap gap-1.5 ml-2">
                      {searchResult.associatedDomains.map((d: string, i: number) => (
                        <span key={i} className="font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {searchResult.reportIds?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Associated Incident Reports:</span>
                    <div className="flex items-center gap-2">
                      {searchResult.reportIds.map((rid: string) => (
                        <button
                          key={rid}
                          onClick={() => onSelectReport && onSelectReport(rid)}
                          className="font-mono text-xs text-cyan-400 hover:text-cyan-300 underline"
                        >
                          {rid}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  CLEAN / UNRECORDED IN REGISTRY
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  No prior malicious incident reports or community flags currently associated with &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Registry Catalog Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              ALL RECORDED THREAT INDICATORS ({filteredIndicators.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Live threat repository synchronized with ScamBait analysis engine.
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'PHONE', 'UPI', 'URL', 'ORG'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterType === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Indicator Value</th>
                <th className="py-2.5 px-3">Scam Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Seen</th>
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredIndicators.map((ind) => (
                <tr key={ind.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      ind.type === 'phone' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                      ind.type === 'upi' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                      ind.type === 'url' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
                      'text-blue-400 border-blue-500/30 bg-blue-500/10'
                    }`}>
                      {ind.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-medium">
                    {ind.value}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">
                    {ind.scamCategory || 'General Scam'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      ind.verified
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                    }`}>
                      {ind.verified ? 'VERIFIED' : 'REPORTED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-300">
                    {ind.timesSeen}x
                  </td>
                  <td className="py-2.5 px-3">
                    {onSelectReport ? (
                      <button
                        onClick={() => onSelectReport(ind.reportId)}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {ind.reportId}
                      </button>
                    ) : (
                      <span className="text-slate-400">{ind.reportId}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => copyVal(ind.value)}
                      className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Copy indicator value"
                    >
                      {copiedVal === ind.value ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
