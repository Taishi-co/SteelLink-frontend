import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Space, Spin, Steps, Tag, Timeline, Typography, Upload, message } from 'antd'
import { ArrowLeftOutlined, CarOutlined, CheckCircleOutlined, EnvironmentOutlined, SafetyCertificateOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { getErrorMessage, hasFormErrorFields, timelineColor } from '@steellink/shared/utils'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { uploadService } from '@/services/uploadService'
import { serviceFulfillmentService } from '@/services/serviceFulfillmentService'

const { Title, Paragraph, Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'orange' },
  2: { label: '待签合同', color: 'gold' },
  3: { label: '待支付', color: 'orange' },
  4: { label: '已支付', color: 'blue' },
  5: { label: '待提货', color: 'cyan' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'green' },
  8: { label: '已完成', color: 'green' },
  9: { label: '已取消', color: 'red' },
  10: { label: '已冻结', color: 'volcano' },
  11: { label: '异常', color: 'magenta' },
  12: { label: '待仓库确认', color: 'purple' },
  13: { label: '待卖方确认', color: 'orange' },
  14: { label: '待买方确认', color: 'blue' },
  15: { label: '物流竞价中', color: 'cyan' },
  16: { label: '待确认物流', color: 'gold' },
  17: { label: '运输中', color: 'processing' },
  18: { label: '已收货', color: 'green' },
  19: { label: '已对账', color: 'success' },
  20: { label: '已归档', color: 'default' },
  21: { label: '融资审批中', color: 'purple' },
  22: { label: '待签署融资合同', color: 'gold' },
}

const orderSteps = [
  { title: '订单创建' },
  { title: '仓库确认' },
  { title: '卖方确认' },
  { title: '买方确认' },
  { title: '签署合同' },
  { title: '支付/融资' },
  { title: '物流竞价' },
  { title: '运输交付' },
  { title: '签收对账' },
  { title: '归档' },
]

const logisticsStatusText: Record<string, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_transit: '在途',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
}

const movementStatusText: Record<string, string> = {
  pending: '待作业',
  processing: '作业中',
  completed: '已完成',
}

function getCurrentStep(status: number) {
  if (status === 0 || status === 1) return 0
  if (status === 12) return 1
  if (status === 13) return 2
  if (status === 14) return 3
  if (status === 2) return 4
  if (status === 3 || status === 21 || status === 22) return 5
  if (status === 4) return 5
  if (status === 15 || status === 16) return 6
  if (status === 5 || status === 6 || status === 17 || status === 7) return 7
  if (status === 18 || status === 19) return 8
  if (status === 8 || status === 20) return 9
  return 0
}

