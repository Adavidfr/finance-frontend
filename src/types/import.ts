export interface ImportJob {
  id: number
  account: number
  file: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  total_rows: number
  processed_rows: number
  error_message: string
  created_at: string
  completed_at: string | null
}