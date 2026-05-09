import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Input, InputNumber, Layout, List, Modal, Row, Select, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { logisticsOrderService, logisticsFulfillmentService } from '@/services/orderService'
import type { OrderInfo, LogisticsOrder } from '@/services/orderService'
import { logisticsResourceService } from '@/services/logisticsResourceService'
import type { LogisticsResource, LogisticsResourcePayload } from '@/services/logisticsResourceService'
import { hasLogisticsCapability } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Title, Text, Paragraph } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  12: { label: '待仓库确认', color: 'orange' },
  13: { label: '待卖方确认', color: 'blue' },
  14: { label: '待买方确认', color: 'blue' },
  2: { label: '待签合同', color: 'cyan' },
  3: { label: '待付款', color: 'gold' },
  4: { label: '待确认收款', color: 'purple' },
  5: { label: '待提货', color: 'geekblue' },
  15: { label: '物流竞价中', color: 'processing' },
  16: { label: '待确认物流', color: 'blue' },
  17: { label: '运输中', color: 'cyan' },
  6: { label: '已发货', color: 'cyan' },
  7: { label: '已到货', color: 'green' },
  18: { label: '已收货', color: 'green' },
  8: { label: '已完成', color: 'success' },
  19: { label: '已对账', color: 'success' },
  20: { label: '已归档', color: 'default' },
  24: { label: '待重新发起物流', color: 'volcano' },
}

const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