function getStatusNotice(status: number, _hasPaymentVoucher: boolean, _hasDeliveryInfo: boolean, contractInfo?: { buyer_signed: boolean; seller_signed: boolean }) {
  if (status === 1) {
    return { type: 'warning' as const, message: '订单已提交，等待卖家确认。' }
  }
  if (status === 12) {
    return { type: 'warning' as const, message: '订单已提交，等待仓储方确认仓库条件。' }
  }
  if (status === 13) {
    return { type: 'warning' as const, message: '仓储方已确认仓库条件，等待卖方确认条款。' }
  }
  if (status === 14) {
    return { type: 'warning' as const, message: '卖方已确认条款，请确认订单最终版本。' }
  }
  if (status === 2) {
    if (contractInfo?.buyer_signed) {
      return { type: 'info' as const, message: '您已签署合同，等待卖家签署后进入支付阶段。' }
    }
    return { type: 'warning' as const, message: '请签署交易合同。' }
  }
  if (status === 3) {
    return { type: 'warning' as const, message: '当前待支付，请上传支付凭证或申请托盘融资。' }
  }
  if (status === 21) {
    return { type: 'info' as const, message: '托盘融资申请已提交，资金方正在进行风控审批。' }
  }
  if (status === 22) {
    return { type: 'warning' as const, message: '融资已审批通过，请签署债务合同并支付手续费。' }
  }
  if (status === 4) {
    return { type: 'success' as const, message: '支付已完成，等待卖方发起物流竞价。' }
  }
  if (status === 15) {
    return { type: 'info' as const, message: '卖方已发起物流竞价，等待物流方报价。' }
  }
  if (status === 16) {
    return { type: 'warning' as const, message: '物流方已报价，请确认物流资源。' }
  }
  if (status === 5 || status === 17) {
    return { type: 'info' as const, message: '物流资源已确认，运输任务已下发。' }
  }
  if (status === 6 || status === 7) {
    return { type: 'info' as const, message: '订单已进入配送阶段，确认签收后订单会完成归档。' }
  }
  if (status === 18) {
    return { type: 'success' as const, message: '已确认收货，等待卖方对账确认。' }
  }
  if (status === 19) {
    return { type: 'success' as const, message: '卖方已完成对账确认，等待归档。' }
  }
  if (status === 8 || status === 20) {
    return { type: 'success' as const, message: '订单已完成归档。' }
  }
  if (status === 9) {
    return { type: 'error' as const, message: '订单已取消。' }
  }
  if (status === 11) {
    return { type: 'error' as const, message: '订单进入异常状态，等待平台运营介入。' }
  }
  return { type: 'info' as const, message: '订单状态已更新。' }
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

function getUploadFile(fileList?: UploadFile[]) {
  const file = fileList?.[0]?.originFileObj
  if (!file) {
    throw new Error('请先选择凭证文件')
  }
  return file
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
  const [cancelling, setCancelling] = useState(false)
  const [signing, setSigning] = useState(false)
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
  const { data: fulfillmentData } = useQuery({
    queryKey: ['order-service-fulfillment', id],
    queryFn: async () => (await serviceFulfillmentService.getOrderFulfillment(Number(id))).data,
    enabled: Boolean(id),
  })
  const fulfillment = fulfillmentData
  const logisticsOrder = fulfillment?.logistics_orders?.[0]
  const latestMovement = fulfillment?.warehouse_movements?.[0]
  const activeGuarantee = fulfillment?.guarantees?.[0]
  const status = statusMap[order?.status || 0] || { label: `状态${order?.status ?? '-'}`, color: 'default' }
  const statusNotice = getStatusNotice(order?.status || 0, Boolean(order?.payment_info?.voucher_url), Boolean(order?.delivery_info?.pickup_code), order?.contract_info)
  const pickupWarehouseName = order?.delivery_info?.warehouse_name || productDetail?.warehouseInfo?.warehouse_name || ''
  const pickupWarehouseId = order?.delivery_info?.warehouse_id || productDetail?.warehouseInfo?.warehouse_id || 0
  const pickupWarehouseServiceId = order?.delivery_info?.warehouse_service_id || productDetail?.warehouseServiceId || 0
  const pickupWarehouseAddress = order?.delivery_info?.warehouse_address || productDetail?.warehouseInfo?.address || ''
  const pickupWarehouseCode = order?.delivery_info?.warehouse_code || productDetail?.warehouseInfo?.warehouse_code || ''
  const pickupWarehouseRegion = [
    order?.delivery_info?.warehouse_province || productDetail?.warehouseInfo?.province,
    order?.delivery_info?.warehouse_city || productDetail?.warehouseInfo?.city,
    order?.delivery_info?.warehouse_district || productDetail?.warehouseInfo?.district,
  ]
    .filter(Boolean)
    .join(' ')
  const canCancelOrder = (order?.status === 1 || order?.status === 2 || order?.status === 3) && !order.payment_info?.voucher_url

  const handleUploadVoucher = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)
      const uploaded = await uploadService.upload(getUploadFile(values.voucher_file), 'payment_voucher')
      await orderService.uploadPaymentVoucher(Number(id), {
        voucher_url: uploaded.url,
        transaction_no: values.transaction_no,
        payer_account: values.payer_account,
        payee_account: values.payee_account,
      })
      message.success('支付凭证已上传')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      form.resetFields()
      setOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '上传失败'))
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
        warehouse_service_id: pickupWarehouseServiceId,
        warehouse_name: pickupWarehouseName,
      })
      message.success('提货信息已保存，提货码已生成')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      deliveryForm.resetFields()
      setDeliveryOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '保存失败'))
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
      const uploaded = await uploadService.upload(getUploadFile(values.receipt_file), 'receipt_voucher')
      await orderService.confirmReceipt(Number(id), {
        receipt_voucher: uploaded.url,
      })
      message.success('已确认收货，订单已完成')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      receiptForm.resetFields()
      setReceiptOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '确认收货失败'))
    } finally {
      setConfirmingReceipt(false)
    }
  }

  const handleSignContract = async () => {
    try {
      setSigning(true)
      await orderService.signContract(Number(id))
      message.success('合同签署成功')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '签署失败'))
    } finally {
      setSigning(false)
    }
  }

  const handleCancelOrder = () => {
    Modal.confirm({
      title: '确认取消订单？',
      content: '取消后将释放锁定库存，订单会进入已取消状态。已上传支付凭证的订单不能直接取消。',
      okText: '确认取消',
      cancelText: '暂不取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setCancelling(true)
          await orderService.cancel(Number(id))
          message.success('订单已取消')
          await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
          await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
        } catch (error: unknown) {
          message.error(getErrorMessage(error, '取消失败'))
        } finally {
          setCancelling(false)
        }
      },
    })
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

            {order.delivery_info && (
              <Card title="订单仓库快照" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="提货仓库">{pickupWarehouseName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="仓库编码">{pickupWarehouseCode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="仓储资源">
                    {pickupWarehouseServiceId ? <Link to={`/warehouses/${pickupWarehouseServiceId}`}>#{pickupWarehouseServiceId}</Link> : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓储方企业">
                    {order.delivery_info.warehouse_enterprise_id ? `#${order.delivery_info.warehouse_enterprise_id}` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓库地区">{pickupWarehouseRegion || '-'}</Descriptions.Item>
                  <Descriptions.Item label="仓库地址">{pickupWarehouseAddress || '-'}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

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

            {order.contract_info && (
              <Card title="合同信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="合同编号">{order.contract_info.contract_no || '-'}</Descriptions.Item>
                  <Descriptions.Item label="签署状态">{order.contract_info.sign_status || '-'}</Descriptions.Item>
                  <Descriptions.Item label="买家签署">{order.contract_info.buyer_signed ? '已签署' : '未签署'}</Descriptions.Item>
                  <Descriptions.Item label="卖家签署">{order.contract_info.seller_signed ? '已签署' : '未签署'}</Descriptions.Item>
                  <Descriptions.Item label="签署时间">
                    {order.contract_info.signed_at ? new Date(order.contract_info.signed_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="合同文件">
                    {isValidHttpUrl(order.contract_info.contract_url) ? (
                      <a href={order.contract_info.contract_url} target="_blank" rel="noreferrer">
                        查看合同
                      </a>
                    ) : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

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
                  <Descriptions.Item label="上传时间">
                    {order.payment_info.uploaded_at ? new Date(order.payment_info.uploaded_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="水印时间">{order.payment_info.captured_at || '-'}</Descriptions.Item>
                  <Descriptions.Item label="GPS">
                    {order.payment_info.gps_latitude && order.payment_info.gps_longitude
                      ? `${order.payment_info.gps_latitude}, ${order.payment_info.gps_longitude}`
                      : '-'}
                  </Descriptions.Item>
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

            {order.status >= 5 && (
              <Card title="提货信息" className="mt-6">
                {order.delivery_info ? (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="司机姓名">{order.delivery_info.driver_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="司机电话">{order.delivery_info.driver_phone || '-'}</Descriptions.Item>
                    <Descriptions.Item label="司机身份证">{order.delivery_info.driver_id_card || '-'}</Descriptions.Item>
                    <Descriptions.Item label="车牌号">{order.delivery_info.plate_number || '-'}</Descriptions.Item>
                    <Descriptions.Item label="提货仓库">{order.delivery_info.warehouse_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="仓库编码">{pickupWarehouseCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="仓储资源">
                      {pickupWarehouseServiceId ? <Link to={`/warehouses/${pickupWarehouseServiceId}`}>#{pickupWarehouseServiceId}</Link> : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓储方企业">
                      {order.delivery_info.warehouse_enterprise_id ? `#${order.delivery_info.warehouse_enterprise_id}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="提货码">
                      {order.delivery_info.pickup_code ? <Text strong copyable>{order.delivery_info.pickup_code}</Text> : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓库地区">{pickupWarehouseRegion || '-'}</Descriptions.Item>
                    <Descriptions.Item label="预计提货时间">{order.delivery_info.estimated_time || '-'}</Descriptions.Item>
                    <Descriptions.Item label="仓库地址">{pickupWarehouseAddress || '-'}</Descriptions.Item>
                    <Descriptions.Item label="送达地址" span={2}>{order.delivery_info.address || '-'}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="待录入提货信息" />
                )}
              </Card>
            )}

            <Card title="物流仓储履约" className="mt-6">
              <Space direction="vertical" size="middle" className="w-full">
                <Alert
                  showIcon
                  type={pickupWarehouseName ? 'success' : 'warning'}
                  message={pickupWarehouseName ? '订单已关联提货仓库，物流履约可从仓库出库节点开始追踪。' : '订单商品缺少仓库绑定，需先在物流平台确认提货点。'}
                  description={pickupWarehouseName ? `${pickupWarehouseName}${pickupWarehouseCode ? `（${pickupWarehouseCode}）` : ''} -> ${order.delivery_info?.address || '买家收货地址待录入'}` : '无仓库商品不会自动推荐仓库线路，买家需发起物流委托后由物流商接单。'}
                />
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="仓储节点">{pickupWarehouseName || '待确认提货点'}</Descriptions.Item>
                  <Descriptions.Item label="物流委托">{logisticsOrder?.logistics_no || '待发起物流委托'}</Descriptions.Item>
                  <Descriptions.Item label="估算价格">
                    {logisticsOrder ? `¥${Number(logisticsOrder.estimated_price || 0).toLocaleString()}` : '待物流平台估算'}
                  </Descriptions.Item>
                  <Descriptions.Item label="保障方式">{activeGuarantee?.guarantee_type || logisticsOrder?.guarantee_type || '待创建履约保障'}</Descriptions.Item>
                  <Descriptions.Item label="出入库状态">{latestMovement ? movementStatusText[latestMovement.status] || latestMovement.status : '暂无出入库记录'}</Descriptions.Item>
                  <Descriptions.Item label="物流状态">{logisticsOrder ? logisticsStatusText[logisticsOrder.status] || logisticsOrder.status : '暂无物流订单'}</Descriptions.Item>
                </Descriptions>
                <Steps
                  current={logisticsOrder?.status === 'completed' ? 4 : logisticsOrder?.status === 'in_transit' ? 3 : logisticsOrder?.status === 'accepted' ? 2 : latestMovement?.status === 'completed' ? 1 : 0}
                  items={[
                    { title: '仓库锁货', description: '订单创建后锁定捆包库存', icon: <SafetyCertificateOutlined /> },
                    { title: '出库作业', description: latestMovement ? movementStatusText[latestMovement.status] || latestMovement.status : pickupWarehouseName || '等待提货点', icon: <CarOutlined /> },
                    { title: '物流接单', description: logisticsOrder?.plate_number || order.delivery_info?.plate_number || '待物流商接单', icon: <EnvironmentOutlined /> },
                    { title: '在途跟踪', description: logisticsOrder?.tracking_events?.[0]?.description || (logisticsOrder ? logisticsStatusText[logisticsOrder.status] : '待发车'), icon: <CarOutlined /> },
                    { title: '签收归档', description: order.receipt_voucher ? '回单已上传' : '待买家确认', icon: <CheckCircleOutlined /> },
                  ]}
                />
                {logisticsOrder?.tracking_events?.length ? (
                  <Timeline
                    items={logisticsOrder.tracking_events.map((event) => ({
                      color: 'blue',
                      children: (
                        <div>
                          <div className="font-medium">{event.description || event.event_type}</div>
                          <Text type="secondary">{event.location || '-'} · {new Date(event.occurred_at).toLocaleString()}</Text>
                        </div>
                      ),
                    }))}
                  />
                ) : null}
              </Space>
            </Card>

            {(order.receipt_voucher || order.receipt_at || order.status === 8) && (
              <Card title="签收信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="签收时间">
                    {order.receipt_at ? new Date(order.receipt_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="上传时间">
                    {order.receipt_info?.uploaded_at ? new Date(order.receipt_info.uploaded_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="水印时间">{order.receipt_info?.captured_at || '-'}</Descriptions.Item>
                  <Descriptions.Item label="GPS">
                    {order.receipt_info?.gps_latitude && order.receipt_info?.gps_longitude
                      ? `${order.receipt_info.gps_latitude}, ${order.receipt_info.gps_longitude}`
                      : '-'}
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
              <Title level={5}>订单操作</Title>
              <Space wrap>
                {order.status === 14 && (
                  <Button type="primary" onClick={async () => {
                    try {
                      await orderService.buyerConfirm(Number(id), { confirm_note: '买方确认订单' })
                      message.success('已确认订单')
                      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                    } catch (error: unknown) { message.error(getErrorMessage(error, '确认失败')) }
                  }}>确认订单</Button>
                )}
                {order.status === 2 && !order.contract_info?.buyer_signed && (
                  <Button type="primary" loading={signing} onClick={handleSignContract}>
                    签署合同
                  </Button>
                )}
                {order.status === 3 && (
                  <Button type="primary" icon={<UploadOutlined />} onClick={() => setOpen(true)}>
                    上传支付凭证
                  </Button>
                )}
                {order.status === 3 && (
                  <Button type="default" onClick={() => message.info('请选择金融服务产品后申请托盘融资')}>
                    申请托盘融资
                  </Button>
                )}
                {order.status === 22 && (
                  <Button type="primary" onClick={() => message.info('请上传手续费支付凭证以完成融资合同签署')}>
                    签署融资合同并支付手续费
                  </Button>
                )}
                {order.status === 16 && (
                  <Button type="primary" onClick={() => message.info('请选择并确认物流报价')}>
                    确认物流资源
                  </Button>
                )}
                {canCancelOrder && (
                  <Button danger loading={cancelling} onClick={handleCancelOrder}>
                    取消订单
                  </Button>
                )}
                {order.status === 5 && (
                  <Button type="primary" icon={<CarOutlined />} onClick={openDeliveryModal}>
                    {order.delivery_info?.pickup_code ? '修改提货信息' : '录入提货信息'}
                  </Button>
                )}
                {(order.status === 6 || order.status === 7 || order.status === 17) && (
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setReceiptOpen(true)}>
                    确认收货
                  </Button>
                )}
                {(order.status === 8 || order.status === 18 || order.status === 19 || order.status === 20) && (
                  <span className="text-green-600">
                    <CheckCircleOutlined className="mr-1" />
                    订单已完成归档
                  </span>
                )}
              </Space>
            </Card>

            <Modal
              title="上传支付凭证"
              open={open}
              onCancel={() => setOpen(false)}
              onOk={handleUploadVoucher}
              confirmLoading={uploading}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="voucher_file"
                  label="支付凭证文件"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList ?? []}
                  rules={[{ required: true, message: '请上传支付凭证文件' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
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
                <Form.Item
                  name="receipt_file"
                  label="签收凭证文件"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList ?? []}
                  rules={[{ required: true, message: '请上传签收凭证文件' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}
