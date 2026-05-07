import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface IdentityStatus {
  identity_status: number
  real_name: string
  id_card: string
  identity_reject: string
}

export interface EnterpriseInfo {
  id: number
  enterprise_code: string
  enterprise_name: string
  name?: string
  enterprise_role: string
  status: number
  legal_person: string
  credit_code?: string
  unified_social_credit_code: string
  verification_info?: {
    legal_person?: string
    legal_id_card?: string
    business_license?: string
    bank_account?: string
    bank_name?: string
    contact_name?: string
    contact_phone?: string
    address?: string
  }
}

export interface EnterpriseServicePermission {
  id: number
  enterprise_id: number
  enterprise_code: string
  service: 'sales' | 'procurement' | 'logistics' | 'warehouse' | 'finance'
  enterprise_role: 'buyer' | 'seller' | 'logistics' | 'warehouse' | 'fund'
  status: number
  audit_reason: string
  approved_at?: string
  updated_at: string
}

export interface EnterpriseServiceOverview {
  permissions: EnterpriseServicePermission[]
  required_documents: Record<string, string[]>
}

const identityStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未认证', color: 'default' },
  1: { label: '审核中', color: 'processing' },
  2: { label: '已认证', color: 'success' },
  3: { label: '已驳回', color: 'error' },
}

export const getIdentityStatusLabel = (status: number) => identityStatusMap[status]?.label || '未知'
export const getIdentityStatusColor = (status: number) => identityStatusMap[status]?.color || 'default'

interface EnterpriseListResponse {
  list: EnterpriseInfo[]
  total: number
  page: number
  page_size: number
}

export function normalizeEnterpriseInfo(enterprise: EnterpriseInfo): EnterpriseInfo {
  const verification = enterprise.verification_info
  return {
    ...enterprise,
    enterprise_name: enterprise.enterprise_name || enterprise.name || '',
    unified_social_credit_code: enterprise.unified_social_credit_code || enterprise.credit_code || '',
    legal_person: enterprise.legal_person || verification?.legal_person || '',
  }
}

export const certificationService = {
  getIdentityStatus: () =>
    api.get<unknown, ApiResponse<IdentityStatus>>('/users/me/identity'),

  getMyEnterprise: () =>
    api.get<unknown, ApiResponse<EnterpriseListResponse>>('/enterprises'),

  getEnterpriseByCode: async (enterpriseCode: string) => {
    const res = await api.get<unknown, ApiResponse<EnterpriseListResponse>>('/enterprises', {
      params: {
        keyword: enterpriseCode,
        page_size: 1,
      },
    })
    const match = res.data?.list?.find((item) => item.enterprise_code === enterpriseCode)
    return {
      ...res,
      data: match ? normalizeEnterpriseInfo(match) : null,
    } as ApiResponse<EnterpriseInfo | null>
  },

  getMyServices: () =>
    api.get<unknown, ApiResponse<EnterpriseServiceOverview>>('/enterprises/me/services'),
}
