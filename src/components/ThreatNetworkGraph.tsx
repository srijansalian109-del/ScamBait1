import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Share2, ZoomIn, ZoomOut, RefreshCw, Filter, Phone, 
  CreditCard, Globe, Building2, FileText, Info, ShieldAlert, X
} from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../types';

interface ThreatNetworkGraphProps {
  onSelectReport?: (reportId: string) => void;
}

export const ThreatNetworkGraph: React.FC<ThreatNetworkGraphProps> = ({
  onSelectReport
}) => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/threat-network');
      const data = await res.json();
      if (data.nodes && data.edges) {
        // Layout algorithm: place report nodes in an inner circle, indicator nodes clustered around their connected reports
        const width = 800;
        const height = 550;
        const centerX = width / 2;
        const centerY = height / 2;

        const reportNodes = data.nodes.filter((n: any) => n.type === 'report');
        const indicatorNodes = data.nodes.filter((n: any) => n.type !== 'report');

        const computedNodes: NetworkNode[] = [];
        const reportPositions: Record<string, { x: number; y: number }> = {};

        // Place reports
        reportNodes.forEach((rep: any, idx: number) => {
          const angle = (idx / Math.max(1, reportNodes.length)) * 2 * Math.PI;
          const radius = 170;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          reportPositions[rep.id] = { x, y };
          computedNodes.push({
            ...rep,
            x,
            y,
            radius: 20
          });
        });

        // Place indicators around their primary linked report
        const indicatorCountPerReport: Record<string, number> = {};

        indicatorNodes.forEach((ind: any) => {
          const linkedEdge = data.edges.find((e: any) => e.target === ind.id || e.source === ind.id);
          const parentRepId = linkedEdge ? (linkedEdge.source === ind.id ? linkedEdge.target : linkedEdge.source) : null;
          const parentPos = (parentRepId && reportPositions[parentRepId]) ? reportPositions[parentRepId] : { x: centerX, y: centerY };

          const count = indicatorCountPerReport[parentRepId || 'root'] || 0;
          indicatorCountPerReport[parentRepId || 'root'] = count + 1;

          const angle = (count * 1.1) + Math.random() * 0.3;
          const dist = 75 + (count % 3) * 25;
          const x = parentPos.x + dist * Math.cos(angle);
          const y = parentPos.y + dist * Math.sin(angle);

          computedNodes.push({
            ...ind,
            x: Math.max(30, Math.min(width - 30, x)),
            y: Math.max(30, Math.min(height - 30, y)),
            radius: ind.type === 'org' ? 16 : 13
          });
        });

        setNodes(computedNodes);
        setEdges(data.edges);
      }
    } catch (err) {
      console.error('Failed to load network graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter(n => n.type === filterType);
  }, [nodes, filterType]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  const getNodeColor = (node: NetworkNode) => {
    if (node.type === 'report') {
      return node.riskLevel === 'HIGH RISK' ? '#f43f5e' : node.riskLevel === 'SUSPICIOUS' ? '#f59e0b' : '#10b981';
    }
    switch (node.type) {
      case 'upi': return '#a855f7'; // Purple
      case 'phone': return '#f59e0b'; // Amber
      case 'url': return '#06b6d4'; // Cyan
      case 'org': return '#3b82f6'; // Blue
      case 'email': return '#ec4899'; // Pink
      default: return '#64748b';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'report': return FileText;
      case 'upi': return CreditCard;
      case 'phone': return Phone;
      case 'url': return Globe;
      case 'org': return Building2;
      default: return Share2;
    }
  };

  // Find linked connections for selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    const connectedNodeIds = new Set<string>();
    edges.forEach(e => {
      if (e.source === selectedNode.id) connectedNodeIds.add(e.target);
      if (e.target === selectedNode.id) connectedNodeIds.add(e.source);
    });
    return nodes.filter(n => connectedNodeIds.has(n.id));
  }, [selectedNode, edges, nodes]);

  return (
    <div className="space-y-4">
      {/* Network Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                THREAT RELATIONSHIP GRAPH
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                MULTI-NODE RECON
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive topological mapping between scam reports, phone numbers, UPI IDs, URLs, and organizations.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['all', 'report', 'phone', 'upi', 'url', 'org'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterType === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Entities' : t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoomLevel(z => Math.min(2, z + 0.2))}
              className="p-1 text-slate-400 hover:text-cyan-400"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.2))}
              className="p-1 text-slate-400 hover:text-cyan-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
              className="p-1 text-slate-400 hover:text-cyan-400"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-xl h-[560px] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-mono space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Computing topological relationship matrix...</span>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Background Cyber Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                {/* Edges */}
                {filteredEdges.map((edge, idx) => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isHighlighted = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

                  return (
                    <line
                      key={idx}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? '#06b6d4' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={isHighlighted ? 'none' : '3 3'}
                      strokeOpacity={isHighlighted ? 0.9 : 0.6}
                    />
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const color = getNodeColor(node);
                  const r = node.radius || 15;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer transition-transform duration-150 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                      }}
                    >
                      {/* Pulse halo if selected */}
                      {isSelected && (
                        <circle
                          r={r + 8}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin"
                          opacity="0.8"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={r}
                        fill="#090d16"
                        stroke={color}
                        strokeWidth={isSelected ? 3 : 2}
                      />

                      {/* Inner dot */}
                      <circle
                        r={r * 0.4}
                        fill={color}
                        opacity={node.type === 'report' ? 0.9 : 0.7}
                      />

                      {/* Node Label Text */}
                      <text
                        dy={r + 14}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9.5"
                        fontFamily="monospace"
                        className="pointer-events-none select-none font-medium"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Interactive Inspector Floating Drawer */}
            {selectedNode && (
              <div className="absolute top-4 right-4 w-72 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getNodeColor(selectedNode) }}
                    />
                    <span className="font-mono uppercase font-bold text-slate-200">
                      {selectedNode.type} Details
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Identifier / Label:</span>
                    <span className="font-mono text-cyan-300 font-semibold break-all text-xs">
                      {selectedNode.fullValue || selectedNode.label}
                    </span>
                  </div>

                  {selectedNode.subLabel && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Category:</span>
                      <span className="text-slate-200">{selectedNode.subLabel}</span>
                    </div>
                  )}

                  {selectedNode.riskLevel && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Threat Severity:</span>
                      <span className={`font-mono font-bold ${selectedNode.riskLevel === 'HIGH RISK' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {selectedNode.riskLevel} {selectedNode.score ? `(${selectedNode.score}/100)` : ''}
                      </span>
                    </div>
                  )}

                  {selectedNode.timesSeen !== undefined && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Frequency across Registry:</span>
                      <span className="font-mono text-slate-200">{selectedNode.timesSeen} incident link(s)</span>
                    </div>
                  )}

                  {/* Connected Nodes List */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-[11px] block mb-1.5 font-mono">
                      LINKED ENTITIES ({selectedNodeConnections.length}):
                    </span>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedNodeConnections.map((cn) => (
                        <div
                          key={cn.id}
                          onClick={() => setSelectedNode(cn)}
                          className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer"
                        >
                          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[160px]">
                            {cn.label}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {cn.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedNode.type === 'report' && onSelectReport && (
                    <button
                      onClick={() => onSelectReport(selectedNode.id)}
                      className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                    >
                      Open Full Report Analysis
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Guide / Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-slate-400 flex items-center gap-3 backdrop-blur-sm">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Report
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Phone
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> UPI
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Domain
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Org
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">Drag to Pan · Scroll / Buttons to Zoom</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
