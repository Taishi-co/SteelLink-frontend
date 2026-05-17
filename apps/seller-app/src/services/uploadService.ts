import api from './api'

export type UploadPurpose =
  | 'payment_voucher'
  | 'receipt_voucher'
  | 'product_image'
  | 'product_qualification'
  | 'title_voucher'
  | 'identity_card'
  | 'enterprise_license'
  | 'enterprise_service_document'

export interface UploadResult {
  bucket: string
  key: string
  url: string
  filename: string
  size: number
  content_type: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export const uploadService = {
  upload: async (file: File, purpose: UploadPurpose) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', purpose)

    const response = await api.post<unknown, ApiResponse<UploadResult>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
