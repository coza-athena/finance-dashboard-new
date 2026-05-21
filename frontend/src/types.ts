export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  category: string;
}

export interface SpendingSummary {
  month: string;
  category: string;
  total: string;
}

export interface BudgetVsActual {
  category: string;
  budget: string;
  actual: string;
}
