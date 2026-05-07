import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Input, InputNumber, Layout, List, Modal, Row, Space, Spin, Steps, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  DollarCircleOutlined,
  FileSearchOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { financeOrderService } from '@/services/orderService'
import type { OrderInfo } from '@/services/orderService'
import { hasFinanceCapability } from '@/services/auth'

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
  21: { label: '融资审批中', color: 'purple' },
  22: { label: '待签署融资合同', color: 'magenta' },
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

type TabKey = 'risk-review' | 'debt-contract' | 'all'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('risk-review')
  const [riskOrders, setRiskOrders] = useState<OrderInfo[]>([])
  const [debtOrders, setDebtOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(false)

  const [riskModal, setRiskModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [riskApproved, setRiskApproved] = useState(true)
  const [riskAmount, setRiskAmount] = useState<number>(0)
  const [riskScore, setRiskScore] = useState<number>(0)
  const [riskRemark, setRiskRemark] = useState('')

  const [disburseModal, setDisburseModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [disburseAmount, setDisburseAmount] = useState<number>(0)
  const [disburseTxNo, setDisburseTxNo] = useState('')

  const fetchRiskOrders = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listFinancing()
      setRiskOrders(list || [])
    } catch {
      message.error('获取融资审批订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchDebtOrders = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listPendingDebt()
      setDebtOrders(list || [])
    } catch {
      message.error('获取待签署合同订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listAll()
      setAllOrders(list || [])
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'risk-review') fetchRiskOrders()
    else if (activeTab === 'debt-contract') fetchDebtOrders()
    else if (activeTab === 'all') fetchAll()
  }, [activeTab])

  const handleSubmitRisk = async () => {
    if (!riskModal.orderId) return
    try {
      await financeOrderService.submitRiskResult(riskModal.orderId, {
        approved: riskApproved,
        approved_amount: riskApproved ? riskAmount : undefined,
        risk_score: riskScore || undefined,
        risk_remark: riskRemark || undefined,
      })
      message.success(riskApproved ? '风控审批通过' : '风控审批拒绝')
      setRiskModal({ visible: false, orderId: null })
      setRiskAmount(0)
      setRiskScore(0)
      setRiskRemark('')
      fetchRiskOrders()
    } catch {
      message.error('操作失败')
    }
  }

  const handleGenerateDebt = async (orderId: number) => {
    try {
      await financeOrderService.generateDebtContract(orderId)
      message.success('债务合同已生成')
      fetchDebtOrders()
    } catch {
      message.error('生成债务合同失败')
    }
  }

  const handleDisburse = async () => {
    if (!disburseModal.orderId) return
    try {
      await financeOrderService.disburse(disburseModal.orderId, {
        disbursed_amount: disburseAmount || undefined,
        transaction_no: disburseTxNo || undefined,
      })
      message.success('放款成功')
      setDisburseModal({ visible: false, orderId: null })
      setDisburseAmount(0)
      setDisburseTxNo('')
      fetchDebtOrders()
    } catch {
      message.error('放款失败')
    }
  }

  const riskColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    {
      title: '申请金额',
      key: 'request_amount',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const amount = record.financing_info?.requested_amount
        return amount ? `¥${amount.toLocaleString()}` : '--'
      },
    },
    {
      title: '融资依据',
      key: 'collateral',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const fin = record.financing_info
        if (!fin) return '--'
        return fin.finance_service_id ? `服务商 #${fin.finance_service_id}` : '--'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: number) => {
        const meta = statusMap[s] || { label: `状态${s}`, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
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
          icon={<AuditOutlined />}
          onClick={() => {
            setRiskApproved(true)
            setRiskAmount(record.financing_info?.requested_amount || 0)
            setRiskModal({ visible: true, orderId: record.id })
          }}
        >
          风控审核
        </Button>
      ),
    },
  ]

  const debtColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    {
      title: '审批金额',
      key: 'approved_amount',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const amount = record.financing_info?.approved_amount
        return amount ? `¥${amount.toLocaleString()}` : '--'
      },
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
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: OrderInfo) => (
        <Space>
          <Button size="small" icon={<FileSearchOutlined />} onClick={() => handleGenerateDebt(record.id)}>
            生成债务合同
          </Button>
          <Button type="primary" size="small" icon={<DollarCircleOutlined />} onClick={() => {
            setDisburseAmount(record.financing_info?.approved_amount || 0)
            setDisburseModal({ visible: true, orderId: record.id })
          }}>
            放款
          </Button>
        </Space>
      ),
    },
  ]

  const allColumns: ColumnsType<OrderInfo> = [
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
      title: '融资信息',
      key: 'financing',
      width: 160,
      render: (_: unknown, record: OrderInfo) => {
        const fin = record.financing_info
        if (!fin) return '--'
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>申请: ¥{fin.requested_amount?.toLocaleString()}</Text>
            {fin.approved_amount && <Text style={{ fontSize: 12 }}>审批: ¥{fin.approved_amount?.toLocaleString()}</Text>}
            {fin.disbursed_amount && <Text style={{ fontSize: 12, color: '#52c41a' }}>已放款: ¥{fin.disbursed_amount?.toLocaleString()}</Text>}
          </Space>
        )
      },
    },
  ]

  const menuItems = [
    { key: 'risk-review' as TabKey, label: '风控审批', icon: <AuditOutlined /> },
    { key: 'debt-contract' as TabKey, label: '合同与放款', icon: <BankOutlined /> },
    { key: 'all' as TabKey, label: '全部订单', icon: <FileSearchOutlined /> },
  ]

  if (!hasFinanceCapability()) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={4}>需要资金服务商权限</Title>
          <Paragraph type="secondary">当前账户未开通资金服务商能力，请联系平台管理员申请开通。</Paragraph>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #edf0f5' }}>
          <Space>
            <DollarCircleOutlined style={{ color: '#7c3aed' }} />
            <Text strong>SteelLink 资金</Text>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={menuItems}
            renderItem={(item) => (
              <List.Item
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                    {item.key === 'risk-review' && riskOrders.length > 0 && (
                      <Badge count={riskOrders.length} style={{ marginLeft: 8 }} />
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
          <Text strong>资金服务方工作台</Text>
          <Space>
            <Button icon={<AuditOutlined />} onClick={() => { if (activeTab === 'risk-review') fetchRiskOrders(); else if (activeTab === 'debt-contract') fetchDebtOrders(); else fetchAll(); }}>
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">买家首页</Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {activeTab === 'risk-review' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待审申请</Typography.Text><br /><Title level={3}>{riskOrders.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">授信余额</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">预警案件</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
              </Row>
              <Card title="融资审批池" extra={<Tag color="purple">状态 21</Tag>}>
                <Spin spinning={loading}>
                  <Table columns={riskColumns} dataSource={riskOrders} rowKey="id" pagination={false} scroll={{ x: 940 }} locale={{ emptyText: '暂无待审批融资申请' }} />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'debt-contract' && (
            <>
              <Card title="合同与放款" extra={<Tag color="magenta">状态 22</Tag>} style={{ marginBottom: 16 }}>
                <Spin spinning={loading}>
                  <Table columns={debtColumns} dataSource={debtOrders} rowKey="id" pagination={false} scroll={{ x: 820 }} locale={{ emptyText: '暂无待处理合同' }} />
                </Spin>
              </Card>
              <Card title="标准审核流">
                <Steps
                  direction="vertical"
                  current={2}
                  items={[
                    { title: '资料校验', description: '企业认证、合同、订单、仓单', status: 'finish' },
                    { title: '风控评估', description: '交易真实性、库存监管、授信占用', status: 'finish' },
                    { title: '放款确认', description: '合同签署、资金划拨、费用确认', status: 'process' },
                    { title: '贷后监控', description: '回款、库存、履约状态预警', status: 'wait' },
                  ]}
                />
              </Card>
            </>
          )}

          {activeTab === 'all' && (
            <Card title="全部订单">
              <Spin spinning={loading}>
                <Table columns={allColumns} dataSource={allOrders} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 940 }} locale={{ emptyText: '暂无订单' }} />
              </Spin>
            </Card>
          )}

          <Modal
            title="风控审核"
            open={riskModal.visible}
            onOk={handleSubmitRisk}
            onCancel={() => { setRiskModal({ visible: false, orderId: null }); setRiskAmount(0); setRiskScore(0); setRiskRemark('') }}
            okText="提交审核"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>审批结果：</Text>
                <Space>
                  <Tag color={riskApproved ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setRiskApproved(true)}>通过</Tag>
                  <Tag color={!riskApproved ? 'red' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setRiskApproved(false)}>拒绝</Tag>
                </Space>
              </div>
              {riskApproved && (
                <div>
                  <Text>审批金额 (元)：</Text>
                  <InputNumber style={{ width: '100%' }} min={0} value={riskAmount} onChange={(v) => setRiskAmount(v || 0)} />
                </div>
              )}
              <div>
                <Text>风险评分 (0-100)：</Text>
                <InputNumber style={{ width: '100%' }} min={0} max={100} value={riskScore} onChange={(v) => setRiskScore(v || 0)} placeholder="选填" />
              </div>
              <div>
                <Text>审核备注：</Text>
                <Input value={riskRemark} onChange={(e) => setRiskRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="确认放款"
            open={disburseModal.visible}
            onOk={handleDisburse}
            onCancel={() => { setDisburseModal({ visible: false, orderId: null }); setDisburseAmount(0); setDisburseTxNo('') }}
            okText="确认放款"
            okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph>确认向买方放款，资金将划拨至卖方账户。</Paragraph>
              <div>
                <Text>放款金额 (元)：</Text>
                <InputNumber style={{ width: '100%' }} min={0} value={disburseAmount} onChange={(v) => setDisburseAmount(v || 0)} />
              </div>
              <div>
                <Text>交易流水号：</Text>
                <Input value={disburseTxNo} onChange={(e) => setDisburseTxNo(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
