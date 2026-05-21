import type { BudgetVsActual } from '../types';

interface Props {
  data: BudgetVsActual[];
}

function barColor(pct: number): string {
  if (pct > 100) return '#DC2626';
  if (pct > 80) return '#F4A01C';
  return '#00857C';
}

export default function BudgetComparison({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ath-navy)' }}>Budget vs Actual (This Month)</h2>
      <div className="space-y-4">
        {data.map((row) => {
          const budget = parseFloat(row.budget);
          const actual = parseFloat(row.actual);
          const pct = budget > 0 ? (actual / budget) * 100 : 0;
          const clampedPct = Math.min(pct, 100);
          const color = barColor(pct);

          return (
            <div key={row.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium" style={{ color: 'var(--ath-navy)' }}>{row.category}</span>
                <span className="font-semibold" style={{ color }}>
                  ${actual.toFixed(2)} / ${budget.toFixed(2)}
                </span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--ath-border)' }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${clampedPct}%`, backgroundColor: color }}
                />
              </div>
              <div className="text-xs text-right mt-0.5" style={{ color: 'var(--ath-text-muted)' }}>{pct.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
