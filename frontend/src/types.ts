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

export interface BudgetHistoryEntry {
  id: number;
  category: string;
  old_limit: string;
  new_limit: string;
  changed_at: string;
}

export interface BudgetRecommendation {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reason: string;
}

export interface Insights {
  summary: string;
  spendingInsights: string[];
  budgetRecommendations: BudgetRecommendation[];
  aiTips: string[];
  source: 'claude' | 'local';
}
