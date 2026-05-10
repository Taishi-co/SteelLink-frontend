import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Row, Col, Card, Typography, Form, Input, Button, Select, Space, Divider, Descriptions, message, Modal, Tag } from 'antd'
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { serviceOfferService } from '@/services/serviceOfferService'
import { serviceFulfillmentService } from '@/services/serviceFulfillmentService'
import { orderService } from '@/services/orderService'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

interface CheckoutItem {
  id: number
  name: string
  specs: string
  price: number
  quantity: number
  warehouseId?: number
  warehouse: string
  mill: string
  bundleNos: string[]
}

const mockCheckoutItems: CheckoutItem[] = [
  {
    id: 1,
    name: '热轧卷板 SPHC 3.0×1250×C',
    specs: '材质：SPHC | 厚度：3.0mm | 宽度：1250mm',
    price: 3850,
    quantity: 100,
    warehouseId: 1,
    warehouse: 'SL-DEMO-唐山钢材监管仓',
    mill: '河钢集团',
    bundleNos: ['HB-2026-0420-0001', 'HB-2026-0420-0002', 'HB-2026-0420-0003'],
  },
]

export default function CheckoutPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [selectedLogistics, setSelectedLogistics] = useState<number>()
  const [loading, setLoading] = useState(false)
  const { data: warehouseData } = useQuery({
    queryKey: ['checkout-warehouse-services'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 100 }),
  })
  const { data: logisticsData } = useQuery({
    queryKey: ['checkout-logistics-services'],
    queryFn: () => serviceOfferService.listLogistics({ page_size: 100 }),
  })
  const warehouses = useMemo(() => warehouseData?.data.list ?? [], [warehouseData?.data.list])
  const logisticsServices = useMemo(() => logisticsData?.data.list ?? [], [logisticsData?.data.list])

  const totalQuantity = mockCheckoutItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = mockCheckoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const pickupWarehouse = warehouses.find((warehouse) => warehouse.id === mockCheckoutItems[0]?.warehouseId)
  const hasWarehouseBinding = Boolean(pickupWarehouse)
  const availableDestWarehouses = warehouses.filter((w) => w.id !== pickupWarehouse?.id)
  const canSelectDestWarehouse = availableDestWarehouses.length > 0
  const recommendedLogistics = useMemo(() => {
    if (!pickupWarehouse) {
      return logisticsServices
    }

    const matched = logisticsServices.filter((carrier) => {
      const routeText = `${carrier.route_start} ${carrier.route_end} ${carrier.service_scope}`
      return routeText.includes((pickupWarehouse.city || '').replace('市', '')) || routeText.includes((pickupWarehouse.province || '').replace('省', ''))
    })
    return matched.length ? matched : logisticsServices
  }, [logisticsServices, pickupWarehouse])
  useEffect(() => {
    if (!selectedLogistics && recommendedLogistics[0]?.id) {
      setSelectedLogistics(recommendedLogistics[0].id)
      form.setFieldValue('logistics', recommendedLogistics[0].id)
    }
  }, [form, recommendedLogistics, selectedLogistics])
  const selectedLogisticsService = logisticsServices.find((item) => item.id === selectedLogistics)
  const { data: estimateData } = useQuery({
    queryKey: ['checkout-logistics-estimate', selectedLogistics, pickupWarehouse?.id, totalQuantity],
    queryFn: () => serviceFulfillmentService.estimateLogistics({
      logistics_service_id: Number(selectedLogistics),
      warehouse_service_id: pickupWarehouse?.id,
      destination: '买家收货地址',
      weight: totalQuantity,
    }),
    enabled: Boolean(selectedLogistics),
  })
  const logisticsPrice = selectedLogistics === 0 ? 0 : Number(estimateData?.data.estimated_price || 0)
  const finalPrice = totalPrice + logisticsPrice

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      Modal.confirm({
        title: '确认下单',
        content: (
          <div>
            <Paragraph className="mb-2">
              确认下单后，系统将自动锁定对应捆包号库存 24 小时，并生成仓库提货与物流履约待办。
            </Paragraph>
            <Paragraph className="text-gray-500 text-sm">
              订单总金额：<Text className="text-red-500 font-bold">¥{finalPrice.toLocaleString()}</Text>
            </Paragraph>
          </div>
        ),
        okText: '确认下单',
        cancelText: '取消',
        onOk: async () => {
          try {
            const payload = {
              product_id: mockCheckoutItems[0]?.id || 1,
              quantity: mockCheckoutItems[0]?.quantity || 1,
              dest_warehouse_service_id: values.destWarehouse || undefined,
            }
            await orderService.create(payload)
            message.success('订单创建成功，请完成合同签署和支付')
            navigate('/orders')
          } catch (err: unknown) {
            const error = err as { message?: string }
            message.error(error?.message || '创建订单失败')
          } finally {
            setLoading(false)
          }
        },
        onCancel: () => {
          setLoading(false)
        },
      })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <Link to="/cart">
            <Button icon={<ArrowLeftOutlined />}>
              返回采购清单
            </Button>
          </Link>
        </div>

        <Title level={3} className="!mb-6">确认订单</Title>

        <Row gutter={24}>
          <Col span={16}>
            <Card title="商品信息" className="mb-6">
              {mockCheckoutItems.map((item) => (
                <div key={item.id} className="mb-4 pb-4 border-b last:border-0">
                  <Row gutter={16} align="middle">
                    <Col span={16}>
                      <div className="mb-2">
                        <Text className="font-medium text-lg">{item.name}</Text>
                      </div>
                      <div className="text-gray-500 text-sm mb-2">{item.specs}</div>
                      <div className="text-gray-500 text-sm mb-2">
                        <ShoppingOutlined className="mr-1" />
                        钢厂：{item.mill}
                      </div>
                      <div className="text-gray-500 text-sm mb-2">
                        <EnvironmentOutlined className="mr-1" />
                        仓库：{item.warehouse}
                      </div>
                      <div className="text-gray-500 text-sm">
                        捆包号：
                        {item.bundleNos.map((no, idx) => (
                          <span key={idx} className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {no}
                          </span>
                        ))}
                      </div>
                    </Col>
                    <Col span={8} className="text-right">
                      <div className="text-gray-500 text-sm mb-1">数量</div>
                      <div className="font-medium mb-2">{item.quantity} 吨</div>
                      <div className="text-gray-500 text-sm mb-1">单价</div>
                      <div className="font-mono font-bold text-red-500">
                        ¥{item.price.toLocaleString()}/吨
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card>

            <Card title="物流与仓储服务" className="mb-6">
              <Space direction="vertical" size="middle" className="w-full">
                <Alert
                  type={hasWarehouseBinding ? 'success' : 'warning'}
                  showIcon
                  message={hasWarehouseBinding ? '商品已绑定平台登记仓库，优先推荐可覆盖该仓库的物流商。' : '商品暂未绑定仓库，请通过物流平台发布运输委托或自行安排物流。'}
                  description={hasWarehouseBinding && pickupWarehouse
                    ? `${pickupWarehouse.warehouse_name}（WH-${String(pickupWarehouse.id).padStart(6, '0')}） · ${pickupWarehouse.address}`
                    : '后端仓库关系完善前，未绑定仓库的商品无法自动生成提货点和推荐线路。'}
                />
                {!canSelectDestWarehouse && (
                  <Alert
                    type="warning"
                    showIcon
                    message="暂无其他可用目的地仓库"
                    description="当前系统只有一个已审核通过的仓储资源，无法选择不同的目的地仓库。请先添加更多仓储资源。"
                  />
                )}
                {hasWarehouseBinding && pickupWarehouse ? (
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="提货仓库">{pickupWarehouse.warehouse_name}</Descriptions.Item>
                    <Descriptions.Item label="仓库编码">WH-{String(pickupWarehouse.id).padStart(6, '0')}</Descriptions.Item>
                    <Descriptions.Item label="仓库运营企业">企业 {pickupWarehouse.enterprise_id}</Descriptions.Item>
                    <Descriptions.Item label="可用库容">{Number(pickupWarehouse.available_capacity || 0).toLocaleString()} 吨</Descriptions.Item>
                    <Descriptions.Item label="仓库地址" span={2}>{pickupWarehouse.address}</Descriptions.Item>
                  </Descriptions>
                ) : null}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {recommendedLogistics.map((carrier) => (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => setSelectedLogistics(carrier.id)}
                      className={`rounded-lg border p-4 text-left transition ${
                        selectedLogistics === carrier.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Text strong>{carrier.name}</Text>
                        <Tag color={carrier.status === 2 ? 'green' : 'gold'}>{carrier.status === 2 ? '可接单' : '待确认'}</Tag>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">{carrier.service_scope}</div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span>{carrier.vehicle_type}</span>
                        <span className="font-mono text-red-600">{carrier.price_rule}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/service-market">
                    <Button icon={<TruckOutlined />}>去物流平台找物流</Button>
                  </Link>
                  <Link to="/dashboard/logistics">
                    <Button>进入物流工作台发单</Button>
                  </Link>
                </div>
              </Space>
            </Card>

            <Card title="收货信息" className="mb-6">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="contactName"
                      label="联系人"
                      rules={[{ required: true, message: '请输入联系人' }]}
                    >
                      <Input placeholder="请输入联系人姓名" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="contactPhone"
                      label="联系电话"
                      rules={[
                        { required: true, message: '请输入联系电话' },
                        { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
                      ]}
                    >
                      <Input placeholder="请输入联系电话" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="warehouse" label="提货仓库" initialValue={pickupWarehouse?.id}>
                      <Select size="large" placeholder="未绑定仓库时请在物流平台确认提货点" disabled={hasWarehouseBinding}>
                        {warehouses.map((warehouse) => (
                          <Option key={warehouse.id} value={warehouse.id}>
                            <div>
                              <div className="font-medium">{warehouse.warehouse_name}</div>
                              <div className="text-gray-500 text-xs">{warehouse.address}</div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="destWarehouse"
                      label="目的地仓库（可选）"
                      extra="可在订单创建后，在订单详情页选择目的地仓库"
                    >
                      <Select
                        size="large"
                        placeholder={canSelectDestWarehouse ? "请选择物流送达的目的地仓库（可选）" : "暂无其他可用仓库"}
                        disabled={!canSelectDestWarehouse}
                        allowClear
                      >
                        {availableDestWarehouses.map((warehouse) => (
                          <Option key={warehouse.id} value={warehouse.id}>
                            <div>
                              <div className="font-medium">{warehouse.warehouse_name}</div>
                              <div className="text-gray-500 text-xs">
                                企业ID: {warehouse.enterprise_id} | {warehouse.address}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                可用库容: {Number(warehouse.available_capacity || 0).toLocaleString()} 吨
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="logistics"
                      label="物流配送"
                      rules={[{ required: true, message: '请选择物流配送' }]}
                      initialValue={selectedLogistics}
                    >
                      <Select
                        size="large"
                        placeholder="请选择物流配送"
                        onChange={setSelectedLogistics}
                      >
                        {logisticsServices.map((log) => (
                          <Option key={log.id} value={log.id}>
                            <div className="flex justify-between">
                              <span>{log.name}</span>
                              <span className="text-gray-500">{log.price_rule}</span>
                            </div>
                          </Option>
                        ))}
                        <Option value={0}>自行安排物流</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="remark" label="备注">
                  <Input.TextArea rows={3} placeholder="如有特殊要求请在此备注" size="large" />
                </Form.Item>
              </Form>
            </Card>

            <Card title="重要提示">
              <Space direction="vertical" className="w-full">
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="text-blue-500 mt-0.5" />
                  <div>
                    <Text className="font-medium">库存锁定</Text>
                    <Text type="secondary" className="text-sm block">
                      订单确认后，系统将自动锁定对应捆包号库存 24 小时，超时未付款自动解锁。
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="text-blue-500 mt-0.5" />
                  <div>
                    <Text className="font-medium">合同签署</Text>
                    <Text type="secondary" className="text-sm block">
                      订单创建后，系统将自动生成电子合同，请在 30 分钟内完成签署。
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="text-blue-500 mt-0.5" />
                  <div>
                    <Text className="font-medium">支付凭证</Text>
                    <Text type="secondary" className="text-sm block">
                      上传支付凭证时，请确保凭证带有 GPS 定位和时间戳水印。
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={8}>
            <Card className="sticky top-24">
              <Title level={5} className="!mb-4">订单汇总</Title>

              <Descriptions column={1} size="small" className="mb-4">
                <Descriptions.Item label="商品金额">
                  <span className="font-mono">¥{totalPrice.toLocaleString()}</span>
                </Descriptions.Item>
                <Descriptions.Item label="物流费用">
                  <span className="font-mono">{selectedLogistics === 0 ? '自行安排' : `¥${logisticsPrice.toLocaleString()}`}</span>
                </Descriptions.Item>
                <Descriptions.Item label="提货仓库">
                  <span>{pickupWarehouse?.warehouse_name || '待物流平台确认'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="履约保障">
                  <span>{selectedLogistics === 0 ? '自行保障' : selectedLogisticsService?.description || '平台承运险 + 回单归档'}</span>
                </Descriptions.Item>
              </Descriptions>

              <Divider className="!my-4" />

              <div className="flex justify-between items-center mb-6">
                <Text className="text-lg font-medium">应付总额</Text>
                <Text className="text-2xl font-bold text-red-600 font-mono">
                  ¥{finalPrice.toLocaleString()}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleSubmit}
                loading={loading}
                className="h-12 text-lg"
              >
                确认下单
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
