import { useEffect, useState } from 'react'
import {
  Alert,
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
  FileTextOutlined,
} from '@ant-design/icons'
import { logisticsOrderService, logisticsFulfillmentService } from '@/services/orderService'
import type { OrderInfo, LogisticsOrder } from '@/services/orderService'
import { logisticsResourceService } from '@/services/logisticsResourceService'
import type {
  LogisticsResource,
  LogisticsResourcePayload,
} from '@/services/logisticsResourceService'
import { fleetService } from '@/services/fleetService'
import type {
  LogisticsDriver,
  LogisticsDriverPayload,
  LogisticsVehicle,
  LogisticsVehiclePayload,
} from '@/services/fleetService'
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

type TabKey = 'dashboard' | 'bidding' | 'logistics-flow' | 'resources' | 'fleet'

function isTabKey(value: string | null): value is TabKey {
  return Boolean(value && ['dashboard', 'bidding', 'logistics-flow', 'resources', 'fleet'].includes(value))
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [biddingOrders, setBiddingOrders] = useState<OrderInfo[]>([])
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([])
  const [resources, setResources] = useState<LogisticsResource[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceModalVisible, setResourceModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<LogisticsResource | null>(null)
  const [resourceForm] = Form.useForm<LogisticsResourcePayload>()
  const [drivers, setDrivers] = useState<LogisticsDriver[]>([])
  const [vehicles, setVehicles] = useState<LogisticsVehicle[]>([])
  const [fleetLoading, setFleetLoading] = useState(false)
  const [driverModalVisible, setDriverModalVisible] = useState(false)
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false)
  const [editingDriver, setEditingDriver] = useState<LogisticsDriver | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<LogisticsVehicle | null>(null)
  const [driverForm] = Form.useForm<LogisticsDriverPayload>()
  const [vehicleForm] = Form.useForm<LogisticsVehiclePayload>()
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
  const [statusModal, setStatusModal] = useState<{ visible: boolean; order: LogisticsOrder | null; nextStatus: string; label: string; requiredDocs: string[] }>({
    visible: false,
    order: null,
    nextStatus: '',
    label: '',
    requiredDocs: [],
  })
  const [statusForm] = Form.useForm<Record<string, string>>()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const tab = urlParams.get('tab')
    if (token) {
      saveLogisticsToken(token)
    }
    if (isTabKey(tab)) {
      setActiveTab(tab)
    }
    if (token || tab) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    setTokenReady(true)
  }, [])

  const hasLogisticsSession = tokenReady && Boolean(getLogisticsToken())

  const showCompleted = (title: string, next: string, targetTab: TabKey = 'logistics-flow') => {
    Modal.success({
      title,
      closable: true,
      maskClosable: true,
      content: (
        <Space direction="vertical" size={8}>
          <Text>已完成：{title.replace('已完成', '')}</Text>
          <Text type="secondary">下一步：{next}</Text>
          <Text type="secondary">可留在当前页继续处理，或切到推荐工作区查看后续任务。</Text>
        </Space>
      ),
      okCancel: true,
      okText: '查看推荐工作区',
      cancelText: '留在当前页',
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

  const fetchFleet = async () => {
    setFleetLoading(true)
    try {
      const [driverList, vehicleList] = await Promise.all([
        fleetService.listDrivers(),
        fleetService.listVehicles(),
      ])
      setDrivers(driverList || [])
      setVehicles(vehicleList || [])
    } catch {
      message.error('获取司机车辆档案失败')
    } finally {
      setFleetLoading(false)
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

  const openCreateDriver = () => {
    setEditingDriver(null)
    driverForm.resetFields()
    driverForm.setFieldsValue({ status: 'active' })
    setDriverModalVisible(true)
  }

  const openEditDriver = (record: LogisticsDriver) => {
    setEditingDriver(record)
    driverForm.setFieldsValue({
      name: record.name,
      phone: record.phone,
      id_card: record.id_card,
      license_no: record.license_no,
      license_expire_at: record.license_expire_at,
      qualification_no: record.qualification_no,
      qualification_expire_at: record.qualification_expire_at,
      status: record.status,
      remark: record.remark,
    })
    setDriverModalVisible(true)
  }

  const handleDriverSubmit = async () => {
    try {
      const values = await driverForm.validateFields()
      if (editingDriver) {
        await fleetService.updateDriver(editingDriver.id, values)
        message.success('司机档案已更新')
      } else {
        await fleetService.createDriver(values)
        message.success('司机档案已创建')
      }
      setDriverModalVisible(false)
      fetchFleet()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('保存司机档案失败')
    }
  }

  const openCreateVehicle = () => {
    setEditingVehicle(null)
    vehicleForm.resetFields()
    vehicleForm.setFieldsValue({ status: 'active' })
    setVehicleModalVisible(true)
  }

  const openEditVehicle = (record: LogisticsVehicle) => {
    setEditingVehicle(record)
    vehicleForm.setFieldsValue({
      plate_number: record.plate_number,
      vehicle_type: record.vehicle_type,
      load_capacity: record.load_capacity,
      vehicle_license: record.vehicle_license,
      license_expire_at: record.license_expire_at,
      insurance_no: record.insurance_no,
      insurance_expire_at: record.insurance_expire_at,
      driver_id: record.driver_id,
      status: record.status,
      remark: record.remark,
    })
    setVehicleModalVisible(true)
  }

  const handleVehicleSubmit = async () => {
    try {
      const values = await vehicleForm.validateFields()
      if (editingVehicle) {
        await fleetService.updateVehicle(editingVehicle.id, values)
        message.success('车辆档案已更新')
      } else {
        await fleetService.createVehicle(values)
        message.success('车辆档案已创建')
      }
      setVehicleModalVisible(false)
      fetchFleet()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('保存车辆档案失败')
    }
  }

  useEffect(() => {
    if (!tokenReady) return
    if (!hasLogisticsSession) return
    if (activeTab === 'dashboard') {
      fetchBidding()
      fetchLogisticsOrders()
      fetchResources()
      fetchFleet()
    } else if (activeTab === 'bidding') fetchBidding()
    else if (activeTab === 'logistics-flow') fetchLogisticsOrders()
    else if (activeTab === 'resources') fetchResources()
    else if (activeTab === 'fleet') fetchFleet()
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

  const openStatusModal = (order: LogisticsOrder, nextStatus: string, label: string, requiredDocs: string[] = []) => {
    setStatusModal({ visible: true, order, nextStatus, label, requiredDocs })
    statusForm.resetFields()
  }

  const handleStatusSubmit = async () => {
    if (!statusModal.order) return
    try {
      const values = await statusForm.validateFields()
      for (const docType of statusModal.requiredDocs) {
        const fileURL = values[`doc_${docType}`]
        if (fileURL) {
          await logisticsFulfillmentService.uploadDocument(statusModal.order.id, {
            doc_type: docType,
            file_url: fileURL,
            remark: values.remark,
          })
        }
      }
      await logisticsFulfillmentService.updateOrderStatus(statusModal.order.id, {
        status: statusModal.nextStatus,
      })
      message.success('物流节点已更新')
      setStatusModal({ visible: false, order: null, nextStatus: '', label: '', requiredDocs: [] })
      fetchLogisticsOrders()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error(
        statusModal.nextStatus === 'pickup_scheduled'
          ? '预约提货失败，请确认卖方已上传提货指令'
          : '节点更新失败，请确认必要单据已上传'
      )
    }
  }

  const handleConfirmLogisticsQuote = async (orderId: number, quoteId: number) => {
    try {
      await logisticsOrderService.confirmLogisticsQuote(orderId, quoteId)
      message.success('接单成功，请签署物流合同')
      fetchBidding()
      fetchLogisticsOrders()
    } catch {
      message.error('接单失败')
    }
  }

  const handleSignLogisticsContract = async (orderId: number) => {
    try {
      await logisticsOrderService.signLogisticsContract(orderId)
      message.success('签署物流合同成功')
      fetchBidding()
      fetchLogisticsOrders()
    } catch {
      message.error('签署物流合同失败')
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
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const bidding = record.logistics_bidding
        const isPendingConfirm = record.status === 17 && bidding?.responder_confirmed && bidding?.selected_quote_id && bidding.selected_quote_id > 0
        const isPendingSignContract = record.status === 27 && record.logistics_contract && record.logistics_contract.status === 'buyer_signed'

        if (isPendingSignContract) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleSignLogisticsContract(record.id)}
            >
              签署物流合同
            </Button>
          )
        }
        if (isPendingConfirm) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                if (bidding.selected_quote_id) {
                  handleConfirmLogisticsQuote(record.id, bidding.selected_quote_id)
                }
              }}
            >
              接单
            </Button>
          )
        }
        if (record.status >= 18 || (record.logistics_contract && record.logistics_contract.status === 'completed')) {
          return (
            <span className="text-green-600">
              <CheckCircleOutlined className="mr-1" />
              已签署
            </span>
          )
        }
        return (
          <Button
            type="primary"
            size="small"
            icon={<DollarCircleOutlined />}
            onClick={() => setQuoteModal({ visible: true, orderId: record.id })}
          >
            报价
          </Button>
        )
      },
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
      { key: 'inbound_completed', title: '收货仓验货入库', owner: '仓储方', hint: '收货仓验货并上传入库资料' },
      { key: 'receipt_signed', title: '确认收货', owner: '买方/资金方', hint: '查看入库资料后确认收货' },
      { key: 'completed', title: '履约结束', owner: '系统', hint: '物流履约流程结束' },
    ]
    const statusOrder = ['task_created', 'pickup_scheduled', 'arrival_signed_in', 'outbound_confirmed', 'loading_confirmed', 'in_transit', 'arrival_confirmed', 'inbound_completed', 'receipt_signed', 'completed']
    
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
    { key: 'bidding' as TabKey, label: '竞价与接单', icon: <DollarCircleOutlined /> },
    { key: 'logistics-flow' as TabKey, label: '物流流程', icon: <CarOutlined /> },
    { key: 'resources' as TabKey, label: '运力资源管理', icon: <AppstoreOutlined /> },
    { key: 'fleet' as TabKey, label: '司机车辆档案', icon: <SafetyCertificateOutlined /> },
  ]

  if (!tokenReady) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    )
  }

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
            height: 78,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            borderBottom: '1px solid #eadcc7',
            background: 'linear-gradient(135deg, rgba(255,253,248,.92), rgba(248,240,228,.72))',
          }}
        >
          <Space>
            <span style={{ display: 'inline-grid', width: 36, height: 36, placeItems: 'center', borderRadius: 16, background: '#214332', color: '#f3c17c', fontWeight: 900 }}>
              R
            </span>
            <span>
              <Text strong style={{ display: 'block', color: '#17221b' }}>锐联物流</Text>
              <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: '#a4662c' }}>RecoLink</Text>
            </span>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                className="service-nav-item"
                style={{
                  border: 0,
                  padding: '11px 12px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  marginBottom: 6,
                  background: activeTab === item.key ? '#214332' : 'transparent',
                  color: activeTab === item.key ? '#fffaf1' : '#5f6b61',
                }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text style={{ color: activeTab === item.key ? '#fffaf1' : '#5f6b61', fontWeight: 650 }}>
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
          <div>
            <Text strong style={{ display: 'block', color: '#17221b', fontSize: 16 }}>物流方工作台</Text>
            <Text style={{ color: '#7a847a', fontSize: 12 }}>竞价接单、物流流转、运力资源与司机车辆档案</Text>
          </div>
          <Space>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={() => {
                if (activeTab === 'dashboard') {
                  fetchBidding()
                  fetchLogisticsOrders()
                  fetchResources()
                  fetchFleet()
                } else if (activeTab === 'bidding') fetchBidding()
                else if (activeTab === 'logistics-flow') fetchLogisticsOrders()
                else if (activeTab === 'resources') fetchResources()
                else if (activeTab === 'fleet') fetchFleet()
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
                    <Typography.Text type="secondary">待处理订单</Typography.Text>
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
                    <Typography.Text type="secondary">司机/车辆</Typography.Text>
                    <br />
                    <Title level={3}>{drivers.length}/{vehicles.length}</Title>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={15}>
                  <Card title="物流管理中心" extra={<Tag color="blue">独立服务商工作台</Tag>}>
                    <List
                      dataSource={[
                        {
                          title: '待处理竞价与接单',
                          description: `${biddingOrders.length} 单待处理`,
                          icon: <DollarCircleOutlined />,
                          tab: 'bidding' as TabKey,
                        },
                        {
                          title: '待接单物流订单',
                          description: `${logisticsOrders.filter((item) => item.status === 'pending').length} 单等待接单`,
                          icon: <ClockCircleOutlined />,
                          tab: 'logistics-flow' as TabKey,
                        },
                        {
                          title: '在途履约',
                          description: `${logisticsOrders.filter((item) => item.status === 'accepted' || item.status === 'in_transit').length} 单正在运输`,
                          icon: <CarOutlined />,
                          tab: 'logistics-flow' as TabKey,
                        },
                        {
                          title: '已审核运力',
                          description: `${resources.filter((item) => item.status === 2).length} 条线路可参与匹配`,
                          icon: <CheckCircleOutlined />,
                          tab: 'resources' as TabKey,
                        },
                        {
                          title: '司机车辆主数据',
                          description: `${drivers.length} 名司机 / ${vehicles.length} 辆车辆`,
                          icon: <SafetyCertificateOutlined />,
                          tab: 'fleet' as TabKey,
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
                        进入竞价与接单
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
                      <Button
                        block
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => setActiveTab('fleet')}
                      >
                        维护司机车辆档案
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
                    <Typography.Text type="secondary">待处理订单</Typography.Text>
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
              <Card title="竞价与接单列表" extra={<Tag color="processing">状态 15/16</Tag>}>
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
                          if (status === 'task_created' || status === 'pending') {
                            const ready = record.status_requirements?.find((item) => item.status === 'pickup_scheduled')?.satisfied
                            return ready
                              ? { label: '预约提货', next: 'pickup_scheduled' }
                              : { label: '等待卖方提货指令', next: 'pickup_scheduled', externalAction: true }
                          }
                          if (status === 'pickup_scheduled' || status === 'accepted') return { label: '等待仓储到场确认', next: 'arrival_signed_in', externalAction: true }
                          if (status === 'arrival_signed_in') return { label: '等待仓储出库确认', next: 'outbound_confirmed', externalAction: true }
                          if (status === 'outbound_confirmed') return { label: '装货确认', next: 'loading_confirmed', docs: ['loading_voucher'] }
                          if (status === 'loading_confirmed') return { label: '发车', next: 'in_transit', docs: ['gps_track'] }
                          if (status === 'in_transit') return { label: '到货确认', next: 'arrival_confirmed', docs: ['delivery_photo'] }
                          if (status === 'arrival_confirmed') return { label: '等待收货仓验货入库', next: 'inbound_completed', externalAction: true }
                          if (status === 'inbound_completed') return { label: '等待买方/资金方确认收货', next: 'receipt_signed', buyerAction: true }
                          if (status === 'receipt_signed') return { label: '履约完成', next: 'completed' }
                          return null
                        }
                        const nextAction = getNextAction(record.status)
                        if (!nextAction) return null
                        if (nextAction.externalAction) {
                          return <Tag color="orange">{nextAction.label}</Tag>
                        }
                        if (nextAction.buyerAction) {
                          return <Tag color="blue">{nextAction.label}</Tag>
                        }
                        return (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => openStatusModal(record, nextAction.next, nextAction.label, nextAction.docs)}
                          >
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

          {activeTab === 'fleet' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">司机档案</Typography.Text>
                    <br />
                    <Title level={3}>{drivers.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">车辆档案</Typography.Text>
                    <br />
                    <Title level={3}>{vehicles.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">可用车辆</Typography.Text>
                    <br />
                    <Title level={3}>{vehicles.filter((item) => item.status !== 'inactive').length}</Title>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={11}>
                  <Card
                    title="司机档案"
                    extra={
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDriver}>
                        新增司机
                      </Button>
                    }
                  >
                    <Spin spinning={fleetLoading}>
                      <Table
                        rowKey="id"
                        dataSource={drivers}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 760 }}
                        columns={[
                          { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
                          { title: '电话', dataIndex: 'phone', key: 'phone', width: 130 },
                          {
                            title: '驾驶证',
                            dataIndex: 'license_no',
                            key: 'license_no',
                            width: 140,
                            render: (v: string) => v || '--',
                          },
                          {
                            title: '从业资格',
                            dataIndex: 'qualification_no',
                            key: 'qualification_no',
                            width: 140,
                            render: (v: string) => v || '--',
                          },
                          {
                            title: '状态',
                            dataIndex: 'status',
                            key: 'status',
                            width: 90,
                            render: (v: string) => (
                              <Tag color={v === 'inactive' ? 'default' : 'success'}>
                                {v === 'inactive' ? '停用' : '可用'}
                              </Tag>
                            ),
                          },
                          {
                            title: '操作',
                            key: 'action',
                            width: 90,
                            render: (_: unknown, record: LogisticsDriver) => (
                              <Button size="small" onClick={() => openEditDriver(record)}>
                                编辑
                              </Button>
                            ),
                          },
                        ]}
                        locale={{ emptyText: '暂无司机档案' }}
                      />
                    </Spin>
                  </Card>
                </Col>
                <Col xs={24} xl={13}>
                  <Card
                    title="车辆档案"
                    extra={
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCreateVehicle}>
                        新增车辆
                      </Button>
                    }
                  >
                    <Spin spinning={fleetLoading}>
                      <Table
                        rowKey="id"
                        dataSource={vehicles}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 880 }}
                        columns={[
                          { title: '车牌号', dataIndex: 'plate_number', key: 'plate_number', width: 110 },
                          {
                            title: '车型',
                            dataIndex: 'vehicle_type',
                            key: 'vehicle_type',
                            width: 110,
                            render: (v: string) => v || '--',
                          },
                          {
                            title: '载重',
                            dataIndex: 'load_capacity',
                            key: 'load_capacity',
                            width: 90,
                            render: (v: number) => (v ? `${v} 吨` : '--'),
                          },
                          {
                            title: '绑定司机',
                            dataIndex: 'driver_id',
                            key: 'driver_id',
                            width: 110,
                            render: (v: number) => drivers.find((driver) => driver.id === v)?.name || '--',
                          },
                          {
                            title: '保险有效期',
                            dataIndex: 'insurance_expire_at',
                            key: 'insurance_expire_at',
                            width: 120,
                            render: (v: string) => v || '--',
                          },
                          {
                            title: '状态',
                            dataIndex: 'status',
                            key: 'status',
                            width: 90,
                            render: (v: string) => (
                              <Tag color={v === 'inactive' ? 'default' : 'success'}>
                                {v === 'inactive' ? '停用' : '可用'}
                              </Tag>
                            ),
                          },
                          {
                            title: '操作',
                            key: 'action',
                            width: 90,
                            render: (_: unknown, record: LogisticsVehicle) => (
                              <Button size="small" onClick={() => openEditVehicle(record)}>
                                编辑
                              </Button>
                            ),
                          },
                        ]}
                        locale={{ emptyText: '暂无车辆档案' }}
                      />
                    </Spin>
                  </Card>
                </Col>
              </Row>
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

          <Modal
            title={`推进节点：${statusModal.label || '--'}`}
            open={statusModal.visible}
            onOk={handleStatusSubmit}
            onCancel={() => setStatusModal({ visible: false, order: null, nextStatus: '', label: '', requiredDocs: [] })}
            okText="上传并推进"
          >
            <Form form={statusForm} layout="vertical">
              {statusModal.nextStatus === 'pickup_scheduled' && (
                <Alert
                  type="info"
                  showIcon
                  message="需先读取卖方提货指令"
                  description="卖方上传提货单/提货指令后才能预约提货；如果没有文件 URL，请联系卖方补传。"
                  style={{ marginBottom: 16 }}
                />
              )}
              {statusModal.requiredDocs.length === 0 ? (
                <Paragraph type="secondary">该节点无需补充单据，确认后会直接推进物流状态。</Paragraph>
              ) : (
                statusModal.requiredDocs.map((docType) => (
                  <Form.Item
                    key={docType}
                    name={`doc_${docType}`}
                    label={`必要单据：${docType}`}
                    rules={[{ required: true, message: '请输入单据 URL' }]}
                  >
                    <Input placeholder="https://..." />
                  </Form.Item>
                ))
              )}
              <Form.Item name="remark" label="节点备注">
                <Input.TextArea rows={3} placeholder="选填" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={editingDriver ? '编辑司机档案' : '新增司机档案'}
            open={driverModalVisible}
            onOk={handleDriverSubmit}
            onCancel={() => setDriverModalVisible(false)}
            width={680}
            okText="保存"
          >
            <Form form={driverForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="司机姓名" rules={[{ required: true, message: '请输入司机姓名' }]}>
                    <Input placeholder="例：张师傅" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                    <Input placeholder="例：13800000000" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="id_card" label="身份证号">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="license_no" label="驾驶证号">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="license_expire_at" label="驾驶证有效期">
                    <Input placeholder="例：2028-12-31" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="qualification_no" label="从业资格证号">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="qualification_expire_at" label="从业资格有效期">
                    <Input placeholder="例：2028-12-31" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="状态">
                    <Select
                      options={[
                        { label: '可用', value: 'active' },
                        { label: '停用', value: 'inactive' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={editingVehicle ? '编辑车辆档案' : '新增车辆档案'}
            open={vehicleModalVisible}
            onOk={handleVehicleSubmit}
            onCancel={() => setVehicleModalVisible(false)}
            width={680}
            okText="保存"
          >
            <Form form={vehicleForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="plate_number" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
                    <Input placeholder="例：沪A12345" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="vehicle_type" label="车型">
                    <Select
                      placeholder="选择车型"
                      options={[
                        { label: '平板车', value: '平板车' },
                        { label: '厢式货车', value: '厢式货车' },
                        { label: '自卸车', value: '自卸车' },
                        { label: '集装箱车', value: '集装箱车' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="load_capacity" label="载重能力(吨)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="driver_id" label="绑定司机">
                    <Select
                      allowClear
                      placeholder="选择司机"
                      options={drivers.map((driver) => ({ label: `${driver.name} ${driver.phone}`, value: driver.id }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="vehicle_license" label="行驶证号">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="license_expire_at" label="行驶证有效期">
                    <Input placeholder="例：2028-12-31" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="insurance_no" label="保险单号">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="insurance_expire_at" label="保险有效期">
                    <Input placeholder="例：2028-12-31" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="status" label="状态">
                    <Select
                      options={[
                        { label: '可用', value: 'active' },
                        { label: '停用', value: 'inactive' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
