import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Descriptions, Drawer, Empty, Form, Input, InputNumber, Progress, Row, Col, Space, Spin, Statistic, Steps, Tag, Typography, message } from 'antd'
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, CloseOutlined, EyeOutlined, FileDoneOutlined, SendOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService, ProcurementActivity } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { color: string; text: string }> = {
  pending_seller: { color: 'gold', text: '待确认' },
  active: { color: 'green', text: '参团中' },
  ended: { color: 'blue', text: '已截止' },
  order_created: { color: 'purple', text: '已生成订单' },
  seller_rejected: { color: 'red', text: '已拒绝' },
}

const flowSteps = [
  { title: '平台发起', description: '收到集采申请', icon: <SendOutlined /> },
  { title: '卖家确认', description: '填写价格规则', icon: <CheckCircleOutlined /> },
  { title: '买家参团', description: '商城公开归集', icon: <TeamOutlined /> },
  { title: '管理成单', description: '生成母子订单', icon: <FileDoneOutlined /> },
  { title: '订单履约', description: '进入订单流程', icon: <ShopOutlined /> },
]

function statusTag(status: string) {
  const meta = statusMeta[status] || { color: 'default', text: status || '-' }
  return <Tag color={meta.color}>{meta.text}</Tag>
}

function flowStep(status: string) {
  if (status === 'pending_seller' || status === 'seller_rejected') return 1
  if (status === 'active' || status === 'ended') return 2
  if (status === 'order_created') return 4
  return 0
}

