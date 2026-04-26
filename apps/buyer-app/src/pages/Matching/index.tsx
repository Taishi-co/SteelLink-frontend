import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  AimOutlined,
  BarChartOutlined,
  CarOutlined,
  CloudServerOutlined,
  PlusOutlined,
  RobotOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getBuyerToken } from '@/services/auth'
import { supplyDemandService } from '@/services/supplyDemandService'
import type { CreateSupplyDemandPayload, SupplyDemandPost, SupplyDemandStats, SupplyDemandType } from '@/services/supplyDemandService'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

type PostFormValues = Omit<CreateSupplyDemandPayload, 'tags'> & {
  tags?: string[]
}

interface Recommendation {
  sourceTitle: string
  target: SupplyDemandPost
  type: string
  matchRate: number
  reason: string
}

const postTypeMeta: Record<SupplyDemandType, { label: string; color: string; action: string; icon: ReactNode; description: string }> = {
  supply: {
    label: '供应信息',
    color: 'blue',
    action: '发布供应',
    icon: <ShopOutlined />,
    description: '发布现货、期货或加工能力，让采购方主动联系。',
  },
  demand: {
    label: '求购信息',
    color: 'green',
    action: '发布求购',
    icon: <PlusOutlined />,
    description: '填写品类、材质、数量和交付地，获得供应推荐。',
  },
  warehouse: {
    label: '仓储服务',
    color: 'purple',
    action: '发布仓储',
    icon: <CloudServerOutlined />,
    description: '发布仓库、装卸、短驳和库存监管服务。',
  },
  logistics: {
    label: '物流服务',
    color: 'orange',
    action: '发布物流',
    icon: <CarOutlined />,
    description: '发布线路、车型、时效和承运服务。',
  },
}

const postTypeOptions = [
  { label: '发布供应', value: 'supply' },
  { label: '发布求购', value: 'demand' },
  { label: '仓储服务', value: 'warehouse' },
  { label: '物流服务', value: 'logistics' },
]

const statCards = [
  { label: '已发布信息数', key: 'publishedCount', hint: '供应、求购与服务信息' },
  { label: '撮合成功数', key: 'matchedCount', hint: '有效撮合信息' },
  { label: '撮合金额数', key: 'matchedAmount', hint: '累计撮合交易规模' },
  { label: '今日新增数', key: 'todayNewCount', hint: '今日新增供需线索' },
] as const

function formatAmount(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString('zh-CN')
}

