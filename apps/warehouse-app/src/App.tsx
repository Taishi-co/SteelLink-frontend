import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  InputNumber,
  Layout,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  Input,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  HomeOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { warehouseOrderService, warehouseMovementService, warehouseInventoryService, warehouseLogisticsService } from '@/services/orderService'
import type { LogisticsOrder, OrderInfo, WarehouseInventorySnapshot, WarehouseMovement } from '@/services/orderService'
import { warehouseResourceService } from '@/services/warehouseResourceService'
import type {
  WarehouseResource,
  WarehouseResourcePayload,
} from '@/services/warehouseResourceService'
import { hasWarehouseCapability, saveWarehouseToken } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  12: { label: '待选择目的地仓储', color: 'geekblue' },
  13: { label: '待仓库确认', color: 'orange' },
  14: { label: '待卖方确认', color: 'blue' },
  15: { label: '待买方确认', color: 'blue' },
  2: { label: '待签合同', color: 'cyan' },
  3: { label: '待付款', color: 'gold' },
  4: { label: '待确认收款', color: 'purple' },
  5: { label: '待提货', color: 'geekblue' },
  16: { label: '物流竞价中', color: 'processing' },
  17: { label: '待确认物流', color: 'blue' },
  18: { label: '运输中', color: 'cyan' },
  6: { label: '已发货', color: 'cyan' },
  7: { label: '已到货', color: 'green' },
  19: { label: '已收货', color: 'green' },
  8: { label: '已完成', color: 'success' },
  20: { label: '已对账', color: 'success' },
  21: { label: '已归档', color: 'default' },
  22: { label: '融资审批中', color: 'purple' },
  23: { label: '待签署融资合同', color: 'magenta' },
  24: { label: '待重新选仓', color: 'volcano' },
  25: { label: '待重新发起物流', color: 'volcano' },
  26: { label: '待选择仓库', color: 'geekblue' },
}

const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

type TabKey = 'dashboard' | 'pending' | 'movements' | 'logistics' | 'inventory' | 'resources' | 'all'

