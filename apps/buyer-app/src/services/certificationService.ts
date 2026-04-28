import api from './api'
import type { ApiResponse } from '@/types'

export interface IdentityStatus {
  identity_status: number
  real_name: string
  id_card: string
  identity_reject: string
}

export interface SubmitIdentityPayload {
  real_name: string
  id_card: string
  id_card_front_url: string
  id_card_back_url: string
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

export interface CreateEnterprisePayload {
  enterprise_name: string
  enterprise_role: string
  unified_social_credit_code: string
  legal_person: string
  legal_id_card: string
  business_license_url: string
  bank_account_name: string
  bank_account_no: string
  bank_name: string
  contact_phone: string
  contact_email?: string
  registered_address: string
}

export interface JoinEnterprisePayload {
  enterprise_code: string
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

  submitIdentity: (payload: SubmitIdentityPayload) =>
    api.post<unknown, ApiResponse<{ message: string }>>('/users/me/identity', payload),

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

  verifyEnterprise: async (enterpriseId: number, payload: CreateEnterprisePayload) => {
    const verifyRes = await api.post<unknown, ApiResponse<EnterpriseInfo>>(`/enterprises/${enterpriseId}/verify`, {
      legal_person: payload.legal_person,
      legal_id_card: payload.legal_id_card,
      business_license: payload.business_license_url,
      bank_account: payload.bank_account_no,
      bank_name: payload.bank_name,
      contact_name: payload.legal_person,
      contact_phone: payload.contact_phone,
      address: payload.registered_address,
    })
    return {
      ...verifyRes,
      data: verifyRes.data ? normalizeEnterpriseInfo(verifyRes.data) : verifyRes.data,
    }
  },

  createEnterprise: async (payload: CreateEnterprisePayload) => {
    const createRes = await api.post<unknown, ApiResponse<EnterpriseInfo>>('/enterprises', {
      name: payload.enterprise_name,
      credit_code: payload.unified_social_credit_code,
      enterprise_role: payload.enterprise_role,
      contact_name: payload.legal_person,
      contact_phone: payload.contact_phone,
      address: payload.registered_address,
    })

    if (createRes.code === 0 && createRes.data?.id) {
      return certificationService.verifyEnterprise(createRes.data.id, payload)
    }

    return {
      ...createRes,
      data: createRes.data ? normalizeEnterpriseInfo(createRes.data) : createRes.data,
    }
  },

  joinEnterprise: (payload: JoinEnterprisePayload) =>
    api.post<unknown, ApiResponse<{ message: string }>>('/users/me/enterprise/join', payload),
}
