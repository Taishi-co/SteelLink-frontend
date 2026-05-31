import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Col, Empty, Progress, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, ClockCircleOutlined, FileDoneOutlined, HomeOutlined, MailOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementActivity, ProcurementInvitation, ProcurementParticipant } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '参团中' },
  ended: { color: 'blue', text: '已截止' },
  order_created: { color: 'purple', text: '已生成订单' },
  closed: { color: 'default', text: '已关闭' },
}

const participantStatusMeta: Record<string, { color: string; text: string }> = {
  joined: { color: 'green', text: '已参团' },
  order_created: { color: 'purple', text: '已成单' },
  cancelled: { color: 'default', text: '已取消' },
}

function statusTag(status: string) {
  const meta = statusMeta[status] || { color: 'default', text: status || '-' }
  return <Tag color={meta.color}>{meta.text}</Tag>
}

function participantStatusTag(status: string) {
  const meta = participantStatusMeta[status] || { color: 'default', text: status || '-' }
  return <Tag color={meta.color}>{meta.text}</Tag>
}

function getMine(activity: ProcurementActivity): ProcurementParticipant | undefined {
  return activity.participants?.[0]
}

function formatQuantity(value: number, unit: string) {
  return `${Number(value || 0).toLocaleString('zh-CN')} ${unit || '吨'}`
}

function formatMoney(value: number) {
  return `¥${Number(value || 0).toLocaleString('zh-CN')}`
}

function deliveryMethodText(value?: string) {
  if (value === 'self') return '自行安排物流'
  if (value === 'platform_logistics') return '平台物流'
  return value || '-'
}

