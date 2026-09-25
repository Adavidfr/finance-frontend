export interface BudgetProgress {
  spent: number
  limit: number
  percentage: number
  is_alert: boolean
  remaining: number
}

export interface Budget {
  id: number
  category: number
  limit_amount: string
  period: 'weekly' | 'monthly'
  alert_threshold: number
  progress: BudgetProgress
  created_at: string
}