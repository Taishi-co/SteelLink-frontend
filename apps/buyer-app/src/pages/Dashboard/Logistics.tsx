import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, InputNumber, List, Modal, Progress, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertOutlined,
  AuditOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, type LogisticsServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type LogisticsOrderInfo } from '@/services/serviceFulfillmentService'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

const columns: ColumnsType<LogisticsOrderInfo> = [
  { title: '委托单', dataIndex: 'logistics_no', key: 'logistics_no' },
  { title: '线路', key: 'route', render: (_, record) => `${record.origin || '-'} -> ${record.destination || '-'}` },
  { title: '货物', dataIndex: 'cargo_name', key: 'cargo_name' },
  { title: '重量', dataIndex: 'weight', key: 'weight', render: (value: number) => `${value} 吨` },
  { title: '估算价格', dataIndex: 'estimated_price', key: 'estimated_price', render: (value: number) => `¥${Number(value || 0).toLocaleString()}` },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === 'in_transit' ? 'blue' : value === 'completed' ? 'green' : 'orange'}>{logisticsStatusText[value] || value}</Tag>,
  },
  {
    title: '承运车辆',
    key: 'vehicle',
    render: (_, record) => record.plate_number || '待物流商接单',
  },
]

const logisticsStatusText: Record<string, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_transit: '在途',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
}

