import { apiClient } from './client'
import type { Transaction, Category, PaginatedResponse } from '../types/transaction'

export async function getTransactions(page: number = 1): Promise<PaginatedResponse<Transaction>> {
  const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions/', {
    params: { page },
  })
  return response.data
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<PaginatedResponse<Category>>('/categories/')
  return response.data.results
}

export async function updateTransactionCategory(
  id: number,
  categoryId: number
): Promise<Transaction> {
  const response = await apiClient.patch<Transaction>(`/transactions/${id}/`, {
    category: categoryId,
  })
  return response.data
}

export async function confirmTransaction(id: number): Promise<Transaction> {
  const response = await apiClient.post<Transaction>(`/transactions/${id}/confirm/`)
  return response.data
}

export async function createTransaction(data: {
  account: number
  amount: number
  date: string
  description: string
}): Promise<Transaction> {
  const response = await apiClient.post<Transaction>('/transactions/', data)
  return response.data
}

export async function updateTransaction(
  id: number,
  data: { amount: number; date: string; description: string }
): Promise<Transaction> {
  const response = await apiClient.patch<Transaction>(`/transactions/${id}/`, data)
  return response.data
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/transactions/${id}/`)
}

export async function getTransactionById(id: number): Promise<Transaction> {
  const response = await apiClient.get<Transaction>(`/transactions/${id}/`)
  return response.data
}