function paymentMethodText(value?: string) {
  if (value === 'offline') return '线下转账'
  if (value === 'online') return '平台线上支付'
  return value || '-'
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function groupProgress(activity: ProcurementActivity) {
  if (activity.status === 'order_created') return 100
  const threshold = activity.minGroupQuantity || activity.targetQuantity || 0
  if (threshold <= 0) return activity.progress || 0
  return Math.min(100, Math.round((activity.demandQuantity / threshold) * 100))
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { response?: { data?: { message?: string } }; message?: string }
  return maybe.response?.data?.message || maybe.message || fallback
}

export default function GroupProcurementModulePage() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ProcurementActivity[]>([])
  const [invitations, setInvitations] = useState<ProcurementInvitation[]>([])
  const [acceptingId, setAcceptingId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [result, invitationResult] = await Promise.all([
        marketService.listMyProcurements({ page: 1, page_size: 50 }),
        marketService.listMyProcurementInvitations({ page: 1, page_size: 50 }),
      ])
      setActivities(result.list)
      setInvitations(invitationResult.list)
    } catch (error) {
      message.error(getErrorMessage(error, '我的集采加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleAcceptInvitation = async (invitation: ProcurementInvitation) => {
    const request = invitation.request
    if (!request) {
      message.error('邀请缺少原始申请信息')
      return
    }
    setAcceptingId(invitation.id)
    try {
      await marketService.acceptProcurementInvitation(invitation.id, {
        quantity: request.quantity,
        contact_name: request.contactName,
        contact_phone: request.contactPhone,
        delivery_address_source: request.deliveryAddressSource === 'warehouse' ? 'warehouse' : 'manual',
        dest_warehouse_service_id: request.destWarehouseServiceId,
        delivery_address: request.deliveryAddress,
        delivery_method: request.deliveryMethod,
        payment_method: request.paymentMethod,
        delivery_note: request.deliveryNote,
        agreement_signed: true,
        remark: request.remark,
      })
      message.success('已接受集采邀请并参团')
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '接受邀请失败，请确认集采状态和企业认证'))
    } finally {
      setAcceptingId(null)
    }
  }

  const stats = useMemo(() => {
    const active = activities.filter((item) => item.status === 'active').length
    const ordered = activities.filter((item) => item.status === 'order_created' || getMine(item)?.status === 'order_created').length
    const quantity = activities.reduce((sum, item) => sum + Number(getMine(item)?.quantity || 0), 0)
    const amount = activities.reduce((sum, item) => sum + Number(getMine(item)?.totalAmount || 0), 0)
    return { active, ordered, quantity, amount }
  }, [activities])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-8 py-10">
        <section className="rounded bg-white p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color="green">采购方工作台</Tag>
              <Title level={1} className="!mb-3 !mt-4">我的集采</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                查看本企业已参与的集采，跟踪成团进度、收货地址和生成的子订单。
              </Paragraph>
            </div>
            <Link to="/procurement">
              <Button type="primary" icon={<ShoppingCartOutlined />}>进入集采大厅</Button>
            </Link>
          </div>
        </section>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="mt-8">
            <Col xs={24} md={6}><Card><Statistic title="已参团" value={activities.length} suffix="场" prefix={<TeamOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="参团中" value={stats.active} suffix="场" prefix={<ClockCircleOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="已成单" value={stats.ordered} suffix="场" prefix={<FileDoneOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="待处理邀请" value={invitations.filter((item) => item.status === 'pending').length} suffix="条" prefix={<MailOutlined />} /></Card></Col>
          </Row>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <Title level={2} className="!mb-0">集采邀请</Title>
              <Tag>{invitations.length} 条</Tag>
            </div>
            {invitations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {invitations.map((invitation) => {
                  const activity = invitation.activity
                  const request = invitation.request
                  return (
                    <Col key={invitation.id} xs={24} lg={12}>
                      <Card className="h-full">
                        <Space direction="vertical" size="middle" className="w-full">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Text type="secondary">{invitation.invitationNo}</Text>
                              <Title level={4} className="!mb-1 !mt-2">{activity?.title || request?.productName || '集采邀请'}</Title>
                              <Text type="secondary">{request?.category || activity?.category || '-'} · 意向 {formatQuantity(request?.quantity || 0, request?.unit || activity?.unit || '吨')}</Text>
                            </div>
                            <Tag color={invitation.status === 'pending' ? 'orange' : invitation.status === 'accepted' ? 'green' : 'default'}>
                              {invitation.status === 'pending' ? '待确认' : invitation.status === 'accepted' ? '已接受' : invitation.status}
                            </Tag>
                          </div>
                          <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                            <div>{request?.contactName || '-'} {request?.contactPhone || ''}</div>
                            <div className="mt-1">{request?.deliveryAddress || '-'}</div>
                            <div className="mt-1">期望价：{request?.targetPrice ? `${formatMoney(request.targetPrice)} / ${request.unit || '吨'}` : '-'}</div>
                          </div>
                          <Space wrap>
                            {activity ? (
                              <Link to={`/procurement/${activity.id}`}>
                                <Button icon={<ArrowRightOutlined />}>查看集采</Button>
                              </Link>
                            ) : null}
                            {invitation.status === 'pending' ? (
                              <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                loading={acceptingId === invitation.id}
                                onClick={() => void handleAcceptInvitation(invitation)}
                              >
                                确认参团
                              </Button>
                            ) : null}
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <Card>
                <Empty description="暂无集采邀请" />
              </Card>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <Title level={2} className="!mb-0">参团记录</Title>
              <Tag>{formatQuantity(stats.quantity, '吨')}</Tag>
            </div>
            {activities.length > 0 ? (
              <Row gutter={[16, 16]}>
                {activities.map((activity) => {
                  const mine = getMine(activity)
                  return (
                    <Col key={activity.id} xs={24} lg={12}>
                      <Card hoverable className="h-full">
                        <Space direction="vertical" size="middle" className="w-full">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Text type="secondary">{activity.procurementNo}</Text>
                              <Title level={4} className="!mb-1 !mt-2">{activity.title}</Title>
                              <Text type="secondary">{activity.productName || activity.target} · 卖家：{activity.sellerName || '-'}</Text>
                            </div>
                            <Space direction="vertical" align="end" size={4}>
                              {statusTag(activity.status)}
                              {mine ? participantStatusTag(mine.status) : null}
                            </Space>
                          </div>

                          <Row gutter={[12, 12]}>
                            <Col span={12}><Text type="secondary">我的参团量</Text><div className="mt-1 font-semibold">{formatQuantity(mine?.quantity || 0, mine?.unit || activity.unit)}</div></Col>
                            <Col span={12}><Text type="secondary">我的金额</Text><div className="mt-1 font-semibold text-red-500">{formatMoney(mine?.totalAmount || 0)}</div></Col>
                            <Col span={12}><Text type="secondary">集采价</Text><div className="mt-1 font-semibold">{formatMoney(activity.groupPrice)} / {activity.unit || '吨'}</div></Col>
                            <Col span={12}><Text type="secondary">截止时间</Text><div className="mt-1 font-semibold">{formatDateTime(activity.endedAt)}</div></Col>
                          </Row>

                          <Progress percent={groupProgress(activity)} format={(percent) => `${percent}%成团`} />

                          <Alert
                            showIcon
                            type={activity.status === 'order_created' ? 'success' : activity.status === 'active' ? 'info' : 'warning'}
                            message={activity.status === 'order_created' ? '集采已生成订单' : activity.status === 'active' ? '集采仍在参团中' : '集采已截止，等待平台处理'}
                            description={mine?.childOrderNo ? `子订单：${mine.childOrderNo}` : '平台结束集采并成团后，会为每个参团买家生成子订单。'}
                          />

                          <div className="rounded border border-gray-100 bg-gray-50 p-3">
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                              <HomeOutlined />
                              收货信息
                            </div>
                            <Text type="secondary">{mine?.contactName || '-'} {mine?.contactPhone || ''}</Text>
                            {mine?.destWarehouseName ? (
                              <div className="mt-1 text-sm text-gray-500">平台仓库：{mine.destWarehouseName} · {mine.destWarehouseAddress || mine.deliveryAddress || '-'}</div>
                            ) : null}
                            <div className="mt-1 text-sm text-gray-500">{mine?.deliveryAddress || '-'}</div>
                            {(mine?.deliveryMethod || mine?.paymentMethod) ? (
                              <div className="mt-1 text-sm text-gray-500">
                                配送/付款：{deliveryMethodText(mine.deliveryMethod)} / {paymentMethodText(mine.paymentMethod)}
                              </div>
                            ) : null}
                          </div>

                          <Space wrap>
                            <Link to={`/procurement/${activity.id}`}>
                              <Button icon={<ArrowRightOutlined />}>查看集采详情</Button>
                            </Link>
                            {mine?.childOrderId ? (
                              <Link to={`/dashboard/orders/${mine.childOrderId}`}>
                                <Button type="primary" icon={<FileDoneOutlined />}>查看子订单</Button>
                              </Link>
                            ) : null}
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <Card>
                <Empty description="暂无已参与的集采">
                  <Link to="/procurement">
                    <Button type="primary" icon={<ShoppingCartOutlined />}>去集采大厅参团</Button>
                  </Link>
                </Empty>
              </Card>
            )}
          </section>
        </Spin>
      </main>
    </div>
  )
}
