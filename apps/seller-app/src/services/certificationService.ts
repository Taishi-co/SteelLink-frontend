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
  enterprise_role: string
  status: number
  legal_person: string
  unified_social_credit_code: string
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

export const certificationService = {
  getIdentityStatus: () =>
    api.get<unknown, ApiResponse<IdentityStatus>>('/users/me/identity'),

  submitIdentity: (payload: SubmitIdentityPayload) =>
    api.post<unknown, ApiResponse<{ message: string }>>('/users/me/identity', payload),

  getMyEnterprise: () =>
    api.get<unknown, ApiResponse<EnterpriseInfo>>('/enterprises'),

  createEnterprise: (payload: CreateEnterprisePayload) =>
    api.post<unknown, ApiResponse<EnterpriseInfo>>('/enterprises', payload),

  joinEnterprise: (payload: JoinEnterprisePayload) =>
    api.post<unknown, ApiResponse<{ message: string }>>('/users/me/enterprise/join', payload),
}
