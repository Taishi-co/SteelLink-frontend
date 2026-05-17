import { Alert, Button, Card, Col, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CarOutlined, EnvironmentOutlined, FileDoneOutlined, NodeIndexOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { serviceOfferService, type LogisticsServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type CreateLogisticsOrderPayload, type LogisticsOrderInfo } from '@/services/serviceFulfillmentService'

const { Paragraph, Title } = Typography

const logisticsStatusText: Record<string, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_transit: '在途',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
}

const carrierColumns: ColumnsType<LogisticsServiceItem> = [
  { title: '物流服务', dataIndex: 'name', key: 'name' },
  { title: '线路', key: 'route', render: (_, record) => `${record.route_start || '-'} -> ${record.route_end || '-'}` },
  { title: '运输方式', dataIndex: 'transport_mode', key: 'transport_mode', render: (value?: string) => value || '-' },
  { title: '运输周期', dataIndex: 'transit_cycle', key: 'transit_cycle', render: (value?: string) => value || '-' },
  { title: '运价', key: 'price', render: (_, record) => record.price_rule || (record.unit_price ? `${record.unit_price} 元/吨` : '-') },
  { title: '车型/载重', key: 'vehicle', render: (_, record) => `${record.vehicle_type || '-'} / ${Number(record.load_capacity || 0).toLocaleString()} 吨` },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space>
        <Link to={`/logistics-services/${record.id}`}>
          <Button size="small">查看</Button>
        </Link>
        <Button size="small" type="primary">发起转运</Button>
      </Space>
    ),
  },
]

const orderColumns: ColumnsType<LogisticsOrderInfo> = [
  { title: '委托单', dataIndex: 'logistics_no', key: 'logistics_no' },
  { title: '线路', key: 'route', render: (_, record) => `${record.origin || '-'} -> ${record.destination || '-'}` },
  { title: '货物', dataIndex: 'cargo_name', key: 'cargo_name', render: (value?: string) => value || '-' },
  { title: '重量', dataIndex: 'weight', key: 'weight', render: (value: number) => `${Number(value || 0).toLocaleString()} 吨` },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === 'in_transit' ? 'blue' : value === 'completed' ? 'green' : 'orange'}>{logisticsStatusText[value] || value}</Tag>,
  },
  { title: '承运车辆', key: 'vehicle', render: (_, record) => record.plate_number || '待物流方接单' },
]

export default function LogisticsPage() {
  const [form] = Form.useForm<CreateLogisticsOrderPayload>()
  const [modalOpen, setModalOpen] = useState(false)
  const { data: carrierData, isLoading: carrierLoading } = useQuery({
    queryKey: ['buyer-visible-logistics-services'],
    queryFn: () => serviceOfferService.listLogistics({ page: 1, page_size: 100, status: 2 }),
  })
  const { data: orderData, isLoading: orderLoading, refetch } = useQuery({
    queryKey: ['buyer-logistics-orders'],
    queryFn: () => serviceFulfillmentService.listLogisticsOrders({ page_size: 100 }),
  })
  const createMutation = useMutation({
    mutationFn: serviceFulfillmentService.createLogisticsOrder,
    onSuccess: () => {
      message.success('物流转运需求已提交')
      setModalOpen(false)
      form.resetFields()
      void refetch()
    },
  })

  const carriers = carrierData?.data.list ?? []
  const logisticsOrders = orderData?.data.list ?? []
  const activeOrders = logisticsOrders.filter((item) => item.status === 'in_transit' || item.status === 'accepted')
  const completedOrders = logisticsOrders.filter((item) => item.status === 'completed' || item.status === 'delivered')
  const trackedOrders = logisticsOrders.filter((item) => item.tracking_events?.length)

  return (
    <div className="min-w-0 space-y-4">
      <Card className="rounded-lg">
        <Space align="start">
          <CarOutlined className="mt-1 text-xl text-blue-600" />
          <div>
            <Title level={4} className="!mb-1">物流服务</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              买卖方可查看平台已审核物流资源、发起货物转运需求，并跟踪自己订单的物流流转。司机管理、运力上架和物流竞价承接由物流方工作台处理。
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Alert
        showIcon
        type="info"
        message="转运功能说明"
        description="这里先提供买卖方发起转运需求和查看可用物流的入口；真实派车、司机资质、GPS 与单据上传仍在物流方工作台流转。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="可用物流资源" value={carriers.length} prefix={<NodeIndexOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="在途/已接单" value={activeOrders.length} prefix={<EnvironmentOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="已完成运输" value={completedOrders.length} suffix={`单 / 轨迹 ${trackedOrders.length}`} prefix={<FileDoneOutlined />} /></Card>
        </Col>
      </Row>

      <Card
        className="rounded-lg"
        title="可用物流"
        extra={<Button type="primary" onClick={() => setModalOpen(true)}>发起货物转运</Button>}
      >
        <Table
          rowKey="id"
          loading={carrierLoading}
          columns={carrierColumns}
          dataSource={carriers}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 980 }}
          locale={{ emptyText: <Empty description="暂无已审核物流资源" /> }}
        />
      </Card>

      <Card className="rounded-lg" title="我的物流委托">
        <Table
          rowKey="id"
          loading={orderLoading}
          columns={orderColumns}
          dataSource={logisticsOrders}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          locale={{ emptyText: <Empty description="暂无物流委托" /> }}
        />
      </Card>

      <Modal
        title="发起货物转运"
        open={modalOpen}
        okText="提交需求"
        cancelText="取消"
        confirmLoading={createMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.validateFields().then((values) => createMutation.mutate(values))}
      >
        <Form form={form} layout="vertical" initialValues={{ cargo_name: '钢材' }}>
          <Form.Item name="logistics_service_id" label="物流服务" rules={[{ required: true, message: '请选择物流服务' }]}>
            <Select placeholder="请选择物流服务">
              {carriers.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name} · {item.route_start || '-'} -&gt; {item.route_end || '-'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="origin" label="起运地" rules={[{ required: true, message: '请输入起运地' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cargo_name" label="货物名称" rules={[{ required: true, message: '请输入货物名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="weight" label="重量（吨）" rules={[{ required: true, message: '请输入重量' }]}>
            <InputNumber className="w-full" min={0.01} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
