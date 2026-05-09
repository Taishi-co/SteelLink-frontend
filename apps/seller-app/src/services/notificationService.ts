import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface NotificationItem {
  id: number
  type: 'admin' | 'order' | 'audit' | 'system'
  title: string
  content: string
  link_url: string
  status: number
  created_at: string
}

export interface NotificationListResult {
  list: NotificationItem[]
  total: number
  unread_count: number
}

export const notificationService = {
  list: async (params?: { status?: number; page?: number; page_size?: number }) => {
    const response = await api.get<unknown, ApiResponse<NotificationListResult>>('/notifications', { params })
    return response.data
  },
  unreadCount: async () => {
    const response = await api.get<unknown, ApiResponse<{ unread_count: number }>>('/notifications/unread-count')
    return response.data
  },
  markRead: (id: number) => api.put<unknown, ApiResponse<{ message: string }>>(`/notifications/${id}/read`).then((response) => response.data),
  markAllRead: () => api.put<unknown, ApiResponse<{ message: string }>>('/notifications/read-all').then((response) => response.data),
}
