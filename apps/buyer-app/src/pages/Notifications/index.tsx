import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Empty, List, Segmented, Space, Tag, Typography, message } from 'antd'
import { CheckOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { notificationService, type NotificationItem } from '@/services/notificationService'

const { Text, Title, Paragraph } = Typography

const typeMeta: Record<NotificationItem['type'], { color: string; label: string }> = {
  admin: { color: 'blue', label: '平台通知' },
  order: { color: 'green', label: '订单流转' },
  audit: { color: 'orange', label: '审核状态' },
  system: { color: 'default', label: '系统消息' },
}

export default function NotificationsPage() {
  const [status, setStatus] = useState<'all' | 'unread'>('all')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const params = status === 'unread' ? { status: 0 } : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.list(params),
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    void queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
  }

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: refresh,
  })

  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      message.success('已全部标记为已读')
      refresh()
    },
  })

  const openNotification = (item: NotificationItem) => {
    if (item.status === 0) {
      markRead.mutate(item.id)
    }
    if (item.link_url) {
      navigate(item.link_url)
    }
  }

  const list = data?.list ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Space>
          <MailOutlined className="text-primary-600 text-xl" />
          <Title level={3} className="!mb-0">站内信</Title>
          <Badge count={data?.unread_count ?? 0} />
        </Space>
        <Space>
          <Segmented
            value={status}
            options={[
              { label: '全部', value: 'all' },
              { label: '未读', value: 'unread' },
            ]}
            onChange={(value) => setStatus(value as 'all' | 'unread')}
          />
          <Button icon={<CheckOutlined />} onClick={() => markAllRead.mutate()} disabled={(data?.unread_count ?? 0) === 0}>
            全部已读
          </Button>
        </Space>
      </div>

      <List
        loading={isLoading}
        dataSource={list}
        locale={{ emptyText: <Empty description="暂无站内信" /> }}
        renderItem={(item) => {
          const meta = typeMeta[item.type] || typeMeta.system
          return (
            <List.Item
              className="cursor-pointer rounded-lg px-4 hover:bg-gray-50"
              onClick={() => openNotification(item)}
              actions={item.status === 0 ? [<Button key="read" size="small" onClick={(event) => { event.stopPropagation(); markRead.mutate(item.id) }}>标记已读</Button>] : undefined}
            >
              <List.Item.Meta
                title={
                  <Space wrap>
                    <Badge status={item.status === 0 ? 'processing' : 'default'} />
                    <Text strong={item.status === 0}>{item.title}</Text>
                    <Tag color={meta.color}>{meta.label}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4} className="w-full">
                    <Paragraph className="!mb-0 text-gray-600">{item.content}</Paragraph>
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
}
