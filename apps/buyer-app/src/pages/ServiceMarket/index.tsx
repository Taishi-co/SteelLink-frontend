import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Divider, Empty, Row, Space, Statistic, Steps, Table, Tag, Typography } from 'antd'
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
import {
  serviceOfferService,
  type LogisticsServiceItem,
  type WarehouseServiceItem,
} from '@/services/serviceOfferService'

const { Title, Paragraph, Text } = Typography

type ResourceType = 'warehouse' | 'logistics'

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
  { title: '响应', dataIndex: 'leadTime', key: 'leadTime' },
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
]

const serviceCards = [
  {
    title: '仓储服务',
    icon: <CloudServerOutlined className="text-2xl text-emerald-600" />,
    description: '查找仓库、监管仓、装卸、库内加工和仓单资料服务。',
    actions: ['预约入库', '库存监管', '仓单质押资料'],
  },
  {
    title: '物流运输',
    icon: <CarOutlined className="text-2xl text-blue-600" />,
    description: '按线路、车型、时效和回单要求匹配承运能力。',
    actions: ['整车运输', '短驳配送', '在途追踪'],
  },
  {
    title: '仓配协同',
    icon: <SwapOutlined className="text-2xl text-indigo-600" />,
    description: '把仓储、运输、货权过户和签收节点串成一个履约计划。',
    actions: ['到仓提货', '过户确认', '签收回单'],
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
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['service-market-warehouses'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 12 }),
  })
  const { data: logisticsData, isLoading: logisticsLoading } = useQuery({
    queryKey: ['service-market-logistics'],
    queryFn: () => serviceOfferService.listLogistics({ page_size: 12 }),
  })

  const warehouses = warehouseData?.data.list ?? []
  const logistics = logisticsData?.data.list ?? []
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
          {serviceCards.map((item) => (
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
    </div>
  )
}
