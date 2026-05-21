import { useState, useEffect, useRef, useCallback } from 'react';
import type { Transaction } from '../types';

const PAGE_SIZE = 20;

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
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  const filtered = query.trim()
    ? data.filter((tx) => tx.description.toLowerCase().includes(query.toLowerCase()))
    : data;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--ath-navy)' }}>Transactions</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'var(--ath-teal-light)',
            color: 'var(--ath-teal)',
            border: '1px solid var(--ath-border)',
          }}>
            {filtered.length} total
          </span>
        </div>
        <input
          type="text"
          placeholder="Search descriptions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg outline-none w-56"
          style={{
            border: '1px solid var(--ath-border)',
            color: 'var(--ath-text)',
            backgroundColor: 'var(--ath-bg)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ath-teal)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ath-border)')}
        />
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: 480, overflowY: 'auto' }}>
        <table className="w-full text-sm text-left">
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr className="uppercase text-xs" style={{ borderBottom: '2px solid var(--ath-teal)', color: 'var(--ath-text-muted)' }}>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((tx) => {
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
            {/* Sentinel row — when visible, triggers loading more */}
            {hasMore && (
              <tr ref={sentinelRef}>
                <td colSpan={4} className="py-3 text-center text-xs" style={{ color: 'var(--ath-text-muted)' }}>
                  Loading more…
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: 'var(--ath-text-muted)' }}>
            No transactions match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {!hasMore && filtered.length > 0 && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--ath-text-muted)' }}>
          Showing all {filtered.length} transactions
        </p>
      )}
    </div>
  );
}
