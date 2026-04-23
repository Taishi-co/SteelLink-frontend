import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Form, Input, Button, Select, Space, Divider, Descriptions, message, Modal } from 'antd'
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

interface CheckoutItem {
  id: number
  name: string
  specs: string
  price: number
  quantity: number
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
    warehouse: '唐山仓库A区',
    mill: '河钢集团',
    bundleNos: ['HB-2026-0420-0001', 'HB-2026-0420-0002', 'HB-2026-0420-0003'],
  },
]

const mockWarehouses = [
  { id: 1, name: '唐山仓库A区', address: '唐山市丰润区工业路88号', phone: '0315-12345678' },
  { id: 2, name: '石家庄仓库', address: '石家庄市栾城区钢铁路12号', phone: '0311-87654321' },
  { id: 3, name: '天津港仓库', address: '天津市滨海新区天津港第五大街', phone: '022-12345678' },
]

const mockLogistics = [
  { id: 1, name: '唐山物流有限公司', price: 80 },
  { id: 2, name: '河北货运集团', price: 75 },
  { id: 3, name: '全国钢铁配送', price: 85 },
]

export default function CheckoutPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [selectedLogistics, setSelectedLogistics] = useState(1)
  const [loading, setLoading] = useState(false)

  const totalPrice = mockCheckoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const logisticsPrice = mockLogistics.find((item) => item.id === selectedLogistics)?.price || 0
  const finalPrice = totalPrice + logisticsPrice

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setLoading(true)

      Modal.confirm({
        title: '确认下单',
        content: (
          <div>
            <Paragraph className="mb-2">
              确认下单后，系统将自动锁定对应捆包号库存 24 小时，请确认订单信息无误。
            </Paragraph>
            <Paragraph className="text-gray-500 text-sm">
              订单总金额：<Text className="text-red-500 font-bold">¥{finalPrice.toLocaleString()}</Text>
            </Paragraph>
          </div>
        ),
        okText: '确认下单',
        cancelText: '取消',
        onOk: () => {
          setTimeout(() => {
            setLoading(false)
            message.success('订单创建成功，请完成合同签署和支付')
            navigate('/orders')
          }, 600)
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
                    <Form.Item
                      name="warehouse"
                      label="提货仓库"
                      rules={[{ required: true, message: '请选择提货仓库' }]}
                      initialValue={1}
                    >
                      <Select size="large" placeholder="请选择提货仓库">
                        {mockWarehouses.map((wh) => (
                          <Option key={wh.id} value={wh.id}>
                            <div>
                              <div className="font-medium">{wh.name}</div>
                              <div className="text-gray-500 text-xs">{wh.address}</div>
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
                      initialValue={1}
                    >
                      <Select
                        size="large"
                        placeholder="请选择物流配送"
                        onChange={setSelectedLogistics}
                      >
                        {mockLogistics.map((log) => (
                          <Option key={log.id} value={log.id}>
                            <div className="flex justify-between">
                              <span>{log.name}</span>
                              <span className="text-gray-500">¥{log.price}/吨</span>
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
