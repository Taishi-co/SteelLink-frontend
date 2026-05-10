import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, InputNumber, List, Modal, Progress, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CiCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type WarehouseMovementInfo, type WarehouseProductInfo } from '@/services/serviceFulfillmentService'
import { warehouseOrderService } from '@/services/orderService'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

const orderStatusLabels: Record<number, { label: string; color: string }> = {
  12: { label: '待选择目的地仓储', color: 'geekblue' },
  13: { label: '待仓库确认', color: 'purple' },
  14: { label: '待卖方确认', color: 'default' },
  5: { label: '待提货', color: 'blue' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'cyan' },
  8: { label: '已完成', color: 'success' },
}

const movementStatusText: Record<string, string> = {
  pending: '待作业',
  processing: '作业中',
  completed: '已完成',
}

const appointmentColumns: ColumnsType<WarehouseMovementInfo> = [
  { title: '作业单', dataIndex: 'movement_no', key: 'movement_no' },
  { title: '关联订单', dataIndex: 'order_no', key: 'order_no', render: (value: string) => value || '-' },
  { title: '货物', key: 'cargo', render: (_, record) => `${record.product_name || '-'} ${record.quantity || 0} 吨` },
  {
    title: '作业类型',
    dataIndex: 'movement_type',
    key: 'movement_type',
    render: (value: string) => (value === 'inbound' ? '入库预约' : '出库提货'),
  },
  { title: '作业窗口', dataIndex: 'scheduled_at', key: 'scheduled_at', render: (value: string) => value || '-' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === 'pending' ? 'orange' : value === 'processing' ? 'blue' : 'green'}>{movementStatusText[value] || value}</Tag>,
  },
]

const inventoryColumns: ColumnsType<WarehouseMovementInfo> = [
  { title: '记录号', dataIndex: 'movement_no', key: 'movement_no' },
  { title: '仓库ID', dataIndex: 'warehouse_service_id', key: 'warehouse_service_id' },
  { title: '商品', dataIndex: 'product_name', key: 'product_name' },
  { title: '捆包号', dataIndex: 'bundle_no', key: 'bundle_no' },
  {
    title: '类型',
    dataIndex: 'movement_type',
    key: 'movement_type',
    render: (value: string) => <Tag color={value === 'inbound' ? 'green' : 'blue'}>{value === 'inbound' ? '入库' : '出库'}</Tag>,
  },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (value: number) => `${value} 吨` },
  { title: '关联单据', dataIndex: 'order_no', key: 'order_no' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === 'completed' ? 'green' : value === 'processing' ? 'blue' : 'gold'}>{movementStatusText[value] || value}</Tag>,
  },
]