function formatPostDate(value: string) {
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

function formatRegion(post: SupplyDemandPost) {
  return [post.province, post.city, post.district].filter(Boolean).join(' / ') || '全国'
}

function formatPrice(post: SupplyDemandPost) {
  const value = post.targetPrice || post.budget
  if (!value) {
    return '面议'
  }
  const suffix = post.targetPrice ? ` / ${post.unit || '吨'}` : ''
  return `¥${value.toLocaleString('zh-CN')}${suffix}`
}

function formatQuantity(post: SupplyDemandPost) {
  if (!post.quantity) {
    return '数量待议'
  }
  return `${post.quantity.toLocaleString('zh-CN')} ${post.unit || '吨'}`
}

function buildRecommendation(myPost: SupplyDemandPost, target: SupplyDemandPost): Recommendation {
  const sameCategory = myPost.category && myPost.category === target.category
  const sameCity = myPost.city && myPost.city === target.city
  const score = Math.min(98, 72 + (sameCategory ? 16 : 0) + (sameCity ? 8 : 0) + Math.min(target.matchCount, 2))
  const type = myPost.type === 'supply' ? '求购匹配' : myPost.type === 'demand' ? '供应匹配' : '服务匹配'
  return {
    sourceTitle: myPost.title,
    target,
    type,
    matchRate: score,
    reason: `根据你发布的「${myPost.title}」，匹配到${sameCategory ? '同品类' : '相关'}信息「${target.title}」。`,
  }
}

function buildRecommendations(myPosts: SupplyDemandPost[], publicPosts: SupplyDemandPost[]) {
  const recommendations: Recommendation[] = []
  myPosts.forEach((myPost) => {
    const targetType: SupplyDemandType | null = myPost.type === 'supply' ? 'demand' : myPost.type === 'demand' ? 'supply' : null
    const candidates = publicPosts.filter((post) => {
      if (post.id === myPost.id) {
        return false
      }
      if (targetType) {
        return post.type === targetType && (!myPost.category || post.category === myPost.category)
      }
      return post.type === myPost.type && (!myPost.city || post.city === myPost.city)
    })
    candidates.slice(0, 2).forEach((target) => recommendations.push(buildRecommendation(myPost, target)))
  })
  return recommendations.slice(0, 3)
}

export default function MatchingPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<SupplyDemandType>('supply')
  const [stats, setStats] = useState<SupplyDemandStats>({
    publishedCount: 0,
    matchedCount: 0,
    matchedAmount: 0,
    todayNewCount: 0,
  })
  const [posts, setPosts] = useState<SupplyDemandPost[]>([])
  const [myPosts, setMyPosts] = useState<SupplyDemandPost[]>([])
  const [form] = Form.useForm<PostFormValues>()

  const isLoggedIn = Boolean(getBuyerToken())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsResult, supplyResult, demandResult, warehouseResult, logisticsResult, mineResult] = await Promise.all([
        supplyDemandService.getStats(),
        supplyDemandService.list({ page: 1, page_size: 6, type: 'supply', sort_by: 'newest' }),
        supplyDemandService.list({ page: 1, page_size: 6, type: 'demand', sort_by: 'newest' }),
        supplyDemandService.list({ page: 1, page_size: 6, type: 'warehouse', sort_by: 'newest' }),
        supplyDemandService.list({ page: 1, page_size: 6, type: 'logistics', sort_by: 'newest' }),
        isLoggedIn ? supplyDemandService.listMine({ page: 1, page_size: 6, sort_by: 'newest' }) : Promise.resolve({ list: [] as SupplyDemandPost[], total: 0, page: 1, pageSize: 6 }),
      ])
      setStats(statsResult)
      setPosts([
        ...supplyResult.list,
        ...demandResult.list,
        ...warehouseResult.list,
        ...logisticsResult.list,
      ])
      setMyPosts(mineResult.list)
    } catch (error) {
      message.error('供求信息加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const infoSections = useMemo(() => {
    return (Object.keys(postTypeMeta) as SupplyDemandType[]).map((type) => ({
      type,
      title: postTypeMeta[type].label,
      items: posts.filter((post) => post.type === type).slice(0, 3),
    }))
  }, [posts])

  const recommendations = useMemo(() => buildRecommendations(myPosts, posts), [myPosts, posts])

  const openCreate = (type: SupplyDemandType) => {
    if (!isLoggedIn) {
      message.warning('请先登录后再发布供求信息')
      return
    }
    setDefaultType(type)
    form.setFieldsValue({
      type,
      unit: type === 'warehouse' ? '平' : type === 'logistics' ? '车' : '吨',
      financing_required: false,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      await supplyDemandService.create({
        ...values,
        type: values.type || defaultType,
        tags: values.tags || [],
      })
      message.success('供求信息已发布')
      setModalOpen(false)
      form.resetFields()
      await loadData()
    } catch (error) {
      message.error('发布失败，请检查信息后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white pb-8 pt-10">
        <div className="mx-auto max-w-7xl px-8">
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {statCards.map((item) => {
                const value = item.key === 'matchedAmount' ? formatAmount(stats[item.key]) : stats[item.key].toLocaleString('zh-CN')
                return (
                  <Col key={item.label} xs={24} sm={12} lg={6}>
                    <Card className="h-full">
                      <Statistic title={item.label} value={value} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
                      <Text type="secondary">{item.hint}</Text>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Spin>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Title level={1} className="!mb-3">供求信息</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                聚合供需、仓储和物流线索，按品类、区域、价格和交付能力推荐可撮合商机。
              </Paragraph>
            </div>
            <Space>
              <Button icon={<UserOutlined />} disabled={!isLoggedIn}>
                我的发布
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('supply')}>
                发布信息
              </Button>
            </Space>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2">AI 智能撮合推荐</Title>
              <Text type="secondary">根据你已有的求购、供应和服务信息生成推荐</Text>
            </div>
            <Button icon={<RobotOutlined />} onClick={() => void loadData()} loading={loading}>
              刷新推荐
            </Button>
          </div>
          {recommendations.length > 0 ? (
            <Row gutter={[24, 24]}>
              {recommendations.map((item) => (
                <Col xs={24} lg={8} key={`${item.sourceTitle}-${item.target.id}`}>
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Tag color="blue">{item.type}</Tag>
                        <Title level={4} className="!mb-2 !mt-3">{item.target.title}</Title>
                      </div>
                      <Progress type="circle" percent={item.matchRate} size={64} />
                    </div>
                    <Paragraph className="min-h-[66px] text-gray-500">{item.reason}</Paragraph>
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between gap-4">
                        <Text type="secondary">区域</Text>
                        <Text strong>{formatRegion(item.target)}</Text>
                      </div>
                      <div className="flex justify-between gap-4">
                        <Text type="secondary">参考价格</Text>
                        <Text strong>{formatPrice(item.target)}</Text>
                      </div>
                    </div>
                    <Space wrap>
                      {item.target.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <Empty description={isLoggedIn ? '暂无可推荐信息，请先发布更多供求信息或等待平台新增线索' : '登录后可基于你的发布生成智能撮合推荐'} />
            </Card>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2">我的发布</Title>
              <Text type="secondary">查看自己发布的信息及当前撮合进展</Text>
            </div>
            <Button onClick={() => openCreate('demand')}>新增发布</Button>
          </div>
          <Card>
            {myPosts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {myPosts.map((item) => (
                  <Col xs={24} md={8} key={item.id}>
                    <div className="rounded border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <Text strong>{item.title}</Text>
                        <Tag color={postTypeMeta[item.type].color}>{postTypeMeta[item.type].label}</Tag>
                      </div>
                      <div className="mt-3 flex justify-between text-sm text-gray-500">
                        <span>{formatPostDate(item.createdAt)}</span>
                        <span>{item.matchCount} 条意向</span>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description={isLoggedIn ? '暂无我的发布' : '登录后查看我的发布'} />
            )}
          </Card>
        </section>

        <section className="mt-10">
          <Title level={2} className="!mb-5">发布与服务</Title>
          <Row gutter={[24, 24]}>
            {(Object.keys(postTypeMeta) as SupplyDemandType[]).map((type) => {
              const item = postTypeMeta[type]
              return (
                <Col key={type} xs={24} sm={12} lg={6}>
                  <Card hoverable className="h-full">
                    <div className="flex h-full flex-col">
                      <div className="mb-4 text-3xl text-primary-600">{item.icon}</div>
                      <Title level={4}>{item.action}</Title>
                      <Paragraph className="flex-1 text-gray-500">{item.description}</Paragraph>
                      <Button type="primary" ghost={type !== 'supply'} onClick={() => openCreate(type)}>
                        {item.action}
                      </Button>
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <BarChartOutlined className="text-xl text-primary-600" />
            <Title level={2} className="!mb-0">信息板块</Title>
          </div>
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {infoSections.map((section) => (
                <Col xs={24} lg={12} key={section.type}>
                  <Card title={section.title} className="h-full">
                    {section.items.length > 0 ? (
                      <Space direction="vertical" size="middle" className="w-full">
                        {section.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 rounded border border-gray-100 p-4">
                            <div>
                              <Text strong>{item.title}</Text>
                              <div className="mt-1 text-sm text-gray-500">
                                {[formatRegion(item), formatQuantity(item), item.spec].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                            <Tag color={postTypeMeta[item.type].color}>{formatPrice(item)}</Tag>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`暂无${section.title}`} />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Spin>
        </section>

        <section className="mt-10 rounded bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <AimOutlined className="mt-1 text-2xl text-primary-600" />
              <div>
                <Title level={3} className="!mb-2">继续补充供需信息，提升推荐准确度</Title>
                <Text type="secondary">完善品类、材质、交付地和预算后，AI 推荐会优先匹配更高可信度的信息。</Text>
              </div>
            </div>
            <Button type="primary" onClick={() => openCreate('demand')}>完善供求信息</Button>
          </div>
        </section>
      </main>

      <Modal
        title={postTypeMeta[defaultType].action}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        okText="发布"
        confirmLoading={submitting}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" initialValues={{ type: defaultType, unit: '吨', financing_required: false }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="信息类型" rules={[{ required: true, message: '请选择信息类型' }]}>
                <Select options={postTypeOptions} onChange={(value: SupplyDemandType) => setDefaultType(value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="品类" rules={[{ required: true, message: '请输入品类' }]}>
                <Input placeholder="如：热轧卷板" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="如：采购 300 吨螺纹钢 HRB400E" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="material" label="材质">
                <Input placeholder="如：Q235B" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="spec" label="规格">
                <Input placeholder="如：5.5*1500*C" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="quantity" label="数量">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="unit" label="单位">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="target_price" label="目标单价">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget" label="预算/报价">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="financing_required" label="需要融资">
                <Select options={[{ label: '否', value: false }, { label: '是', value: true }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="province" label="省份">
                <Input placeholder="如：上海" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="城市">
                <Input placeholder="如：上海" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区县">
                <Input placeholder="如：宝山" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="delivery_address" label="交付/服务地址">
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" tokenSeparators={[',', '，']} placeholder="如：急采、现货、可月结" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_name" label="联系人">
                <Input placeholder="联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_phone" label="联系电话">
                <Input placeholder="联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="详细描述">
            <TextArea rows={4} placeholder="补充交付周期、质量要求、付款方式等信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
