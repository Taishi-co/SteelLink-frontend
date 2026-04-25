import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Spin, Steps, Tag, Timeline, Typography, message } from 'antd'
import { ArrowLeftOutlined, CarOutlined, CheckCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { timelineColor } from '@steellink/shared/utils'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'

const { Title, Paragraph, Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'orange' },
  2: { label: '待签合同', color: 'gold' },
  3: { label: '待支付', color: 'orange' },
  4: { label: '待卖家确认收款', color: 'blue' },
  5: { label: '待提货', color: 'cyan' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'green' },
  8: { label: '已完成', color: 'green' },
  9: { label: '已取消', color: 'red' },
  10: { label: '已冻结', color: 'volcano' },
  11: { label: '异常', color: 'magenta' },
}

const orderSteps = [
  { title: '订单创建' },
  { title: '支付凭证' },
  { title: '待提货' },
  { title: '配送中' },
  { title: '已完成' },
]

function getCurrentStep(status: number) {
  if (status <= 3) return 1
  if (status === 4 || status === 5) return 2
  if (status === 6 || status === 7) return 3
  if (status >= 8) return 4
  return 0
}

function getStatusNotice(status: number, hasPaymentVoucher: boolean, hasDeliveryInfo: boolean) {
  if (status === 3) {
    return {
      type: hasPaymentVoucher ? 'info' as const : 'warning' as const,
      message: hasPaymentVoucher ? '支付凭证已上传，等待卖家确认收款。' : '当前待支付，请先上传支付凭证。',
    }
  }
  if (status === 4) {
    return {
      type: 'info' as const,
      message: '买家已上传支付凭证，等待卖家确认收款。',
    }
  }
  if (status === 5) {
    return {
      type: hasDeliveryInfo ? 'info' as const : 'warning' as const,
      message: hasDeliveryInfo ? '提货信息已录入，等待卖家确认出库。' : '当前待提货，请先录入提货信息。',
    }
  }
  if (status === 6 || status === 7) {
    return {
      type: 'info' as const,
      message: '订单已进入配送阶段，确认签收后订单会完成归档。',
    }
  }
  if (status === 8) {
    return {
      type: 'success' as const,
      message: '订单已完成，支付、提货和签收信息已归档。',
    }
  }
  return {
    type: 'info' as const,
    message: '订单状态已更新。',
  }
}

