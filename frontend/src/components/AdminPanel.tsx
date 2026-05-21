import { useEffect, useState } from 'react';
import type { Transaction, Budget, TransactionInput } from '../types';
import {
  fetchTransactions,
  fetchBudgets,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateBudget,
} from '../api';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];

const EMPTY_FORM: TransactionInput = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  category: 'Food',
};

export default function AdminPanel() {
  const [tab, setTab] = useState<'transactions' | 'budgets'>('transactions');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<TransactionInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchBudgets()])
      .then(([txs, buds]) => {
        setTransactions(txs);
        setBudgets(buds);
        const edits: Record<string, string> = {};
        buds.forEach((b) => { edits[b.category] = b.monthly_limit; });
        setBudgetEdits(edits);
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(tx: Transaction) {
    setForm({
      date: tx.date.slice(0, 10),
      description: tx.description,
      amount: parseFloat(tx.amount),
      category: tx.category,
    });
    setEditingId(tx.id);
    setShowForm(true);
  }

  async function handleSaveTransaction() {
    if (!form.date || !form.description || !form.category || form.amount <= 0) {
      showToast('All fields are required and amount must be > 0', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        const updated = await updateTransaction(editingId, form);
        setTransactions((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
        showToast('Transaction updated', 'success');
      } else {
        const created = await createTransaction(form);
        setTransactions((prev) => [created, ...prev]);
        showToast('Transaction added', 'success');
      }
      setShowForm(false);
    } catch {
      showToast('Failed to save transaction', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaction deleted', 'success');
    } catch {
      showToast('Failed to delete transaction', 'error');
    }
  }

  async function handleSaveBudget(category: string) {
    const val = parseFloat(budgetEdits[category]);
    if (isNaN(val) || val < 0) {
      showToast('Budget must be a non-negative number', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateBudget(category, val);
      setBudgets((prev) =>
        prev.map((b) => (b.category === category ? { ...b, monthly_limit: String(val.toFixed(2)) } : b))
      );
      showToast(`${category} budget updated`, 'success');
    } catch {
      showToast('Failed to update budget', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm" style={{ color: 'var(--ath-text-muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium"
          style={{
            backgroundColor: toast.type === 'success' ? '#E6F4F3' : '#FEF2F2',
            color: toast.type === 'success' ? '#00857C' : '#B91C1C',
            border: `1px solid ${toast.type === 'success' ? '#00857C' : '#FECACA'}`,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--ath-border)' }}>
        {(['transactions', 'budgets'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium capitalize transition-colors"
            style={{
              borderBottom: tab === t ? '2px solid var(--ath-teal)' : '2px solid transparent',
              color: tab === t ? 'var(--ath-teal)' : 'var(--ath-text-muted)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Transactions tab */}
      {tab === 'transactions' && (
        <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ath-navy)' }}>Manage Transactions</h2>
            <button
              onClick={openNew}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--ath-teal)' }}
            >
              + Add Transaction
            </button>
          </div>

          {/* Inline form */}
          {showForm && (
            <div className="rounded-lg p-4 mb-4 space-y-3" style={{ backgroundColor: 'var(--ath-bg)', border: '1px solid var(--ath-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--ath-navy)' }}>
                {editingId !== null ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--ath-text-muted)' }}>Date</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full text-sm px-2 py-1.5 rounded border outline-none"
                    style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text)' }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1" style={{ color: 'var(--ath-text-muted)' }}>Description</label>
                  <input type="text" value={form.description} placeholder="e.g. Grocery Run"
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full text-sm px-2 py-1.5 rounded border outline-none"
                    style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--ath-text-muted)' }}>Amount ($)</label>
                  <input type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                    className="w-full text-sm px-2 py-1.5 rounded border outline-none"
                    style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--ath-text-muted)' }}>Category</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-sm px-2 py-1.5 rounded border outline-none"
                    style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text)' }}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-sm rounded border"
                  style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text-muted)' }}>
                  Cancel
                </button>
                <button onClick={handleSaveTransaction} disabled={saving}
                  className="px-3 py-1.5 text-sm text-white rounded hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--ath-teal)' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="uppercase text-xs" style={{ borderBottom: '2px solid var(--ath-teal)', color: 'var(--ath-text-muted)' }}>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b" style={{ borderColor: 'var(--ath-border)' }}>
                    <td className="py-2 pr-4 whitespace-nowrap" style={{ color: 'var(--ath-text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </td>
                    <td className="py-2 pr-4" style={{ color: 'var(--ath-text)' }}>{tx.description}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--ath-text-muted)' }}>{tx.category}</td>
                    <td className="py-2 pr-4 text-right font-semibold" style={{ color: 'var(--ath-navy)' }}>
                      ${parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => openEdit(tx)}
                        className="text-xs px-2 py-1 rounded mr-1 hover:opacity-80"
                        style={{ backgroundColor: 'var(--ath-teal-light)', color: 'var(--ath-teal)' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(tx.id)}
                        className="text-xs px-2 py-1 rounded hover:opacity-80"
                        style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Budgets tab */}
      {tab === 'budgets' && (
        <div className="bg-white rounded-xl shadow p-6" style={{ border: '1px solid var(--ath-border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ath-navy)' }}>Manage Monthly Budgets</h2>
          <div className="space-y-3 max-w-md">
            {budgets.map((b) => (
              <div key={b.category} className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium" style={{ color: 'var(--ath-navy)' }}>{b.category}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--ath-text-muted)' }}>$</span>
                  <input
                    type="number" min="0" step="1"
                    value={budgetEdits[b.category] ?? ''}
                    onChange={(e) => setBudgetEdits((prev) => ({ ...prev, [b.category]: e.target.value }))}
                    className="flex-1 text-sm px-2 py-1.5 rounded border outline-none"
                    style={{ borderColor: 'var(--ath-border)', color: 'var(--ath-text)' }}
                  />
                </div>
                <button
                  onClick={() => handleSaveBudget(b.category)}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm text-white rounded hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--ath-teal)' }}
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
