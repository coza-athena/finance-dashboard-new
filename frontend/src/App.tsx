import { useEffect, useState } from 'react';
import { fetchTransactions, fetchSpendingSummary, fetchBudgetVsActual } from './api';
import type { Transaction, SpendingSummary, BudgetVsActual } from './types';
import SpendingChart from './components/SpendingChart';
import TransactionsTable from './components/TransactionsTable';
import BudgetComparison from './components/BudgetComparison';
import MonthlyTotals from './components/MonthlyTotals';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SpendingSummary[]>([]);
  const [budget, setBudget] = useState<BudgetVsActual[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSpendingSummary(), fetchBudgetVsActual()])
      .then(([txs, sum, bud]) => {
        setTransactions(txs);
        setSummary(sum);
        setBudget(bud);
      })
      .catch(() => setError('Failed to load data. Is the backend running?'));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ath-bg)' }}>
      <header style={{ backgroundColor: 'var(--ath-navy)' }} className="shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: 'var(--ath-teal)' }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Personal Finance Dashboard</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="border px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <MonthlyTotals data={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SpendingChart data={summary} />
          <BudgetComparison data={budget} />
        </div>

        <TransactionsTable data={transactions} />
      </main>
    </div>
  );
}
