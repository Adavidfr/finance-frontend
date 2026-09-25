export interface Account {
  id: number
  name: string
  account_type: 'checking' | 'savings' | 'credit' | 'cash'
  currency: string
  balance: string
  created_at: string
}