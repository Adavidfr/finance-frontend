import { apiClient } from './client'
import type { SavingsGoal } from '../types/goal'
import type { PaginatedResponse } from '../types/transaction'

export async function getGoals(): Promise<SavingsGoal[]> {
  const response = await apiClient.get<PaginatedResponse<SavingsGoal>>('/goals/')
  return response.data.results
}

export async function createGoal(data: {
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
}): Promise<SavingsGoal> {
  const response = await apiClient.post<SavingsGoal>('/goals/', data)
  return response.data
}

export async function updateGoal(
  id: number,
  data: { name: string; target_amount: number; current_amount: number; target_date?: string }
): Promise<SavingsGoal> {
  const response = await apiClient.patch<SavingsGoal>(`/goals/${id}/`, data)
  return response.data
}

export async function deleteGoal(id: number): Promise<void> {
  await apiClient.delete(`/goals/${id}/`)
}