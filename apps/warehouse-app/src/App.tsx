import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Layout, List, Modal, Row, Space, Spin, Table, Tag, Typography, Input, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  HomeOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { warehouseOrderService, warehouseMovementService } from '@/services/orderService'
import type { OrderInfo, WarehouseMovement } from '@/services/orderService'
import { hasWarehouseCapability } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

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
  21: { label: '融资审批中', color: 'purple' },
  22: { label: '待签署融资合同', color: 'magenta' },
}

type TabKey = 'pending' | 'movements' | 'all'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [pendingOrders, setPendingOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [movements, setMovements] = useState<WarehouseMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [confirmRemark, setConfirmRemark] = useState('')
  const [confirmOk, setConfirmOk] = useState(true)

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

  useEffect(() => {
    if (activeTab === 'pending') fetchPending()
    else if (activeTab === 'all') fetchAll()
    else if (activeTab === 'movements') fetchMovements()
  }, [activeTab])

  const handleWarehouseConfirm = async () => {
    if (!confirmModal.orderId) return
    try {
      await warehouseOrderService.warehouseConfirm(confirmModal.orderId, {
        condition_ok: confirmOk,
        remark: confirmRemark || undefined,
      })
      message.success(confirmOk ? '仓库条件已确认' : '仓库条件已打回')
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
      message.success('状态已更新')
      fetchMovements()
    } catch {
      message.error('操作失败')
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
        const meta = statusMap[s] || { label: `状态${s}`, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, render: (v: string) => v?.slice(0, 19).replace('T', ' ') },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: OrderInfo) => {
        if (record.status === 12) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => { setConfirmOk(true); setConfirmModal({ visible: true, orderId: record.id }) }}
              >
                确认
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => { setConfirmOk(false); setConfirmModal({ visible: true, orderId: record.id }) }}
              >
                打回
              </Button>
            </Space>
          )
        }
        return <Tag>查看</Tag>
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
      render: (v: string) => <Tag color={v === 'inbound' ? 'green' : 'orange'}>{v === 'inbound' ? '入库' : '出库'}</Tag>,
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = { pending: 'default', in_progress: 'processing', completed: 'success', cancelled: 'error' }
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
            <Button type="primary" size="small" onClick={() => handleMovementStatus(record.id, 'in_progress')}>
              开始作业
            </Button>
          )
        }
        if (record.status === 'in_progress') {
          return (
            <Button type="primary" size="small" onClick={() => handleMovementStatus(record.id, 'completed')}>
              完成作业
            </Button>
          )
        }
        return null
      },
    },
  ]

  const menuItems = [
    { key: 'pending' as TabKey, label: '待确认订单', icon: <ExclamationCircleOutlined /> },
    { key: 'movements' as TabKey, label: '出入库管理', icon: <DatabaseOutlined /> },
    { key: 'all' as TabKey, label: '全部订单', icon: <InboxOutlined /> },
  ]

  if (!hasWarehouseCapability()) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={4}>需要仓储服务商权限</Title>
          <Paragraph type="secondary">当前账户未开通仓储服务商能力，请联系平台管理员申请开通。</Paragraph>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #edf0f5' }}>
          <Space>
            <BankOutlined style={{ color: '#16a34a' }} />
            <Text strong>SteelLink 仓储</Text>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#eaf8ee' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
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
        <Header style={{ background: '#fff', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>仓储方工作台</Text>
          <Space>
            <Button icon={<CalendarOutlined />} onClick={() => { if (activeTab === 'pending') fetchPending(); else if (activeTab === 'movements') fetchMovements(); else fetchAll(); }}>
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">买家首页</Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {activeTab === 'pending' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待确认订单</Typography.Text><br /><Title level={3}>{pendingOrders.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">今日出入库</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">监管库存</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
              </Row>
              <Card title="待仓库确认订单" extra={<Tag color="orange">状态 12</Tag>}>
                <Spin spinning={loading}>
                  <Table columns={orderColumns} dataSource={pendingOrders} rowKey="id" pagination={false} scroll={{ x: 940 }} locale={{ emptyText: '暂无待确认订单' }} />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'movements' && (
            <Card title="出入库管理" extra={<Tag color="green">仓库作业</Tag>}>
              <Spin spinning={loading}>
                <Table columns={movementColumns} dataSource={movements} rowKey="id" pagination={false} scroll={{ x: 720 }} locale={{ emptyText: '暂无出入库记录' }} />
              </Spin>
            </Card>
          )}

          {activeTab === 'all' && (
            <Card title="全部订单">
              <Spin spinning={loading}>
                <Table columns={orderColumns} dataSource={allOrders} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 940 }} locale={{ emptyText: '暂无订单' }} />
              </Spin>
            </Card>
          )}

          <Modal
            title={confirmOk ? '确认仓库条件' : '打回仓库条件'}
            open={confirmModal.visible}
            onOk={handleWarehouseConfirm}
            onCancel={() => { setConfirmModal({ visible: false, orderId: null }); setConfirmRemark('') }}
            okText={confirmOk ? '确认' : '打回'}
            okButtonProps={{ danger: !confirmOk }}
          >
            <Paragraph>
              {confirmOk
                ? '确认仓库条件满足，订单将进入"待卖方确认"状态。'
                : '仓库条件不满足，订单将被打回，需重新安排仓库。'}
            </Paragraph>
            <TextArea
              rows={3}
              placeholder="备注（选填）"
              value={confirmRemark}
              onChange={(e) => setConfirmRemark(e.target.value)}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
