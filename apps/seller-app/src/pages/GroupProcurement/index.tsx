import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List, Row, Select, Space, Spin, Statistic, Steps, Tag, Typography, message } from 'antd'
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, DollarOutlined, EyeOutlined, FileDoneOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService, type ProcurementProject } from '@/services/marketService'
import { sellerProductService, type SellerProductRecord } from '@/services/productService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { color: string; text: string; step: number }> = {
  collecting: { color: 'gold', text: '待参与', step: 0 },
  quoting: { color: 'blue', text: '报价中', step: 2 },
  awarded: { color: 'green', text: '已定标', step: 3 },
  order_created: { color: 'purple', text: '已转订单', step: 4 },
  closed: { color: 'default', text: '已关闭', step: 4 },
}

const flowSteps = [
  { title: '平台邀约', description: '进入候选供应池', icon: <SendOutlined /> },
  { title: '确认参与', description: '卖家报名项目', icon: <CheckCircleOutlined /> },
  { title: '提交报价', description: '可反复覆盖最新报价', icon: <DollarOutlined /> },
  { title: '平台定标', description: '管理端选择中标报价', icon: <TeamOutlined /> },
  { title: '生成订单', description: '转入商城履约', icon: <FileDoneOutlined /> },
]

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function formatMoney(value?: number) {
  if (!value) return '-'
  return `¥${Number(value).toLocaleString('zh-CN')}`
}

function formatQuantity(value?: number, unit?: string) {
  return `${Number(value || 0).toLocaleString('zh-CN')} ${unit || '吨'}`
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { response?: { data?: { message?: string } }; message?: string }
  return maybe.response?.data?.message || maybe.message || fallback
}

interface QuoteFormValues {
  product_id?: number
  unit_price: number
  supply_quantity: number
  unit?: string
  delivery_days: number
  delivery_warehouse?: string
  tax_included?: boolean
  tax_rate?: number
  payment_terms?: string
  remark?: string
}

