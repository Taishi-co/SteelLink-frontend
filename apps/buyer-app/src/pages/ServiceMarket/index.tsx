import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Divider, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Steps, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  BankOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  serviceOfferService,
  type LogisticsServiceItem,
  type WarehouseServiceItem,
} from '@/services/serviceOfferService'
import { serviceFulfillmentService } from '@/services/serviceFulfillmentService'
import type { CreateLogisticsOrderPayload, CreateWarehouseStoragePayload } from '@/services/serviceFulfillmentService'
import { getBuyerToken } from '@/services/auth'
import { certificationService } from '@/services/certificationService'

const { Title, Paragraph, Text } = Typography

type ResourceType = 'warehouse' | 'logistics'
type ProviderService = 'warehouse' | 'logistics' | 'finance'

const providerServices = new Set<ProviderService>(['warehouse', 'logistics', 'finance'])

interface ServiceResourceRow {
  key: string
  id: number
  provider: string
  resourceType: ResourceType
  type: string
  region: string
  capability: string
  price: string
  leadTime: string
  tags: string[]
}

const serviceCards = [
  {
    key: 'storage-rent',
    title: '已有货物租仓',
    icon: <CloudServerOutlined className="text-2xl text-emerald-600" />,
    description: '用户已有一批货，但缺少临时或监管存放场地，可向已审核仓库提交入库托管需求。',
    actions: ['预约入库', '库存监管', '质押监管'],
  },
  {
    key: 'logistics-hire',
    title: '已有货物找物流',
    icon: <CarOutlined className="text-2xl text-blue-600" />,
    description: '用户已有现货或仓内货物，需要委托物流商运输，并可附加履约保障。',
    actions: ['运输委托', '价格估算', '履约保障'],
  },
  {
    key: 'provider-listing',
    title: '服务商上架资源',
    icon: <SwapOutlined className="text-2xl text-indigo-600" />,
    description: '仓库有闲置库容可上架出租；物流商可上架线路、车型和报价规则。',
    actions: ['仓库出租', '物流上架', '平台审核'],
  },
]

function mapWarehouseResource(item: WarehouseServiceItem): ServiceResourceRow {
  const region = [item.province, item.city, item.district].filter(Boolean).join(' / ') || item.address || '-'
  const tags = item.service_types?.length ? item.service_types : ['仓储资源']
  return {
    key: `warehouse-${item.id}`,
    id: item.id,
    provider: item.warehouse_name,
    resourceType: 'warehouse',
    type: '仓储服务',
    region,
    capability: `总库容 ${item.capacity || 0} / 可用 ${item.available_capacity || 0}`,
    price: item.price_rule || '按仓储规则报价',
    leadTime: '平台审核通过',
    tags,
  }
}

function mapLogisticsResource(item: LogisticsServiceItem): ServiceResourceRow {
  const tags = [item.vehicle_type, item.service_scope].filter(Boolean) as string[]
  return {
    key: `logistics-${item.id}`,
    id: item.id,
    provider: item.name,
    resourceType: 'logistics',
    type: '物流运输',
    region: `${item.route_start || '-'} -> ${item.route_end || '-'}`,
    capability: `${item.vehicle_type || '车型待确认'} / 载重 ${item.load_capacity || 0}`,
    price: item.price_rule || '按线路报价',
    leadTime: '平台审核通过',
    tags: tags.length ? tags : ['物流资源'],
  }
}

