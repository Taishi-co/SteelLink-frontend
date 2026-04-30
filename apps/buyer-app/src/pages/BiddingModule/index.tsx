import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Col, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Progress, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowLeftOutlined, AuditOutlined, CheckCircleOutlined, FileProtectOutlined, FormOutlined, PlusOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { BiddingActivity } from '@/services/marketService'
import { getBuyerEnterpriseID, getBuyerToken } from '@/services/auth'

const { Title, Paragraph, Text } = Typography

const activeStatuses = new Set(['bidding'])
const awardableStatuses = new Set(['pending_award'])

const moduleConfig = {
  title: '买家竞价',
  role: '采购方工作台',
  description: '管理我发起的竞价需求，查看供应商报价并完成定标确认。',
  color: 'blue',
} as const

const workflowSteps = [
  { title: '提交信息', icon: <FormOutlined /> },
  { title: '资质校验', icon: <AuditOutlined /> },
  { title: '企业参与', icon: <TeamOutlined /> },
  { title: '成交确认', icon: <CheckCircleOutlined /> },
  { title: '合同归档', icon: <FileProtectOutlined /> },
]

interface CreateBiddingFormValues {
  title: string
  category: string
  quantity: number
  unit?: string
  start_price: number
  delivery_region: string
  ended_at: { toISOString: () => string }
}

function formatAmount(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString('zh-CN')
}

function formatQuantity(activity: BiddingActivity) {
  return `${activity.quantity.toLocaleString('zh-CN')} ${activity.unit || '吨'}`
}

function formatPrice(value: number, unit = '吨') {
  return `¥${value.toLocaleString('zh-CN')} / ${unit}`
}

function formatTime(value?: string) {
  if (!value) {
    return '-'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string }
  return maybeError.response?.data?.message || maybeError.message || fallback
}

function statusLabel(status: string) {
  if (status === 'bidding') return '竞价中'
  if (status === 'pending_award') return '待定标'
  if (status === 'awarded') return '已定标'
  if (status === 'order_created') return '已生成订单'
  if (status === 'failed') return '已流标'
  if (status === 'closed') return '已关闭'
  return status
}

function statusColor(status: string) {
  if (status === 'awarded' || status === 'order_created') return 'green'
  if (status === 'pending_award') return 'gold'
  if (status === 'failed' || status === 'closed') return 'default'
  return 'blue'
}

function buyerStatusHint(activity: BiddingActivity) {
  if (activity.status === 'bidding') {
    return '报价截止前可持续接收供应商报价，截止后自动进入待定标。'
  }
  if (activity.status === 'pending_award') {
    return activity.quoteCount > 0 ? '已截止，请从报价记录中选择供应商完成定标。' : '已截止但暂无报价，系统将按流标处理。'
  }
  if (activity.status === 'awarded') {
    return '已完成定标，确认无误后可生成订单进入履约。'
  }
  if (activity.status === 'order_created') {
    return '订单已生成，可在订单模块继续处理确认、合同、支付和提货。'
  }
  if (activity.status === 'failed') {
    return '该竞价已流标，可根据需要重新发布。'
  }
  return '该竞价已归档。'
}

function buyerAlertType(status: string): 'info' | 'success' | 'warning' {
  if (status === 'pending_award') return 'warning'
  if (status === 'awarded' || status === 'order_created') return 'success'
  return 'info'
}

