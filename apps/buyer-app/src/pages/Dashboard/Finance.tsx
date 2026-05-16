import { Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Steps, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BankOutlined, FileSearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FinanceServiceItem, serviceOfferService } from '@/services/serviceOfferService'
import type { WarehouseServiceItem } from '@/services/serviceOfferService'
import {
  serviceFulfillmentService,
  type CreateWarehouseReceiptPledgePayload,
  type WarehouseReceiptPledgeInfo,
} from '@/services/serviceFulfillmentService'

const { Paragraph, Text, Title } = Typography

const pledgeStatusMeta: Record<string, { label: string; color: string }> = {
  submitted: { label: '已提交', color: 'processing' },
  risk_approved: { label: '风控通过', color: 'cyan' },
  risk_rejected: { label: '已驳回', color: 'red' },
  agreement_signed: { label: '协议已签', color: 'blue' },
  disbursed: { label: '已放款', color: 'green' },
  released: { label: '已释放', color: 'default' },
}

const columns: ColumnsType<FinanceServiceItem> = [
  { title: '资金产品', dataIndex: 'name', key: 'name', width: 180 },
  { title: '类型', dataIndex: 'finance_type', key: 'finance_type', width: 120, render: (v?: string) => v || '-' },
  {
    title: '额度范围',
    key: 'amount',
    width: 170,
    render: (_, row) => `${(row.min_amount || 0).toLocaleString()} - ${(row.max_amount || 0).toLocaleString()} 元`,
  },
  {
    title: '账期/费率',
    key: 'term_rate',
    width: 140,
    render: (_, row) => `${row.term_days || 0} 天 / ${row.annual_rate || 0}%`,
  },
  { title: '手续费规则', dataIndex: 'fee_rule', key: 'fee_rule', width: 180, render: (v?: string) => v || '-' },
  {
    title: '适用场景',
    dataIndex: 'supported_scenarios',
    key: 'supported_scenarios',
    width: 180,
    render: (items?: string[]) => items?.length ? <Space wrap>{items.map((item) => <Tag key={item}>{item}</Tag>)}</Space> : '-',
  },
]

