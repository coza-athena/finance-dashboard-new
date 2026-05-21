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

export interface Budget {
  category: string;
  monthly_limit: string;
}

export interface TransactionInput {
  date: string;
  description: string;
  amount: number;
  category: string;
}
