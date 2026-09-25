import { apiClient } from './client'
import type { Budget } from '../types/budget'
import type { PaginatedResponse } from '../types/transaction'

export async function getBudgets(): Promise<Budget[]> {
  const response = await apiClient.get<PaginatedResponse<Budget>>('/budgets/')
  return response.data.results
}

export async function createBudget(data: {
  category: number
  limit_amount: number
  period: 'weekly' | 'monthly'
  alert_threshold: number
}): Promise<Budget> {
  const response = await apiClient.post<Budget>('/budgets/', data)
  return response.data
}

export async function updateBudget(
  id: number,
  data: { limit_amount: number; period: 'weekly' | 'monthly'; alert_threshold: number }
): Promise<Budget> {
  const response = await apiClient.patch<Budget>(`/budgets/${id}/`, data)
  return response.data
}

export async function deleteBudget(id: number): Promise<void> {
  await apiClient.delete(`/budgets/${id}/`)
}