type TabKey = 'bidding' | 'logistics-orders' | 'resources' | 'all'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('bidding')
  const [biddingOrders, setBiddingOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([])
  const [resources, setResources] = useState<LogisticsResource[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceModalVisible, setResourceModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<LogisticsResource | null>(null)
  const [resourceForm] = Form.useForm<LogisticsResourcePayload>()
  const [loading, setLoading] = useState(false)
  const [quoteModal, setQuoteModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [quotePrice, setQuotePrice] = useState<number>(0)
  const [quoteDays, setQuoteDays] = useState<number>(3)
  const [quoteRemark, setQuoteRemark] = useState('')

  const showCompleted = (title: string, next: string, targetTab: TabKey = 'all') => {
    Modal.success({
      title,
      content: (
        <Space direction="vertical" size={8}>
          <Text>已完成：{title.replace('已完成', '')}</Text>
          <Text type="secondary">下一步：{next}</Text>
          <Text type="secondary">管理端可在订单详情中查看本次节点事件记录。</Text>
        </Space>
      ),
      okText: '回工作台看订单',
      onOk: () => setActiveTab(targetTab),
    })
  }

  const fetchBidding = async () => {
    setLoading(true)
    try {
      const list = await logisticsOrderService.listBidding()
      setBiddingOrders(list || [])
    } catch {
      message.error('获取竞价订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const list = await logisticsOrderService.listAll()
      setAllOrders(list || [])
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogisticsOrders = async () => {
    setLoading(true)
    try {
      const list = await logisticsFulfillmentService.listOrders()
      setLogisticsOrders(list || [])
    } catch {
      message.error('获取物流订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    setResourceLoading(true)
    try {
      const list = await logisticsResourceService.listMine()
      setResources(list || [])
    } catch {
      message.error('获取运力资源列表失败')
    } finally {
      setResourceLoading(false)
    }
  }

  const openCreateResource = () => {
    setEditingResource(null)
    resourceForm.resetFields()
    setResourceModalVisible(true)
  }

  const openEditResource = (record: LogisticsResource) => {
    setEditingResource(record)
    resourceForm.setFieldsValue({
      name: record.name,
      route_start: record.route_start,
      route_end: record.route_end,
      service_scope: record.service_scope,
      vehicle_type: record.vehicle_type,
      load_capacity: record.load_capacity,
      price_rule: record.price_rule,
      fleet_name: record.fleet_name,
      description: record.description,
    })
    setResourceModalVisible(true)
  }

  const handleResourceSubmit = async () => {
    try {
      const values = await resourceForm.validateFields()
      if (editingResource) {
        await logisticsResourceService.update(editingResource.id, values)
        message.success('运力资源更新成功')
      } else {
        await logisticsResourceService.create(values as LogisticsResourcePayload)
        message.success('运力资源创建成功，等待平台审核')
      }
      setResourceModalVisible(false)
      fetchResources()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('操作失败')
    }
  }

  const handleResourceOffline = async (record: LogisticsResource) => {
    Modal.confirm({
      title: '确认下线该运力资源？',
      content: `线路：${record.name}（${record.route_start} → ${record.route_end}），下线后将不再参与物流竞价匹配。`,
      okText: '确认下线',
      okType: 'danger',
      onOk: async () => {
        try {
          await logisticsResourceService.delete(record.id)
          message.success('运力资源已下线')
          fetchResources()
        } catch {
          message.error('下线失败')
        }
      },
    })
  }

  useEffect(() => {
    if (activeTab === 'bidding') fetchBidding()
    else if (activeTab === 'all') fetchAll()
    else if (activeTab === 'logistics-orders') fetchLogisticsOrders()
    else if (activeTab === 'resources') fetchResources()
  }, [activeTab])

  const handleSubmitQuote = async () => {
    if (!quoteModal.orderId) return
    if (quotePrice <= 0) {
      message.warning('请输入有效报价')
      return
    }
    try {
      await logisticsOrderService.createQuote(quoteModal.orderId, {
        vehicle_info: '平台认证车辆',
        driver_info: '平台认证司机',
        amount: quotePrice,
        estimated_delivery_at: `${quoteDays}天`,
        remark: quoteRemark || undefined,
      })
      showCompleted('物流报价已完成', '等待合同约定的运费承担方选择报价。', 'bidding')
      setQuoteModal({ visible: false, orderId: null })
      setQuotePrice(0)
      setQuoteDays(3)
      setQuoteRemark('')
      fetchBidding()
    } catch {
      message.error('报价提交失败')
    }
  }

  const handleAcceptOrder = async (id: number) => {
    try {
      await logisticsFulfillmentService.acceptOrder(id)
      showCompleted('物流接单已完成', '下一步发车并更新运输状态。', 'logistics-orders')
      fetchLogisticsOrders()
    } catch {
      message.error('接单失败')
    }
  }

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await logisticsFulfillmentService.updateOrderStatus(id, { status })
      showCompleted('物流状态更新已完成', status === 'delivered' ? '等待买方确认收货。' : '继续推进运输履约。', 'logistics-orders')
      fetchLogisticsOrders()
    } catch {
      message.error('操作失败')
    }
  }

  const handleShipmentProgress = async (orderId: number, action: string) => {
    try {
      await logisticsOrderService.shipmentProgress(orderId, action)
      showCompleted('运输状态更新已完成', action === 'delivered' ? '等待买方确认收货。' : '继续推进运输履约。', 'all')
      fetchAll()
    } catch {
      message.error('操作失败')
    }
  }

  const biddingColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (v: number) => `¥${v?.toLocaleString()}`,
    },
    {
      title: '货物',
      key: 'cargo',
      width: 120,
      render: (_: unknown, record: OrderInfo) => record.items?.[0]?.product_name || '--',
    },
    {
      title: '数量',
      key: 'quantity',
      width: 80,
      render: (_: unknown, record: OrderInfo) => record.items?.[0]?.quantity || '--',
    },
    {
      title: '竞价信息',
      key: 'bidding',
      width: 200,
      render: (_: unknown, record: OrderInfo) => {
        const b = record.logistics_bidding
        if (!b) return '--'
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>{b.pickup_address || '待确认'} → {b.destination_address || '待确认'}</Text>
            {b.quotes && b.quotes.length > 0 && <Tag color="blue">{b.quotes.length} 个报价</Tag>}
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: OrderInfo) => (
        <Button
          type="primary"
          size="small"
          icon={<DollarCircleOutlined />}
          onClick={() => setQuoteModal({ visible: true, orderId: record.id })}
        >
          报价
        </Button>
      ),
    },
  ]

  const logisticsOrderColumns: ColumnsType<LogisticsOrder> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '起始', dataIndex: 'origin', key: 'origin', width: 120 },
    { title: '目的地', dataIndex: 'destination', key: 'destination', width: 120 },
    { title: '货物', dataIndex: 'cargo_name', key: 'cargo_name', width: 100 },
    { title: '重量', dataIndex: 'weight', key: 'weight', width: 80, render: (v: number) => `${v} 吨` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = { pending: 'default', accepted: 'processing', in_transit: 'cyan', delivered: 'success', cancelled: 'error' }
        const labelMap: Record<string, string> = { pending: '待接单', accepted: '已接单', in_transit: '运输中', delivered: '已送达', cancelled: '已取消' }
        return <Tag color={colorMap[v] || 'default'}>{labelMap[v] || v}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: LogisticsOrder) => {
        if (record.status === 'pending') {
          return <Button type="primary" size="small" onClick={() => handleAcceptOrder(record.id)}>接单</Button>
        }
        if (record.status === 'accepted') {
          return <Button type="primary" size="small" onClick={() => handleUpdateOrderStatus(record.id, 'in_transit')}>发车</Button>
        }
        if (record.status === 'in_transit') {
          return <Button type="primary" size="small" onClick={() => handleUpdateOrderStatus(record.id, 'delivered')}>送达</Button>
        }
        return null
      },
    },
  ]

  const allOrderColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (v: number) => `¥${v?.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: number) => {
        const meta = statusMap[s] || { label: `状态${s}`, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '运输操作',
      key: 'shipment',
      width: 160,
      render: (_: unknown, record: OrderInfo) => {
        if (record.status === 17) {
          return (
            <Space>
              <Button size="small" onClick={() => handleShipmentProgress(record.id, 'pickup')}>已提货</Button>
              <Button size="small" onClick={() => handleShipmentProgress(record.id, 'in-transit')}>运输中</Button>
              <Button size="small" type="primary" onClick={() => handleShipmentProgress(record.id, 'delivered')}>已送达</Button>
            </Space>
          )
        }
        return null
      },
    },
  ]

  const menuItems = [
    { key: 'bidding' as TabKey, label: '物流竞价', icon: <DollarCircleOutlined /> },
    { key: 'logistics-orders' as TabKey, label: '物流订单', icon: <CarOutlined /> },
    { key: 'resources' as TabKey, label: '运力资源管理', icon: <AppstoreOutlined /> },
    { key: 'all' as TabKey, label: '全部订单', icon: <DatabaseOutlined /> },
  ]

  if (!hasLogisticsCapability()) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={4}>需要物流服务商权限</Title>
          <Paragraph type="secondary">当前账户未开通物流服务商能力，请联系平台管理员申请开通。</Paragraph>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #edf0f5' }}>
          <Space>
            <RocketOutlined style={{ color: '#1677ff' }} />
            <Text strong>SteelLink 物流</Text>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#e8f3ff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                    {item.key === 'bidding' && biddingOrders.length > 0 && (
                      <Badge count={biddingOrders.length} style={{ marginLeft: 8 }} />
                    )}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>物流方工作台</Text>
          <Space>
            <Button icon={<EnvironmentOutlined />} onClick={() => { if (activeTab === 'bidding') fetchBidding(); else if (activeTab === 'logistics-orders') fetchLogisticsOrders(); else if (activeTab === 'resources') fetchResources(); else fetchAll(); }}>
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">买家首页</Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {activeTab === 'bidding' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待报价订单</Typography.Text><br /><Title level={3}>{biddingOrders.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">在途车辆</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待结算金额</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
              </Row>
              <Card title="物流竞价订单" extra={<Tag color="processing">状态 15</Tag>}>
                <Spin spinning={loading}>
                  <Table columns={biddingColumns} dataSource={biddingOrders} rowKey="id" pagination={false} scroll={{ x: 940 }} locale={{ emptyText: '暂无竞价订单' }} />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'logistics-orders' && (
            <Card title="物流订单管理" extra={<Tag color="blue">物流履约</Tag>}>
              <Spin spinning={loading}>
                <Table columns={logisticsOrderColumns} dataSource={logisticsOrders} rowKey="id" pagination={false} scroll={{ x: 800 }} locale={{ emptyText: '暂无物流订单' }} />
              </Spin>
            </Card>
          )}

          {activeTab === 'all' && (
            <Card title="全部订单">
              <Spin spinning={loading}>
                <Table columns={allOrderColumns} dataSource={allOrders} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 940 }} locale={{ emptyText: '暂无订单' }} />
              </Spin>
            </Card>
          )}

          {activeTab === 'resources' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">运力资源总数</Typography.Text><br /><Title level={3}>{resources.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已通过</Typography.Text><br /><Title level={3}>{resources.filter(r => r.status === 2).length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待审核</Typography.Text><br /><Title level={3}>{resources.filter(r => r.status === 1).length}</Title></Card>
                </Col>
              </Row>
              <Card
                title="运力资源管理"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateResource}>新建运力资源</Button>}
              >
                <Spin spinning={resourceLoading}>
                  <Table
                    columns={[
                      { title: '线路名称', dataIndex: 'name', key: 'name', width: 160 },
                      { title: '起始地', dataIndex: 'route_start', key: 'route_start', width: 120 },
                      { title: '目的地', dataIndex: 'route_end', key: 'route_end', width: 120 },
                      { title: '车型', dataIndex: 'vehicle_type', key: 'vehicle_type', width: 100, render: (v: string) => v || '--' },
                      { title: '载重(吨)', dataIndex: 'load_capacity', key: 'load_capacity', width: 90, render: (v: number) => v ? `${v}` : '--' },
                      { title: '车队', dataIndex: 'fleet_name', key: 'fleet_name', width: 120, render: (v: string) => v || '--' },
                      { title: '价格规则', dataIndex: 'price_rule', key: 'price_rule', width: 140, ellipsis: true, render: (v: string) => v || '--' },
                      {
                        title: '审核状态',
                        dataIndex: 'status',
                        key: 'status',
                        width: 100,
                        render: (s: number) => {
                          const meta = resourceStatusMap[s] || { label: `状态${s}`, color: 'default' }
                          return <Tag color={meta.color}>{meta.label}</Tag>
                        },
                      },
                      {
                        title: '审核备注',
                        dataIndex: 'audit_remark',
                        key: 'audit_remark',
                        width: 140,
                        ellipsis: true,
                        render: (v: string) => v || '--',
                      },
                      { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 140, render: (v: string) => v?.slice(0, 10) },
                      {
                        title: '操作',
                        key: 'action',
                        width: 140,
                        render: (_: unknown, record: LogisticsResource) => (
                          <Space>
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditResource(record)} disabled={record.status === 4}>编辑</Button>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleResourceOffline(record)} disabled={record.status === 4}>下线</Button>
                          </Space>
                        ),
                      },
                    ]}
                    dataSource={resources}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                    locale={{ emptyText: '暂无运力资源，点击"新建运力资源"开始上架' }}
                  />
                </Spin>
              </Card>

              <Modal
                title={editingResource ? '编辑运力资源' : '新建运力资源'}
                open={resourceModalVisible}
                onOk={handleResourceSubmit}
                onCancel={() => setResourceModalVisible(false)}
                width={720}
                okText={editingResource ? '保存' : '提交审核'}
                destroyOnClose
              >
                <Form form={resourceForm} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="name" label="线路名称" rules={[{ required: true, message: '请输入线路名称' }]}>
                        <Input placeholder="例：上海-杭州干线" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="fleet_name" label="车队名称"><Input placeholder="例：华东一号车队" /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="route_start" label="起始地" rules={[{ required: true, message: '请输入起始地' }]}>
                        <Input placeholder="例：上海市" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="route_end" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
                        <Input placeholder="例：杭州市" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="vehicle_type" label="车型">
                        <Select placeholder="选择车型" options={[
                          { label: '平板车', value: '平板车' },
                          { label: '厢式货车', value: '厢式货车' },
                          { label: '自卸车', value: '自卸车' },
                          { label: '集装箱车', value: '集装箱车' },
                          { label: '冷藏车', value: '冷藏车' },
                          { label: '罐车', value: '罐车' },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="load_capacity" label="载重能力(吨)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="service_scope" label="服务范围"><Input placeholder="例：华东地区" /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="price_rule" label="价格规则"><Input placeholder="例：120元/吨" /></Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} placeholder="运力特色、资质、服务优势等" />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}

          <Modal
            title="提交物流报价"
            open={quoteModal.visible}
            onOk={handleSubmitQuote}
            onCancel={() => { setQuoteModal({ visible: false, orderId: null }); setQuotePrice(0); setQuoteDays(3); setQuoteRemark('') }}
            okText="提交报价"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>报价金额 (元)：</Text>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={quotePrice}
                  onChange={(v) => setQuotePrice(v || 0)}
                  placeholder="请输入报价金额"
                />
              </div>
              <div>
                <Text>预计运输天数：</Text>
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  value={quoteDays}
                  onChange={(v) => setQuoteDays(v || 3)}
                  placeholder="请输入预计天数"
                />
              </div>
              <div>
                <Text>备注（选填）：</Text>
                <Input
                  value={quoteRemark}
                  onChange={(e) => setQuoteRemark(e.target.value)}
                  placeholder="备注信息"
                />
              </div>
            </Space>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