function isTabKey(value: string | null): value is TabKey {
  return Boolean(value && ['dashboard', 'pending', 'movements', 'logistics', 'inventory', 'resources', 'all'].includes(value))
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [pendingOrders, setPendingOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [movements, setMovements] = useState<WarehouseMovement[]>([])
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([])
  const [inventorySnapshots, setInventorySnapshots] = useState<WarehouseInventorySnapshot[]>([])
  const [resources, setResources] = useState<WarehouseResource[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceModalVisible, setResourceModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<WarehouseResource | null>(null)
  const [resourceForm] = Form.useForm<WarehouseResourcePayload>()
  const [inventoryForm] = Form.useForm()
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false)
  const [editingInventory, setEditingInventory] = useState<WarehouseInventorySnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; orderId: number | null }>({
    visible: false,
    orderId: null,
  })
  const [confirmRemark, setConfirmRemark] = useState('')
  const [confirmOk, setConfirmOk] = useState(true)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null)
  const [tokenReady, setTokenReady] = useState(false)
  const [logisticsModal, setLogisticsModal] = useState<{ visible: boolean; order: LogisticsOrder | null; nextStatus: string; label: string; requiredDocs: string[] }>({
    visible: false,
    order: null,
    nextStatus: '',
    label: '',
    requiredDocs: [],
  })
  const [logisticsForm] = Form.useForm<Record<string, string>>()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const tab = urlParams.get('tab')
    if (token) {
      saveWarehouseToken(token)
    }
    if (isTabKey(tab)) {
      setActiveTab(tab)
    }
    if (token || tab) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    setTokenReady(true)
  }, [])

  const formatDateTime = (value?: string) => (value ? value.slice(0, 19).replace('T', ' ') : '--')
  const formatMoney = (value?: number) => `¥${(value || 0).toLocaleString()}`
  const statusTag = (status?: number) => {
    const meta = statusMap[status || 0] || { label: `状态${status}`, color: 'default' }
    return <Tag color={meta.color}>{meta.label}</Tag>
  }

  const showCompleted = (title: string, next: string, targetTab: TabKey = 'all') => {
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

  const fetchPending = async () => {
    setLoading(true)
    try {
      const list = await warehouseOrderService.listPending()
      setPendingOrders(list || [])
    } catch {
      message.error('获取待确认订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const list = await warehouseOrderService.listAll()
      setAllOrders(list || [])
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const list = await warehouseMovementService.list()
      setMovements(list || [])
    } catch {
      message.error('获取出入库记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogisticsOrders = async () => {
    setLoading(true)
    try {
      const list = await warehouseLogisticsService.listOrders()
      setLogisticsOrders(list || [])
    } catch {
      message.error('获取物流履约单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const list = await warehouseInventoryService.list()
      setInventorySnapshots(list || [])
    } catch {
      message.error('获取库存快照失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    setResourceLoading(true)
    try {
      const list = await warehouseResourceService.listMine()
      setResources(list || [])
    } catch {
      message.error('获取仓库资源列表失败')
    } finally {
      setResourceLoading(false)
    }
  }

  const openCreateResource = () => {
    setEditingResource(null)
    resourceForm.resetFields()
    setResourceModalVisible(true)
  }

  const openEditResource = (record: WarehouseResource) => {
    setEditingResource(record)
    resourceForm.setFieldsValue({
      warehouse_name: record.warehouse_name,
      province: record.province,
      city: record.city,
      district: record.district,
      address: record.address,
      capacity: record.capacity,
      available_capacity: record.available_capacity,
      service_types: record.service_types,
      price_rule: record.price_rule,
      loading_capacity: record.loading_capacity,
      business_hours: record.business_hours,
      pledge_supervision: record.pledge_supervision,
      outbound_voucher_req: record.outbound_voucher_req,
      description: record.description,
    })
    setResourceModalVisible(true)
  }

  const openCreateInventory = () => {
    setEditingInventory(null)
    inventoryForm.resetFields()
    inventoryForm.setFieldsValue({
      quantity: 0,
      frozen_quantity: 0,
      quality_status: 'unchecked',
      pledge_status: 'none',
      sync_status: 'manual',
    })
    setInventoryModalVisible(true)
  }

  const openEditInventory = (record: WarehouseInventorySnapshot) => {
    setEditingInventory(record)
    inventoryForm.setFieldsValue(record)
    setInventoryModalVisible(true)
  }

  const handleInventorySubmit = async () => {
    try {
      const values = await inventoryForm.validateFields()
      if (editingInventory) {
        await warehouseInventoryService.update(editingInventory.id, values)
        message.success('库存快照已更新')
      } else {
        await warehouseInventoryService.create(values)
        message.success('库存快照已创建')
      }
      setInventoryModalVisible(false)
      fetchInventory()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('保存库存快照失败')
    }
  }

  const handleResourceSubmit = async () => {
    try {
      const values = await resourceForm.validateFields()
      if (editingResource) {
        await warehouseResourceService.update(editingResource.id, values)
        message.success('仓库资源更新成功')
      } else {
        await warehouseResourceService.create(values as WarehouseResourcePayload)
        message.success('仓库资源创建成功，等待平台审核')
      }
      setResourceModalVisible(false)
      fetchResources()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('操作失败')
    }
  }

  const handleResourceOffline = async (record: WarehouseResource) => {
    Modal.confirm({
      title: '确认下线该仓库资源？',
      content: `仓库：${record.warehouse_name}，下线后买家将无法看到该资源。`,
      okText: '确认下线',
      okType: 'danger',
      onOk: async () => {
        try {
          await warehouseResourceService.delete(record.id)
          message.success('仓库资源已下线')
          fetchResources()
        } catch {
          message.error('下线失败')
        }
      },
    })
  }

	useEffect(() => {
		if (activeTab === 'dashboard') {
			fetchPending()
			fetchMovements()
			fetchLogisticsOrders()
			fetchInventory()
			fetchResources()
			fetchAll()
		} else if (activeTab === 'pending') fetchPending()
		else if (activeTab === 'all') fetchAll()
		else if (activeTab === 'movements') fetchMovements()
		else if (activeTab === 'logistics') fetchLogisticsOrders()
		else if (activeTab === 'inventory') fetchInventory()
		else if (activeTab === 'resources') fetchResources()
	}, [activeTab])

  const handleWarehouseConfirm = async () => {
    if (!confirmModal.orderId) return
    try {
      await warehouseOrderService.warehouseConfirm(confirmModal.orderId, {
        confirmed: confirmOk,
        condition_note: confirmRemark || undefined,
      })
      showCompleted(
        confirmOk ? '仓库条件确认已完成' : '仓储拒绝反馈已完成',
        confirmOk
          ? '订单流转到卖方工作台，等待卖方确认条款。'
          : '平台管理端已收到反馈，买方需重新选择仓储方。',
        'all'
      )
      setConfirmModal({ visible: false, orderId: null })
      setConfirmRemark('')
      fetchPending()
    } catch {
      message.error('操作失败')
    }
  }

  const handleMovementStatus = async (id: number, status: string) => {
    try {
      await warehouseMovementService.updateStatus(id, { status })
      showCompleted(
        '仓库作业状态更新已完成',
        status === 'completed'
          ? '等待后续物流或签收节点。'
          : '继续处理仓库作业，完成后更新为已完成。',
        'movements'
      )
      fetchMovements()
    } catch {
      message.error('操作失败')
    }
  }

  const openLogisticsModal = (order: LogisticsOrder, nextStatus: string, label: string, requiredDocs: string[] = []) => {
    setLogisticsModal({ visible: true, order, nextStatus, label, requiredDocs })
    logisticsForm.resetFields()
  }

  const handleLogisticsNodeSubmit = async () => {
    if (!logisticsModal.order) return
    try {
      const values = await logisticsForm.validateFields()
      for (const docType of logisticsModal.requiredDocs) {
        const fileURL = values[`doc_${docType}`]
        if (fileURL) {
          await warehouseLogisticsService.uploadDocument(logisticsModal.order.id, {
            doc_type: docType,
            file_url: fileURL,
            remark: values.remark,
          })
        }
      }
      await warehouseLogisticsService.updateStatus(logisticsModal.order.id, {
        status: logisticsModal.nextStatus,
        remark: values.remark,
      })
      message.success('物流仓储节点已更新')
      setLogisticsModal({ visible: false, order: null, nextStatus: '', label: '', requiredDocs: [] })
      fetchLogisticsOrders()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('更新物流节点失败，请确认必要单据已上传')
    }
  }

  const openOrderDetail = async (record: OrderInfo) => {
    setDetailModalVisible(true)
    setSelectedOrder(record)
    setDetailLoading(true)
    try {
      const detail = await warehouseOrderService.getById(record.id)
      setSelectedOrder(detail)
    } catch {
      message.error('获取订单详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const orderColumns: ColumnsType<OrderInfo> = [
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
        return statusTag(s)
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: OrderInfo) => {
        if (record.status === 13) {
          return (
            <Space>
              <Button size="small" onClick={() => openOrderDetail(record)}>
                查看
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setConfirmOk(true)
                  setConfirmModal({ visible: true, orderId: record.id })
                }}
              >
                确认
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setConfirmOk(false)
                  setConfirmModal({ visible: true, orderId: record.id })
                }}
              >
                打回
              </Button>
            </Space>
          )
        }
        return (
          <Button size="small" onClick={() => openOrderDetail(record)}>
            查看
          </Button>
        )
      },
    },
  ]

  const movementColumns: ColumnsType<WarehouseMovement> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '商品', dataIndex: 'product_name', key: 'product_name', width: 120 },
    {
      title: '类型',
      dataIndex: 'movement_type',
      key: 'movement_type',
      width: 80,
      render: (v: string) => (
        <Tag color={v === 'inbound' ? 'green' : 'orange'}>{v === 'inbound' ? '入库' : '出库'}</Tag>
      ),
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          pending: 'default',
          in_progress: 'processing',
          completed: 'success',
          cancelled: 'error',
        }
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: WarehouseMovement) => {
        if (record.status === 'pending') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleMovementStatus(record.id, 'in_progress')}
            >
              开始作业
            </Button>
          )
        }
        if (record.status === 'in_progress') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleMovementStatus(record.id, 'completed')}
            >
              完成作业
            </Button>
          )
        }
        return null
      },
    },
  ]

  const menuItems = [
    { key: 'dashboard' as TabKey, label: '工作台概览', icon: <DashboardOutlined /> },
    { key: 'pending' as TabKey, label: '待确认订单', icon: <ExclamationCircleOutlined /> },
    { key: 'movements' as TabKey, label: '出入库管理', icon: <DatabaseOutlined /> },
    { key: 'logistics' as TabKey, label: '物流履约协同', icon: <SafetyCertificateOutlined /> },
    { key: 'inventory' as TabKey, label: '库存快照', icon: <SafetyCertificateOutlined /> },
    { key: 'resources' as TabKey, label: '仓库资源管理', icon: <AppstoreOutlined /> },
    { key: 'all' as TabKey, label: '全部订单', icon: <InboxOutlined /> },
  ]

  if (!tokenReady) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    )
  }

  if (!hasWarehouseCapability()) {
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
          <Title level={4}>需要仓储服务商权限</Title>
          <Paragraph type="secondary">
            当前账户未开通仓储服务商能力，请联系平台管理员申请开通。
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
              <Text strong style={{ display: 'block', color: '#17221b' }}>锐联仓储</Text>
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
                    {item.key === 'pending' && pendingOrders.length > 0 && (
                      <Badge count={pendingOrders.length} style={{ marginLeft: 8 }} />
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
            <Text strong style={{ display: 'block', color: '#17221b', fontSize: 16 }}>仓储方工作台</Text>
            <Text style={{ color: '#7a847a', fontSize: 12 }}>仓库资源、出入库、库存快照与物流履约协同</Text>
          </div>
          <Space>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => {
                if (activeTab === 'dashboard') {
                  fetchPending()
                  fetchMovements()
                  fetchLogisticsOrders()
                  fetchResources()
                  fetchAll()
                } else if (activeTab === 'pending') fetchPending()
                else if (activeTab === 'movements') fetchMovements()
                else if (activeTab === 'logistics') fetchLogisticsOrders()
                else if (activeTab === 'inventory') fetchInventory()
                else if (activeTab === 'resources') fetchResources()
                else fetchAll()
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
                    <Typography.Text type="secondary">待确认订单</Typography.Text>
                    <br />
                    <Title level={3}>{pendingOrders.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">出入库记录</Typography.Text>
                    <br />
                    <Title level={3}>{movements.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">仓库资源</Typography.Text>
                    <br />
                    <Title level={3}>{resources.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Typography.Text type="secondary">物流协同单</Typography.Text>
                    <br />
                    <Title level={3}>{logisticsOrders.length}</Title>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={15}>
                  <Card title="仓储管理中心" extra={<Tag color="green">独立服务商工作台</Tag>}>
                    <List
                      dataSource={[
                        {
                          title: '待仓库确认订单',
                          description: `${pendingOrders.length} 单等待仓储方确认`,
                          icon: <ExclamationCircleOutlined />,
                          tab: 'pending' as TabKey,
                        },
                        {
                          title: '待处理出入库',
                          description: `${movements.filter((item) => item.status === 'pending').length} 笔作业等待开始`,
                          icon: <DatabaseOutlined />,
                          tab: 'movements' as TabKey,
                        },
                        {
                          title: '作业中记录',
                          description: `${movements.filter((item) => item.status === 'in_progress').length} 笔作业正在处理`,
                          icon: <CalendarOutlined />,
                          tab: 'movements' as TabKey,
                        },
                        {
                          title: '物流到场/出入库协同',
                          description: `${logisticsOrders.filter((item) => ['pickup_scheduled', 'arrival_signed_in', 'arrival_confirmed'].includes(item.status)).length} 单待仓储协同`,
                          icon: <SafetyCertificateOutlined />,
                          tab: 'logistics' as TabKey,
                        },
                        {
                          title: '已审核仓库',
                          description: `${resources.filter((item) => item.status === 2).length} 个仓库可对外服务`,
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
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => setActiveTab('pending')}
                      >
                        处理待确认订单
                      </Button>
                      <Button
                        block
                        icon={<DatabaseOutlined />}
                        onClick={() => setActiveTab('movements')}
                      >
                        进入出入库管理
                      </Button>
                      <Button
                        block
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => setActiveTab('logistics')}
                      >
                        处理物流履约协同
                      </Button>
                      <Button
                        block
                        icon={<AppstoreOutlined />}
                        onClick={() => setActiveTab('resources')}
                      >
                        管理仓库资源
                      </Button>
                      <Button block icon={<InboxOutlined />} onClick={() => setActiveTab('all')}>
                        查看全部订单
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {activeTab === 'pending' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">待确认订单</Typography.Text>
                    <br />
                    <Title level={3}>{pendingOrders.length}</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">今日出入库</Typography.Text>
                    <br />
                    <Title level={3}>--</Title>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">监管库存</Typography.Text>
                    <br />
                    <Title level={3}>--</Title>
                  </Card>
                </Col>
              </Row>
              <Card title="待仓库确认订单" extra={<Tag color="orange">状态 13</Tag>}>
                <Spin spinning={loading}>
                  <Table
                    columns={orderColumns}
                    dataSource={pendingOrders}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 940 }}
                    locale={{ emptyText: '暂无待确认订单' }}
                  />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'movements' && (
            <Card title="出入库管理" extra={<Tag color="green">仓库作业</Tag>}>
              <Spin spinning={loading}>
                <Table
                  columns={movementColumns}
                  dataSource={movements}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 720 }}
                  locale={{ emptyText: '暂无出入库记录' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'logistics' && (
            <Card title="物流履约协同" extra={<Tag color="green">到场 / 出库 / 入库</Tag>}>
              <Spin spinning={loading}>
                <Table
                  rowKey="id"
                  dataSource={logisticsOrders}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 980 }}
                  columns={[
                    { title: '物流单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
                    { title: '起始地', dataIndex: 'origin', key: 'origin', width: 180, ellipsis: true },
                    { title: '目的地', dataIndex: 'destination', key: 'destination', width: 180, ellipsis: true },
                    { title: '货物', dataIndex: 'cargo_name', key: 'cargo_name', width: 120 },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 130,
                      render: (v: string) => <Tag>{v}</Tag>,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 220,
                      render: (_: unknown, record: LogisticsOrder) => {
                        if (record.status === 'pickup_scheduled') {
                          return <Button size="small" type="primary" onClick={() => openLogisticsModal(record, 'arrival_signed_in', '确认车辆到场')}>确认到场</Button>
                        }
                        if (record.status === 'arrival_signed_in') {
                          return (
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => openLogisticsModal(record, 'outbound_confirmed', '确认出库', ['outbound_order', 'seal_photo'])}
                            >
                              上传出库/封条并确认
                            </Button>
                          )
                        }
                        if (record.status === 'arrival_confirmed') {
                          return (
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => openLogisticsModal(record, 'inbound_completed', '收货仓验货入库', ['seal_photo', 'inbound_order', 'receipt_order'])}
                            >
                              上传封条/入库/收货单
                            </Button>
                          )
                        }
                        return <Text type="secondary">等待其他方</Text>
                      },
                    },
                  ]}
                  locale={{ emptyText: '暂无需要仓储协同的物流单' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'inventory' && (
            <Card
              title="库存快照"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateInventory}>
                  新增库存快照
                </Button>
              }
            >
              <Spin spinning={loading}>
                <Table
                  rowKey="id"
                  dataSource={inventorySnapshots}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                  columns={[
                    { title: '快照号', dataIndex: 'snapshot_no', key: 'snapshot_no', width: 160 },
                    { title: '商品', dataIndex: 'product_name', key: 'product_name', width: 140 },
                    { title: '批次', dataIndex: 'batch_no', key: 'batch_no', width: 100, render: (v: string) => v || '--' },
                    { title: '库位', dataIndex: 'location_code', key: 'location_code', width: 100, render: (v: string) => v || '--' },
                    { title: '库存', dataIndex: 'quantity', key: 'quantity', width: 90, render: (v: number) => `${Number(v || 0).toLocaleString()} 吨` },
                    { title: '冻结', dataIndex: 'frozen_quantity', key: 'frozen_quantity', width: 90, render: (v: number) => `${Number(v || 0).toLocaleString()} 吨` },
                    { title: '质检', dataIndex: 'quality_status', key: 'quality_status', width: 90 },
                    { title: '质押', dataIndex: 'pledge_status', key: 'pledge_status', width: 90 },
                    { title: '同步', dataIndex: 'sync_status', key: 'sync_status', width: 90 },
                    { title: '外部单号', dataIndex: 'external_ref_no', key: 'external_ref_no', width: 140, render: (v: string) => v || '--' },
                    {
                      title: '操作',
                      key: 'action',
                      width: 90,
                      render: (_: unknown, record: WarehouseInventorySnapshot) => (
                        <Button size="small" onClick={() => openEditInventory(record)}>编辑</Button>
                      ),
                    },
                  ]}
                  locale={{ emptyText: '暂无库存快照，可先手工录入，后续对接 WMS/MRP 同步' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'all' && (
            <Card title="全部订单">
              <Spin spinning={loading}>
                <Table
                  columns={orderColumns}
                  dataSource={allOrders}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 940 }}
                  locale={{ emptyText: '暂无订单' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'resources' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card>
                    <Typography.Text type="secondary">仓库资源总数</Typography.Text>
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
                title="仓库资源管理"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateResource}>
                    新建仓库资源
                  </Button>
                }
              >
                <Spin spinning={resourceLoading}>
                  <Table
                    columns={[
                      {
                        title: '仓库名称',
                        dataIndex: 'warehouse_name',
                        key: 'warehouse_name',
                        width: 160,
                      },
                      {
                        title: '省/市/区',
                        key: 'region',
                        width: 140,
                        render: (_: unknown, r: WarehouseResource) =>
                          `${r.province || ''}${r.city || ''}${r.district || ''}`,
                      },
                      {
                        title: '地址',
                        dataIndex: 'address',
                        key: 'address',
                        width: 180,
                        ellipsis: true,
                      },
                      {
                        title: '总容量',
                        dataIndex: 'capacity',
                        key: 'capacity',
                        width: 90,
                        render: (v: number) => (v ? `${v}` : '--'),
                      },
                      {
                        title: '可用容量',
                        dataIndex: 'available_capacity',
                        key: 'available_capacity',
                        width: 90,
                        render: (v: number) => (v ? `${v}` : '--'),
                      },
                      {
                        title: '服务类型',
                        dataIndex: 'service_types',
                        key: 'service_types',
                        width: 140,
                        render: (v: string[]) =>
                          v?.length ? v.map((t, i) => <Tag key={i}>{t}</Tag>) : '--',
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
                        render: (_: unknown, record: WarehouseResource) => (
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
                    locale={{ emptyText: '暂无仓库资源，点击"新建仓库资源"开始上架' }}
                  />
                </Spin>
              </Card>

              <Modal
                title={editingResource ? '编辑仓库资源' : '新建仓库资源'}
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
                        name="warehouse_name"
                        label="仓库名称"
                        rules={[{ required: true, message: '请输入仓库名称' }]}
                      >
                        <Input placeholder="例：华东一号仓" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="address"
                        label="详细地址"
                        rules={[{ required: true, message: '请输入详细地址' }]}
                      >
                        <Input placeholder="例：上海市浦东新区XX路100号" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="province" label="省份">
                        <Input placeholder="省" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="city" label="城市">
                        <Input placeholder="市" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="district" label="区/县">
                        <Input placeholder="区" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="capacity" label="总容量(吨)">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="available_capacity" label="可用容量(吨)">
                        <InputNumber style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="loading_capacity" label="装卸能力">
                        <Input placeholder="例：500吨/日" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="service_types" label="服务类型">
                        <Select
                          mode="multiple"
                          placeholder="选择服务类型"
                          options={[
                            { label: '仓储保管', value: '仓储保管' },
                            { label: '代储代管', value: '代储代管' },
                            { label: '质押监管', value: '质押监管' },
                            { label: '过户交割', value: '过户交割' },
                            { label: '加工分拣', value: '加工分拣' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="business_hours" label="营业时间">
                        <Input placeholder="例：周一至周五 8:00-18:00" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="price_rule" label="价格规则">
                        <Input placeholder="例：30元/吨/天" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="outbound_voucher_req" label="出库凭证要求">
                        <Input placeholder="例：需卖方盖章出库单" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="pledge_supervision" label="支持质押监管" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="description" label="描述">
                    <Input.TextArea rows={3} placeholder="仓库特色、资质、服务优势等" />
                  </Form.Item>
                </Form>
              </Modal>
            </>
          )}

          <Modal
            title={editingInventory ? '编辑库存快照' : '新增库存快照'}
            open={inventoryModalVisible}
            onOk={handleInventorySubmit}
            onCancel={() => setInventoryModalVisible(false)}
            width={720}
            okText="保存"
          >
            <Form form={inventoryForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="warehouse_service_id" label="仓储资源ID" rules={[{ required: true, message: '请输入仓储资源ID' }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="product_name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                    <Input placeholder="例：热轧卷" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="bundle_no" label="捆包号">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="batch_no" label="批次号">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="location_code" label="库位">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="quantity" label="当前库存" rules={[{ required: true, message: '请输入库存数量' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="吨" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="frozen_quantity" label="冻结/质押数量">
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="吨" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="quality_status" label="质检状态">
                    <Select options={[
                      { value: 'unchecked', label: '未质检' },
                      { value: 'passed', label: '通过' },
                      { value: 'failed', label: '异常' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="pledge_status" label="质押状态">
                    <Select options={[
                      { value: 'none', label: '未质押' },
                      { value: 'frozen', label: '已冻结' },
                      { value: 'released', label: '已释放' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="sync_status" label="同步状态">
                    <Select options={[
                      { value: 'manual', label: '手工录入' },
                      { value: 'synced', label: '已同步' },
                      { value: 'failed', label: '同步失败' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="external_system" label="外部系统">
                    <Input placeholder="例：WMS/MRP" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="external_ref_no" label="外部单号">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="remark" label="备注">
                <TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={`物流履约节点：${logisticsModal.label || '--'}`}
            open={logisticsModal.visible}
            onOk={handleLogisticsNodeSubmit}
            onCancel={() => setLogisticsModal({ visible: false, order: null, nextStatus: '', label: '', requiredDocs: [] })}
            okText="上传并确认"
          >
            <Form form={logisticsForm} layout="vertical">
              {logisticsModal.requiredDocs.length === 0 ? (
                <Paragraph type="secondary">该节点无需上传单据，确认后会推进物流状态。</Paragraph>
              ) : (
                logisticsModal.requiredDocs.map((docType) => (
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
                <TextArea rows={3} placeholder="选填" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={confirmOk ? '确认仓库条件' : '打回仓库条件'}
            open={confirmModal.visible}
            onOk={handleWarehouseConfirm}
            onCancel={() => {
              setConfirmModal({ visible: false, orderId: null })
              setConfirmRemark('')
            }}
            okText={confirmOk ? '确认' : '打回'}
            okButtonProps={{ danger: !confirmOk }}
          >
            <Paragraph>
              {confirmOk
                ? '确认仓库条件满足，订单将进入"待卖方确认"状态。'
                : '仓库条件不满足时，订单会反馈平台管理端，并回退给买方重新选择仓储方。'}
            </Paragraph>
            <TextArea
              rows={3}
              placeholder="备注（选填）"
              value={confirmRemark}
              onChange={(e) => setConfirmRemark(e.target.value)}
            />
          </Modal>

          <Modal
            title={selectedOrder ? `订单详情 ${selectedOrder.order_no}` : '订单详情'}
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={<Button onClick={() => setDetailModalVisible(false)}>关闭</Button>}
            width={920}
          >
            <Spin spinning={detailLoading}>
              {selectedOrder && (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="订单号">{selectedOrder.order_no}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {statusTag(selectedOrder.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="买方">
                      {selectedOrder.buyer_name || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label="卖方">
                      {selectedOrder.seller_name || '--'}
                    </Descriptions.Item>
                    <Descriptions.Item label="总数量">
                      {selectedOrder.total_quantity || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="订单金额">
                      {formatMoney(selectedOrder.total_amount)}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {formatDateTime(selectedOrder.created_at)}
                    </Descriptions.Item>
                    <Descriptions.Item label="币种">
                      {selectedOrder.currency || 'CNY'}
                    </Descriptions.Item>
                  </Descriptions>

                  <Card size="small" title="仓储与交付">
                    <Descriptions size="small" column={2}>
                      <Descriptions.Item label="仓库">
                        {selectedOrder.delivery_info?.warehouse_name || '--'}
                      </Descriptions.Item>
                      <Descriptions.Item label="仓库编码">
                        {selectedOrder.delivery_info?.warehouse_code || '--'}
                      </Descriptions.Item>
                      <Descriptions.Item label="仓库地址">
                        {selectedOrder.delivery_info?.warehouse_address ||
                          selectedOrder.delivery_info?.address ||
                          '--'}
                      </Descriptions.Item>
                      <Descriptions.Item label="收货地址">
                        {selectedOrder.delivery_info?.address || '--'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card size="small" title="商品明细">
                    <Table
                      size="small"
                      columns={[
                        { title: '商品', dataIndex: 'product_name', key: 'product_name' },
                        {
                          title: '商品编号',
                          dataIndex: 'product_no',
                          key: 'product_no',
                          width: 140,
                        },
                        { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 90 },
                        {
                          title: '单价',
                          dataIndex: 'unit_price',
                          key: 'unit_price',
                          width: 110,
                          render: (v: number) => formatMoney(v),
                        },
                        {
                          title: '金额',
                          dataIndex: 'total_amount',
                          key: 'total_amount',
                          width: 120,
                          render: (v: number) => formatMoney(v),
                        },
                      ]}
                      dataSource={selectedOrder.items || []}
                      rowKey={(item) => `${item.product_id}-${item.product_no}`}
                      pagination={false}
                      locale={{ emptyText: '暂无商品明细' }}
                    />
                  </Card>
                </Space>
              )}
            </Spin>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