function groupProgress(item: ProcurementActivity) {
  if (item.status === 'order_created') return 100
  const threshold = item.minGroupQuantity || item.targetQuantity || 0
  if (threshold <= 0) return 0
  return Math.min(100, Math.round((item.demandQuantity / threshold) * 100))
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function formatLocalDateTimeInput(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { response?: { data?: { message?: string } }; message?: string }
  return maybe.response?.data?.message || maybe.message || fallback
}

export default function SellerGroupProcurementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activities, setActivities] = useState<ProcurementActivity[]>([])
  const [selected, setSelected] = useState<ProcurementActivity | null>(null)
  const [form] = Form.useForm<{ group_price: number; min_group_quantity: number; max_group_quantity?: number; ended_at: string; delivery_days?: number; remark?: string }>()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      setActivities(await marketService.listProcurements())
    } catch (error) {
      message.error(getErrorMessage(error, '集采申请加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const pendingCount = useMemo(() => activities.filter((item) => item.status === 'pending_seller').length, [activities])
  const activeCount = useMemo(() => activities.filter((item) => item.status === 'active').length, [activities])
  const orderedCount = useMemo(() => activities.filter((item) => item.status === 'order_created').length, [activities])

  const openDetail = (item: ProcurementActivity) => {
    setSelected(item)
    const defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000)
    form.setFieldsValue({
      group_price: item.groupPrice || undefined,
      min_group_quantity: item.minGroupQuantity || item.targetQuantity || undefined,
      max_group_quantity: item.maxGroupQuantity || undefined,
      ended_at: formatLocalDateTimeInput(defaultEnd),
      delivery_days: item.deliveryDays || 3,
      remark: item.sellerRemark,
    })
  }

  const handleAccept = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const values = await form.validateFields()
      const updated = await marketService.respondProcurement(selected.id, {
        accepted: true,
        group_price: values.group_price,
        min_group_quantity: values.min_group_quantity,
        max_group_quantity: values.max_group_quantity,
        ended_at: values.ended_at,
        delivery_days: values.delivery_days,
        remark: values.remark,
      })
      setSelected(updated)
      message.success('已确认集采，买家端可见')
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '确认集采失败'))
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const remark = form.getFieldValue('remark')
      const updated = await marketService.respondProcurement(selected.id, { accepted: false, remark })
      setSelected(updated)
      message.success('已拒绝集采申请')
      await loadData()
    } catch (error) {
      message.error(getErrorMessage(error, '拒绝集采失败'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Tag color="green">供应方工作台</Tag>
          <Title level={2} className="!mb-2 !mt-3">集采申请</Title>
          <Paragraph className="text-gray-500 !mb-0">处理平台向商品发起的集采申请，确认集采价格、最小成团量和截止时间。</Paragraph>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card><Statistic title="待确认" value={pendingCount} suffix="场" prefix={<ClockCircleOutlined />} /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="参团中" value={activeCount} suffix="场" prefix={<TeamOutlined />} /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="已成单" value={orderedCount} suffix="场" prefix={<FileDoneOutlined />} /></Card></Col>
        </Row>

        <section className="mt-6">
          {activities.length > 0 ? (
            <Row gutter={[16, 16]}>
              {activities.map((item) => (
                <Col key={item.id} xs={24} lg={12}>
                  <Card hoverable className="h-full">
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Text type="secondary">{item.procurementNo}</Text>
                          <Title level={4} className="!mb-1 !mt-2">{item.title}</Title>
                          <Text type="secondary">{item.productName || item.target}</Text>
                        </div>
                        {statusTag(item.status)}
                      </div>
                      <Row gutter={[12, 12]}>
                        <Col span={12}><Text type="secondary">商品ID</Text><div className="font-semibold">{item.productId}</div></Col>
                        <Col span={12}><Text type="secondary">成团门槛</Text><div className="font-semibold">{item.minGroupQuantity || item.targetQuantity}{item.unit || '吨'}</div></Col>
                        <Col span={12}><Text type="secondary">集采价</Text><div className="font-semibold">¥{item.groupPrice || 0}</div></Col>
                        <Col span={12}><Text type="secondary">已归集</Text><div className="font-semibold">{item.demandQuantity || 0}{item.unit || '吨'}</div></Col>
                      </Row>
                      <Progress percent={groupProgress(item)} format={(percent) => `${percent}%成团`} />
                      {item.status === 'pending_seller' ? <Alert type="warning" showIcon message="请确认价格和成团规则后开放给买家参团" /> : null}
                      <Button type={item.status === 'pending_seller' ? 'primary' : 'default'} icon={item.status === 'pending_seller' ? <CheckOutlined /> : <EyeOutlined />} onClick={() => openDetail(item)}>
                        {item.status === 'pending_seller' ? '处理申请' : '查看进度'}
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card><Empty description="暂无集采申请" /></Card>
          )}
        </section>
      </Spin>

      <Drawer title="集采申请详情" open={!!selected} onClose={() => setSelected(null)} width={760}>
        {selected ? (
          <Space direction="vertical" size="large" className="w-full">
            <Card size="small">
              <Steps
                current={flowStep(selected.status)}
                items={flowSteps.map((step) => ({
                  title: step.title,
                  description: step.description,
                  icon: step.icon,
                }))}
              />
            </Card>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="状态">{statusTag(selected.status)}</Descriptions.Item>
              <Descriptions.Item label="商品">{selected.productName}</Descriptions.Item>
              <Descriptions.Item label="目标数量">{selected.targetQuantity}{selected.unit || '吨'}</Descriptions.Item>
              <Descriptions.Item label="成团门槛">{selected.minGroupQuantity || selected.targetQuantity}{selected.unit || '吨'}</Descriptions.Item>
              <Descriptions.Item label="当前参团">{selected.demandQuantity}{selected.unit || '吨'}</Descriptions.Item>
              <Descriptions.Item label="截止时间">{formatDateTime(selected.endedAt)}</Descriptions.Item>
              <Descriptions.Item label="母订单">{selected.masterOrderNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="管理备注" span={2}>{selected.adminRemark || '-'}</Descriptions.Item>
            </Descriptions>
            {selected.status === 'pending_seller' ? (
              <Card title="确认集采规则" size="small">
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={12}><Form.Item name="group_price" label="集采价格" rules={[{ required: true }]}><InputNumber min={0.01} className="w-full" /></Form.Item></Col>
                    <Col xs={24} md={12}><Form.Item name="min_group_quantity" label="最小成团量" rules={[{ required: true }]}><InputNumber min={0.01} className="w-full" /></Form.Item></Col>
                    <Col xs={24} md={12}><Form.Item name="max_group_quantity" label="最大可参团量"><InputNumber min={0.01} className="w-full" /></Form.Item></Col>
                    <Col xs={24} md={12}><Form.Item name="delivery_days" label="交货周期（天）"><InputNumber min={1} className="w-full" /></Form.Item></Col>
                    <Col xs={24}><Form.Item name="ended_at" label="参团截止时间" rules={[{ required: true }]}><Input placeholder="2026-05-31 18:00" /></Form.Item></Col>
                    <Col xs={24}><Form.Item name="remark" label="卖家备注"><Input.TextArea rows={3} /></Form.Item></Col>
                  </Row>
                  <Space>
                    <Button type="primary" icon={<CheckOutlined />} loading={saving} onClick={() => void handleAccept()}>确认并公开</Button>
                    <Button danger icon={<CloseOutlined />} loading={saving} onClick={() => void handleReject()}>拒绝申请</Button>
                  </Space>
                </Form>
              </Card>
            ) : (
              <Alert
                type={selected.status === 'order_created' ? 'success' : 'info'}
                showIcon
                message={selected.status === 'order_created' ? '本次集采已生成订单' : '当前集采正在按平台流程推进'}
                description={selected.masterOrderNo ? `母订单：${selected.masterOrderNo}` : '买家参团和订单生成由平台管理端统一处理。'}
              />
            )}
          </Space>
        ) : null}
      </Drawer>
    </div>
  )
}
