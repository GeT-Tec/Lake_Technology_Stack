export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

// Tipos para tokenização
export interface Asset {
  id: string;
  name: string;
  description: string;
  value: number;
  owner: string;
  tokenized: boolean;
  metadata?: any;
}

export interface TokenizeAssetRequest {
  assetId: string;
  totalSupply: number;
  pricePerToken: number;
  metadata: any;
}

export interface CreateAssetRequest {
  name: string;
  description: string;
  value: number;
  category: string;
  metadata?: any;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}