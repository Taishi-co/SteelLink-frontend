import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Input, InputNumber, Layout, List, Modal, Row, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons'
import { logisticsOrderService, logisticsFulfillmentService } from '@/services/orderService'
import type { OrderInfo, LogisticsOrder } from '@/services/orderService'
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
}

type TabKey = 'bidding' | 'logistics-orders' | 'all'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('bidding')
  const [biddingOrders, setBiddingOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [logisticsOrders, setLogisticsOrders] = useState<LogisticsOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [quoteModal, setQuoteModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [quotePrice, setQuotePrice] = useState<number>(0)
  const [quoteDays, setQuoteDays] = useState<number>(3)
  const [quoteRemark, setQuoteRemark] = useState('')

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

  useEffect(() => {
    if (activeTab === 'bidding') fetchBidding()
    else if (activeTab === 'all') fetchAll()
    else if (activeTab === 'logistics-orders') fetchLogisticsOrders()
  }, [activeTab])

  const handleSubmitQuote = async () => {
    if (!quoteModal.orderId) return
    if (quotePrice <= 0) {
      message.warning('请输入有效报价')
      return
    }
    try {
      await logisticsOrderService.createQuote(quoteModal.orderId, {
        price: quotePrice,
        estimated_days: quoteDays,
        remark: quoteRemark || undefined,
      })
      message.success('报价已提交')
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
      message.success('已接单')
      fetchLogisticsOrders()
    } catch {
      message.error('接单失败')
    }
  }

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await logisticsFulfillmentService.updateOrderStatus(id, { status })
      message.success('状态已更新')
      fetchLogisticsOrders()
    } catch {
      message.error('操作失败')
    }
  }

  const handleShipmentProgress = async (orderId: number, action: string) => {
    try {
      await logisticsOrderService.shipmentProgress(orderId, action)
      message.success('运输状态已更新')
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
            <Button icon={<EnvironmentOutlined />} onClick={() => { if (activeTab === 'bidding') fetchBidding(); else if (activeTab === 'logistics-orders') fetchLogisticsOrders(); else fetchAll(); }}>
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
