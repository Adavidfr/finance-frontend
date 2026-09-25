export interface Insight {
  id: number
  insight_type: 'spending_change' | 'goal_projection' | 'budget_alert' | 'general'
  generated_text: string
  supporting_data: Record<string, unknown>
  created_at: string
}