export default function BiddingModulePage() {
  const currentModule = moduleConfig
  const currentEnterpriseID = getBuyerEnterpriseID()

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activities, setActivities] = useState<BiddingActivity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<BiddingActivity | null>(null)
  const [createForm] = Form.useForm<CreateBiddingFormValues>()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await marketService.listBiddings({ page: 1, page_size: 50, scope: 'workspace' })
      setActivities(result.list)
    } catch (error) {
      message.error(getErrorMessage(error, '竞价工作台数据加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const visibleActivities = useMemo(() => {
    return activities.filter((activity) => activity.buyerId === currentEnterpriseID)
  }, [activities, currentEnterpriseID])

  const stats = useMemo(() => {
    const active = visibleActivities.filter((activity) => activeStatuses.has(activity.status)).length
    const success = visibleActivities.filter((activity) => activity.status === 'awarded' || activity.status === 'order_created').length
    const pendingAward = visibleActivities.filter((activity) => activity.status === 'pending_award').length
    const totalDeal = visibleActivities.reduce((sum, activity) => sum + (activity.dealAmount || 0), 0)
    return { active, success, pendingAward, totalDeal }
  }, [visibleActivities])

  const openCreateModal = () => {
    if (!getBuyerToken()) {
      message.warning('请先登录企业账号后再发起竞价')
      return
    }
    createForm.resetFields()
    setCreateOpen(true)
  }

  const openBiddingDetail = async (id: number) => {
    setDetailOpen(true)
    setActionLoading(true)
    try {
      setSelectedActivity(await marketService.getBidding(id))
    } catch (error) {
      message.error(getErrorMessage(error, '竞价详情加载失败'))
      setDetailOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateBidding = async (values: CreateBiddingFormValues) => {
    setActionLoading(true)
    try {
      const created = await marketService.createBidding({
        ...values,
        unit: values.unit || '吨',
        ended_at: values.ended_at.toISOString(),
      })
      message.success('竞价已发布')
      setCreateOpen(false)
      createForm.resetFields()
      await loadData()
      await openBiddingDetail(created.id)
    } catch (error) {
      message.error(getErrorMessage(error, '竞价发布失败'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleAward = async (quoteId: number) => {
    if (!selectedActivity) {
      return
    }
    setActionLoading(true)
    try {
      const updated = await marketService.awardBidding(selectedActivity.id, quoteId)
      setSelectedActivity(updated)
      message.success('已完成定标')
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '定标失败'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedActivity) {
      return
    }
    setActionLoading(true)
    try {
      const result = await marketService.createBiddingOrder(selectedActivity.id)
      setSelectedActivity(result.bidding)
      message.success(`订单已生成：${result.orderNo}`)
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '生成订单失败'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-8 py-10">
        <Link to="/bidding" className="mb-6 inline-flex items-center gap-2 text-primary-600">
          <ArrowLeftOutlined />
          返回竞价大厅
        </Link>

        <section className="rounded bg-white p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color={currentModule.color}>{currentModule.role}</Tag>
              <Title level={1} className="!mb-3 !mt-4">{currentModule.title}</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">{currentModule.description}</Paragraph>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>新建竞价单</Button>
          </div>
        </section>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="mt-8">
            <Col xs={24} md={6}><Card><Statistic title="我的竞价" value={visibleActivities.length} suffix="场" /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="竞价中" value={stats.active} suffix="场" /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="待定标" value={stats.pendingAward} suffix="场" /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="成交金额" value={formatAmount(stats.totalDeal)} /></Card></Col>
          </Row>

          <Card className="mt-8" title="流程状态">
            <Row gutter={[16, 16]}>
              {workflowSteps.map((step, index) => (
                <Col key={step.title} xs={24} sm={12} lg={index === 4 ? 4 : 5}>
                  <div className="flex items-center gap-3 rounded border border-gray-100 p-3">
                    <span className="text-xl text-primary-600">{step.icon}</span>
                    <Text>{step.title}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <Title level={2} className="!mb-0">我发起的竞价</Title>
              <Tag>{visibleActivities.length} 场</Tag>
            </div>
            {visibleActivities.length > 0 ? (
              <Row gutter={[16, 16]}>
                {visibleActivities.map((activity) => (
                  <Col key={activity.id} xs={24} lg={12}>
                    <Card hoverable className="h-full">
                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text type="secondary">{activity.biddingNo}</Text>
                            <Title level={4} className="!mb-1 !mt-2">{activity.title}</Title>
                            <Text type="secondary">采购方：{activity.buyerName || '-'}</Text>
                          </div>
                          <Tag color={statusColor(activity.status)}>{statusLabel(activity.status)}</Tag>
                        </div>
                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">品类</Text><div className="mt-1 font-semibold">{activity.category}</div></Col>
                          <Col span={12}><Text type="secondary">数量</Text><div className="mt-1 font-semibold">{formatQuantity(activity)}</div></Col>
                          <Col span={12}><Text type="secondary">当前价</Text><div className="mt-1 font-semibold text-red-500">{formatPrice(activity.currentPrice, activity.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">报价数</Text><div className="mt-1 font-semibold">{activity.quoteCount || 0} 次</div></Col>
                        </Row>
                        <Alert type={buyerAlertType(activity.status)} showIcon message={buyerStatusHint(activity)} />
                        <Progress percent={activity.progress} showInfo={false} />
                        <Button type={activity.status === 'pending_award' ? 'primary' : 'default'} icon={<TrophyOutlined />} onClick={() => void openBiddingDetail(activity.id)}>
                          {activity.status === 'pending_award' ? '进入定标' : activity.status === 'awarded' ? '生成订单' : '查看详情'}
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card><Empty description="暂无我发起的竞价" /></Card>
            )}
          </section>
        </Spin>
      </main>

      <Modal
        title="新建竞价单"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={actionLoading}
        width={720}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateBidding} initialValues={{ unit: '吨' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="title" label="竞价标题" rules={[{ required: true, message: '请输入竞价标题' }]}>
                <Input placeholder="例如：华东区域热轧卷板竞价采购" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="category" label="品类" rules={[{ required: true, message: '请输入品类' }]}>
                <Input placeholder="热轧板卷 / 螺纹钢 / 中厚板" />
              </Form.Item>
            </Col>
            <Col xs={16} md={8}>
              <Form.Item name="quantity" label="采购数量" rules={[{ required: true, message: '请输入采购数量' }]}>
                <InputNumber min={1} precision={2} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={8} md={4}>
              <Form.Item name="unit" label="单位">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="start_price" label="最高限价/起始价" rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber min={1} precision={2} prefix="¥" className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ended_at" label="报价截止时间" rules={[{ required: true, message: '请选择截止时间' }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="delivery_region" label="交付区域" rules={[{ required: true, message: '请输入交付区域' }]}>
                <Input placeholder="例如：上海、苏州、宁波指定仓库" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer title="竞价工作台详情" open={detailOpen} onClose={() => setDetailOpen(false)} width={820}>
        <Spin spinning={actionLoading}>
          {selectedActivity ? (
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Space className="mb-3">
                  <Tag color={statusColor(selectedActivity.status)}>{statusLabel(selectedActivity.status)}</Tag>
                  <Text type="secondary">{selectedActivity.biddingNo}</Text>
                </Space>
                <Title level={3} className="!mb-2">{selectedActivity.title}</Title>
                <Text type="secondary">采购方：{selectedActivity.buyerName || '-'}</Text>
              </div>

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="品类">{selectedActivity.category}</Descriptions.Item>
                <Descriptions.Item label="数量">{formatQuantity(selectedActivity)}</Descriptions.Item>
                <Descriptions.Item label="起始价">{formatPrice(selectedActivity.startPrice, selectedActivity.unit)}</Descriptions.Item>
                <Descriptions.Item label="当前价">{formatPrice(selectedActivity.currentPrice, selectedActivity.unit)}</Descriptions.Item>
                <Descriptions.Item label="交付区域" span={2}>{selectedActivity.deliveryRegion || '-'}</Descriptions.Item>
                <Descriptions.Item label="截止时间">{formatTime(selectedActivity.endedAt)}</Descriptions.Item>
                <Descriptions.Item label="报价数">{selectedActivity.quoteCount || selectedActivity.quotes?.length || 0} 次</Descriptions.Item>
                <Descriptions.Item label="订单">{selectedActivity.orderId ? `#${selectedActivity.orderId}` : '-'}</Descriptions.Item>
              </Descriptions>

              <Alert type={buyerAlertType(selectedActivity.status)} showIcon message={buyerStatusHint(selectedActivity)} />

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Title level={4} className="!mb-0">报价记录</Title>
                  <Tag>{selectedActivity.quotes?.length || 0} 条</Tag>
                </div>
                {selectedActivity.quotes && selectedActivity.quotes.length > 0 ? (
                  <div className="space-y-3">
                    {selectedActivity.quotes.map((quote) => (
                      <Card key={quote.id} size="small">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <Space className="mb-2">
                              <Text strong>{quote.supplierName}</Text>
                              <Tag color={quote.isAwarded ? 'green' : 'default'}>{quote.isAwarded ? '中标' : `第 ${quote.round} 轮`}</Tag>
                            </Space>
                            <div className="text-sm text-gray-500">
                              可供 {quote.quantity.toLocaleString('zh-CN')} {selectedActivity.unit} · 交付 {quote.deliveryDays} 天 · {formatTime(quote.createdAt)}
                            </div>
                            {quote.remark ? <div className="mt-2 text-sm text-gray-500">{quote.remark}</div> : null}
                          </div>
                          <Space>
                            <Text className="text-lg font-semibold text-red-500">{formatPrice(quote.unitPrice, selectedActivity.unit)}</Text>
                            {selectedActivity.buyerId === currentEnterpriseID && awardableStatuses.has(selectedActivity.status) ? (
                              <Button type="primary" onClick={() => void handleAward(quote.id)} loading={actionLoading}>定标</Button>
                            ) : selectedActivity.status === 'bidding' ? (
                              <Button disabled>截止后可定标</Button>
                            ) : null}
                          </Space>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无供应商报价" />
                )}
              </div>

              {selectedActivity.status === 'awarded' ? (
                <Card>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Title level={4} className="!mb-1">生成订单</Title>
                      <Text type="secondary">定标已完成，确认后生成真实订单并进入履约链路。</Text>
                    </div>
                    <Button type="primary" onClick={() => void handleCreateOrder()} loading={actionLoading}>生成订单</Button>
                  </div>
                </Card>
              ) : null}

            </Space>
          ) : null}
        </Spin>
      </Drawer>
    </div>
  )
}
