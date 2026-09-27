import React, { useState } from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { BlocklistItem } from '../types';

export const BlocklistView: React.FC = () => {
  const [items, setItems] = useState<BlocklistItem[]>([
    {
      id: 'BLK-101',
      type: 'PHONE',
      value: '+91 98765 43210',
      status: 'VERIFIED',
      occurrenceCount: 3,
      firstSeenAt: '2026-09-25',
      lastSeenAt: '2026-09-27'
    },
    {
      id: 'BLK-102',
      type: 'UPI',
      value: 'refund-verify@ybl',
      status: 'PENDING',
      occurrenceCount: 1,
      firstSeenAt: '2026-09-27',
      lastSeenAt: '2026-09-27'
    }
  ]);

  const handleSimulateMatch = (value: string) => {
    setItems(prev => prev.map(item => {
      if (item.value === value) {
        const newCount = item.occurrenceCount + 1;
        return {
          ...item,
          occurrenceCount: newCount,
          status: newCount >= 2 ? 'VERIFIED' : 'PENDING',
          lastSeenAt: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs font-mono text-slate-200">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-100">VERIFIED-ONLY BLOCKLIST REGISTRY</h3>
        <span className="text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
          Rule: 2+ Sessions = Verified
        </span>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-800 text-slate-500 uppercase">
            <th className="py-2">Entity Value</th>
            <th className="py-2">Type</th>
            <th className="py-2">Sessions</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {items.map(item => (
            <tr key={item.id}>
              <td className="py-2.5 text-slate-100 font-bold">{item.value}</td>
              <td className="py-2.5 text-slate-400">{item.type}</td>
              <td className="py-2.5 text-slate-300">{item.occurrenceCount} session(s)</td>
              <td className="py-2.5">
                {item.status === 'VERIFIED' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded w-max text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded w-max text-[10px]">
                    <Clock className="w-3 h-3" /> PENDING ({item.occurrenceCount}/2)
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right">
                <button
                  onClick={() => handleSimulateMatch(item.value)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px]"
                >
                  + Match Session
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
