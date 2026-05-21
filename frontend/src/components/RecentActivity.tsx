import type { Transaction } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Food:          '#00857C',
  Transport:     '#2E4170',
  Housing:       '#00A99D',
  Entertainment: '#F4A01C',
  Utilities:     '#6B7E8F',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface Props {
  data: Transaction[];
}

export default function RecentActivity({ data }: Props) {
  const recent = data.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow p-6 h-fit" style={{ border: '1px solid var(--ath-border)' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ath-navy)' }}>Recent Activity</h2>

      {recent.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ath-text-muted)' }}>No recent transactions.</p>
      ) : (
        <ol className="relative" style={{ borderLeft: '2px solid var(--ath-border)', marginLeft: '0.5rem' }}>
          {recent.map((tx, i) => {
            const color = CATEGORY_COLORS[tx.category] ?? '#6B7E8F';
            return (
              <li key={tx.id} className={`pl-4 ${i < recent.length - 1 ? 'pb-4' : ''}`} style={{ position: 'relative' }}>
                {/* timeline dot */}
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    left: -6,
                    top: 4,
                    border: '2px solid white',
                  }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium leading-tight" style={{ color: 'var(--ath-navy)' }}>
                      {tx.description}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ath-text-muted)' }}>
                      {tx.category} · {formatDate(tx.date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ color }}>
                    ${parseFloat(tx.amount).toFixed(2)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
