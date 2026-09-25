export interface Category {
  id: number
  name: string
  category_type: 'income' | 'expense'
  parent: number | null
  icon: string
  color: string
  is_default: boolean
}

export interface Transaction {
  id: number
  account: number
  category: number | null
  category_name: string | null
  amount: string
  date: string
  description: string
  raw_description: string
  source: 'manual' | 'import'
  categorization_method: 'rule' | 'llm' | 'manual' | 'pending'
  categorization_confidence: number | null
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}