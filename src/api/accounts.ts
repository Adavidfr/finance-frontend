import { apiClient } from './client'
import type { Account } from '../types/account'
import type { PaginatedResponse } from '../types/transaction'

export async function getAccounts(): Promise<Account[]> {
  const response = await apiClient.get<PaginatedResponse<Account>>('/accounts/')
  return response.data.results
}