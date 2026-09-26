import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, ArrowUpDown, ExternalLink, 
  ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Terminal, PlusCircle 
} from 'lucide-react';
import { ScamReport } from '../types';

interface ReportsViewProps {
  onSelectReport: (reportId: string) => void;
  onNewAnalysis: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onSelectReport,
  onNewAnalysis
}) => {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (riskFilter !== 'ALL') params.append('riskLevel', riskFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [riskFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // Sort local reports
  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'desc' ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
    }
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const categories = Array.from(new Set(reports.map(r => r.scamCategory).filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                THREAT INTELLIGENCE REPORTS REGISTRY
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Forensic records of analyzed messages, threat metrics, and extracted indicators.
            </p>
          </div>
        </div>

        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>New Scam Analysis</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, keywords, or taxonomy..."
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH RISK">High Risk Only</option>
            <option value="SUSPICIOUS">Suspicious Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs max-w-[170px] truncate"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort Switcher */}
          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortBy('score');
              } else {
                setSortBy('date');
              }
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sort: {sortBy === 'date' ? 'Date' : 'Score'}</span>
          </button>

          <button
            onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1.5 rounded-lg font-mono text-[11px]"
            title="Toggle sort direction"
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs font-mono space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Retrieving forensic reports registry...</span>
          </div>
        ) : sortedReports.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-400 font-mono">
            No reports matching current filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3 px-4">Scam ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Indicators</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedReports.map((report) => {
                  const isHigh = report.riskLevel === 'HIGH RISK';
                  const isSuspicious = report.riskLevel === 'SUSPICIOUS';

                  return (
                    <tr
                      key={report.id}
                      onClick={() => onSelectReport(report.id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {report.sourceType}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {report.scamCategory}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isHigh
                            ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                            : isSuspicious
                            ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                            : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                        }`}>
                          {report.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-100">
                        {report.riskScore}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {report.indicatorsCount || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-cyan-400 hover:text-cyan-300 text-xs font-medium underline">
                          Inspect Dossier
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