export default function WarehousePage() {
  const [form] = Form.useForm<Partial<WarehouseServiceItem>>()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseServiceItem | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<{
    id: number
    order_no: string
    buyer_name: string
    seller_name: string
    warehouse_name: string
    warehouse_address: string
    product_name: string
    quantity: number
    unit: string
    total_amount: number
    status: number
    status_text: string
    created_at: string
  } | null>(null)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmOrderRef, setConfirmOrderRef] = useState<typeof orders[0] | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectOrderRef, setRejectOrderRef] = useState<typeof orders[0] | null>(null)
  const { data: warehouseData, isError: warehouseError, isLoading: warehouseLoading } = useQuery({
    queryKey: ['dashboard-warehouse-services'],
    queryFn: () => serviceOfferService.listMyWarehouses(),
  })
  const warehouses = warehouseData?.data ?? []
  const activeWarehouse = warehouses[0]
  const { data: movementData, isError: movementError, isLoading: movementLoading } = useQuery({
    queryKey: ['dashboard-warehouse-movements'],
    queryFn: () => serviceFulfillmentService.listWarehouseMovements({ page_size: 100 }),
  })
  const movements = movementData?.data.list ?? []
  const { data: productData, isError: productError, isLoading: productLoading } = useQuery({
    queryKey: ['dashboard-warehouse-products', activeWarehouse?.id],
    queryFn: () => serviceFulfillmentService.listWarehouseProducts(activeWarehouse.id),
    enabled: Boolean(activeWarehouse?.id),
  })
  const warehouseProducts = productData?.data.list ?? []
  const availableCapacity = warehouses.reduce((sum, item) => sum + Number(item.available_capacity || 0), 0)
  const managedStock = warehouseProducts.reduce((sum, item) => sum + Number(item.available_qty || 0), 0)
  const todayMovements = movements.length
  const pendingMovements = movements.filter((item) => item.status === 'pending')
  const processingMovements = movements.filter((item) => item.status === 'processing')
  const capacityRows = warehouses.slice(0, 4).map((warehouse) => {
    const capacity = Number(warehouse.capacity || 0)
    const available = Number(warehouse.available_capacity || 0)
    const usedPercent = capacity > 0 ? Math.round(((capacity - available) / capacity) * 100) : 0
    return { id: warehouse.id, label: warehouse.warehouse_name, usedPercent }
  })
  const saveWarehouseMutation = useMutation({
    mutationFn: (payload: Partial<WarehouseServiceItem>) =>
      editingWarehouse ? serviceOfferService.updateWarehouse(editingWarehouse.id, payload) : serviceOfferService.createWarehouse(payload),
    onSuccess: () => {
      message.success(editingWarehouse ? '仓库已更新并重新提交审核' : '仓库已提交审核')
      setModalOpen(false)
      setEditingWarehouse(null)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['dashboard-warehouse-services'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-warehouse-products'] })
    },
  })
  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: number) => serviceOfferService.deleteWarehouse(id),
    onSuccess: () => {
      message.success('仓库已停用')
      void queryClient.invalidateQueries({ queryKey: ['dashboard-warehouse-services'] })
    },
  })

  const { data: orderData, isLoading: orderLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['dashboard-warehouse-orders'],
    queryFn: async () => {
      const [pendingList, allList] = await Promise.all([
        warehouseOrderService.listPending(),
        warehouseOrderService.listAll(),
      ])
      const allOrders = [...new Map([...pendingList, ...allList].map(o => [o.id, o])).values()]
      return allOrders.map(order => ({
        id: order.id,
        order_no: order.order_no,
        buyer_name: order.buyer_name,
        seller_name: order.seller_name,
        warehouse_name: order.delivery_info?.warehouse_name || '',
        warehouse_address: order.delivery_info?.warehouse_address || '',
        product_name: order.items?.[0]?.product_name || '未知商品',
        quantity: order.total_quantity || 0,
        unit: '吨',
        total_amount: order.total_amount || 0,
        status: order.status,
        status_text: orderStatusLabels[order.status]?.label || '未知',
        created_at: order.created_at || '',
      }))
    },
  })

  const orders = orderData ?? []
  const pendingOrders = orders.filter(o => o.status === 13)

  const handleViewOrderDetail = (order: typeof orders[0]) => {
    setSelectedOrder(order)
  }

  const handleConfirmOrder = async () => {
    if (!confirmOrderRef) return
    setConfirmLoading(true)
    try {
      await warehouseOrderService.warehouseConfirm(confirmOrderRef.id, { confirmed: true })
      message.success('确认成功')
      setConfirmModalVisible(false)
      setConfirmOrderRef(null)
      void refetchOrders()
    } catch (error) {
      message.error('确认失败')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!rejectOrderRef) return
    try {
      await warehouseOrderService.warehouseConfirm(rejectOrderRef.id, { confirmed: false, condition_note: rejectReason })
      message.success('已驳回')
      setRejectModalVisible(false)
      setRejectOrderRef(null)
      setRejectReason('')
      void refetchOrders()
    } catch (error) {
      message.error('驳回失败')
    }
  }

  const orderColumns: ColumnsType<typeof orders[0]> = [
    { title: '订单编号', dataIndex: 'order_no', key: 'order_no', width: 180, render: (text: string) => <code className="text-sm">{text}</code> },
    { title: '买家', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    { title: '卖家', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    { title: '商品', dataIndex: 'product_name', key: 'product_name', ellipsis: true },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, render: (quantity: number, record: typeof orders[0]) => `${quantity} ${record.unit}` },
    { title: '金额', dataIndex: 'total_amount', key: 'total_amount', width: 100, render: (amount: number) => `¥${amount.toLocaleString('zh-CN')}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const info = orderStatusLabels[status] || { label: '未知', color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: typeof orders[0]) => (
        <Space>
          <Button size="small" onClick={() => handleViewOrderDetail(record)} icon={<EyeOutlined />}>详情</Button>
          {record.status === 13 && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  setConfirmOrderRef(record)
                  setConfirmModalVisible(true)
                }}
                icon={<CheckCircleOutlined />}
              >
                确认
              </Button>
              <Button
                size="small"
                danger
                onClick={() => {
                  setRejectOrderRef(record)
                  setRejectModalVisible(true)
                }}
                icon={<CiCircleOutlined />}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const openCreateWarehouse = () => {
    setEditingWarehouse(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditWarehouse = (warehouse: WarehouseServiceItem) => {
    setEditingWarehouse(warehouse)
    form.setFieldsValue(warehouse)
    setModalOpen(true)
  }

  const warehouseColumns: ColumnsType<WarehouseServiceItem> = [
    { title: '仓库名称', dataIndex: 'warehouse_name', key: 'warehouse_name' },
    { title: '编码', key: 'code', render: (_, record) => `WH-${String(record.id).padStart(6, '0')}` },
    { title: '运营企业', dataIndex: 'enterprise_id', key: 'enterprise_id', render: (value: number) => `企业 ${value}` },
    { title: '区域', key: 'region', render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(' / ') },
    { title: '可用/总库容', key: 'capacity', render: (_, record) => `${Number(record.available_capacity || 0).toLocaleString()} / ${Number(record.capacity || 0).toLocaleString()} 吨` },
    {
      title: '服务',
      dataIndex: 'service_types',
      key: 'service_types',
      render: (value?: string[]) => <Space wrap>{(value || []).map((item) => <Tag key={item}>{item}</Tag>)}</Space>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number) => <Tag color={value === 2 ? 'green' : value === 1 ? 'gold' : 'default'}>{value === 2 ? '可用' : value === 1 ? '审核中' : '停用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditWarehouse(record)}>编辑</Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteWarehouseMutation.isPending}
            onClick={() => Modal.confirm({
              title: '确认停用仓库？',
              okText: '确认停用',
              cancelText: '取消',
              onOk: () => deleteWarehouseMutation.mutate(record.id),
            })}
          >
            停用
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <ServicePanelGate serviceKey="warehouse">
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <Title level={4} className="!mb-1">仓储平台</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            在买家工作台内管理仓容、入出库预约、库存监管、仓单资料和费用结算，为物流与资金服务提供履约依据。
          </Paragraph>
        </Card>
        {(warehouseError || movementError || productError) ? (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="仓储接口数据未完整返回"
            description="请确认当前登录企业已开通仓储服务，并且后端已部署 service-fulfillment 接口。"
          />
        ) : null}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="可用仓容" value={availableCapacity} suffix="吨" prefix={<InboxOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="出入库记录" value={todayMovements} suffix="单" prefix={<CalendarOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="监管库存" value={managedStock} suffix="吨" prefix={<SafetyCertificateOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="作业准时率" value={98.1} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={16}>
            <Card className="rounded-lg" title="入出库预约" extra={<Button type="primary" icon={<BarcodeOutlined />}>分配库位</Button>}>
              <Table loading={movementLoading} columns={appointmentColumns} dataSource={movements} rowKey="id" pagination={false} scroll={{ x: 820 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="rounded-lg" title="库区容量">
              <Space direction="vertical" className="w-full">
                {capacityRows.length ? capacityRows.map((item) => (
                  <div key={item.id}>
                    <Text>{item.label}</Text>
                    <Progress percent={item.usedPercent} status={item.usedPercent > 90 ? 'exception' : item.usedPercent > 75 ? 'active' : 'normal'} />
                  </div>
                )) : <Text type="secondary">暂无仓库容量数据</Text>}
              </Space>
            </Card>
            <Card className="mt-4 rounded-lg" title="库存监管待办">
              <List
                dataSource={[
                  { title: '待出入库作业', description: `${pendingMovements.length} 笔出入库记录等待仓库处理`, icon: <AuditOutlined /> },
                  { title: '作业中记录', description: `${processingMovements.length} 笔出入库记录正在处理`, icon: <DatabaseOutlined /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Card
          className="mt-4 rounded-lg"
          title="仓库管理"
          extra={<Button type="primary" icon={<DatabaseOutlined />} onClick={openCreateWarehouse}>新增仓库</Button>}
        >
          <Table loading={warehouseLoading} columns={warehouseColumns} dataSource={warehouses} rowKey="id" pagination={false} scroll={{ x: 1100 }} />
        </Card>

        <Card className="mt-4 rounded-lg" title={`待仓库确认订单 (${pendingOrders.length})`}>
          <Table loading={orderLoading} columns={orderColumns} dataSource={pendingOrders} rowKey="id" pagination={false} scroll={{ x: 1100 }} />
        </Card>

        <Card className="mt-4 rounded-lg" title="全部订单">
          <Table loading={orderLoading} columns={orderColumns} dataSource={orders.filter(o => o.status !== 12)} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} />
        </Card>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={15}>
            <Card className="rounded-lg" title="商品与仓库关系">
              <Table
                rowKey="id"
                pagination={false}
                scroll={{ x: 760 }}
                loading={productLoading}
                dataSource={warehouseProducts}
                columns={[
                  { title: '商品', dataIndex: 'name' },
                  { title: '捆包号', dataIndex: 'bundle_no' },
                  { title: '绑定仓库', render: (_: unknown, record: WarehouseProductInfo) => record.warehouse_info?.warehouse_name || activeWarehouse?.warehouse_name || '-' },
                  { title: '库存', dataIndex: 'available_qty', render: (value: number) => `${value} 吨` },
                  { title: '状态', render: (_: unknown, record: WarehouseProductInfo) => <Tag color={record.locked_qty > 0 ? 'gold' : 'blue'}>{record.locked_qty > 0 ? '订单锁定中' : '监管库存'}</Tag> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="rounded-lg" title="仓储履约规则">
              <Space direction="vertical" className="w-full">
                <Text><BankOutlined /> 商品绑定仓库后，买家下单自动生成提货仓库和出库待办。</Text>
                <Text><SafetyCertificateOutlined /> 出库记录、签收回单和仓单资料进入订单履约归档。</Text>
                <Text><DatabaseOutlined /> 未绑定仓库的商品，需要买家通过物流平台补充提货点。</Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card className="mt-4 rounded-lg" title="出库 / 入库记录">
          <Table loading={movementLoading} columns={inventoryColumns} dataSource={movements} rowKey="id" pagination={false} scroll={{ x: 980 }} />
        </Card>
        <Modal
          title={editingWarehouse ? '编辑仓库' : '新增仓库'}
          open={modalOpen}
          okText={editingWarehouse ? '保存并提交审核' : '提交审核'}
          cancelText="取消"
          confirmLoading={saveWarehouseMutation.isPending}
          onCancel={() => {
            setModalOpen(false)
            setEditingWarehouse(null)
            form.resetFields()
          }}
          onOk={() => form.validateFields().then((values) => saveWarehouseMutation.mutate(values))}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="仓库名称" name="warehouse_name" rules={[{ required: true, message: '请输入仓库名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入详细地址' }]}>
              <Input />
            </Form.Item>
            <Space className="w-full" size="large" wrap>
              <Form.Item label="省份" name="province">
                <Input className="w-40" />
              </Form.Item>
              <Form.Item label="城市" name="city">
                <Input className="w-40" />
              </Form.Item>
              <Form.Item label="区县" name="district">
                <Input className="w-40" />
              </Form.Item>
            </Space>
            <Space className="w-full" size="large" wrap>
              <Form.Item label="总库容（吨）" name="capacity">
                <InputNumber className="w-60" min={0} />
              </Form.Item>
              <Form.Item label="可用库容（吨）" name="available_capacity">
                <InputNumber className="w-60" min={0} />
              </Form.Item>
            </Space>
            <Form.Item label="价格规则" name="price_rule">
              <Input placeholder="例如：仓储费 8 元/吨/天" />
            </Form.Item>
            <Form.Item label="资源描述" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="订单详情"
          visible={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
          width={600}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-lg">{selectedOrder.order_no}</span>
                <Tag color={orderStatusLabels[selectedOrder.status]?.color}>
                  {orderStatusLabels[selectedOrder.status]?.label}
                </Tag>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-gray-500">买家企业</Text>
                  <div className="font-medium">{selectedOrder.buyer_name}</div>
                </div>
                <div>
                  <Text className="text-gray-500">卖家企业</Text>
                  <div className="font-medium">{selectedOrder.seller_name}</div>
                </div>
              </div>

              <div>
                <Text className="text-gray-500">提货仓库</Text>
                <div className="font-medium">{selectedOrder.warehouse_name}</div>
                <Text className="text-sm text-gray-400">{selectedOrder.warehouse_address}</Text>
              </div>

              <div className="border-t pt-4">
                <Text className="text-gray-500">商品信息</Text>
                <div className="font-medium">{selectedOrder.product_name}</div>
                <div className="text-sm">数量：{selectedOrder.quantity} {selectedOrder.unit}</div>
                <div className="text-sm">金额：¥{selectedOrder.total_amount.toLocaleString('zh-CN')}</div>
              </div>

              <div className="border-t pt-4">
                <Text className="text-gray-500">创建时间</Text>
                <div>{selectedOrder.created_at}</div>
              </div>

              {selectedOrder.status === 13 && (
                <div className="flex gap-3 mt-4">
                  <Button
                    type="primary"
                    onClick={() => {
                      setConfirmOrderRef(selectedOrder)
                      setConfirmModalVisible(true)
                    }}
                    icon={<CheckCircleOutlined />}
                  >
                    确认入库
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      setRejectOrderRef(selectedOrder)
                      setRejectModalVisible(true)
                    }}
                    icon={<CiCircleOutlined />}
                  >
                    驳回订单
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          title="确认订单"
          open={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          onOk={handleConfirmOrder}
          okText="确认入库"
          okType="primary"
          loading={confirmLoading}
        >
          <p>确定要确认该订单的入库吗？</p>
          {confirmOrderRef && (
            <p className="text-sm text-gray-500 mt-2">订单编号：{confirmOrderRef.order_no}</p>
          )}
        </Modal>

        <Modal
          title="驳回订单"
          open={rejectModalVisible}
          onCancel={() => {
            setRejectModalVisible(false)
            setRejectReason('')
          }}
          onOk={handleRejectOrder}
          okText="确认驳回"
          okType="danger"
        >
          <p>请输入驳回原因：</p>
          <textarea
            className="w-full h-24 mt-2 p-3 border rounded-lg resize-none"
            placeholder="请输入驳回原因..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          {rejectOrderRef && (
            <p className="text-sm text-gray-500 mt-2">订单编号：{rejectOrderRef.order_no}</p>
          )}
        </Modal>
      </div>
    </ServicePanelGate>
  )
}
