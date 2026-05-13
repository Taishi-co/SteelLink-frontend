import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CarOutlined,
  HomeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { logisticsOrderService, logisticsFulfillmentService } from '@/services/orderService'
import type { OrderInfo, LogisticsOrder } from '@/services/orderService'
import { logisticsResourceService } from '@/services/logisticsResourceService'
import type {
  LogisticsResource,
  LogisticsResourcePayload,
} from '@/services/logisticsResourceService'
import { getLogisticsToken, hasLogisticsCapability, saveLogisticsToken } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Title, Text, Paragraph } = Typography

const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

const logisticsOrderStatusMap: Record<string, { label: string; color: string }> = {
  task_created: { label: '运输任务已创建', color: 'default' },
  pickup_scheduled: { label: '提货已预约', color: 'processing' },
  arrival_signed_in: { label: '已到场签到', color: 'blue' },
  outbound_confirmed: { label: '已出库确认', color: 'cyan' },
  loading_confirmed: { label: '已装货确认', color: 'cyan' },
  in_transit: { label: '运输中', color: 'geekblue' },
  arrival_confirmed: { label: '已到货确认', color: 'green' },
  receipt_signed: { label: '已验收签收', color: 'green' },
  inbound_completed: { label: '已入库完成', color: 'success' },
  completed: { label: '履约完成', color: 'success' },
  pending: { label: '待接单', color: 'default' },
  accepted: { label: '已接单', color: 'processing' },
  delivered: { label: '已送达', color: 'green' },
  cancelled: { label: '已取消', color: 'error' },
}

