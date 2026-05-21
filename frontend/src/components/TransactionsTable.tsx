import type { Transaction } from '../types';

const CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  Food:          { bg: '#E6F4F3', color: '#00857C' },
  Transport:     { bg: '#E8EBF3', color: '#2E4170' },
  Housing:       { bg: '#E6FAF9', color: '#00A99D' },
  Entertainment: { bg: '#FEF3CD', color: '#B27200' },
  Utilities:     { bg: '#EDF0F2', color: '#3D4F61' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface Props {
  data: Transaction[];
}

export default function TransactionsTable({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ath-navy)' }}>Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="uppercase text-xs" style={{ borderBottom: '2px solid var(--ath-teal)', color: 'var(--ath-text-muted)' }}>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => {
              const badge = CATEGORY_BADGE[tx.category] ?? { bg: '#F4F6F8', color: '#3D4F61' };
              return (
                <tr key={tx.id} className="border-b" style={{ borderColor: 'var(--ath-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ath-teal-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                  <td className="py-2 pr-4 whitespace-nowrap" style={{ color: 'var(--ath-text-muted)' }}>{formatDate(tx.date)}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--ath-text)' }}>{tx.description}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2 text-right font-semibold" style={{ color: 'var(--ath-navy)' }}>
                    ${parseFloat(tx.amount).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
