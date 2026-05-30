import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, Checkbox, Col, Empty, Form, Input, InputNumber, Row, Space, Spin, Statistic, Steps, Tag, Timeline, Typography, message } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FormOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementActivity } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const processStages = [
  { title: '平台发起', description: '管理端选择商品', icon: <FormOutlined /> },
  { title: '卖家确认', description: '价格和成团规则', icon: <CheckCircleOutlined /> },
  { title: '买家参团', description: '签协议和收货地址', icon: <TeamOutlined /> },
  { title: '管理成单', description: '生成母子订单', icon: <FileDoneOutlined /> },
  { title: '订单履约', description: '按订单流转', icon: <ShopOutlined /> },
]

const statusMeta: Record<string, { color: string; text: string }> = {
  pending_seller: { color: 'gold', text: '待卖家确认' },
  active: { color: 'green', text: '参团中' },
  ended: { color: 'blue', text: '已截止' },
  order_created: { color: 'purple', text: '已生成订单' },
  seller_rejected: { color: 'red', text: '卖家拒绝' },
  closed: { color: 'default', text: '已关闭' },
}

function formatQuantity(value: number, unit: string) {
  return `${value.toLocaleString('zh-CN')} ${unit || '吨'}`
}

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

function groupProgress(activity: ProcurementActivity) {
  if (activity.status === 'order_created') return 100
  const threshold = activity.minGroupQuantity || activity.targetQuantity || 0
  if (threshold <= 0) return activity.progress || 0
  return Math.min(100, Math.round((activity.demandQuantity / threshold) * 100))
}