type TabKey = 'dashboard' | 'bidding' | 'logistics-flow' | 'resources'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [biddingOrders, setBiddingOrders] = useState<OrderInfo[]>([])
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([])
  const [resources, setResources] = useState<LogisticsResource[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceModalVisible, setResourceModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<LogisticsResource | null>(null)
  const [resourceForm] = Form.useForm<LogisticsResourcePayload>()
  const [loading, setLoading] = useState(false)
  const [quoteModal, setQuoteModal] = useState<{ visible: boolean; orderId: number | null }>({
    visible: false,
    orderId: null,
  })
  const [quotePrice, setQuotePrice] = useState<number>(0)
  const [quoteDays, setQuoteDays] = useState<number>(3)
  const [quoteRemark, setQuoteRemark] = useState('')
  const [tokenReady, setTokenReady] = useState(false)
  const [expandedLogisticsOrders, setExpandedLogisticsOrders] = useState<number[]>([])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      saveLogisticsToken(token)
      window.history.replaceState({}, '', window.location.pathname)
    }
    setTokenReady(true)
  }, [])

  const hasLogisticsSession = tokenReady && Boolean(getLogisticsToken())

  const showCompleted = (title: string, next: string, targetTab: TabKey = 'logistics-flow') => {
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
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      saveLogisticsToken(token)
      window.history.replaceState({}, '', window.location.pathname)
    }
    setTokenReady(true)
  }, [])

  useEffect(() => {
    if (!tokenReady) return
    if (!hasLogisticsSession) return
    if (activeTab === 'dashboard') {
      fetchBidding()
      fetchLogisticsOrders()
      fetchResources()
    } else if (activeTab === 'bidding') fetchBidding()
    else if (activeTab === 'logistics-flow') fetchLogisticsOrders()
    else if (activeTab === 'resources') fetchResources()
  }, [activeTab, hasLogisticsSession, tokenReady])

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

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await logisticsFulfillmentService.updateOrderStatus(id, { status })
      showCompleted(
        '物流状态更新已完成',
        status === 'delivered' ? '等待买方确认收货。' : '继续推进运输履约。',
        'logistics-flow'
      )
      fetchLogisticsOrders()
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
            <Text type="secondary" style={{ fontSize: 12 }}>
              {b.pickup_address || '待确认'} → {b.destination_address || '待确认'}
            </Text>
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

  const getLogisticsStepInfo = (status: string) => {
    const stepDefinitions = [
      { key: 'task_created', title: '运输任务', owner: '系统', hint: '运输任务已创建' },
      { key: 'pickup_scheduled', title: '提货预约', owner: '物流方', hint: '预约提货时间' },
      { key: 'arrival_signed_in', title: '到场签到', owner: '物流方', hint: '车辆到达仓库签到' },
      { key: 'outbound_confirmed', title: '出库确认', owner: '仓储方', hint: '仓库执行出库操作' },
      { key: 'loading_confirmed', title: '装货确认', owner: '物流方', hint: '确认货物装载完毕' },
      { key: 'in_transit', title: '运输中', owner: '物流方', hint: '货物在途运输' },
      { key: 'arrival_confirmed', title: '到货确认', owner: '物流方', hint: '到达目的地确认' },
      { key: 'receipt_signed', title: '验收签收', owner: '买方', hint: '买方验收并签收' },
      { key: 'inbound_completed', title: '入库登记', owner: '仓储方', hint: '货物入库登记' },
      { key: 'completed', title: '履约结束', owner: '系统', hint: '物流履约流程结束' },
    ]
    const statusOrder = ['task_created', 'pickup_scheduled', 'arrival_signed_in', 'outbound_confirmed', 'loading_confirmed', 'in_transit', 'arrival_confirmed', 'receipt_signed', 'inbound_completed', 'completed']
    
    let completedStep = statusOrder.indexOf(status)
    if (completedStep === -1) {
      if (status === 'pending') completedStep = 0
      else if (status === 'accepted') completedStep = 1
    }
    
    const currentStep = Math.min(completedStep + 1, stepDefinitions.length - 1)
    
    return { stepDefinitions, currentStep }
  }

  const menuItems = [
    { key: 'dashboard' as TabKey, label: '工作台概览', icon: <RocketOutlined /> },
    { key: 'bidding' as TabKey, label: '物流竞价', icon: <DollarCircleOutlined /> },
    { key: 'logistics-flow' as TabKey, label: '物流流程', icon: <CarOutlined /> },
    { key: 'resources' as TabKey, label: '运力资源管理', icon: <AppstoreOutlined /> },
  ]

  if (!hasLogisticsCapability()) {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={4}>需要物流服务商权限</Title>
          <Paragraph type="secondary">
            当前账户未开通物流服务商能力，请联系平台管理员申请开通。
          </Paragraph>
        </Card>
      </Layout>
    )
  }

  if (!tokenReady) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    )
  }

  if (!hasLogisticsSession) {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
          <Title level={4}>未获取到登录会话</Title>
          <Paragraph type="secondary">
            当前页面没有拿到可用 token，所以不会继续请求物流数据。请从已登录的业务端进入，或先在同 host 下完成登录。
          </Paragraph>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderBottom: '1px solid #edf0f5',
          }}
        >
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
                style={{
                  border: 0,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: activeTab === item.key ? '#e8f3ff' : 'transparent',
                }}
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
        <Header
          style={{
            background: '#fff',
            height: 64,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text strong>物流方工作台</Text>
          <Space>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={() => {
                if (activeTab === 'dashboard') {
                  fetchBidding()
                  fetchLogisticsOrders()
                  fetchResources()
                } else if (activeTab === 'bidding') fetchBidding()
                else if (activeTab === 'logistics-flow') fetchLogisticsOrders()
                else if (activeTab === 'resources') fetchResources()
              }}
            >
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">
              买家首页
            </Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {activeTab === 'dashboard' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">待报价竞价</Typography.Text>
                    <br />
                    <Title level={3}>{biddingOrders.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">物流履约单</Typography.Text>
                    <br />
                    <Title level={3}>{logisticsOrders.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">运力资源</Typography.Text>
                    <br />
                    <Title level={3}>{resources.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">物流订单</Typography.Text>
                    <br />
                    <Title level={3}>{logisticsOrders.length}</Title>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={15}>
                  <Card title="物流管理中心" extra={<Tag color="blue">独立服务商工作台</Tag>}>
                    <List
                      dataSource={[
                        {
                          title: '待报价物流竞价',
                          description: `${biddingOrders.length} 单等待报价`,
                          icon: <DollarCircleOutlined />,
                          tab: 'bidding' as TabKey,
                        },
                        {
                          title: '待接单物流订单',
                          description: `${logisticsOrders.filter((item) => item.status === 'pending').length} 单等待接单`,
                          icon: <ClockCircleOutlined />,
                          tab: 'logistics-orders' as TabKey,
                        },
                        {
                          title: '在途履约',
                          description: `${logisticsOrders.filter((item) => item.status === 'accepted' || item.status === 'in_transit').length} 单正在运输`,
                          icon: <CarOutlined />,
                          tab: 'logistics-orders' as TabKey,
                        },
                        {
                          title: '已审核运力',
                          description: `${resources.filter((item) => item.status === 2).length} 条线路可参与匹配`,
                          icon: <CheckCircleOutlined />,
                          tab: 'resources' as TabKey,
                        },
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button key="open" type="link" onClick={() => setActiveTab(item.tab)}>
                              处理
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={item.icon}
                            title={item.title}
                            description={item.description}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} xl={9}>
                  <Card title="快捷操作">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        block
                        type="primary"
                        icon={<DollarCircleOutlined />}
                        onClick={() => setActiveTab('bidding')}
                      >
                        进入物流竞价
                      </Button>
                      <Button
                        block
                        icon={<CarOutlined />}
                        onClick={() => setActiveTab('logistics-flow')}
                      >
                        查看物流流程
                      </Button>
                      <Button
                        block
                        icon={<AppstoreOutlined />}
                        onClick={() => setActiveTab('resources')}
                      >
                        管理运力资源
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {activeTab === 'bidding' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">待报价订单</Typography.Text>
                    <br />
                    <Title level={3}>{biddingOrders.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">在途车辆</Typography.Text>
                    <br />
                    <Title level={3}>--</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">待结算金额</Typography.Text>
                    <br />
                    <Title level={3}>--</Title>
                  </Card>
                </Col>
              </Row>
              <Card title="物流竞价订单" extra={<Tag color="processing">状态 15</Tag>}>
                <Spin spinning={loading}>
                  <Table
                    columns={biddingColumns}
                    dataSource={biddingOrders}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 940 }}
                    locale={{ emptyText: '暂无竞价订单' }}
                  />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'logistics-flow' && (
            <Card title="物流流程总览">
              <Spin spinning={loading}>
                <Table
                  dataSource={logisticsOrders}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  expandable={{
                    expandedRowKeys: expandedLogisticsOrders,
                    onExpandedRowsChange: (keys) => setExpandedLogisticsOrders(keys as number[]),
                    expandedRowRender: (record) => {
                      const { currentStep, stepDefinitions } = getLogisticsStepInfo(record.status)
                      return (
                        <div style={{ padding: '16px 24px', background: '#fafafa' }}>
                          <Steps
                            current={currentStep}
                            size="small"
                            items={stepDefinitions.map((step, index) => ({
                              title: index === currentStep ? `${step.title}中` : step.title,
                              description: step.owner,
                              status: index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait',
                            }))}
                          />
                          <div style={{ marginTop: 16, display: 'flex', gap: 32, color: '#666' }}>
                            <span>起始地：<strong style={{ color: '#333' }}>{record.origin}</strong></span>
                            <span>目的地：<strong style={{ color: '#333' }}>{record.destination}</strong></span>
                            <span>货物：<strong style={{ color: '#333' }}>{record.cargo_name}</strong></span>
                            <span>重量：<strong style={{ color: '#333' }}>{record.weight}吨</strong></span>
                          </div>
                        </div>
                      )
                    },
                  }}
                  columns={[
                    {
                      title: '订单号',
                      dataIndex: 'order_no',
                      key: 'order_no',
                      width: 160,
                      render: (text: string) => <Text strong>{text}</Text>,
                    },
                    {
                      title: '起始地',
                      dataIndex: 'origin',
                      key: 'origin',
                      width: 120,
                    },
                    {
                      title: '目的地',
                      dataIndex: 'destination',
                      key: 'destination',
                      width: 120,
                    },
                    {
                      title: '货物',
                      dataIndex: 'cargo_name',
                      key: 'cargo_name',
                      width: 100,
                    },
                    {
                      title: '物流状态',
                      key: 'logistics_status',
                      width: 120,
                      render: (_: unknown, record: LogisticsOrder) => {
                        const meta = logisticsOrderStatusMap[record.status] || { label: record.status, color: 'default' }
                        return <Tag color={meta.color}>{meta.label}</Tag>
                      },
                    },
                    {
                      title: '当前节点',
                      key: 'current_step',
                      width: 140,
                      render: (_: unknown, record: LogisticsOrder) => {
                        const { currentStep, stepDefinitions } = getLogisticsStepInfo(record.status)
                        const current = stepDefinitions[currentStep]
                        return current ? `${currentStep + 1}. ${current.title}中` : '--'
                      },
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_: unknown, record: LogisticsOrder) => {
                        const getNextAction = (status: string) => {
                          if (status === 'task_created' || status === 'pending') return { label: '接单', next: 'pickup_scheduled' }
                          if (status === 'pickup_scheduled' || status === 'accepted') return { label: '签到', next: 'arrival_signed_in' }
                          if (status === 'arrival_signed_in') return { label: '出库确认', next: 'outbound_confirmed' }
                          if (status === 'outbound_confirmed') return { label: '装货确认', next: 'loading_confirmed' }
                          if (status === 'loading_confirmed') return { label: '发车', next: 'in_transit' }
                          if (status === 'in_transit') return { label: '到货确认', next: 'arrival_confirmed' }
                          if (status === 'arrival_confirmed') return { label: '签收确认', next: 'receipt_signed' }
                          if (status === 'receipt_signed') return { label: '入库完成', next: 'inbound_completed' }
                          if (status === 'inbound_completed') return { label: '履约完成', next: 'completed' }
                          return null
                        }
                        const nextAction = getNextAction(record.status)
                        if (!nextAction) return null
                        return (
                          <Button type="primary" size="small" onClick={() => handleUpdateOrderStatus(record.id, nextAction.next as any)}>
                            {nextAction.label}
                          </Button>
                        )
                      },
                    },
                  ]}
                  locale={{ emptyText: '暂无物流订单' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'resources' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">运力资源总数</Typography.Text>
                    <br />
                    <Title level={3}>{resources.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">已通过</Typography.Text>
                    <br />
                    <Title level={3}>{resources.filter((r) => r.status === 2).length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">待审核</Typography.Text>
                    <br />
                    <Title level={3}>{resources.filter((r) => r.status === 1).length}</Title>
                  </Card>
                </Col>
              </Row>
              <Card
                title="运力资源管理"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateResource}>
                    新建运力资源
                  </Button>
                }
              >
                <Spin spinning={resourceLoading}>
                  <Table
                    columns={[
                      { title: '线路名称', dataIndex: 'name', key: 'name', width: 160 },
                      { title: '起始地', dataIndex: 'route_start', key: 'route_start', width: 120 },
                      { title: '目的地', dataIndex: 'route_end', key: 'route_end', width: 120 },
                      {
                        title: '车型',
                        dataIndex: 'vehicle_type',
                        key: 'vehicle_type',
                        width: 100,
                        render: (v: string) => v || '--',
                      },
                      {
                        title: '载重(吨)',
                        dataIndex: 'load_capacity',
                        key: 'load_capacity',
                        width: 90,
                        render: (v: number) => (v ? `${v}` : '--'),
                      },
                      {
                        title: '车队',
                        dataIndex: 'fleet_name',
                        key: 'fleet_name',
                        width: 120,
                        render: (v: string) => v || '--',
                      },
                      {
                        title: '价格规则',
                        dataIndex: 'price_rule',
                        key: 'price_rule',
                        width: 140,
                        ellipsis: true,
                        render: (v: string) => v || '--',
                      },
                      {
                        title: '审核状态',
                        dataIndex: 'status',
                        key: 'status',
                        width: 100,
                        render: (s: number) => {
                          const meta = resourceStatusMap[s] || {
                            label: `状态${s}`,
                            color: 'default',
                          }
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
                      {
                        title: '创建时间',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        width: 140,
                        render: (v: string) => v?.slice(0, 10),
                      },
                      {
                        title: '操作',
                        key: 'action',
                        width: 140,
                        render: (_: unknown, record: LogisticsResource) => (
                          <Space>
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openEditResource(record)}
                              disabled={record.status === 4}
                            >
                              编辑
                            </Button>
                            <Button
                              type="link"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleResourceOffline(record)}
                              disabled={record.status === 4}
                            >
                              下线
                            </Button>
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
                      <Form.Item
                        name="name"
                        label="线路名称"
                        rules={[{ required: true, message: '请输入线路名称' }]}
                      >
                        <Input placeholder="例：上海-杭州干线" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="fleet_name" label="车队名称">
                        <Input placeholder="例：华东一号车队" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="route_start"
                        label="起始地"
                        rules={[{ required: true, message: '请输入起始地' }]}
                      >
                        <Input placeholder="例：上海市" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="route_end"
                        label="目的地"
                        rules={[{ required: true, message: '请输入目的地' }]}
                      >
                        <Input placeholder="例：杭州市" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="vehicle_type" label="车型">
                        <Select
                          placeholder="选择车型"
                          options={[
                            { label: '平板车', value: '平板车' },
                            { label: '厢式货车', value: '厢式货车' },
                            { label: '自卸车', value: '自卸车' },
                            { label: '集装箱车', value: '集装箱车' },
                            { label: '冷藏车', value: '冷藏车' },
                            { label: '罐车', value: '罐车' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="load_capacity" label="载重能力(吨)">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="service_scope" label="服务范围">
                        <Input placeholder="例：华东地区" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="price_rule" label="价格规则">
                        <Input placeholder="例：120元/吨" />
                      </Form.Item>
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
            onCancel={() => {
              setQuoteModal({ visible: false, orderId: null })
              setQuotePrice(0)
              setQuoteDays(3)
              setQuoteRemark('')
            }}
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