export default function ServiceMarketPage() {
  const [logisticsForm] = Form.useForm<CreateLogisticsOrderPayload & { guarantee_enabled?: boolean; coverage_amount?: number }>()
  const [storageForm] = Form.useForm<CreateWarehouseStoragePayload>()
  const [warehouseForm] = Form.useForm<Partial<WarehouseServiceItem>>()
  const [carrierForm] = Form.useForm<Partial<LogisticsServiceItem>>()
  const [activeModal, setActiveModal] = useState<'logistics' | 'storage' | 'warehouse-listing' | 'logistics-listing' | null>(null)
  const queryClient = useQueryClient()
  const isLoggedIn = Boolean(getBuyerToken())
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['service-market-warehouses'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 12 }),
  })
  const { data: logisticsData, isLoading: logisticsLoading } = useQuery({
    queryKey: ['service-market-logistics'],
    queryFn: () => serviceOfferService.listLogistics({ page_size: 12 }),
  })
  const { data: serviceOverview } = useQuery({
    queryKey: ['service-market-enterprise-services'],
    queryFn: () => certificationService.getMyServices(),
    enabled: isLoggedIn,
  })

  const warehouses = useMemo(() => warehouseData?.data.list ?? [], [warehouseData?.data.list])
  const logistics = useMemo(() => logisticsData?.data.list ?? [], [logisticsData?.data.list])
  const loading = warehouseLoading || logisticsLoading

  const serviceResources = useMemo(
    () => [
      ...warehouses.map(mapWarehouseResource),
      ...logistics.map(mapLogisticsResource),
    ],
    [logistics, warehouses],
  )

  const totalWarehouseCapacity = warehouses.reduce((sum, item) => sum + (item.available_capacity || 0), 0)
  const totalLogisticsCapacity = logistics.reduce((sum, item) => sum + (item.load_capacity || 0), 0)
  const approvedProviderServices = useMemo(() => {
    return new Set(
      (serviceOverview?.data?.permissions ?? [])
        .filter((item) => providerServices.has(item.service as ProviderService) && item.status === 2)
        .map((item) => item.service),
    )
  }, [serviceOverview?.data?.permissions])
  const canListWarehouse = approvedProviderServices.has('warehouse')
  const canListLogistics = approvedProviderServices.has('logistics')
  const visibleServiceCards = useMemo(() => {
    return serviceCards.filter((item) => {
      if (item.key !== 'provider-listing') return true
      return canListWarehouse || canListLogistics
    })
  }, [canListLogistics, canListWarehouse])
  const ensureLoggedIn = () => {
    if (!isLoggedIn) {
      message.warning('请先登录后再提交服务需求')
      return false
    }
    return true
  }
  const openLogisticsRequest = (item?: LogisticsServiceItem) => {
    if (!ensureLoggedIn()) return
    logisticsForm.resetFields()
    logisticsForm.setFieldsValue({
      logistics_service_id: item?.id,
      origin: item?.route_start || '',
      destination: item?.route_end || '',
      vehicle_type: item?.vehicle_type || '',
      cargo_name: '钢材',
      weight: 30,
      guarantee_type: '平台履约保障',
      guarantee_enabled: true,
    })
    setActiveModal('logistics')
  }
  const openStorageRequest = (item?: WarehouseServiceItem) => {
    if (!ensureLoggedIn()) return
    storageForm.resetFields()
    storageForm.setFieldsValue({
      warehouse_service_id: item?.id,
      product_name: '钢材现货',
      quantity: 30,
      storage_requirement: item?.pledge_supervision ? '需要质押监管和出库凭证管理' : '需要短期存放和出入库作业',
    })
    setActiveModal('storage')
  }
  const createLogisticsMutation = useMutation({
    mutationFn: async (values: CreateLogisticsOrderPayload & { guarantee_enabled?: boolean; coverage_amount?: number }) => {
      const logisticsOrder = await serviceFulfillmentService.createLogisticsOrder(values)
      if (values.guarantee_enabled && values.guarantee_type) {
        await serviceFulfillmentService.createGuarantee({
          logistics_order_id: logisticsOrder.data.id,
          guarantee_type: values.guarantee_type,
          coverage_amount: values.coverage_amount,
          description: `物流委托 ${logisticsOrder.data.logistics_no} 的履约保障`,
        })
      }
      return logisticsOrder
    },
    onSuccess: () => {
      message.success('物流委托已提交，物流商可在工作台接单')
      setActiveModal(null)
      logisticsForm.resetFields()
    },
  })
  const storageMutation = useMutation({
    mutationFn: serviceFulfillmentService.requestWarehouseStorage,
    onSuccess: () => {
      message.success('仓储托管需求已提交，仓储方可在作业记录中处理')
      setActiveModal(null)
      storageForm.resetFields()
    },
  })
  const warehouseListingMutation = useMutation({
    mutationFn: serviceOfferService.createWarehouse,
    onSuccess: () => {
      message.success('仓库资源已提交审核')
      setActiveModal(null)
      warehouseForm.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['service-market-warehouses'] })
    },
  })
  const logisticsListingMutation = useMutation({
    mutationFn: serviceOfferService.createLogistics,
    onSuccess: () => {
      message.success('物流资源已提交审核')
      setActiveModal(null)
      carrierForm.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['service-market-logistics'] })
    },
  })
  const columns: ColumnsType<ServiceResourceRow> = [
    {
      title: '服务商',
      dataIndex: 'provider',
      key: 'provider',
      render: (value: string, record) => (
        <Link to={record.resourceType === 'warehouse' ? `/warehouses/${record.id}` : `/logistics-services/${record.id}`}>
          {value}
        </Link>
      ),
    },
    {
      title: '服务类型',
      dataIndex: 'type',
      key: 'type',
      render: (value: string, record) => (
        <Tag color={record.resourceType === 'warehouse' ? 'green' : 'blue'}>{value}</Tag>
      ),
    },
    { title: '覆盖区域', dataIndex: 'region', key: 'region' },
    { title: '能力', dataIndex: 'capability', key: 'capability' },
    { title: '价格', dataIndex: 'price', key: 'price' },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => {
        if (record.resourceType === 'warehouse') {
          const warehouse = warehouses.find((item) => item.id === record.id)
          return <Button type="link" onClick={() => openStorageRequest(warehouse)}>租仓存货</Button>
        }
        const carrier = logistics.find((item) => item.id === record.id)
        return <Button type="link" onClick={() => openLogisticsRequest(carrier)}>委托运输</Button>
      },
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} lg={14}>
              <Space size="small" className="mb-4">
                <Tag color="blue">物流</Tag>
                <Tag color="green">仓储</Tag>
                <Tag color="purple">监管</Tag>
              </Space>
              <Title className="!mb-3">物流仓储服务市场</Title>
              <Paragraph className="!mb-6 !max-w-3xl !text-base !text-slate-500">
                买家在交易前后可以统一查看已审核仓库、承运线路、监管仓和仓配组合服务；服务商在工作台上架资源，平台审核通过后进入这里展示。
              </Paragraph>
              <Space wrap>
                <Link to="/warehouses">
                  <Button type="primary" size="large" icon={<FileSearchOutlined />}>查看仓储资源</Button>
                </Link>
                <Link to="/logistics-services">
                  <Button size="large" icon={<EnvironmentOutlined />}>查看物流资源</Button>
                </Link>
                <Button size="large" icon={<CarOutlined />} onClick={() => openLogisticsRequest()}>发布运输需求</Button>
                <Button size="large" icon={<CloudServerOutlined />} onClick={() => openStorageRequest()}>发布租仓需求</Button>
              </Space>
            </Col>
            <Col xs={24} lg={10}>
              <Card className="rounded-lg border-slate-200">
                <Row gutter={[16, 16]}>
                  <Col span={12}><Statistic title="已审核仓库" value={warehouses.length} suffix="个" prefix={<BankOutlined />} /></Col>
                  <Col span={12}><Statistic title="已审核线路" value={logistics.length} suffix="条" prefix={<CarOutlined />} /></Col>
                  <Col span={12}><Statistic title="可用库容" value={totalWarehouseCapacity} precision={0} prefix={<SafetyCertificateOutlined />} /></Col>
                  <Col span={12}><Statistic title="承运载重" value={totalLogisticsCapacity} precision={0} prefix={<ThunderboltOutlined />} /></Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Row gutter={[16, 16]}>
          {visibleServiceCards.map((item) => (
            <Col xs={24} md={8} key={item.title}>
              <Card className="h-full rounded-lg border-slate-200">
                <Space align="start" size="middle">
                  {item.icon}
                  <div>
                    <Title level={4} className="!mb-2">{item.title}</Title>
                    <Paragraph className="!text-slate-500">{item.description}</Paragraph>
                    <Space wrap>
                      {item.actions.map((action) => <Tag key={action}>{action}</Tag>)}
                    </Space>
                    <div className="mt-4">
                      {item.key === 'logistics-hire' && <Button type="primary" onClick={() => openLogisticsRequest()}>委托物流商运输</Button>}
                      {item.key === 'storage-rent' && <Button type="primary" onClick={() => openStorageRequest()}>提交租仓托管</Button>}
                      {item.key === 'provider-listing' && (
                        <Space wrap>
                          {canListWarehouse && <Button onClick={() => { if (ensureLoggedIn()) setActiveModal('warehouse-listing') }}>上架仓库</Button>}
                          {canListLogistics && <Button onClick={() => { if (ensureLoggedIn()) setActiveModal('logistics-listing') }}>上架物流</Button>}
                        </Space>
                      )}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          className="mt-6 rounded-lg border-slate-200"
          title="已审核服务资源"
          extra={
            <Space>
              <Link to="/warehouses"><Button type="link">仓储全部</Button></Link>
              <Link to="/logistics-services"><Button type="link">物流全部</Button></Link>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={serviceResources}
            loading={loading}
            locale={{ emptyText: <Empty description="暂无已审核仓储或物流资源" /> }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 900 }}
          />
        </Card>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} lg={14}>
            <Card className="h-full rounded-lg border-slate-200" title="买家履约流程">
              <Steps
                current={1}
                items={[
                  { title: '选择服务', description: '按交付地、仓容、线路和监管要求筛选' },
                  { title: '提交需求', description: '填写货物、数量、时间窗口和票据要求' },
                  { title: '服务商确认', description: '仓储方或物流方报价并承诺节点' },
                  { title: '履约回传', description: '入库、装车、签收、回单同步到订单' },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="h-full rounded-lg border-slate-200" title="为什么物流和仓储一起展示">
              <Paragraph className="!text-slate-500">
                买家关注的是订单能否按时、按质、可追溯地完成交付，不会先按组织后台拆分需求。因此买家侧先合并为履约服务市场；服务方侧再拆成物流后台和仓储后台，分别管理自己的资源、任务和结算。
              </Paragraph>
              <Divider />
              <Space>
                <CheckCircleOutlined className="text-emerald-600" />
                <Text>后续可接入交易订单、仓单质押和资金服务风控。</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </main>
      <Modal
        title="委托物流商运输"
        open={activeModal === 'logistics'}
        onCancel={() => setActiveModal(null)}
        onOk={() => logisticsForm.submit()}
        confirmLoading={createLogisticsMutation.isPending}
        width={720}
      >
        <Form form={logisticsForm} layout="vertical" onFinish={(values) => createLogisticsMutation.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="logistics_service_id" label="物流服务商" rules={[{ required: true }]}>
                <Select options={logistics.map((item) => ({ value: item.id, label: `${item.name} · ${item.route_start || '-'} -> ${item.route_end || '-'}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item name="cargo_name" label="货物名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="origin" label="提货地址" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="destination" label="送达地址" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="weight" label="重量" rules={[{ required: true }]}><InputNumber className="w-full" min={0.01} addonAfter="吨" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="vehicle_type" label="车型"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="coverage_amount" label="保障金额"><InputNumber className="w-full" min={0} addonBefore="¥" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="guarantee_type" label="履约保障"><Input placeholder="如：平台履约保障、签收回单保障、货损保障" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title="提交仓储托管需求"
        open={activeModal === 'storage'}
        onCancel={() => setActiveModal(null)}
        onOk={() => storageForm.submit()}
        confirmLoading={storageMutation.isPending}
        width={720}
      >
        <Form form={storageForm} layout="vertical" onFinish={(values) => storageMutation.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="warehouse_service_id" label="目标仓库" rules={[{ required: true }]}>
                <Select options={warehouses.map((item) => ({ value: item.id, label: `${item.warehouse_name} · ${[item.province, item.city].filter(Boolean).join(' / ') || item.address || '-'}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item name="product_name" label="货物名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber className="w-full" min={0.01} addonAfter="吨" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="contact_name" label="联系人"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="contact_phone" label="联系电话"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="scheduled_at" label="计划入库时间"><Input placeholder="如：2026-05-10 上午" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="bundle_no" label="捆包/批次号"><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item name="storage_requirement" label="仓储要求"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title="上架闲置仓库"
        open={activeModal === 'warehouse-listing'}
        onCancel={() => setActiveModal(null)}
        onOk={() => warehouseForm.submit()}
        confirmLoading={warehouseListingMutation.isPending}
        width={720}
      >
        <Form form={warehouseForm} layout="vertical" onFinish={(values) => warehouseListingMutation.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="warehouse_name" label="仓库名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="address" label="详细地址" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="province" label="省份"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="city" label="城市"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="district" label="区县"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="capacity" label="总库容"><InputNumber className="w-full" min={0} addonAfter="吨" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="available_capacity" label="可出租库容"><InputNumber className="w-full" min={0} addonAfter="吨" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="price_rule" label="价格规则"><Input placeholder="如：12 元/吨/天" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="service_types" label="服务类型"><Select mode="tags" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="description" label="资源描述"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        title="上架物流线路"
        open={activeModal === 'logistics-listing'}
        onCancel={() => setActiveModal(null)}
        onOk={() => carrierForm.submit()}
        confirmLoading={logisticsListingMutation.isPending}
        width={720}
      >
        <Form form={carrierForm} layout="vertical" onFinish={(values) => logisticsListingMutation.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="name" label="服务名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="fleet_name" label="车队名称"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="route_start" label="起始地" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="route_end" label="目的地" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="vehicle_type" label="车型"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="load_capacity" label="载重"><InputNumber className="w-full" min={0} addonAfter="吨" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="price_rule" label="价格规则"><Input placeholder="如：80 元/吨" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="service_scope" label="服务范围"><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item name="description" label="资源描述"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
