import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Drawer, Empty, Progress, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { BiddingActivity, BiddingStats } from '@/services/marketService'
import { openSellerCenter } from '@/services/auth'

const { Title, Paragraph, Text } = Typography

const activeStatuses = new Set(['bidding'])
const successStatuses = new Set(['awarded', 'order_created'])

function formatAmount(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString('zh-CN')
}

function formatQuantity(activity: BiddingActivity) {
  return `${activity.quantity.toLocaleString('zh-CN')} ${activity.unit || '吨'}`
}

function formatPrice(value: number, unit = '吨') {
  return `¥${value.toLocaleString('zh-CN')} / ${unit}`
}

function formatTime(value?: string) {
  if (!value) {
    return '-'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getRemainingText(endedAt: string) {
  const diff = new Date(endedAt).getTime() - Date.now()
  if (diff <= 0) {
    return '已截止'
  }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}小时${minutes}分`
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string }
  return maybeError.response?.data?.message || maybeError.message || fallback
}

function statusLabel(status: string) {
  if (status === 'bidding') return '竞价中'
  if (status === 'pending_award') return '待定标'
  if (status === 'awarded') return '已定标'
  if (status === 'order_created') return '已生成订单'
  if (status === 'failed') return '已流标'
  if (status === 'closed') return '已关闭'
  return status
}

function statusColor(status: string) {
  if (status === 'awarded' || status === 'order_created') return 'green'
  if (status === 'pending_award') return 'gold'
  if (status === 'failed' || status === 'closed') return 'default'
  return 'blue'
}

export default function BiddingPage() {
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<BiddingActivity | null>(null)
  const [stats, setStats] = useState<BiddingStats>({
    activeCount: 0,
    successCount: 0,
    totalTransaction: 0,
    participatingCompany: 0,
  })
  const [activities, setActivities] = useState<BiddingActivity[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsResult, listResult] = await Promise.all([
        marketService.getBiddingStats(),
        marketService.listBiddings({ page: 1, page_size: 20 }),
      ])
      setStats(statsResult)
      setActivities(listResult.list)
    } catch (error) {
      message.error('竞价交易数据加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const hotBiddings = useMemo(() => activities.filter((activity) => activeStatuses.has(activity.status)).slice(0, 3), [activities])
  const successBiddings = useMemo(() => activities.filter((activity) => successStatuses.has(activity.status)).slice(0, 3), [activities])

  const openBiddingDetail = async (id: number) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const detail = await marketService.getBidding(id)
      setSelectedActivity(detail)
    } catch (error) {
      message.error(getErrorMessage(error, '竞价详情加载失败'))
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const overviewStats = [
    { label: '进行中竞价', value: stats.activeCount, suffix: '场', icon: <ClockCircleOutlined />, color: 'text-blue-600' },
    { label: '竞价成功', value: stats.successCount, suffix: '场', icon: <CheckCircleOutlined />, color: 'text-green-600' },
    { label: '总成交金额', value: formatAmount(stats.totalTransaction), suffix: '', icon: <BankOutlined />, color: 'text-red-600' },
    { label: '参与企业', value: stats.participatingCompany, suffix: '家', icon: <TeamOutlined />, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color="blue" className="mb-4">实时竞价大厅</Tag>
              <Title level={1} className="!mb-3">竞价交易</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                聚合钢材现货和项目采购竞价活动，支持买家发起竞价、卖家参与报价，并沉淀成交记录与价格走势。
              </Paragraph>
            </div>
            <Space>
              <Link to="/dashboard/bidding"><Button type="primary" icon={<RiseOutlined />}>发起竞价</Button></Link>
              <Button icon={<UserSwitchOutlined />} onClick={() => void openSellerCenter('/seller/bidding')}>参与报价</Button>
            </Space>
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
        <Spin spinning={loading}>
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <Title level={2} className="!mb-2">热门竞价</Title>
                <Text type="secondary">实时展示参与度高、价格变化活跃的竞价活动。</Text>
              </div>
              <Tag color="red" icon={<CrownOutlined />}>热度榜</Tag>
            </div>
            {hotBiddings.length > 0 ? (
              <Row gutter={[16, 16]}>
                {hotBiddings.map((item) => (
                  <Col key={item.id} xs={24} lg={8}>
                    <Card hoverable className="h-full">
                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text type="secondary">{item.biddingNo}</Text>
                            <Title level={4} className="!mb-1 !mt-2">{item.title}</Title>
                          </div>
                          <Tag color={statusColor(item.status)}>{statusLabel(item.status)}</Tag>
                        </div>
                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">品类</Text><div className="mt-1 font-semibold">{item.category}</div></Col>
                          <Col span={12}><Text type="secondary">数量</Text><div className="mt-1 font-semibold">{formatQuantity(item)}</div></Col>
                          <Col span={12}><Text type="secondary">当前价</Text><div className="mt-1 font-semibold text-red-500">{formatPrice(item.currentPrice, item.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">降幅</Text><div className="mt-1 font-semibold text-green-600">{item.priceChangeRate.toFixed(1)}%</div></Col>
                        </Row>
                        <Progress percent={item.progress} showInfo={false} />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{item.participants} 家参与</span>
                          <span>剩余 {getRemainingText(item.endedAt)}</span>
                        </div>
                        <Button block onClick={() => void openBiddingDetail(item.id)}>查看竞价</Button>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card><Empty description="暂无进行中的热门竞价" /></Card>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <Title level={2} className="!mb-2">竞价成功</Title>
              <Text type="secondary">展示近期完成定标和成交确认的竞价记录。</Text>
            </div>
            {successBiddings.length > 0 ? (
              <Row gutter={[16, 16]}>
                {successBiddings.map((item) => (
                  <Col key={item.id} xs={24} lg={8}>
                    <Card className="h-full">
                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text type="secondary">{item.biddingNo}</Text>
                            <Title level={4} className="!mb-0 !mt-2">{item.title}</Title>
                          </div>
                          <Tag color="green" icon={<TrophyOutlined />}>成交</Tag>
                        </div>
                        <div className="rounded border border-gray-100 p-4">
                          <div className="mb-2 flex justify-between gap-4">
                            <Text type="secondary">采购方</Text>
                            <Text strong>{item.buyerName || '-'}</Text>
                          </div>
                          <div className="flex justify-between gap-4">
                            <Text type="secondary">中标方</Text>
                            <Text strong>{item.supplierName || '-'}</Text>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <Text type="secondary">成交金额</Text>
                            <div className="mt-1 text-xl font-semibold text-red-500">¥{formatAmount(item.dealAmount)}</div>
                          </div>
                          <div className="text-right">
                            <Tag color="green">节省 {item.savingRate.toFixed(1)}%</Tag>
                            <div className="mt-2 text-sm text-gray-500">{formatTime(item.closedAt)}</div>
                          </div>
                        </div>
                        <Button block onClick={() => void openBiddingDetail(item.id)}>查看详情</Button>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card><Empty description="暂无竞价成功记录" /></Card>
            )}
          </section>
        </Spin>
      </main>

      <Drawer
        title="竞价详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={760}
      >
        <Spin spinning={detailLoading}>
          {selectedActivity ? (
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Space className="mb-3">
                  <Tag color={statusColor(selectedActivity.status)}>{statusLabel(selectedActivity.status)}</Tag>
                  <Text type="secondary">{selectedActivity.biddingNo}</Text>
                </Space>
                <Title level={3} className="!mb-2">{selectedActivity.title}</Title>
                <Text type="secondary">采购方：{selectedActivity.buyerName || '-'}</Text>
              </div>

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="品类">{selectedActivity.category}</Descriptions.Item>
                <Descriptions.Item label="数量">{formatQuantity(selectedActivity)}</Descriptions.Item>
                <Descriptions.Item label="起始价">{formatPrice(selectedActivity.startPrice, selectedActivity.unit)}</Descriptions.Item>
                <Descriptions.Item label="当前价">{formatPrice(selectedActivity.currentPrice, selectedActivity.unit)}</Descriptions.Item>
                <Descriptions.Item label="交付区域" span={2}>{selectedActivity.deliveryRegion || '-'}</Descriptions.Item>
                <Descriptions.Item label="截止时间">{formatTime(selectedActivity.endedAt)}</Descriptions.Item>
                <Descriptions.Item label="报价数">{selectedActivity.quoteCount || selectedActivity.quotes?.length || 0} 次</Descriptions.Item>
              </Descriptions>

              <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Title level={4} className="!mb-1">进入工作台处理</Title>
                    <Text type="secondary">报价明细、供应商报价和定标操作已收敛到企业工作台。</Text>
                  </div>
                  <Space>
                    <Link to="/dashboard/bidding"><Button type="primary">买家工作台</Button></Link>
                    <Button onClick={() => void openSellerCenter('/seller/bidding')}>卖家工作台</Button>
                  </Space>
                </div>
              </Card>
            </Space>
          ) : null}
        </Spin>
      </Drawer>
    </div>
  )
}
