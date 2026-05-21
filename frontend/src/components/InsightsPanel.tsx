import { useEffect, useState } from 'react';
import { fetchInsights } from '../api';
import type { Insights } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Food:          '#00FFD1',
  Transport:     '#7B9FFF',
  Housing:       '#00E5FF',
  Entertainment: '#FFD166',
  Utilities:     '#B0BEC5',
};

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00FFD1', letterSpacing: '0.12em' }}>
        {label}
      </span>
    </div>
  );
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInsights();
      setInsights(data);
      setLoaded(true);
    } catch {
      setError('Failed to load insights. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-xl shadow-lg p-6" style={{
      background: 'linear-gradient(145deg, #0A1628 0%, #0D2137 60%, #0A1E30 100%)',
      border: '1px solid rgba(0,255,209,0.2)',
      boxShadow: '0 0 30px rgba(0,133,124,0.15), inset 0 0 60px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div style={{
            width: 3, height: 20, borderRadius: 2,
            background: 'linear-gradient(to bottom, #00FFD1, #00857C)',
            boxShadow: '0 0 8px #00FFD1',
          }} />
          <h2 className="text-base font-bold uppercase tracking-widest" style={{ color: '#00FFD1', letterSpacing: '0.12em' }}>
            Financial Insights
          </h2>
          {insights?.source && (
            <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{
              backgroundColor: insights.source === 'claude' ? 'rgba(0,255,209,0.1)' : 'rgba(255,255,255,0.06)',
              color: insights.source === 'claude' ? '#00FFD1' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${insights.source === 'claude' ? 'rgba(0,255,209,0.3)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              {insights.source === 'claude' ? '✦ AI' : 'local'}
            </span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity"
          style={{
            backgroundColor: 'rgba(0,255,209,0.1)',
            color: '#00FFD1',
            border: '1px solid rgba(0,255,209,0.3)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: '#FF6B6B' }}>{error}</p>
      )}

      {loading && !loaded && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#00FFD1', animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#00FFD1', animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#00FFD1', animationDelay: '300ms' }} />
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg p-4" style={{
            background: 'rgba(0,255,209,0.05)',
            border: '1px solid rgba(0,255,209,0.15)',
          }}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(180,210,230,0.9)' }}>
              {insights.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spending Insights */}
            <div>
              <SectionHeader icon="📊" label="Spending Insights" />
              <ul className="space-y-2">
                {insights.spendingInsights.map((insight, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'rgba(180,210,230,0.8)' }}>
                    <span style={{ color: '#7B9FFF', flexShrink: 0, fontWeight: 700 }}>→</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Budget Recommendations */}
            <div>
              <SectionHeader icon="🎯" label="Budget Recommendations" />
              <ul className="space-y-3">
                {insights.budgetRecommendations.map((rec) => {
                  const color = CATEGORY_COLORS[rec.category] ?? '#00FFD1';
                  const diff = rec.recommendedBudget - rec.currentBudget;
                  return (
                    <li key={rec.category} className="rounded-lg p-2.5" style={{
                      background: `${color}0d`,
                      border: `1px solid ${color}22`,
                    }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase" style={{ color, letterSpacing: '0.06em' }}>
                          {rec.category}
                        </span>
                        <span className="text-xs font-mono font-bold" style={{ color }}>
                          ${rec.currentBudget} → ${rec.recommendedBudget}
                          <span className="ml-1 text-xs" style={{ color: diff > 0 ? '#FFD166' : '#00FFD1', opacity: 0.8 }}>
                            ({diff > 0 ? '+' : ''}{diff})
                          </span>
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(180,210,230,0.6)' }}>{rec.reason}</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* AI Tips */}
            <div>
              <SectionHeader icon="✦" label="Saving Tips" />
              <ul className="space-y-2">
                {insights.aiTips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'rgba(180,210,230,0.8)' }}>
                    <span style={{ color: '#FFD166', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
