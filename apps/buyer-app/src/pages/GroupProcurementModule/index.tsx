import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Col, Empty, Progress, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, ClockCircleOutlined, FileDoneOutlined, HomeOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementActivity, ProcurementParticipant } from '@/services/marketService'

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

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await marketService.listMyProcurements({ page: 1, page_size: 50 })
      setActivities(result.list)
    } catch (error) {
      message.error(getErrorMessage(error, '我的集采加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

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
            <Col xs={24} md={6}><Card><Statistic title="参团金额" value={stats.amount} prefix="¥" precision={2} /></Card></Col>
          </Row>

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
                            <div className="mt-1 text-sm text-gray-500">{mine?.deliveryAddress || '-'}</div>
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
