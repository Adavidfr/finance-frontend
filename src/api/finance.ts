import { apiClient } from './client'
import type { DashboardSummary } from '../types/finance'

export async function getDashboardSummary(year: number, month: number): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/dashboard/summary/', {
    params: { year, month },
  })
  return response.data
}