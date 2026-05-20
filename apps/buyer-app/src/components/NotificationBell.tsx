import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Empty, List, Popover, Space, Tag, Typography } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { BUYER_TOKEN_REFRESH_EVENT, getBuyerToken } from '@/services/auth'
import { notificationService, type NotificationItem } from '@/services/notificationService'

const { Text, Paragraph } = Typography

const typeMeta: Record<NotificationItem['type'], { color: string; label: string }> = {
  admin: { color: 'blue', label: '平台' },
  order: { color: 'green', label: '订单' },
  audit: { color: 'orange', label: '审核' },
  system: { color: 'default', label: '系统' },
}

function notificationWebSocketURL() {
  const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1')
  const url = new URL(base, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = `${url.pathname.replace(/\/$/, '')}/notifications/ws`
  return url.toString()
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const token = getBuyerToken()

  const { data } = useQuery({
    queryKey: ['notifications', 'header'],
    queryFn: () => notificationService.list({ page_size: 5 }),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  })

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    void queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
  }, [queryClient])

  useEffect(() => {
    if (!token) return
    let socket: WebSocket | null = null
    let retryTimer: number | undefined
    let closedByEffect = false

    const connect = () => {
      const latestToken = getBuyerToken()
      if (!latestToken) return
      socket = new WebSocket(notificationWebSocketURL())
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { type?: string }
          if (payload.type === 'notification.created') {
            refresh()
          }
        } catch {
          // Ignore malformed keepalive frames from old clients or proxies.
        }
      }
      socket.onclose = () => {
        if (!closedByEffect) {
          retryTimer = window.setTimeout(connect, 3000)
        }
      }
    }

    connect()
    const handleTokenRefresh = () => {
      socket?.close()
    }
    window.addEventListener(BUYER_TOKEN_REFRESH_EVENT, handleTokenRefresh)
    return () => {
      closedByEffect = true
      if (retryTimer) window.clearTimeout(retryTimer)
      window.removeEventListener(BUYER_TOKEN_REFRESH_EVENT, handleTokenRefresh)
      socket?.close()
    }
  }, [refresh, token])

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: refresh,
  })
  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: refresh,
  })

  const notifications = data?.list ?? []
  const unreadCount = data?.unread_count ?? 0

  const content = (
    <div className="w-[360px] max-w-[80vw]">
      <div className="flex items-center justify-between pb-2">
        <Text strong>站内信</Text>
        <Space size="small">
          <Button type="link" size="small" onClick={() => markAllRead.mutate()} disabled={unreadCount === 0} icon={<CheckOutlined />}>
            全部已读
          </Button>
          <Button type="link" size="small" onClick={() => { setOpen(false); navigate('/dashboard/notifications') }}>
            查看全部
          </Button>
        </Space>
      </div>
      <List
        dataSource={notifications}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无站内信" /> }}
        renderItem={(item) => {
          const meta = typeMeta[item.type] || typeMeta.system
          return (
            <List.Item
              className="cursor-pointer px-0"
              onClick={() => {
                if (item.status === 0) markRead.mutate(item.id)
                if (item.link_url) {
                  setOpen(false)
                  navigate(item.link_url)
                }
              }}
            >
              <List.Item.Meta
                title={
                  <Space size={6} wrap>
                    <Badge status={item.status === 0 ? 'processing' : 'default'} />
                    <Text strong={item.status === 0} className="max-w-[220px]" ellipsis>{item.title}</Text>
                    <Tag color={meta.color} className="mr-0">{meta.label}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2} className="w-full">
                    <Paragraph ellipsis={{ rows: 2 }} className="!mb-0 text-gray-600">{item.content}</Paragraph>
                    <Text type="secondary" className="text-xs">{new Date(item.created_at).toLocaleString()}</Text>
                  </Space>
                }
              />
            </List.Item>
          )
        }}
      />
    </div>
  )

  if (!token) return null

  return (
    <Popover open={open} onOpenChange={setOpen} content={content} trigger="click" placement="bottomRight">
      <Badge count={unreadCount} size="small" overflowCount={99}>
        <Button type="text" shape="circle" icon={<BellOutlined className="text-lg" />} aria-label="站内信" />
      </Badge>
    </Popover>
  )
}
