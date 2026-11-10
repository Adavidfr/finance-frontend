export interface CategorySpending {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardSummary {
  current_month: {
    income: number;
    expenses: number;
    balance: number;
  };
  spending_by_category: CategorySpending[];
  monthly_trend: MonthlyTrend[];
}

export interface TransactionStats {
  total_transactions: number;
  largest_transaction: number;
  average_transaction: number;
}

export interface DashboardSummary {
  current_month: {
    income: number;
    expenses: number;
    balance: number;
  };
  spending_by_category: CategorySpending[];
  monthly_trend: MonthlyTrend[];
  stats: TransactionStats;
}
