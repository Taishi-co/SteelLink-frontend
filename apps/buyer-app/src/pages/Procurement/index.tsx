import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Input, Progress, Row, Select, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, FileDoneOutlined, FormOutlined, ReloadOutlined, SearchOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementActivity } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { label: string; color: string }> = {
  active: { label: '参团中', color: 'green' },
  ended: { label: '已截止', color: 'blue' },
  order_created: { label: '已生成订单', color: 'purple' },
}

const marketplaceStatuses = new Set(['active', 'ended', 'order_created'])

function formatQuantity(value: number, unit: string) {
  return `${value.toLocaleString('zh-CN')} ${unit || '吨'}`
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function groupProgress(activity: ProcurementActivity) {
  if (activity.status === 'order_created') return 100
  const threshold = activity.minGroupQuantity || activity.targetQuantity || 0
  if (threshold <= 0) return activity.progress || 0
  return Math.min(100, Math.round((activity.demandQuantity / threshold) * 100))
}

export default function ProcurementPage() {
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [category, setCategory] = useState<string | undefined>()
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('')
  const [activities, setActivities] = useState<ProcurementActivity[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const listResult = await marketService.listProcurements({
        page: 1,
        page_size: 50,
        keyword: appliedKeyword,
        status,
        category: appliedCategory || undefined,
      })
      setActivities(listResult.list.filter((item) => marketplaceStatuses.has(item.status)))
    } catch (error) {
      message.error('集采大厅数据加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [appliedCategory, appliedKeyword, status])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const activeCount = activities.filter((item) => item.status === 'active').length
  const orderCreatedCount = activities.filter((item) => item.status === 'order_created').length
  const demandQuantity = activities.reduce((sum, item) => sum + Number(item.demandQuantity || 0), 0)
  const participatingCompany = activities.reduce((sum, item) => sum + Number(item.participatingCount || 0), 0)
  const overviewStats = [
    { label: '可参团集采', value: activeCount, suffix: '场', icon: <ShoppingCartOutlined />, color: 'text-green-600' },
    { label: '已归集需求', value: demandQuantity, suffix: '吨', icon: <ClockCircleOutlined />, color: 'text-gold-600' },
    { label: '参团企业', value: participatingCompany, suffix: '家', icon: <TeamOutlined />, color: 'text-purple-600' },
    { label: '已成单集采', value: orderCreatedCount, suffix: '场', icon: <FileDoneOutlined />, color: 'text-blue-600' },
  ]

  const applyFilters = () => {
    setAppliedKeyword(keyword.trim())
    setAppliedCategory((category || '').trim())
  }

  const resetFilters = () => {
    setKeyword('')
    setAppliedKeyword('')
    setStatus(undefined)
    setCategory(undefined)
    setAppliedCategory('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color="blue" className="mb-4">集采活动大厅</Tag>
              <Title level={1} className="!mb-3">集采大厅</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                展示卖家已确认并公开到商城的集采活动。买家可查看集采价、成团门槛和截止时间，签署协议后填写收货信息参与集采。
              </Paragraph>
            </div>
            <Link to="/ai-procurement">
              <Button type="primary" icon={<FormOutlined />}>AI采购申请集采</Button>
            </Link>
          </div>

          <Spin spinning={loading}>
            <Row gutter={[16, 16]} className="mt-8">
              {overviewStats.map((item) => (
                <Col key={item.label} xs={24} sm={12} lg={6}>
                  <Card>
                    <Space align="start" className="w-full justify-between">
                      <Statistic title={item.label} value={item.value} suffix={item.suffix} />
                      <span className={`text-3xl ${item.color}`}>{item.icon}</span>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Spin>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <Card className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Input.Search
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索标题、编号、商品、卖家"
              className="lg:max-w-md"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={(value) => {
                setAppliedKeyword(value.trim())
                setAppliedCategory((category || '').trim())
              }}
            />
            <Select
              className="lg:w-40"
              allowClear
              placeholder="集采状态"
              value={status}
              onChange={setStatus}
              options={[
                { label: '参团中', value: 'active' },
                { label: '已截止', value: 'ended' },
                { label: '已生成订单', value: 'order_created' },
              ]}
            />
            <Input
              allowClear
              className="lg:w-48"
              placeholder="品类，如热轧板卷"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              onPressEnter={applyFilters}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>重置</Button>
          </div>
        </Card>

        <Spin spinning={loading}>
          {activities.length > 0 ? (
            <Row gutter={[20, 20]}>
              {activities.map((activity) => {
                const meta = statusMeta[activity.status] || { label: activity.status, color: 'default' }
                return (
                  <Col key={activity.id} xs={24} lg={12}>
                    <Card hoverable className="h-full">
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Text type="secondary">{activity.procurementNo}</Text>
                            <Title level={3} className="!mb-2 !mt-2">{activity.title}</Title>
                            <Paragraph className="text-gray-500 !mb-0">{activity.productName || activity.target} · 卖家：{activity.sellerName || '-'}</Paragraph>
                          </div>
                          <Tag color={meta.color}>{meta.label}</Tag>
                        </div>
                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">集采品类</Text><div className="mt-1 font-semibold">{activity.category}</div></Col>
                          <Col span={12}><Text type="secondary">采购标的</Text><div className="mt-1 font-semibold">{activity.target}</div></Col>
                          <Col span={12}><Text type="secondary">成团门槛</Text><div className="mt-1 font-semibold">{formatQuantity(activity.minGroupQuantity || activity.targetQuantity, activity.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">集采价</Text><div className="mt-1 font-semibold text-red-500">{activity.groupPrice ? `¥${activity.groupPrice.toLocaleString('zh-CN')}` : activity.budgetDisplay}</div></Col>
                          <Col span={12}><Text type="secondary">当前阶段</Text><div className="mt-1 font-semibold">{activity.stage}</div></Col>
                          <Col span={12}><Text type="secondary">截止时间</Text><div className="mt-1 font-semibold">{activity.endedAt ? formatDateTime(activity.endedAt) : activity.openDate || '-'}</div></Col>
                        </Row>
                        <Progress percent={groupProgress(activity)} format={(percent) => `${percent}%成团`} />
                        <Row gutter={[12, 12]}>
                          <Col span={8}><Statistic title="参采企业" value={activity.participatingCount} suffix="家" /></Col>
                          <Col span={8}><Statistic title="归集需求" value={activity.demandQuantity} suffix={activity.unit} /></Col>
                          <Col span={8}><Statistic title="成单状态" value={activity.masterOrderId ? '已成单' : '未成单'} prefix={activity.masterOrderId ? <CheckCircleOutlined /> : <ShoppingCartOutlined />} /></Col>
                        </Row>
                        <Link to={`/procurement/${activity.id}`} className="mt-auto">
                          <Button type={activity.status === 'active' ? 'primary' : 'default'} icon={<ArrowRightOutlined />}>
                            {activity.status === 'active' ? '签署协议并参团' : '查看集采进度'}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          ) : (
            <Card>
              <Empty
                description="暂无符合条件的公开集采"
              >
                <Link to="/ai-procurement">
                  <Button type="primary" icon={<FormOutlined />}>通过 AI 采购申请集采</Button>
                </Link>
              </Empty>
            </Card>
          )}
        </Spin>
      </main>
    </div>
  )
}
