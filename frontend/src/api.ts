import axios from 'axios';
import type { Transaction, SpendingSummary, BudgetVsActual, Budget, TransactionInput } from './types';

const client = axios.create({ baseURL: '/api' });

export const fetchTransactions = () =>
  client.get<Transaction[]>('/transactions').then((r) => r.data);

export const fetchSpendingSummary = () =>
  client.get<SpendingSummary[]>('/spending-summary').then((r) => r.data);

export const fetchBudgetVsActual = () =>
  client.get<BudgetVsActual[]>('/budget-vs-actual').then((r) => r.data);

export const fetchBudgets = () =>
  client.get<Budget[]>('/budgets').then((r) => r.data);

export const createTransaction = (data: TransactionInput) =>
  client.post<Transaction>('/transactions', data).then((r) => r.data);

export const updateTransaction = (id: number, data: TransactionInput) =>
  client.put<Transaction>(`/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id: number) =>
  client.delete(`/transactions/${id}`);

export const updateBudget = (category: string, monthly_limit: number) =>
  client.put<Budget>(`/budgets/${category}`, { monthly_limit }).then((r) => r.data);

export const fetchAiSuggestions = (category: string, actual: number, budget: number) =>
  client
    .post<{ tips: string[]; source: string }>('/ai-suggestions', { category, actual, budget })
    .then((r) => r.data);
