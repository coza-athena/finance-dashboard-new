import type { SpendingSummary } from '../types';

interface Props {
  data: SpendingSummary[];
}

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function MonthlyTotals({ data }: Props) {
  const totals = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.month] = (acc[row.month] ?? 0) + parseFloat(row.total);
    return acc;
  }, {});

  const months = Object.keys(totals).sort();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {months.map((month, i) => (
        <div
          key={month}
          className="rounded-xl shadow p-5"
          style={{
            backgroundColor: i === months.length - 1 ? 'var(--ath-teal)' : 'white',
            border: '1px solid var(--ath-border)',
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: i === months.length - 1 ? 'rgba(255,255,255,0.75)' : 'var(--ath-text-muted)' }}
          >
            {formatMonth(month)}
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: i === months.length - 1 ? 'white' : 'var(--ath-navy)' }}
          >
            ${totals[month].toFixed(2)}
          </div>
          {i === months.length - 1 && (
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Current month
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