export default function FinancePage() {
  const [form] = Form.useForm<CreateWarehouseReceiptPledgePayload>()
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['approved-finance-services'],
    queryFn: () => serviceOfferService.listFinance({ status: 2, page_size: 100 }),
  })
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['pledge-supervision-warehouses'],
    queryFn: () => serviceOfferService.listWarehouses({ status: 2, page_size: 100 }),
  })
  const { data: pledgeData, isLoading: pledgeLoading } = useQuery({
    queryKey: ['my-warehouse-receipt-pledges'],
    queryFn: () => serviceFulfillmentService.listMyWarehouseReceiptPledges({ page_size: 20 }),
  })
  const createPledge = useMutation({
    mutationFn: (payload: CreateWarehouseReceiptPledgePayload) =>
      serviceFulfillmentService.createWarehouseReceiptPledge(payload),
    onSuccess: () => {
      message.success('仓单质押申请已提交')
      setPledgeModalOpen(false)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['my-warehouse-receipt-pledges'] })
    },
    onError: () => {
      message.error('仓单质押申请提交失败')
    },
  })
  const rows = data?.data?.list ?? []
  const pledgeRows = pledgeData?.data?.list ?? []
  const pledgeWarehouses = (warehouseData?.data?.list ?? []).filter((item: WarehouseServiceItem) => item.pledge_supervision)
  const pledgeFinanceProducts = rows.filter((item) => {
    const text = `${item.name || ''}${item.finance_type || ''}${item.description || ''}${item.supported_scenarios?.join('') || ''}`
    return /仓单|存货|质押|监管/.test(text)
  })
  const financeOptions = (pledgeFinanceProducts.length ? pledgeFinanceProducts : rows).map((item) => ({
    label: `${item.name}${item.finance_type ? ` / ${item.finance_type}` : ''}`,
    value: item.id,
  }))
  const warehouseOptions = pledgeWarehouses.map((item) => ({
    label: `${item.warehouse_name}${item.finance_certified ? ' / 资方认证监管仓' : ''}`,
    value: item.id,
  }))

  const pledgeColumns: ColumnsType<WarehouseReceiptPledgeInfo> = [
    { title: '申请号', dataIndex: 'application_no', key: 'application_no', width: 170 },
    { title: '资金产品', dataIndex: 'finance_service_name', key: 'finance_service_name', width: 160, render: (v?: string) => v || '-' },
    { title: '监管仓', dataIndex: 'warehouse_name', key: 'warehouse_name', width: 160 },
    { title: '仓单号', dataIndex: 'receipt_no', key: 'receipt_no', width: 130 },
    { title: '货物', dataIndex: 'goods_name', key: 'goods_name', width: 120 },
    { title: '申请金额', dataIndex: 'requested_amount', key: 'requested_amount', width: 120, render: (v: number) => `¥${Number(v || 0).toLocaleString()}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const meta = pledgeStatusMeta[v] || { label: v || '-', color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '资方反馈',
      key: 'risk_remark',
      width: 180,
      render: (_, row) => row.risk_remark || row.release_remark || '-',
    },
  ]

  return (
    <div className="min-w-0 space-y-4">
      <Card className="rounded-lg">
        <Space align="start">
          <BankOutlined className="text-xl text-violet-600 mt-1" />
          <div>
            <Title level={4} className="!mb-1">可申请资金服务</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              这里面向买方/卖方展示平台已审核的资金产品。订单融资在订单支付节点发起；自有存货可在这里发起仓单质押申请，由资金方处理审批、监管协议、放款和货权释放。
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Card className="rounded-lg" title="仓单质押（自有存货融资）" extra={<Button type="primary" onClick={() => setPledgeModalOpen(true)}>申请仓单质押</Button>}>
        <Steps
          size="small"
          items={[
            { title: '存入监管仓', description: '将自有存货存入资方认可的监管仓库' },
            { title: '取得仓单', description: '仓库出具记载货权、数量、品质的正规仓单' },
            { title: '质押签约', description: '仓单质押给资方并签监管协议' },
            { title: '放款释放', description: '资方放款，销售回款后逐笔释放货权' },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="rounded-lg" title="使用口径">
            <Space direction="vertical">
              <Text><FileSearchOutlined /> 买卖方只查看和申请资金服务。</Text>
              <Text><SafetyCertificateOutlined /> 资金方工作台只给已开通金融服务商能力的企业使用。</Text>
              <Text type="secondary">订单进入待支付后，可选择资金产品发起托盘垫资。</Text>
              <Text type="secondary">自有存货已在监管仓形成仓单时，可直接发起仓单质押。</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="资金方入口"
            description="如果你的企业是资金方，请先在个人工作台申请并通过“金融服务商能力”，审核通过后侧边栏会出现“进入资金方工作台”。"
          />
          <Card className="rounded-lg" title="平台资金产品池" extra={<Link to="/dashboard/orders"><Button type="primary">从订单申请</Button></Link>}>
            <Table
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={rows}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 920 }}
              locale={{ emptyText: '暂无已审核资金产品' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="rounded-lg" title="我的仓单质押申请">
        <Table
          rowKey="id"
          loading={pledgeLoading}
          columns={pledgeColumns}
          dataSource={pledgeRows}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1080 }}
          locale={{ emptyText: '暂无仓单质押申请' }}
        />
      </Card>

      <Modal
        title="申请仓单质押"
        open={pledgeModalOpen}
        onCancel={() => setPledgeModalOpen(false)}
        onOk={() => form.submit()}
        okText="提交申请"
        confirmLoading={createPledge.isPending}
        width={720}
        destroyOnClose
      >
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message="申请前置条件"
          description="请先确认货物已入资方认可的监管仓，且已取得正规仓单。非平台监管仓无法进入库存冻结和后续货权释放监控。"
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createPledge.mutate(values)}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="finance_service_id" label="资金产品" rules={[{ required: true, message: '请选择资金产品' }]}>
                <Select options={financeOptions} loading={isLoading} placeholder="选择仓单/存货质押产品" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="warehouse_service_id" label="监管仓库" rules={[{ required: true, message: '请选择监管仓库' }]}>
                <Select options={warehouseOptions} loading={warehouseLoading} placeholder="选择支持质押监管的仓库" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="receipt_no" label="仓单编号" rules={[{ required: true, message: '请输入仓单编号' }]}>
                <Input placeholder="仓库出具的正规仓单号" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="receipt_voucher_url" label="仓单文件 URL" rules={[{ required: true, message: '请输入仓单文件 URL' }]}>
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="goods_name" label="货物名称" rules={[{ required: true, message: '请输入货物名称' }]}>
                <Input placeholder="如：螺纹钢 HRB400E" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quality_grade" label="品质/牌号">
                <Input placeholder="如：HRB400E / Q235B" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quantity" label="数量（吨）" rules={[{ required: true, message: '请输入数量' }]}>
                <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="requested_amount" label="申请金额（元）" rules={[{ required: true, message: '请输入申请金额' }]}>
                <InputNumber min={1} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="remark" label="申请备注">
                <Input.TextArea rows={3} placeholder="可填写存货批次、销售计划、回款安排等" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
