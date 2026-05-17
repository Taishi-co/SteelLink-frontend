import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Steps, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BankOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceOfferService, type FinanceServiceItem, type WarehouseServiceItem } from '@/services/serviceOfferService'
import {
  sellerServiceFulfillmentService,
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

export default function FinancePage() {
  const [form] = Form.useForm<CreateWarehouseReceiptPledgePayload>()
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: financeData, isLoading: financeLoading } = useQuery({
    queryKey: ['seller-approved-finance-services'],
    queryFn: () => serviceOfferService.listFinance({ status: 2, page_size: 100 }),
  })
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['seller-pledge-supervision-warehouses'],
    queryFn: () => serviceOfferService.listWarehouses({ status: 2, page_size: 100 }),
  })
  const { data: pledgeData, isLoading: pledgeLoading } = useQuery({
    queryKey: ['seller-warehouse-receipt-pledges'],
    queryFn: () => sellerServiceFulfillmentService.listMyWarehouseReceiptPledges({ page_size: 20 }),
  })

  const createPledge = useMutation({
    mutationFn: (payload: CreateWarehouseReceiptPledgePayload) =>
      sellerServiceFulfillmentService.createWarehouseReceiptPledge(payload),
    onSuccess: () => {
      message.success('仓单质押申请已提交')
      setPledgeModalOpen(false)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['seller-warehouse-receipt-pledges'] })
    },
    onError: () => message.error('仓单质押申请提交失败'),
  })

  const financeRows = financeData?.data?.list ?? []
  const pledgeRows = pledgeData?.data?.list ?? []
  const pledgeWarehouses = (warehouseData?.data?.list ?? []).filter((item: WarehouseServiceItem) => item.pledge_supervision)
  const pledgeFinanceProducts = financeRows.filter((item: FinanceServiceItem) => {
    const text = `${item.name || ''}${item.finance_type || ''}${item.description || ''}${item.supported_scenarios?.join('') || ''}`
    return /仓单|存货|质押|监管/.test(text)
  })

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
    { title: '资方反馈', key: 'risk_remark', width: 180, render: (_, row) => row.risk_remark || row.release_remark || '-' },
  ]

  const financeOptions = (pledgeFinanceProducts.length ? pledgeFinanceProducts : financeRows).map((item) => ({
    label: `${item.name}${item.finance_type ? ` / ${item.finance_type}` : ''}`,
    value: item.id,
  }))
  const warehouseOptions = pledgeWarehouses.map((item) => ({
    label: `${item.warehouse_name}${item.finance_certified ? ' / 资方认证监管仓' : ''}`,
    value: item.id,
  }))

  return (
    <div className="min-w-0 space-y-4">
      <Card>
        <Space align="start">
          <BankOutlined className="mt-1 text-xl text-primary-600" />
          <div>
            <Title level={4} className="!mb-1">资金服务</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              卖方可查看平台资金产品，并基于自有库存发起仓单质押申请；订单托盘垫资仍在订单支付节点处理。
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Card title="仓单质押（4 步）" extra={<Button type="primary" onClick={() => setPledgeModalOpen(true)}>申请仓单质押</Button>}>
        <Steps
          size="small"
          items={[
            { title: '存入监管仓', description: '自有存货存入资方认可监管仓' },
            { title: '取得仓单', description: '仓库出具货权、数量、品质仓单' },
            { title: '质押签约', description: '质押仓单并签署监管协议' },
            { title: '放款释放', description: '资方放款，回款后释放货权' },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="申请口径">
            <Space direction="vertical">
              <Text><SafetyCertificateOutlined /> 仓库必须支持质押监管。</Text>
              <Text type="secondary">如果资方配置了认可监管仓，后端会强制校验仓库授权。</Text>
              <Text type="secondary">非平台监管仓不支持库存冻结、贷后监控和逐笔释放。</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="我的仓单质押申请">
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
        </Col>
      </Row>

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
          description="请确认存货已入监管仓且已取得正规仓单。平台监管仓可进入库存冻结和后续货权释放监控。"
        />
        <Form form={form} layout="vertical" onFinish={(values) => createPledge.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="finance_service_id" label="资金产品" rules={[{ required: true, message: '请选择资金产品' }]}>
                <Select options={financeOptions} loading={financeLoading} placeholder="选择仓单/存货质押产品" />
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
                <Input placeholder="如：热轧卷板 Q235B" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quality_grade" label="品质/牌号">
                <Input placeholder="如：Q235B / HRB400E" />
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
                <Input.TextArea rows={3} placeholder="可填写库存批次、销售计划、回款安排等" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
