import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Input, Progress, Row, Select, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, BankOutlined, CheckCircleOutlined, ClockCircleOutlined, FileDoneOutlined, FileSearchOutlined, FormOutlined, ReloadOutlined, SearchOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementActivity, ProcurementStats } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { label: string; color: string }> = {
  pending_seller: { label: '待卖家确认', color: 'gold' },
  active: { label: '参团中', color: 'green' },
  ended: { label: '已截止', color: 'blue' },
  order_created: { label: '已生成订单', color: 'purple' },
  seller_rejected: { label: '卖家拒绝', color: 'red' },
  preparing: { label: '筹备中', color: 'gold' },
  signup: { label: '报名中', color: 'blue' },
  bidding: { label: '报价中', color: 'purple' },
  awarded: { label: '已定标', color: 'green' },
  closed: { label: '成交归档', color: 'default' },
}

function formatAmount(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString('zh-CN')
}

function formatQuantity(value: number, unit: string) {
  return `${value.toLocaleString('zh-CN')} ${unit || '吨'}`
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
  const [stats, setStats] = useState<ProcurementStats>({
    activityCount: 0,
    preparingCount: 0,
    successCount: 0,
    totalTransaction: 0,
    participatingCompany: 0,
    demandQuantity: 0,
  })
  const [activities, setActivities] = useState<ProcurementActivity[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsResult, listResult] = await Promise.all([
        marketService.getProcurementStats(),
        marketService.listProcurements({ page: 1, page_size: 12, keyword: appliedKeyword, status, category }),
      ])
      setStats(statsResult)
      setActivities(listResult.list)
    } catch (error) {
      message.error('集采大厅数据加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [appliedKeyword, category, status])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const overviewStats = [
    { label: '集采活动', value: stats.activityCount, suffix: '场', icon: <FileSearchOutlined />, color: 'text-blue-600' },
    { label: '参团中', value: stats.preparingCount, suffix: '场', icon: <ClockCircleOutlined />, color: 'text-gold-600' },
    { label: '已成单', value: stats.successCount, suffix: '场', icon: <FileDoneOutlined />, color: 'text-green-600' },
    { label: '成交金额', value: formatAmount(stats.totalTransaction), suffix: '', icon: <BankOutlined />, color: 'text-red-600' },
    { label: '参与企业', value: stats.participatingCompany, suffix: '家', icon: <TeamOutlined />, color: 'text-purple-600' },
  ]

  const resetFilters = () => {
    setKeyword('')
    setAppliedKeyword('')
    setStatus(undefined)
    setCategory(undefined)
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
                浏览平台公开集采，查看集采价、成团门槛和归集进度，签署协议后即可参团。
              </Paragraph>
            </div>
            <Link to="/ai-procurement">
              <Button type="primary" icon={<FormOutlined />}>AI采购申请集采</Button>
            </Link>
          </div>

          <Spin spinning={loading}>
            <Row gutter={[16, 16]} className="mt-8">
              {overviewStats.map((item) => (
                <Col key={item.label} xs={24} sm={12} lg={overviewStats.length === 5 ? 5 : 6}>
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
              onSearch={(value) => setAppliedKeyword(value)}
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
            <Select
              className="lg:w-40"
              placeholder="集采品类"
              allowClear
              value={category}
              onChange={setCategory}
              options={[
                { label: '大宗商品', value: '大宗商品' },
                { label: '工业品', value: '工业品' },
              ]}
            />
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
                          <Col span={12}><Text type="secondary">截止时间</Text><div className="mt-1 font-semibold">{activity.endedAt ? new Date(activity.endedAt).toLocaleString('zh-CN') : activity.openDate}</div></Col>
                        </Row>
                        <Progress percent={groupProgress(activity)} format={(percent) => `${percent}%成团`} />
                        <Row gutter={[12, 12]}>
                          <Col span={8}><Statistic title="参采企业" value={activity.participatingCount} suffix="家" /></Col>
                          <Col span={8}><Statistic title="归集需求" value={activity.demandQuantity} suffix={activity.unit} /></Col>
                          <Col span={8}><Statistic title="成单状态" value={activity.masterOrderId ? '已成单' : '未成单'} prefix={activity.masterOrderId ? <CheckCircleOutlined /> : <ShoppingCartOutlined />} /></Col>
                        </Row>
                        <Link to={`/procurement/${activity.id}`} className="mt-auto">
                          <Button type="primary" icon={<ArrowRightOutlined />}>查看并参团</Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          ) : (
            <Card><Empty description="暂无集采活动" /></Card>
          )}
        </Spin>
      </main>
    </div>
  )
}