export default function LogisticsPage() {
  const [form] = Form.useForm<Partial<LogisticsServiceItem>>()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<LogisticsServiceItem | null>(null)
  const { data: carrierData, isError: carrierError, isLoading: carrierLoading } = useQuery({
    queryKey: ['dashboard-logistics-services'],
    queryFn: () => serviceOfferService.listLogistics({ page_size: 100 }),
  })
  const carriers = carrierData?.data.list ?? []
  const { data: warehouseData, isError: warehouseError } = useQuery({
    queryKey: ['dashboard-logistics-warehouses'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 100 }),
  })
  const warehouses = warehouseData?.data.list ?? []
  const { data: orderData, isError: orderError, isLoading: orderLoading } = useQuery({
    queryKey: ['dashboard-logistics-orders'],
    queryFn: () => serviceFulfillmentService.listLogisticsOrders({ page_size: 100, role: 'carrier' }),
  })
  const logisticsOrders = orderData?.data.list ?? []
  const estimateTarget = carriers[0]
  const estimateWarehouse = warehouses[0]
  const { data: estimateData } = useQuery({
    queryKey: ['dashboard-logistics-estimate', estimateTarget?.id, estimateWarehouse?.id],
    queryFn: () => serviceFulfillmentService.estimateLogistics({
      logistics_service_id: estimateTarget.id,
      warehouse_service_id: estimateWarehouse?.id,
      destination: '买家指定收货地',
      weight: 100,
    }),
    enabled: Boolean(estimateTarget?.id),
  })
  const activeOrders = logisticsOrders.filter((item) => item.status === 'in_transit' || item.status === 'accepted')
  const pendingOrders = logisticsOrders.filter((item) => item.status === 'pending')
  const completedOrders = logisticsOrders.filter((item) => item.status === 'completed' || item.status === 'delivered')
  const trackedOrders = logisticsOrders.filter((item) => item.tracking_events?.length)
  const trackingCoverage = logisticsOrders.length > 0 ? Math.round((trackedOrders.length / logisticsOrders.length) * 100) : 0
  const acceptanceRate = logisticsOrders.length > 0 ? Math.round(((logisticsOrders.length - pendingOrders.length) / logisticsOrders.length) * 100) : 0
  const completionRate = logisticsOrders.length > 0 ? Math.round((completedOrders.length / logisticsOrders.length) * 100) : 0
  const guaranteeRows = logisticsOrders.map((item) => ({
    id: item.id,
    title: item.logistics_no,
    description: `${item.guarantee_type || '未配置保障'} · ${logisticsStatusText[item.status] || item.status}`,
    icon: item.status === 'pending' ? <AuditOutlined /> : item.tracking_events?.length ? <EnvironmentOutlined /> : <SafetyCertificateOutlined />,
  }))
  const saveCarrierMutation = useMutation({
    mutationFn: (payload: Partial<LogisticsServiceItem>) =>
      editingCarrier ? serviceOfferService.updateLogistics(editingCarrier.id, payload) : serviceOfferService.createLogistics(payload),
    onSuccess: () => {
      message.success(editingCarrier ? '物流商已更新并重新提交审核' : '物流商已提交审核')
      setModalOpen(false)
      setEditingCarrier(null)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['dashboard-logistics-services'] })
    },
  })
  const deleteCarrierMutation = useMutation({
    mutationFn: (id: number) => serviceOfferService.deleteLogistics(id),
    onSuccess: () => {
      message.success('物流商已下线')
      void queryClient.invalidateQueries({ queryKey: ['dashboard-logistics-services'] })
    },
  })

  const openCreateCarrier = () => {
    setEditingCarrier(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditCarrier = (carrier: LogisticsServiceItem) => {
    setEditingCarrier(carrier)
    form.setFieldsValue(carrier)
    setModalOpen(true)
  }

  const carrierColumns: ColumnsType<LogisticsServiceItem> = [
    { title: '物流商', dataIndex: 'name', key: 'name' },
    { title: '起始地', dataIndex: 'route_start', key: 'route_start' },
    { title: '目的地', dataIndex: 'route_end', key: 'route_end' },
    { title: '车型', dataIndex: 'vehicle_type', key: 'vehicle_type' },
    { title: '载重', dataIndex: 'load_capacity', key: 'load_capacity', render: (value: number) => `${value || 0} 吨` },
    { title: '计价规则', dataIndex: 'price_rule', key: 'price_rule' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number) => <Tag color={value === 2 ? 'green' : value === 1 ? 'gold' : 'default'}>{value === 2 ? '可接单' : value === 1 ? '审核中' : '停用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditCarrier(record)}>编辑</Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteCarrierMutation.isPending}
            onClick={() => Modal.confirm({
              title: '确认下线物流商？',
              okText: '确认下线',
              cancelText: '取消',
              onOk: () => deleteCarrierMutation.mutate(record.id),
            })}
          >
            下线
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <ServicePanelGate serviceKey="logistics">
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <Title level={4} className="!mb-1">物流平台</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            在买家工作台内承接物流服务：运输委托、派车、在途跟踪、异常处理、签收回单和费用结算。
          </Paragraph>
        </Card>
        {(carrierError || warehouseError || orderError) ? (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="物流接口数据未完整返回"
            description="请确认当前登录企业已开通物流服务，并且后端已部署 logistics service-fulfillment 接口。"
          />
        ) : null}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="今日承运委托" value={logisticsOrders.length} suffix="单" prefix={<NodeIndexOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="在途车辆" value={activeOrders.length} suffix="辆" prefix={<CarOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="准点率" value={96.4} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="待结算金额" value={activeOrders.reduce((sum, item) => sum + Number(item.final_price || item.estimated_price || 0), 0)} prefix={<ClockCircleOutlined />} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={15}>
            <Card
              className="rounded-lg"
              title="物流商管理"
              extra={<Button type="primary" icon={<CarOutlined />} onClick={openCreateCarrier}>新增物流商</Button>}
            >
              <Table loading={carrierLoading} columns={carrierColumns} dataSource={carriers} rowKey="id" pagination={false} scroll={{ x: 1080 }} />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="rounded-lg" title="订单价格估算">
              <Space direction="vertical" className="w-full">
                {estimateData?.data ? (
                  <div className="rounded-lg border border-gray-100 p-3">
                    <div className="font-medium text-gray-900">{estimateData.data.origin || estimateWarehouse?.warehouse_name || '买家指定提货点'} {'->'} {estimateData.data.destination}</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {estimateData.data.weight} 吨 · {estimateTarget?.name} · ¥{estimateData.data.estimated_price.toLocaleString()}
                    </div>
                  </div>
                ) : <Text type="secondary">暂无可估价物流商</Text>}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={16}>
            <Card className="rounded-lg" title="运输委托池" extra={<Button type="primary" icon={<CarOutlined />}>智能派车</Button>}>
              <Table loading={orderLoading} columns={columns} dataSource={logisticsOrders} rowKey="id" pagination={false} scroll={{ x: 900 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="rounded-lg" title="待办优先级">
              <List
                dataSource={[
                  { title: '待派车委托', description: `${pendingOrders.length} 单需要物流商接单和确认车辆`, icon: <CarOutlined /> },
                  { title: '在途异常', description: `${activeOrders.filter((item) => !item.tracking_events?.length).length} 单缺少轨迹回传`, icon: <AlertOutlined /> },
                  { title: '回单确认', description: `${completedOrders.length} 单等待回单归档确认`, icon: <FileDoneOutlined /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
            </Card>
            <Card className="mt-4 rounded-lg" title="线路履约健康度">
              <Space direction="vertical" className="w-full">
                <Text>接单率</Text>
                <Progress percent={acceptanceRate} />
                <Text>轨迹覆盖率</Text>
                <Progress percent={trackingCoverage} status={trackingCoverage < 60 && logisticsOrders.length ? 'exception' : 'active'} />
                <Text>送达完成率</Text>
                <Progress percent={completionRate} status={completionRate < 50 && logisticsOrders.length ? 'exception' : 'normal'} />
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={14}>
            <Card className="rounded-lg" title="客户发单 / 物流接单">
              <Table
                rowKey="id"
                pagination={false}
                scroll={{ x: 860 }}
                loading={orderLoading}
                dataSource={logisticsOrders}
                columns={[
                  { title: '服务单', dataIndex: 'logistics_no' },
                  { title: '客户企业ID', dataIndex: 'buyer_enterprise_id' },
                  { title: '提货点', dataIndex: 'origin' },
                  { title: '目的地', dataIndex: 'destination' },
                  { title: '承运企业ID', render: (_: unknown, record: LogisticsOrderInfo) => record.carrier_enterprise_id || '待物流商接单' },
                  { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === 'pending' ? 'gold' : value === 'accepted' ? 'blue' : 'green'}>{logisticsStatusText[value] || value}</Tag> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card className="rounded-lg" title="履约保障">
              <List
                dataSource={guaranteeRows}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        <Modal
          title={editingCarrier ? '编辑物流商' : '新增物流商'}
          open={modalOpen}
          okText={editingCarrier ? '保存并提交审核' : '提交审核'}
          cancelText="取消"
          confirmLoading={saveCarrierMutation.isPending}
          onCancel={() => {
            setModalOpen(false)
            setEditingCarrier(null)
            form.resetFields()
          }}
          onOk={() => form.validateFields().then((values) => saveCarrierMutation.mutate(values))}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="服务名称" name="name" rules={[{ required: true, message: '请输入服务名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="起始地" name="route_start" rules={[{ required: true, message: '请输入起始地' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="目的地" name="route_end" rules={[{ required: true, message: '请输入目的地' }]}>
              <Input />
            </Form.Item>
            <Space className="w-full" size="large" wrap>
              <Form.Item label="车型" name="vehicle_type">
                <Input className="w-60" />
              </Form.Item>
              <Form.Item label="载重能力（吨）" name="load_capacity">
                <InputNumber className="w-60" min={0} />
              </Form.Item>
            </Space>
            <Form.Item label="服务范围" name="service_scope">
              <Input />
            </Form.Item>
            <Form.Item label="价格规则" name="price_rule">
              <Input placeholder="例如：80 元/吨" />
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
