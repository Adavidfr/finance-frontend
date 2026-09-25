import { apiClient } from './client'
import type { Insight } from '../types/insight'
import type { PaginatedResponse } from '../types/transaction'

export async function getInsights(): Promise<Insight[]> {
  const response = await apiClient.get<PaginatedResponse<Insight>>('/insights/')
  return response.data.results
}

export async function generateInsights(): Promise<Insight[]> {
  const response = await apiClient.post<Insight[]>('/insights/generate/')
  return response.data
}