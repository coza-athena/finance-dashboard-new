import type { SpendingSummary, BudgetVsActual } from '../types';

interface Props {
  data: SpendingSummary[];
  budgets: BudgetVsActual[];
}

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

interface CardStyle {
  bg: string;
  border: string;
  labelColor: string;
  amountColor: string;
  subColor: string;
  badge?: string;
  badgeText?: string;
}

function cardStyle(pct: number, isCurrent: boolean): CardStyle {
  if (pct > 100) return {
    bg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
    border: 'rgba(239,68,68,0.5)',
    labelColor: 'rgba(252,165,165,0.8)',
    amountColor: '#fca5a5',
    subColor: 'rgba(252,165,165,0.6)',
    badge: '#ef4444',
    badgeText: 'Over budget',
  };
  if (pct > 80) return {
    bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
    border: 'rgba(251,191,36,0.5)',
    labelColor: 'rgba(253,230,138,0.8)',
    amountColor: '#fde68a',
    subColor: 'rgba(253,230,138,0.6)',
    badge: '#f59e0b',
    badgeText: 'Near limit',
  };
  return {
    bg: isCurrent
      ? 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)'
      : 'linear-gradient(135deg, #0a1628 0%, #0d2137 100%)',
    border: 'rgba(0,255,209,0.3)',
    labelColor: 'rgba(0,255,209,0.7)',
    amountColor: '#00FFD1',
    subColor: 'rgba(0,255,209,0.5)',
    badge: '#00857C',
    badgeText: isCurrent ? 'Current month' : 'On track',
  };
}

export default function MonthlyTotals({ data, budgets }: Props) {
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.budget), 0);

  const totals = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.month] = (acc[row.month] ?? 0) + parseFloat(row.total);
    return acc;
  }, {});

  const months = Object.keys(totals).sort();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {months.map((month, i) => {
        const spent = totals[month];
        const pct = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
        const isCurrent = i === months.length - 1;
        const style = cardStyle(pct, isCurrent);

        return (
          <div
            key={month}
            className="rounded-xl shadow-lg p-5 relative overflow-hidden"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              boxShadow: `0 0 20px ${style.border}`,
            }}
          >
            {/* Shine overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
            }} />

            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: style.labelColor }}>
              {formatMonth(month)}
            </div>
            <div className="text-2xl font-bold font-mono" style={{
              color: style.amountColor,
              textShadow: `0 0 12px ${style.amountColor}88`,
            }}>
              ${spent.toFixed(2)}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs" style={{ color: style.subColor }}>
                of ${totalBudget.toFixed(2)} budget
              </div>
              {style.badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                  backgroundColor: `${style.badge}22`,
                  color: style.amountColor,
                  border: `1px solid ${style.badge}55`,
                }}>
                  {pct.toFixed(0)}% · {style.badgeText}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full rounded-full overflow-hidden" style={{
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}>
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: style.amountColor,
                boxShadow: `0 0 6px ${style.amountColor}`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