export default function SellerGroupProcurementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<ProcurementProject[]>([])
  const [selected, setSelected] = useState<ProcurementProject | null>(null)
  const [products, setProducts] = useState<SellerProductRecord[]>([])
  const [quoteForm] = Form.useForm<QuoteFormValues>()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectList, productResponse] = await Promise.all([
        marketService.listProcurementProjects(),
        sellerProductService.list(),
      ])
      setProjects(projectList)
      setProducts(productResponse.data.list.filter((item) => item.status === 'approved'))
    } catch (error) {
      message.error(getErrorMessage(error, '集采竞价项目加载失败'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const openDetail = async (project: ProcurementProject) => {
    setLoading(true)
    try {
      const detail = await marketService.getProcurementProject(project.id)
      setSelected(detail)
      quoteForm.setFieldsValue({
        product_id: detail.viewerQuote?.productId || detail.viewerEnrollment?.productId || undefined,
        unit_price: detail.viewerQuote?.unitPrice || undefined,
        supply_quantity: detail.viewerQuote?.supplyQuantity || detail.targetQuantity || undefined,
        unit: detail.viewerQuote?.unit || detail.unit || '吨',
        delivery_days: detail.viewerQuote?.deliveryDays || detail.awardDeliveryDays || 3,
        delivery_warehouse: detail.viewerQuote?.deliveryWarehouse,
        tax_included: detail.viewerQuote?.taxIncluded ?? true,
        tax_rate: detail.viewerQuote?.taxRate || undefined,
        payment_terms: detail.viewerQuote?.paymentTerms,
        remark: detail.viewerQuote?.remark || detail.viewerEnrollment?.remark,
      })
    } catch (error) {
      message.error(getErrorMessage(error, '集采项目详情加载失败'))
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const updated = await marketService.createProcurementProjectEnrollment(selected.id, {
        remark: quoteForm.getFieldValue('remark'),
      })
      setSelected(updated)
      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      message.success('已确认参与该集采项目')
    } catch (error) {
      message.error(getErrorMessage(error, '确认参与失败'))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitQuote = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const values = await quoteForm.validateFields()
      const updated = await marketService.submitProcurementProjectQuote(selected.id, values)
      setSelected(updated)
      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      message.success('最新报价已提交')
    } catch (error) {
      message.error(getErrorMessage(error, '提交报价失败'))
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const waiting = projects.filter((item) => !item.viewerEnrollment).length
    const quoting = projects.filter((item) => item.status === 'quoting').length
    const awarded = projects.filter((item) => item.status === 'awarded' || item.status === 'order_created').length
    return { waiting, quoting, awarded }
  }, [projects])

  const meta = selected ? statusMeta[selected.status] || { color: 'default', text: selected.status, step: 0 } : statusMeta.collecting
  const canQuote = selected?.status === 'collecting' || selected?.status === 'quoting'
  const hasEnrollment = Boolean(selected?.viewerEnrollment)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Tag color="green">供应方工作台</Tag>
          <Title level={2} className="!mb-2 !mt-3">集采竞价</Title>
          <Paragraph className="text-gray-500 !mb-0">卖家先确认参与，再提交可覆盖的最新报价。平台按最新有效报价和履约条件定标。</Paragraph>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card><Statistic title="待确认参与" value={stats.waiting} suffix="个" prefix={<ClockCircleOutlined />} /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="报价中项目" value={stats.quoting} suffix="个" prefix={<DollarOutlined />} /></Card></Col>
          <Col xs={24} md={8}><Card><Statistic title="已定标/转单" value={stats.awarded} suffix="个" prefix={<FileDoneOutlined />} /></Card></Col>
        </Row>

        <section className="mt-6">
          {projects.length > 0 ? (
            <Row gutter={[16, 16]}>
              {projects.map((item) => {
                const itemMeta = statusMeta[item.status] || { color: 'default', text: item.status, step: 0 }
                return (
                  <Col key={item.id} xs={24} lg={12}>
                    <Card hoverable className="h-full">
                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text type="secondary">{item.projectNo}</Text>
                            <Title level={4} className="!mb-1 !mt-2">{item.title}</Title>
                            <Text type="secondary">{item.productName || '-'} · {item.category || '-'}</Text>
                          </div>
                          <Space direction="vertical" align="end" size={4}>
                            <Tag color={itemMeta.color}>{itemMeta.text}</Tag>
                            {item.viewerQuote ? <Tag color="green">已报价</Tag> : item.viewerEnrollment ? <Tag color="blue">已参与</Tag> : <Tag color="orange">待参与</Tag>}
                          </Space>
                        </div>

                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">需求量</Text><div className="font-semibold">{formatQuantity(item.demandQuantity, item.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">报价截止</Text><div className="font-semibold">{formatDateTime(item.quoteDeadline)}</div></Col>
                          <Col span={12}><Text type="secondary">参与买家</Text><div className="font-semibold">{item.buyerEnterpriseCount} 家</div></Col>
                          <Col span={12}><Text type="secondary">有效报价</Text><div className="font-semibold">{item.quotedSupplierCount} 家</div></Col>
                        </Row>

                        {item.viewerQuote ? (
                          <Alert type="success" showIcon message={`我的最新报价 ${formatMoney(item.viewerQuote.unitPrice)}`} description={`供货量 ${formatQuantity(item.viewerQuote.supplyQuantity, item.viewerQuote.unit)}，交期 ${item.viewerQuote.deliveryDays} 天`} />
                        ) : item.viewerEnrollment ? (
                          <Alert type="info" showIcon message="已参与，待提交报价" />
                        ) : (
                          <Alert type="warning" showIcon message="尚未确认参与，当前项目不会进入报价比较" />
                        )}

                        <Button type={item.viewerEnrollment ? 'default' : 'primary'} icon={item.viewerEnrollment ? <EyeOutlined /> : <CheckOutlined />} onClick={() => void openDetail(item)}>
                          {item.viewerEnrollment ? '查看并报价' : '确认参与'}
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          ) : (
            <Card><Empty description="暂无可参与的集采竞价项目" /></Card>
          )}
        </section>
      </Spin>

      <Drawer title="集采竞价详情" open={!!selected} onClose={() => setSelected(null)} width={820}>
        {selected ? (
          <Space direction="vertical" size="large" className="w-full">
            <Card size="small">
              <Steps
                current={meta.step}
                items={flowSteps.map((step) => ({
                  title: step.title,
                  description: step.description,
                  icon: step.icon,
                }))}
              />
            </Card>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="项目状态"><Tag color={meta.color}>{meta.text}</Tag></Descriptions.Item>
              <Descriptions.Item label="项目编号">{selected.projectNo}</Descriptions.Item>
              <Descriptions.Item label="商品">{selected.productName || '-'}</Descriptions.Item>
              <Descriptions.Item label="需求总量">{formatQuantity(selected.demandQuantity, selected.unit)}</Descriptions.Item>
              <Descriptions.Item label="目标价">{formatMoney(selected.targetPrice)}</Descriptions.Item>
              <Descriptions.Item label="报价截止">{formatDateTime(selected.quoteDeadline)}</Descriptions.Item>
              <Descriptions.Item label="收货地" span={2}>{selected.deliveryAddress || '-'}</Descriptions.Item>
              <Descriptions.Item label="平台备注" span={2}>{selected.adminRemark || '-'}</Descriptions.Item>
            </Descriptions>

            {!hasEnrollment ? (
              <Card title="第一步：确认参与" size="small">
                <Paragraph className="text-gray-500">确认参与后，你的企业会进入该项目的正式报价池，之后才能提交和覆盖最新报价。</Paragraph>
                <Form form={quoteForm} layout="vertical">
                  <Form.Item name="remark" label="参与备注">
                    <Input.TextArea rows={3} placeholder="可填写供货优势、可覆盖区域、预计交期等说明" />
                  </Form.Item>
                </Form>
                <Button type="primary" icon={<CheckOutlined />} loading={saving} onClick={() => void handleEnroll()}>确认参与项目</Button>
              </Card>
            ) : null}

            {hasEnrollment ? (
              <Card title="第二步：提交最新报价" size="small">
                <Form form={quoteForm} layout="vertical">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="product_id" label="报价商品" rules={[{ required: true, message: '请选择报价商品' }]}>
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="选择已审核通过的商城商品"
                          options={products.map((item) => ({
                            label: `${item.name} / ${item.sku_id} / 库存 ${item.visible_stock}`,
                            value: item.id,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="unit_price" label="报价单价" rules={[{ required: true, message: '请输入报价单价' }]}>
                        <InputNumber min={0.01} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="supply_quantity" label="可供数量" rules={[{ required: true, message: '请输入可供数量' }]}>
                        <InputNumber min={0.01} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="delivery_days" label="交货周期（天）" rules={[{ required: true, message: '请输入交货周期' }]}>
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="unit" label="单位">
                        <Input placeholder="吨" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="tax_rate" label="税率（%）">
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="delivery_warehouse" label="发货仓库">
                        <Input placeholder="填写发货仓或库区名称" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="payment_terms" label="付款条件">
                        <Input placeholder="如：款到发货 / 月结 30 天" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="remark" label="报价说明">
                        <Input.TextArea rows={3} placeholder="补充含税情况、执行条件、锁价说明等" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                <Space>
                  <Button type="primary" icon={<DollarOutlined />} loading={saving} disabled={!canQuote} onClick={() => void handleSubmitQuote()}>
                    提交最新报价
                  </Button>
                  {!canQuote ? <Text type="secondary">当前项目已结束报价，无法继续提交</Text> : null}
                </Space>
              </Card>
            ) : null}

            <Card title="报价排名" size="small">
              {selected.quotes.length > 0 ? (
                <List
                  dataSource={selected.quotes}
                  renderItem={(item, index) => (
                    <List.Item>
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-3">
                          <Space wrap>
                            <Tag color={item.sellerEnterpriseId === selected.viewerQuote?.sellerEnterpriseId ? 'green' : 'default'}>#{index + 1}</Tag>
                            <Text strong>{item.sellerName}</Text>
                            {item.sellerEnterpriseId === selected.viewerQuote?.sellerEnterpriseId ? <Tag color="green">我的报价</Tag> : null}
                          </Space>
                          <Text strong>{formatMoney(item.unitPrice)}</Text>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          供货量 {formatQuantity(item.supplyQuantity, item.unit)}，交期 {item.deliveryDays} 天，仓库 {item.deliveryWarehouse || '-'}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无有效报价" />
              )}
            </Card>

            {selected.awardSupplierName ? (
              <Alert
                type={selected.orderNo ? 'success' : 'info'}
                showIcon
                message={selected.orderNo ? '项目已转订单' : '项目已定标'}
                description={`中标供应商：${selected.awardSupplierName}，中标价 ${formatMoney(selected.awardUnitPrice)}，订单号 ${selected.orderNo || '-'}`}
              />
            ) : null}
          </Space>
        ) : null}
      </Drawer>
    </div>
  )
}
