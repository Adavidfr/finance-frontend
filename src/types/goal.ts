export interface GoalProjection {
  percentage: number
  remaining: number
  projected_date: string | null
  on_track: boolean | null
}

export interface SavingsGoal {
  id: number
  name: string
  target_amount: string
  current_amount: string
  target_date: string | null
  projection: GoalProjection
  created_at: string
}