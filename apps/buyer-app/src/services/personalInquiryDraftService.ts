import api from './api'
import type { ApiResponse } from '@/types'

export interface PersonalInquiryDraft {
  id: number
  draft_no: string
  user_id: number
  title: string
  product_name: string
  category: string
  material: string
  spec: string
  quantity: number
  unit: string
  target_price: number
  delivery_address: string
  requirement: string
  status: string
  created_at: string
  updated_at: string
}

export type PersonalInquiryDraftPayload = Pick<
  PersonalInquiryDraft,
  'title' | 'product_name' | 'category' | 'material' | 'spec' | 'quantity' | 'unit' | 'target_price' | 'delivery_address' | 'requirement'
>

export const personalInquiryDraftService = {
  async list() {
    const response = await api.get<unknown, ApiResponse<{ list: PersonalInquiryDraft[] }>>('/users/me/inquiry-drafts')
    return response.data.list
  },

  async create(payload: PersonalInquiryDraftPayload) {
    const response = await api.post<unknown, ApiResponse<PersonalInquiryDraft>>('/users/me/inquiry-drafts', payload)
    return response.data
  },

  async update(id: number, payload: PersonalInquiryDraftPayload) {
    const response = await api.put<unknown, ApiResponse<PersonalInquiryDraft>>(`/users/me/inquiry-drafts/${id}`, payload)
    return response.data
  },

  async remove(id: number) {
    const response = await api.delete<unknown, ApiResponse<{ message: string }>>(`/users/me/inquiry-drafts/${id}`)
    return response.data
  },
}
