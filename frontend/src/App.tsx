import { useEffect, useState } from 'react';
import { fetchTransactions, fetchSpendingSummary, fetchBudgetVsActual, fetchBudgetHistory } from './api';
import type { Transaction, SpendingSummary, BudgetVsActual, BudgetHistoryEntry } from './types';
import SpendingChart from './components/SpendingChart';
import TransactionsTable from './components/TransactionsTable';
import BudgetComparison from './components/BudgetComparison';
import MonthlyTotals from './components/MonthlyTotals';
import AdminPanel from './components/AdminPanel';
import RecentActivity from './components/RecentActivity';
import InsightsPanel from './components/InsightsPanel';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SpendingSummary[]>([]);
  const [budget, setBudget] = useState<BudgetVsActual[]>([]);
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'insights' | 'admin'>('dashboard');

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSpendingSummary(), fetchBudgetVsActual(), fetchBudgetHistory()])
      .then(([txs, sum, bud, hist]) => {
        setTransactions(txs);
        setSummary(sum);
        setBudget(bud);
        setBudgetHistory(hist);
      })
      .catch(() => setError('Failed to load data. Is the backend running?'));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ath-bg)' }}>
      <header style={{ backgroundColor: 'var(--ath-navy)' }} className="shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: 'var(--ath-teal)' }} />
            <h1 className="text-2xl font-bold text-white tracking-tight">Personal Finance Dashboard</h1>
          </div>
          <nav className="flex gap-1">
            {(['dashboard', 'insights', 'admin'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors"
                style={{
                  backgroundColor: view === v ? 'var(--ath-teal)' : 'transparent',
                  color: view === v ? 'white' : 'rgba(255,255,255,0.65)',
                }}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="border px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        {view === 'dashboard' ? (
          <>
            <MonthlyTotals data={summary} budgets={budget} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpendingChart data={summary} />
              <BudgetComparison data={budget} history={budgetHistory} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TransactionsTable data={transactions} />
              </div>
              <RecentActivity data={transactions} />
            </div>
          </>
        ) : view === 'insights' ? (
          <InsightsPanel />
        ) : (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}
