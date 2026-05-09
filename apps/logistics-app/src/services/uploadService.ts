import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface UploadResult {
  bucket: string
  key: string
  url: string
  filename: string
  size: number
  content_type: string
}

export const uploadService = {
  upload: async (file: File, purpose: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', purpose)

    const response = await api.post<ApiResponse<UploadResult>, ApiResponse<UploadResult>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
