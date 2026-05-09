import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, InputNumber, List, Modal, Progress, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type WarehouseMovementInfo, type WarehouseProductInfo } from '@/services/serviceFulfillmentService'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

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
  const { data: warehouseData, isError: warehouseError, isLoading: warehouseLoading } = useQuery({
    queryKey: ['dashboard-warehouse-services'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 100 }),
  })
  const warehouses = warehouseData?.data.list ?? []
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
      </div>
    </ServicePanelGate>
  )
}
