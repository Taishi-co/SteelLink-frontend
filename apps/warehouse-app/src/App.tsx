import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, InputNumber, Layout, List, Modal, Row, Select, Space, Spin, Switch, Table, Tag, Typography, Input, message } from 'antd'
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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { warehouseOrderService, warehouseMovementService } from '@/services/orderService'
import type { OrderInfo, WarehouseMovement } from '@/services/orderService'
import { warehouseResourceService } from '@/services/warehouseResourceService'
import type { WarehouseResource, WarehouseResourcePayload } from '@/services/warehouseResourceService'
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
  23: { label: '待重新选仓', color: 'volcano' },
  24: { label: '待重新发起物流', color: 'volcano' },
}

const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

type TabKey = 'pending' | 'movements' | 'resources' | 'all'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [pendingOrders, setPendingOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [movements, setMovements] = useState<WarehouseMovement[]>([])
  const [resources, setResources] = useState<WarehouseResource[]>([])
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceModalVisible, setResourceModalVisible] = useState(false)
  const [editingResource, setEditingResource] = useState<WarehouseResource | null>(null)
  const [resourceForm] = Form.useForm<WarehouseResourcePayload>()
  const [loading, setLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [confirmRemark, setConfirmRemark] = useState('')
  const [confirmOk, setConfirmOk] = useState(true)

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
    if (activeTab === 'pending') fetchPending()
    else if (activeTab === 'all') fetchAll()
    else if (activeTab === 'movements') fetchMovements()
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
        confirmOk ? '订单流转到卖方工作台，等待卖方确认条款。' : '平台管理端已收到反馈，买方需重新选择仓储方。',
        'all',
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
      showCompleted('仓库作业状态更新已完成', status === 'completed' ? '等待后续物流或签收节点。' : '继续处理仓库作业，完成后更新为已完成。', 'movements')
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
    { key: 'resources' as TabKey, label: '仓库资源管理', icon: <AppstoreOutlined /> },
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
            <Button icon={<CalendarOutlined />} onClick={() => { if (activeTab === 'pending') fetchPending(); else if (activeTab === 'movements') fetchMovements(); else if (activeTab === 'resources') fetchResources(); else fetchAll(); }}>
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

          {activeTab === 'resources' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">仓库资源总数</Typography.Text><br /><Title level={3}>{resources.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已通过</Typography.Text><br /><Title level={3}>{resources.filter(r => r.status === 2).length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待审核</Typography.Text><br /><Title level={3}>{resources.filter(r => r.status === 1).length}</Title></Card>
                </Col>
              </Row>
              <Card
                title="仓库资源管理"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateResource}>新建仓库资源</Button>}
              >
                <Spin spinning={resourceLoading}>
                  <Table
                    columns={[
                      { title: '仓库名称', dataIndex: 'warehouse_name', key: 'warehouse_name', width: 160 },
                      { title: '省/市/区', key: 'region', width: 140, render: (_: unknown, r: WarehouseResource) => `${r.province || ''}${r.city || ''}${r.district || ''}` },
                      { title: '地址', dataIndex: 'address', key: 'address', width: 180, ellipsis: true },
                      { title: '总容量', dataIndex: 'capacity', key: 'capacity', width: 90, render: (v: number) => v ? `${v}` : '--' },
                      { title: '可用容量', dataIndex: 'available_capacity', key: 'available_capacity', width: 90, render: (v: number) => v ? `${v}` : '--' },
                      {
                        title: '服务类型',
                        dataIndex: 'service_types',
                        key: 'service_types',
                        width: 140,
                        render: (v: string[]) => v?.length ? v.map((t, i) => <Tag key={i}>{t}</Tag>) : '--',
                      },
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
                        render: (_: unknown, record: WarehouseResource) => (
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
                      <Form.Item name="warehouse_name" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
                        <Input placeholder="例：华东一号仓" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="address" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
                        <Input placeholder="例：上海市浦东新区XX路100号" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="province" label="省份"><Input placeholder="省" /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="city" label="城市"><Input placeholder="市" /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="district" label="区/县"><Input placeholder="区" /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="capacity" label="总容量(吨)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="available_capacity" label="可用容量(吨)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="loading_capacity" label="装卸能力"><Input placeholder="例：500吨/日" /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="service_types" label="服务类型">
                        <Select mode="multiple" placeholder="选择服务类型" options={[
                          { label: '仓储保管', value: '仓储保管' },
                          { label: '代储代管', value: '代储代管' },
                          { label: '质押监管', value: '质押监管' },
                          { label: '过户交割', value: '过户交割' },
                          { label: '加工分拣', value: '加工分拣' },
                        ]} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="business_hours" label="营业时间"><Input placeholder="例：周一至周五 8:00-18:00" /></Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="price_rule" label="价格规则"><Input placeholder="例：30元/吨/天" /></Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="outbound_voucher_req" label="出库凭证要求"><Input placeholder="例：需卖方盖章出库单" /></Form.Item>
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
                : '仓库条件不满足时，订单会反馈平台管理端，并回退给买方重新选择仓储方。'}
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
