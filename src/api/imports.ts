import { apiClient } from './client'
import type { ImportJob } from '../types/import'

export async function uploadImport(file: File, accountId: number): Promise<ImportJob> {
  const formData = new FormData()
  formData.append('account', String(accountId))
  formData.append('file', file)

  const response = await apiClient.post<ImportJob>('/imports/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getImportJob(id: number): Promise<ImportJob> {
  const response = await apiClient.get<ImportJob>(`/imports/${id}/`)
  return response.data
}