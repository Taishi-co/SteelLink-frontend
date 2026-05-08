import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface FinanceServiceItem {
  id: number
  enterprise_id: number
  name: string
  finance_type?: string
  min_amount?: number
  max_amount?: number
  term_days?: number
  annual_rate?: number
  fee_rule?: string
  risk_control_rule?: string
  required_documents?: string[]
  supported_scenarios?: string[]
  description?: string
  status: number
  audit_remark?: string
  created_at: string
  updated_at: string
}

export const financeService = {
  async listMine() {
    const response = await api.get<unknown, ApiResponse<FinanceServiceItem[]>>('/finance-services/mine')
    return response.data
  },

  async create(payload: Partial<FinanceServiceItem>) {
    const response = await api.post<unknown, ApiResponse<FinanceServiceItem>>('/finance-services', payload)
    return response.data
  },
}
