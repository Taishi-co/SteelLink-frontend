import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, Progress, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { RiseOutlined, TrophyOutlined } from '@ant-design/icons'
import { getSellerEnterpriseID } from '@/services/auth'
import { marketService } from '@/services/marketService'
import type { BiddingActivity } from '@/services/marketService'

const { Title, Text, Paragraph } = Typography

const activeStatuses = new Set(['bidding'])

interface QuoteFormValues {
  unit_price: number
  quantity: number
  delivery_days: number
  remark?: string
}

function formatAmount(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return value.toLocaleString('zh-CN')
}

function formatQuantity(activity: BiddingActivity) {
  return `${activity.quantity.toLocaleString('zh-CN')} ${activity.unit || '吨'}`
}

function formatPrice(value: number, unit = '吨') {
  return `¥${value.toLocaleString('zh-CN')} / ${unit}`
}

function formatTime(value?: string) {
  if (!value) return '-'
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

function sellerStatusHint(activity: BiddingActivity, enterpriseID: number) {
  const ownQuote = activity.quotes?.find((quote) => quote.supplierId === enterpriseID)
  const awardedQuote = activity.quotes?.find((quote) => quote.isAwarded)
  if (activity.status === 'bidding') {
    return ownQuote ? '你已提交报价，仍可在截止前用更低单价再次报价。' : '当前可报价，报价不能高于公开最低价。'
  }
  if (activity.status === 'pending_award') {
    return ownQuote ? '报价已截止，等待发起方定标。' : '报价已截止，无法继续参与。'
  }
  if (activity.status === 'awarded' || activity.status === 'order_created') {
    if (awardedQuote?.supplierId === enterpriseID) return '你已中标，请关注后续订单履约。'
    return ownQuote ? '本次未中标，可继续关注其他竞价。' : '该竞价已定标。'
  }
  if (activity.status === 'failed') return '该竞价已流标。'
  return '该竞价已结束。'
}

function sellerAlertType(activity: BiddingActivity, enterpriseID: number): 'info' | 'success' | 'warning' {
  if ((activity.status === 'awarded' || activity.status === 'order_created') && activity.quotes?.some((quote) => quote.supplierId === enterpriseID && quote.isAwarded)) {
    return 'success'
  }
  if (activity.status === 'pending_award') return 'warning'
  return 'info'
}

export default function SellerBiddingPage() {
  const enterpriseID = getSellerEnterpriseID()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activities, setActivities] = useState<BiddingActivity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<BiddingActivity | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      setActivities(await marketService.listBiddings())
    } catch (error) {
      message.error(getErrorMessage(error, '竞价数据加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const visibleActivities = useMemo(
    () => activities.filter((activity) => activeStatuses.has(activity.status) && activity.buyerId !== enterpriseID),
    [activities, enterpriseID],
  )

  const myQuotedCount = useMemo(
    () => activities.filter((activity) => activity.quotes?.some((quote) => quote.supplierId === enterpriseID)).length,
    [activities, enterpriseID],
  )

  const wonCount = useMemo(
    () => activities.filter((activity) => (activity.status === 'awarded' || activity.status === 'order_created') && activity.quotes?.some((quote) => quote.supplierId === enterpriseID && quote.isAwarded)).length,
    [activities, enterpriseID],
  )

  const followedActivities = useMemo(
    () => activities.filter((activity) => activity.quotes?.some((quote) => quote.supplierId === enterpriseID)),
    [activities, enterpriseID],
  )

  const openDetail = async (id: number) => {
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

  const handleSubmitQuote = async (values: QuoteFormValues) => {
    if (!selectedActivity) return
    setActionLoading(true)
    try {
      const updated = await marketService.submitBiddingQuote(selectedActivity.id, values)
      setSelectedActivity(updated)
      message.success('报价已提交')
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '报价提交失败'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Tag color="green">供应方工作台</Tag>
          <Title level={2} className="!mb-2 !mt-3">参与竞价</Title>
          <Paragraph className="text-gray-500 !mb-0">查看其他企业发起的竞价单，提交企业报价并跟踪中标结果。</Paragraph>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card><Statistic title="可参与竞价" value={visibleActivities.length} suffix="场" /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="我已报价" value={myQuotedCount} suffix="场" /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="已中标" value={wonCount} suffix="场" /></Card></Col>
        </Row>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <Title level={3} className="!mb-0">可参与竞价</Title>
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
                      <Alert type={sellerAlertType(activity, enterpriseID)} showIcon message={sellerStatusHint(activity, enterpriseID)} />
                      <Progress percent={activity.progress} showInfo={false} />
                      <Button type="primary" icon={<RiseOutlined />} onClick={() => void openDetail(activity.id)}>查看并报价</Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <Empty
                description={
                  <span>
                    暂无可参与竞价。这里仅展示其他企业发起且仍在报价期内的竞价单。
                  </span>
                }
              />
            </Card>
          )}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <Title level={3} className="!mb-0">我的报价跟踪</Title>
            <Tag>{followedActivities.length} 场</Tag>
          </div>
          {followedActivities.length > 0 ? (
            <Row gutter={[16, 16]}>
              {followedActivities.map((activity) => (
                <Col key={activity.id} xs={24} lg={12}>
                  <Card hoverable className="h-full">
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Text type="secondary">{activity.biddingNo}</Text>
                          <Title level={4} className="!mb-1 !mt-2">{activity.title}</Title>
                        </div>
                        <Tag color={statusColor(activity.status)}>{statusLabel(activity.status)}</Tag>
                      </div>
                      <Alert type={sellerAlertType(activity, enterpriseID)} showIcon message={sellerStatusHint(activity, enterpriseID)} />
                      <Button onClick={() => void openDetail(activity.id)}>查看报价记录</Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card><Empty description="暂无报价记录" /></Card>
          )}
        </section>
      </Spin>

      <Drawer title="竞价报价" open={detailOpen} onClose={() => setDetailOpen(false)} width={820}>
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
                <Descriptions.Item label="成交金额">{selectedActivity.dealAmount ? formatAmount(selectedActivity.dealAmount) : '-'}</Descriptions.Item>
              </Descriptions>

              <Alert type={sellerAlertType(selectedActivity, enterpriseID)} showIcon message={sellerStatusHint(selectedActivity, enterpriseID)} />

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
                              <Tag color={quote.isAwarded ? 'green' : quote.supplierId === enterpriseID ? 'blue' : 'default'}>
                                {quote.isAwarded ? '中标' : quote.supplierId === enterpriseID ? `我的第 ${quote.round} 轮` : `第 ${quote.round} 轮`}
                              </Tag>
                            </Space>
                            <div className="text-sm text-gray-500">
                              可供 {quote.quantity.toLocaleString('zh-CN')} {selectedActivity.unit} · 交付 {quote.deliveryDays} 天 · {formatTime(quote.createdAt)}
                            </div>
                            {quote.remark ? <div className="mt-2 text-sm text-gray-500">{quote.remark}</div> : null}
                          </div>
                          <Text className="text-lg font-semibold text-red-500">{formatPrice(quote.unitPrice, selectedActivity.unit)}</Text>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无供应商报价" />
                )}
              </div>

              {activeStatuses.has(selectedActivity.status) ? (
                <Card title="提交报价">
                  <Form layout="vertical" onFinish={handleSubmitQuote}>
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item name="unit_price" label="报价单价" rules={[{ required: true, message: '请输入报价单价' }]}>
                          <InputNumber min={1} precision={2} prefix="¥" className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="quantity" label="可供数量" rules={[{ required: true, message: '请输入可供数量' }]}>
                          <InputNumber min={1} max={selectedActivity.quantity} precision={2} className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="delivery_days" label="交付周期" rules={[{ required: true, message: '请输入交付周期' }]}>
                          <InputNumber min={1} addonAfter="天" className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="remark" label="报价说明">
                          <Input.TextArea rows={3} placeholder="可填写交付批次、仓库、付款要求等说明" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" loading={actionLoading}>提交报价</Button>
                  </Form>
                </Card>
              ) : (
                <Card><Empty image={<TrophyOutlined />} description="当前竞价已结束，无法继续报价" /></Card>
              )}
            </Space>
          ) : null}
        </Spin>
      </Drawer>
    </div>
  )
}
