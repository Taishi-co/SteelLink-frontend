import api from './api'
import type { ApiResponse } from '@/types'

export interface NotificationItem {
  id: number
  recipient_user_id: number
  recipient_enterprise_id: number
  sender_user_id: number
  type: 'admin' | 'order' | 'audit' | 'system'
  title: string
  content: string
  link_url: string
  status: number
  read_at?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface NotificationListResult {
  list: NotificationItem[]
  total: number
  unread_count: number
}

export const notificationService = {
  list: async (params?: { status?: number; page?: number; page_size?: number }) => {
    const response = await api.get<ApiResponse<NotificationListResult>, ApiResponse<NotificationListResult>>('/notifications', { params })
    return response.data
  },
  unreadCount: async () => {
    const response = await api.get<ApiResponse<{ unread_count: number }>, ApiResponse<{ unread_count: number }>>('/notifications/unread-count')
    return response.data
  },
  markRead: (id: number) =>
    api.put<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>(`/notifications/${id}/read`).then((response) => response.data),
  markAllRead: () =>
    api.put<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>('/notifications/read-all').then((response) => response.data),
}
