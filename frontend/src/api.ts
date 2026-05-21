import axios from 'axios';
import type { Transaction, SpendingSummary, BudgetVsActual } from './types';

const client = axios.create({ baseURL: '/api' });

export const fetchTransactions = () =>
  client.get<Transaction[]>('/transactions').then((r) => r.data);

export const fetchSpendingSummary = () =>
  client.get<SpendingSummary[]>('/spending-summary').then((r) => r.data);

export const fetchBudgetVsActual = () =>
  client.get<BudgetVsActual[]>('/budget-vs-actual').then((r) => r.data);