export default function ProcurementDetailPage() {
  const params = useParams()
  const activityID = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [joinLoading, setJoinLoading] = useState(false)
  const [activity, setActivity] = useState<ProcurementActivity | null>(null)
  const [joinForm] = Form.useForm<{ quantity: number; contact_name: string; contact_phone: string; delivery_address: string; agreement_signed: boolean; remark?: string }>()

  const loadData = useCallback(async () => {
    if (!activityID) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setActivity(await marketService.getProcurement(activityID))
    } catch (error) {
      message.error('集采活动详情加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [activityID])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleJoin = async () => {
    if (!activity) return
    setJoinLoading(true)
    try {
      const values = await joinForm.validateFields()
      const updated = await marketService.joinProcurement(activity.id, {
        quantity: values.quantity,
        contact_name: values.contact_name,
        contact_phone: values.contact_phone,
        delivery_address: values.delivery_address,
        agreement_signed: values.agreement_signed,
        remark: values.remark,
      })
      setActivity(updated)
      message.success('已参与本次集采')
    } catch (error) {
      const maybe = error as { response?: { data?: { message?: string } } }
      message.error(maybe.response?.data?.message || '参团失败，请确认企业认证和集采状态')
    } finally {
      setJoinLoading(false)
    }
  }

  if (!loading && !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-8 py-12">
          <Card>
            <Empty description="集采活动不存在" />
            <div className="mt-6 text-center">
              <Link to="/procurement"><Button type="primary">返回集采大厅</Button></Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  const previewItems = activity ? [
    { label: '品类', value: activity.category },
    { label: '采购标的', value: activity.target },
    { label: '集采单价', value: activity.groupPrice > 0 ? `¥${activity.groupPrice.toLocaleString('zh-CN')} / ${activity.unit || '吨'}` : '待卖家确认' },
    { label: '最小成团量', value: formatQuantity(activity.minGroupQuantity || activity.targetQuantity, activity.unit) },
    { label: '交货周期', value: `${activity.deliveryDays}天` },
    { label: '卖家', value: activity.sellerName || '-' },
    { label: '截止时间', value: activity.endedAt ? new Date(activity.endedAt).toLocaleString('zh-CN') : activity.openDate },
  ] : []
  const canJoin = activity?.status === 'active' && (!activity.endedAt || new Date(activity.endedAt).getTime() > Date.now())
  const currentStep = activity ? flowStep(activity.status) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Spin spinning={loading}>
        {activity ? (
          <>
            <section className="bg-white py-10">
              <div className="mx-auto max-w-7xl px-8">
                <Link to="/procurement" className="mb-6 inline-flex items-center gap-2 text-primary-600">
                  <ArrowLeftOutlined />
                  返回集采大厅
                </Link>
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Space className="mb-4" size="small" wrap>
                      <Tag color="blue">平台集采</Tag>
                      {statusTag(activity.status)}
                      {activity.masterOrderNo ? <Tag color="purple">母订单 {activity.masterOrderNo}</Tag> : null}
                    </Space>
                    <Title level={1} className="!mb-3">{activity.title}</Title>
                    <Paragraph className="text-lg text-gray-500 !mb-0">
                      编号：{activity.procurementNo} | 商品：{activity.productName || activity.target} | 卖家：{activity.sellerName || '-'}
                    </Paragraph>
                  </div>
                  <Tag color="green" className="px-4 py-2 text-base">{activity.stage}</Tag>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}><Card><Text type="secondary">集采品类</Text><div className="mt-2 text-xl font-semibold">{activity.category}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">集采价格</Text><div className="mt-2 text-xl font-semibold">{activity.groupPrice > 0 ? `¥${activity.groupPrice}` : '待确认'}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">成团门槛</Text><div className="mt-2 text-xl font-semibold">{formatQuantity(activity.minGroupQuantity || activity.targetQuantity, activity.unit)}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">当前阶段</Text><div className="mt-2 text-xl font-semibold">{activity.stage}</div></Card></Col>
                </Row>
              </div>
            </section>

            <main className="mx-auto max-w-7xl px-8 py-10">
              <section>
                <Title level={2} className="!mb-5">参团概览</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="参采企业" value={activity.participatingCount} suffix="家" /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="归集需求" value={activity.demandQuantity} suffix={activity.unit} /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="最小成团量" value={activity.minGroupQuantity || activity.targetQuantity} suffix={activity.unit} /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="集采单价" value={activity.groupPrice || 0} prefix="¥" /></Card></Col>
                  <Col xs={24} sm={12} lg={4}><Card><Statistic title="成团进度" value={groupProgress(activity)} suffix="%" prefix={<ClockCircleOutlined />} /></Card></Col>
                </Row>
              </section>

              <section className="mt-10">
                <Title level={2} className="!mb-5">集采流程</Title>
                <Card>
                  <Steps
                    current={currentStep}
                    items={processStages.map((stage) => ({
                      title: stage.title,
                      description: stage.description,
                      icon: stage.icon,
                    }))}
                  />
                </Card>
              </section>

              <section className="mt-10">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={14}>
                    <Card title="参与集采">
                      {canJoin ? (
                        <Form form={joinForm} layout="vertical" initialValues={{ quantity: activity.minGroupQuantity || 1, agreement_signed: false }}>
                          <Row gutter={16}>
                            <Col xs={24} md={8}>
                              <Form.Item name="quantity" label={`参团数量（${activity.unit || '吨'}）`} rules={[{ required: true, message: '请输入参团数量' }]}>
                                <InputNumber min={0.01} className="w-full" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}><Form.Item name="contact_name" label="收货联系人" rules={[{ required: true }]}><Input /></Form.Item></Col>
                            <Col xs={24} md={8}><Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item></Col>
                            <Col xs={24}><Form.Item name="delivery_address" label="收货地址" rules={[{ required: true }]}><Input /></Form.Item></Col>
                            <Col xs={24}><Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item></Col>
                            <Col xs={24}>
                              <Form.Item name="agreement_signed" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('请先签署集采协议')) }]}>
                                <Checkbox>我已阅读并签署本次集采协议，确认按集采价格和平台规则参团</Checkbox>
                              </Form.Item>
                            </Col>
                          </Row>
                          <Button type="primary" loading={joinLoading} onClick={() => void handleJoin()}>确认参团</Button>
                        </Form>
                      ) : (
                        <Alert
                          type={activity.status === 'order_created' ? 'success' : 'info'}
                          showIcon
                          message={activity.status === 'order_created' ? '本次集采已生成订单' : '当前集采暂不可参团'}
                          description={activity.status === 'pending_seller' ? '卖家尚未确认价格和成团规则。' : activity.endedAt ? `截止时间：${new Date(activity.endedAt).toLocaleString('zh-CN')}` : undefined}
                        />
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={10}>
                    <Card title="参团规则">
                      <Space direction="vertical" className="w-full">
                        <div className="flex justify-between"><Text type="secondary">卖家</Text><Text strong>{activity.sellerName || '-'}</Text></div>
                        <div className="flex justify-between"><Text type="secondary">商品</Text><Text strong>{activity.productName || activity.target}</Text></div>
                        <div className="flex justify-between"><Text type="secondary">集采价</Text><Text strong>¥{activity.groupPrice || 0}</Text></div>
                        <div className="flex justify-between"><Text type="secondary">成团量</Text><Text strong>{activity.minGroupQuantity || 0}{activity.unit || '吨'}</Text></div>
                        <div className="flex justify-between"><Text type="secondary">已归集</Text><Text strong>{activity.demandQuantity || 0}{activity.unit || '吨'}</Text></div>
                        <div className="flex justify-between"><Text type="secondary">截止时间</Text><Text strong>{activity.endedAt ? new Date(activity.endedAt).toLocaleString('zh-CN') : '-'}</Text></div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </section>

              <section className="mt-10">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Card title="流程记录" extra={<Tag color="blue">平台留痕</Tag>}>
                      {activity.logs.length > 0 ? (
                        <Timeline items={activity.logs.map((log) => ({ children: log.content, color: log.color }))} />
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无流程记录" />
                      )}
                    </Card>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" className="w-full">
                      <Card title="集采预览">
                        <Space direction="vertical" size="middle" className="w-full">
                          {previewItems.map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded border border-gray-100 p-3">
                              <Text type="secondary">{item.label}</Text>
                              <Text strong>{item.value}</Text>
                            </div>
                          ))}
                        </Space>
                      </Card>

                      <Card title="下一步">
                        {canJoin ? (
                          <Space direction="vertical">
                            <Text strong><ShoppingCartOutlined /> 填写参团数量和收货地址</Text>
                            <Text type="secondary">参团后管理端会在截止或主动结束时统一生成母子订单。</Text>
                          </Space>
                        ) : (
                          <Space direction="vertical">
                            <Text strong><FileDoneOutlined /> {activity.masterOrderId ? '等待订单履约' : '等待管理端处理'}</Text>
                            <Text type="secondary">{activity.masterOrderNo || '达到成团条件后，平台会生成对应订单。'}</Text>
                          </Space>
                        )}
                      </Card>
                    </Space>
                  </Col>
                </Row>
              </section>
            </main>
          </>
        ) : null}
      </Spin>
    </div>
  )
}