function isValidHttpUrl(value?: string) {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function formatTimelineTime(value?: string) {
  return value ? new Date(value).toLocaleString() : ''
}

const httpUrlRule = {
  validator: async (_: unknown, value?: string) => {
    if (!value) {
      throw new Error('请输入凭证地址')
    }
    if (!isValidHttpUrl(value)) {
      throw new Error('请输入完整的 http/https 地址')
    }
  },
}

function hasFormErrorFields(error: unknown) {
  return typeof error === 'object' && error !== null && 'errorFields' in error
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const response = 'response' in error ? error.response : undefined
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data
      if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
        return data.message
      }
    }
  }
  return undefined
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [confirmingReceipt, setConfirmingReceipt] = useState(false)
  const [form] = Form.useForm()
  const [deliveryForm] = Form.useForm()
  const [receiptForm] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderService.getById(Number(id)),
    enabled: Boolean(id),
  })

  const order = data
  const item = order?.items?.[0]
  const { data: productDetail } = useQuery({
    queryKey: ['order-product-detail', item?.product_id],
    queryFn: async () => (await productService.getProduct(Number(item?.product_id))).data,
    enabled: Boolean(item?.product_id),
  })
  const status = statusMap[order?.status || 0] || { label: `状态${order?.status ?? '-'}`, color: 'default' }
  const statusNotice = getStatusNotice(order?.status || 0, Boolean(order?.payment_info?.voucher_url), Boolean(order?.delivery_info))
  const pickupWarehouseName = productDetail?.warehouseInfo?.warehouse_name || order?.delivery_info?.warehouse_name || ''
  const pickupWarehouseId = productDetail?.warehouseInfo?.warehouse_id || 0
  const pickupWarehouseAddress = productDetail?.warehouseInfo?.address || ''
  const pickupWarehouseCode = productDetail?.warehouseInfo?.warehouse_code || ''
  const pickupWarehouseRegion = [productDetail?.warehouseInfo?.province, productDetail?.warehouseInfo?.city, productDetail?.warehouseInfo?.district]
    .filter(Boolean)
    .join(' ')

  const handleUploadVoucher = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)
      await orderService.uploadPaymentVoucher(Number(id), values)
      message.success('支付凭证已上传')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      form.resetFields()
      setOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error) || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      const values = await deliveryForm.validateFields()
      setSavingDelivery(true)
      await orderService.setDeliveryInfo(Number(id), {
        ...values,
        warehouse_id: pickupWarehouseId,
        warehouse_name: pickupWarehouseName,
      })
      message.success('提货信息已保存，提货码已生成')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      deliveryForm.resetFields()
      setDeliveryOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error) || '保存失败')
    } finally {
      setSavingDelivery(false)
    }
  }

  const openDeliveryModal = () => {
    deliveryForm.setFieldsValue({
      driver_name: order?.delivery_info?.driver_name,
      driver_phone: order?.delivery_info?.driver_phone,
      driver_id_card: order?.delivery_info?.driver_id_card,
      plate_number: order?.delivery_info?.plate_number,
      address: order?.delivery_info?.address,
      estimated_time: order?.delivery_info?.estimated_time,
    })
    setDeliveryOpen(true)
  }

  const handleConfirmReceipt = async () => {
    try {
      const values = await receiptForm.validateFields()
      setConfirmingReceipt(true)
      await orderService.confirmReceipt(Number(id), values)
      message.success('已确认收货，订单已完成')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      receiptForm.resetFields()
      setReceiptOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error) || '确认收货失败')
    } finally {
      setConfirmingReceipt(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spin size="large" />
          </div>
        ) : !order || !item ? (
          <Card className="mt-6">
            <Empty description="订单不存在或无权查看" />
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <div className="flex justify-between items-start">
                <div>
                  <Title level={3} className="!mb-2">订单号：{order.order_no}</Title>
                  <Text type="secondary">创建时间：{new Date(order.created_at).toLocaleString()}</Text>
                </div>
                <Tag color={status.color} className="px-4 py-1 text-base">
                  {status.label}
                </Tag>
              </div>
            </Card>

            <Card className="mt-6">
              <Steps current={getCurrentStep(order.status)} items={orderSteps} />
            </Card>

            <Card title="订单时间线" className="mt-6">
              <Timeline
                items={(order.timeline || []).map((item) => ({
                  color: timelineColor(item.status),
                  children: (
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.time && <Text type="secondary">{formatTimelineTime(item.time)}</Text>}
                      {item.description && (
                        <Paragraph className="!mb-0" type="secondary">
                          {item.description}
                        </Paragraph>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>

            <Alert
              type={statusNotice.type}
              showIcon
              className="mt-6"
              message="订单状态提示"
              description={statusNotice.message}
            />

            <Card title="订单商品" className="mt-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="商品名称">{item.product_name}</Descriptions.Item>
                <Descriptions.Item label="商品编号">{item.product_no}</Descriptions.Item>
                <Descriptions.Item label="钢厂">{item.steel_mill}</Descriptions.Item>
                <Descriptions.Item label="分类">{item.category}</Descriptions.Item>
                <Descriptions.Item label="捆包号">{item.bundle_no}</Descriptions.Item>
                <Descriptions.Item label="数量">{item.quantity} 吨</Descriptions.Item>
                <Descriptions.Item label="单价">¥{item.unit_price.toLocaleString()}/吨</Descriptions.Item>
                <Descriptions.Item label="小计">¥{item.total_amount.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="交易双方" className="mt-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="买家企业">{order.buyer_name}</Descriptions.Item>
                <Descriptions.Item label="卖家企业">{order.seller_name}</Descriptions.Item>
                <Descriptions.Item label="订单总量">{order.total_quantity} 吨</Descriptions.Item>
                <Descriptions.Item label="订单总额">¥{order.tax_total_amount.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="币种">{order.currency}</Descriptions.Item>
                <Descriptions.Item label="支付截止">
                  {order.expires_at ? new Date(order.expires_at).toLocaleString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {order.payment_info && (
              <Card title="支付信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="支付方式">{order.payment_info.payment_method}</Descriptions.Item>
                  <Descriptions.Item label="支付时间">
                    {new Date(order.payment_info.payment_time).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="交易流水号">{order.payment_info.transaction_no || '-'}</Descriptions.Item>
                  <Descriptions.Item label="付款账户">{order.payment_info.payer_account || '-'}</Descriptions.Item>
                  <Descriptions.Item label="收款账户">{order.payment_info.payee_account || '-'}</Descriptions.Item>
                  <Descriptions.Item label="支付凭证">
                    {isValidHttpUrl(order.payment_info.voucher_url) ? (
                      <a href={order.payment_info.voucher_url} target="_blank" rel="noreferrer">
                        查看支付凭证
                      </a>
                    ) : (
                      <Text type="secondary">凭证地址无效</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {(order.delivery_info || order.status >= 5) && (
              <Card title="提货信息" className="mt-6">
                {order.delivery_info ? (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="司机姓名">{order.delivery_info.driver_name}</Descriptions.Item>
                    <Descriptions.Item label="司机电话">{order.delivery_info.driver_phone}</Descriptions.Item>
                    <Descriptions.Item label="司机身份证">{order.delivery_info.driver_id_card || '-'}</Descriptions.Item>
                    <Descriptions.Item label="车牌号">{order.delivery_info.plate_number}</Descriptions.Item>
                    <Descriptions.Item label="提货仓库">{order.delivery_info.warehouse_name}</Descriptions.Item>
                    <Descriptions.Item label="仓库编码">{pickupWarehouseCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="提货码">
                      <Text strong copyable>{order.delivery_info.pickup_code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="仓库地区">{pickupWarehouseRegion || '-'}</Descriptions.Item>
                    <Descriptions.Item label="预计提货时间">{order.delivery_info.estimated_time || '-'}</Descriptions.Item>
                    <Descriptions.Item label="仓库地址">{pickupWarehouseAddress || '-'}</Descriptions.Item>
                    <Descriptions.Item label="送达地址" span={2}>{order.delivery_info.address}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="待录入提货信息" />
                )}
              </Card>
            )}

            {(order.receipt_voucher || order.receipt_at || order.status === 8) && (
              <Card title="签收信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="签收时间">
                    {order.receipt_at ? new Date(order.receipt_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="签收凭证">
                    {isValidHttpUrl(order.receipt_voucher) ? (
                      <a href={order.receipt_voucher} target="_blank" rel="noreferrer">
                        查看签收凭证
                      </a>
                    ) : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card className="mt-6">
              <Title level={5}>下一步</Title>
              <Paragraph className="!mb-0">
                当前已支持订单创建、支付凭证上传、提货信息录入、出库确认。买家确认收货并上传签收凭证后，订单会进入已完成状态。
              </Paragraph>
              {order.status === 3 && (
                <Button className="mt-4" type="primary" icon={<UploadOutlined />} onClick={() => setOpen(true)}>
                  上传支付凭证
                </Button>
              )}
              {order.status === 5 && (
                <Button className="mt-4 ml-3" type="primary" icon={<CarOutlined />} onClick={openDeliveryModal}>
                  {order.delivery_info ? '修改提货信息' : '录入提货信息'}
                </Button>
              )}
              {order.status === 6 && (
                <Button className="mt-4 ml-3" type="primary" icon={<CheckCircleOutlined />} onClick={() => setReceiptOpen(true)}>
                  确认收货
                </Button>
              )}
              {order.status === 8 && (
                <div className="mt-4 text-green-600">
                  <CheckCircleOutlined className="mr-1" />
                  订单已完成，签收信息已归档
                </div>
              )}
            </Card>

            <Modal
              title="上传支付凭证"
              open={open}
              onCancel={() => setOpen(false)}
              onOk={handleUploadVoucher}
              confirmLoading={uploading}
            >
              <Form form={form} layout="vertical">
                <Form.Item name="voucher_url" label="凭证地址" rules={[httpUrlRule]}>
                  <Input placeholder="例如：https://example.com/payment-voucher.jpg" />
                </Form.Item>
                <Form.Item name="transaction_no" label="交易流水号">
                  <Input />
                </Form.Item>
                <Form.Item name="payer_account" label="付款账户">
                  <Input />
                </Form.Item>
                <Form.Item name="payee_account" label="收款账户">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="录入提货信息"
              open={deliveryOpen}
              onCancel={() => setDeliveryOpen(false)}
              onOk={handleSaveDelivery}
              confirmLoading={savingDelivery}
            >
              <Form form={deliveryForm} layout="vertical">
                <Alert
                  showIcon
                  type="info"
                  className="mb-4"
                  message="提货仓库由卖家商品仓库自动带出"
                  description={pickupWarehouseName ? `${pickupWarehouseName}${pickupWarehouseCode ? `（${pickupWarehouseCode}）` : ''}${pickupWarehouseRegion ? `，${pickupWarehouseRegion}` : ''}` : '当前未获取到仓库信息，请联系卖家确认后再继续。'}
                />
                <Form.Item name="driver_name" label="司机姓名" rules={[{ required: true }]}>
                  <Input placeholder="例如：张师傅" />
                </Form.Item>
                <Form.Item name="driver_phone" label="司机电话" rules={[{ required: true }]}>
                  <Input placeholder="例如：13800000000" />
                </Form.Item>
                <Form.Item name="driver_id_card" label="司机身份证">
                  <Input placeholder="例如：110101199001011234" />
                </Form.Item>
                <Form.Item name="plate_number" label="车牌号" rules={[{ required: true }]}>
                  <Input placeholder="例如：冀A12345" />
                </Form.Item>
                <Form.Item label="提货仓库">
                  <Input value={pickupWarehouseName || '未提供提货仓库'} disabled />
                </Form.Item>
                <Form.Item label="仓库编码">
                  <Input value={pickupWarehouseCode || '未提供仓库编码'} disabled />
                </Form.Item>
                <Form.Item name="estimated_time" label="预计提货时间">
                  <Input placeholder="例如：2026-04-23 10:00" />
                </Form.Item>
                <Form.Item name="address" label="送达地址" rules={[{ required: true }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="确认收货并上传签收凭证"
              open={receiptOpen}
              onCancel={() => setReceiptOpen(false)}
              onOk={handleConfirmReceipt}
              confirmLoading={confirmingReceipt}
            >
              <Form form={receiptForm} layout="vertical">
                <Form.Item name="receipt_voucher" label="签收凭证地址" rules={[httpUrlRule]}>
                  <Input placeholder="例如：https://example.com/receipt-voucher.jpg" />
                </Form.Item>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}
