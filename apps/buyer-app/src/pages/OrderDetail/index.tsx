import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Spin, Steps, Tag, Typography, message } from 'antd'
import { ArrowLeftOutlined, CarOutlined, CheckCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { orderService } from '@/services/orderService'

const { Title, Paragraph, Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  2: { label: '待签合同', color: 'gold' },
  3: { label: '待支付', color: 'orange' },
  4: { label: '已支付', color: 'blue' },
  5: { label: '待提货', color: 'cyan' },
  6: { label: '配送中', color: 'processing' },
  8: { label: '已完成', color: 'green' },
  9: { label: '已取消', color: 'red' },
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
  if (status === 5) return 2
  if (status === 6) return 3
  if (status >= 8) return 4
  return 0
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
  const status = statusMap[order?.status || 0] || { label: `状态${order?.status ?? '-'}`, color: 'default' }

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
    } catch (error: any) {
      if (error?.errorFields) return
      message.error(error?.response?.data?.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      const values = await deliveryForm.validateFields()
      setSavingDelivery(true)
      await orderService.setDeliveryInfo(Number(id), values)
      message.success('提货信息已保存，提货码已生成')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      setDeliveryOpen(false)
    } catch (error: any) {
      if (error?.errorFields) return
      message.error(error?.response?.data?.message || '保存失败')
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
      warehouse_name: order?.delivery_info?.warehouse_name || '',
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
    } catch (error: any) {
      if (error?.errorFields) return
      message.error(error?.response?.data?.message || '确认收货失败')
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

            <Alert
              type="info"
              showIcon
              className="mt-6"
              message="当前为第一版订单流程"
              description="订单已创建并锁定库存。后续会继续补合同签署、支付凭证、提货和签收流程。"
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
                    <a href={order.payment_info.voucher_url} target="_blank" rel="noreferrer">
                      查看支付凭证
                    </a>
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
                    <Descriptions.Item label="提货码">
                      <Text strong>{order.delivery_info.pickup_code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="预计提货时间">{order.delivery_info.estimated_time || '-'}</Descriptions.Item>
                    <Descriptions.Item label="收货地址">{order.delivery_info.address}</Descriptions.Item>
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
                    {order.receipt_voucher ? (
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
                <Form.Item name="voucher_url" label="凭证地址" rules={[{ required: true }]}>
                  <Input placeholder="先填一个可访问的凭证 URL" />
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
                <Form.Item name="driver_name" label="司机姓名" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="driver_phone" label="司机电话" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="driver_id_card" label="司机身份证">
                  <Input />
                </Form.Item>
                <Form.Item name="plate_number" label="车牌号" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="warehouse_name" label="提货仓库" rules={[{ required: true }]}>
                  <Input placeholder="例如：唐山仓库A区" />
                </Form.Item>
                <Form.Item name="estimated_time" label="预计提货时间">
                  <Input placeholder="例如：2026-04-23 10:00" />
                </Form.Item>
                <Form.Item name="address" label="收货地址" rules={[{ required: true }]}>
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
                <Form.Item name="receipt_voucher" label="签收凭证地址" rules={[{ required: true }]}>
                  <Input placeholder="先填一个可访问的签收凭证 URL" />
                </Form.Item>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}
