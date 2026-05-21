import { useState } from 'react';
import type { BudgetVsActual, BudgetHistoryEntry } from '../types';
import { fetchAiSuggestions } from '../api';

interface Props {
  data: BudgetVsActual[];
  history: BudgetHistoryEntry[];
}

interface BarConfig {
  gradient: [string, string];
  glow: string;
}

function barConfig(pct: number): BarConfig {
  if (pct > 100) return { gradient: ['#FF6B6B', '#DC2626'], glow: '#FF6B6B' };
  if (pct > 80)  return { gradient: ['#FFD166', '#F4A01C'], glow: '#FFD166' };
  return           { gradient: ['#00FFD1', '#00857C'],  glow: '#00FFD1' };
}

interface TipsState {
  loading: boolean;
  tips: string[] | null;
  source?: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function BudgetComparison({ data, history }: Props) {
  const [tipsMap, setTipsMap] = useState<Record<string, TipsState>>({});

  // Most recent change per category
  const latestChange: Record<string, BudgetHistoryEntry> = {};
  for (const entry of history) {
    if (!latestChange[entry.category]) latestChange[entry.category] = entry;
  }

  async function loadTips(category: string, actual: number, budget: number) {
    if (tipsMap[category]?.tips || tipsMap[category]?.loading) return;
    setTipsMap((prev) => ({ ...prev, [category]: { loading: true, tips: null } }));
    try {
      const result = await fetchAiSuggestions(category, actual, budget);
      setTipsMap((prev) => ({ ...prev, [category]: { loading: false, tips: result.tips, source: result.source } }));
    } catch {
      setTipsMap((prev) => ({ ...prev, [category]: { loading: false, tips: ['Could not load suggestions. Try again later.'] } }));
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-6" style={{
      background: 'linear-gradient(145deg, #0A1628 0%, #0D2137 60%, #0A1E30 100%)',
      border: '1px solid rgba(0,255,209,0.2)',
      boxShadow: '0 0 30px rgba(0,133,124,0.15), inset 0 0 60px rgba(0,0,0,0.3)',
    }}>
      {/* SVG gradient defs */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          {data.map((row) => {
            const pct = parseFloat(row.budget) > 0
              ? (parseFloat(row.actual) / parseFloat(row.budget)) * 100 : 0;
            const { gradient: [from, to] } = barConfig(pct);
            return (
              <linearGradient key={row.category} id={`bgrad-${row.category}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={from} stopOpacity={0.9} />
                <stop offset="100%" stopColor={to} stopOpacity={0.8} />
              </linearGradient>
            );
          })}
        </defs>
      </svg>

      <div className="flex items-center gap-2 mb-5">
        <div style={{
          width: 3, height: 20, borderRadius: 2,
          background: 'linear-gradient(to bottom, #00FFD1, #00857C)',
          boxShadow: '0 0 8px #00FFD1',
        }} />
        <h2 className="text-base font-bold uppercase tracking-widest" style={{ color: '#00FFD1', letterSpacing: '0.12em' }}>
          Budget vs Actual
        </h2>
      </div>

      <div className="space-y-5">
        {data.map((row) => {
          const budget = parseFloat(row.budget);
          const actual = parseFloat(row.actual);
          const pct = budget > 0 ? (actual / budget) * 100 : 0;
          const clampedPct = Math.min(pct, 100);
          const { glow } = barConfig(pct);
          const isOver = pct > 100;
          const tips = tipsMap[row.category];
          const change = latestChange[row.category];
          const changeDiff = change ? parseFloat(change.new_limit) - parseFloat(change.old_limit) : 0;

          return (
            <div key={row.category}>
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-wide uppercase text-xs" style={{ color: 'rgba(180,210,230,0.7)', letterSpacing: '0.08em' }}>
                    {row.category}
                  </span>
                  {change && (
                    <span
                      title={`Changed from $${parseFloat(change.old_limit).toFixed(0)} → $${parseFloat(change.new_limit).toFixed(0)} · ${timeAgo(change.changed_at)}`}
                      className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold cursor-default"
                      style={{
                        backgroundColor: changeDiff > 0 ? 'rgba(251,191,36,0.15)' : 'rgba(0,255,209,0.1)',
                        color: changeDiff > 0 ? '#FFD166' : '#00FFD1',
                        border: `1px solid ${changeDiff > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(0,255,209,0.2)'}`,
                      }}
                    >
                      {changeDiff > 0 ? '▲' : '▼'} ${Math.abs(changeDiff).toFixed(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold" style={{ color: glow, textShadow: `0 0 8px ${glow}88` }}>
                  ${actual.toFixed(2)} <span style={{ opacity: 0.5 }}>/ ${budget.toFixed(2)}</span>
                </span>
              </div>

              {/* Track */}
              <div className="relative w-full rounded-full overflow-hidden" style={{
                height: 8,
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {/* Filled bar */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${clampedPct}%`,
                    backgroundColor: glow,
                    backgroundImage: `linear-gradient(to right, ${barConfig(pct).gradient[0]}, ${barConfig(pct).gradient[1]})`,
                    boxShadow: `0 0 10px ${glow}99, 0 0 4px ${glow}66`,
                  }}
                />
                {/* Shine overlay */}
                <div className="absolute top-0 left-0 h-1/2 w-full rounded-full" style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                  pointerEvents: 'none',
                }} />
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono" style={{ color: `${glow}bb` }}>
                  {pct.toFixed(0)}%
                </span>
                {isOver && (
                  <button
                    onClick={() => loadTips(row.category, actual, budget)}
                    className="text-xs font-semibold px-2 py-0.5 rounded-full transition-opacity"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.15)',
                      color: '#FF6B6B',
                      border: '1px solid rgba(239,68,68,0.4)',
                    }}
                  >
                    {tips?.loading ? 'Loading…' : tips?.tips ? 'Tips ▲' : '✦ Get AI Tips'}
                  </button>
                )}
              </div>

              {/* AI Tips panel */}
              {isOver && tips?.tips && (
                <div className="mt-3 rounded-lg p-3" style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span style={{ color: '#FF6B6B', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      ✦ AI Saving Tips
                    </span>
                    {tips.source === 'mock' && (
                      <span style={{ color: 'rgba(255,107,107,0.5)', fontSize: 10 }}>(offline)</span>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {tips.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: 'rgba(252,165,165,0.85)' }}>
                        <span style={{ color: '#FF6B6B', flexShrink: 0 }}>{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
