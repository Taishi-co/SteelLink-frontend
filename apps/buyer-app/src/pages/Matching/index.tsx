import { Button, Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'
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

const { Title, Paragraph, Text } = Typography

const stats = [
  { label: '已发布信息数', value: '1,286', hint: '供应、求购与服务信息' },
  { label: '撮合成功数', value: '342', hint: '近 90 天有效撮合' },
  { label: '撮合金额数', value: '8.6亿', hint: '累计撮合交易规模' },
  { label: '今日新增数', value: '28', hint: '今日新增供需线索' },
]

const recommendations = [
  {
    title: '热轧卷板 Q235B 求购线索',
    type: '供应匹配',
    matchRate: 96,
    region: '上海 / 江苏',
    price: '¥3,820-3,880 / 吨',
    reason: '匹配你已发布的华东热轧卷板现货供应，规格和交付区域高度一致。',
    tags: ['热轧卷板', 'Q235B', '现货'],
  },
  {
    title: '低合金中板供应商推荐',
    type: '求购匹配',
    matchRate: 91,
    region: '山东 / 河北',
    price: '¥4,050 / 吨起',
    reason: '根据你的中板采购需求，推荐可承接 500 吨以上批量交付的供应方。',
    tags: ['中板', 'Q355B', '批量采购'],
  },
  {
    title: '华南仓储与短驳组合',
    type: '服务匹配',
    matchRate: 88,
    region: '佛山 / 广州',
    price: '仓储 ¥18 / 吨 / 月',
    reason: '与你近期华南到货计划匹配，可覆盖仓储、装卸和短驳配送。',
    tags: ['仓储', '短驳', '华南'],
  },
]

const myPosts = [
  { title: '采购 300 吨螺纹钢 HRB400E', status: '撮合中', date: '今天 09:30', replies: 6 },
  { title: '供应 800 吨热轧卷板 Q235B', status: '已有意向', date: '昨天 16:10', replies: 12 },
  { title: '上海宝山仓储服务需求', status: '待确认', date: '04-25 11:20', replies: 3 },
]

const actionBoards = [
  {
    title: '发布供应',
    description: '发布现货、期货或加工能力，让采购方主动联系。',
    icon: <ShopOutlined />,
    button: '发布供应',
    color: 'blue',
  },
  {
    title: '发布求购',
    description: '填写品类、材质、数量和交付地，获得供应推荐。',
    icon: <PlusOutlined />,
    button: '发布求购',
    color: 'green',
  },
  {
    title: '仓储服务',
    description: '匹配仓库、装卸、短驳和库存监管服务。',
    icon: <CloudServerOutlined />,
    button: '寻找仓储',
    color: 'purple',
  },
  {
    title: '物流服务',
    description: '按线路、车型、时效和预算匹配承运资源。',
    icon: <CarOutlined />,
    button: '寻找物流',
    color: 'orange',
  },
]

const infoSections = [
  {
    title: '供应信息',
    items: [
      { name: '热轧卷板 Q235B', meta: '上海宝山 · 1,200 吨', tag: '现货' },
      { name: '螺纹钢 HRB400E', meta: '杭州萧山 · 680 吨', tag: '可议价' },
      { name: '镀锌卷 DX51D', meta: '佛山顺德 · 420 吨', tag: '今日上新' },
    ],
  },
  {
    title: '求购信息',
    items: [
      { name: '采购低合金中板 Q355B', meta: '南京 · 500 吨 · 7 日内交付', tag: '急采' },
      { name: '采购冷轧卷 SPCC', meta: '苏州 · 300 吨 · 可分批', tag: '长期' },
      { name: '采购无缝管 20#', meta: '宁波 · 180 吨 · 含运输', tag: '询价中' },
    ],
  },
  {
    title: '仓储服务信息',
    items: [
      { name: '华东钢材仓储中心', meta: '上海宝山 · 35,000 平 · 可监管', tag: '推荐' },
      { name: '佛山乐从室内仓', meta: '佛山 · 18,000 平 · 可装卸', tag: '热门' },
      { name: '天津滨海露天堆场', meta: '天津 · 50,000 平 · 近港口', tag: '港口' },
    ],
  },
  {
    title: '物流服务信息',
    items: [
      { name: '上海至杭州整车运输', meta: '13 米平板 · 次日达', tag: '高频' },
      { name: '佛山至深圳短驳配送', meta: '卷板专线 · 可夜配', tag: '专线' },
      { name: '天津至山东大宗运输', meta: '长期承运 · 可月结', tag: '月结' },
    ],
  },
]

export default function MatchingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-8">
          <Row gutter={[24, 24]}>
            {stats.map((item) => (
              <Col xs={24} sm={12} lg={6} key={item.label}>
                <Card className="h-full">
                  <Statistic title={item.label} value={item.value} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
                  <Text type="secondary">{item.hint}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Title level={1} className="!mb-3">供求信息</Title>
              <Paragraph className="text-gray-500 text-lg !mb-0">
                聚合供需、仓储和物流线索，按品类、区域、价格和交付能力推荐可撮合商机。
              </Paragraph>
            </div>
            <Space>
              <Button icon={<UserOutlined />}>我的发布</Button>
              <Button type="primary" icon={<PlusOutlined />}>发布信息</Button>
            </Space>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <Title level={2} className="!mb-2">AI 智能撮合推荐</Title>
              <Text type="secondary">根据你已有的求购、供应和服务信息生成推荐</Text>
            </div>
            <Button icon={<RobotOutlined />}>刷新推荐</Button>
          </div>
          <Row gutter={[24, 24]}>
            {recommendations.map((item) => (
              <Col xs={24} lg={8} key={item.title}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Tag color="blue">{item.type}</Tag>
                      <Title level={4} className="!mt-3 !mb-2">{item.title}</Title>
                    </div>
                    <Progress type="circle" percent={item.matchRate} size={64} />
                  </div>
                  <Paragraph className="text-gray-500 min-h-[66px]">{item.reason}</Paragraph>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between gap-4">
                      <Text type="secondary">区域</Text>
                      <Text strong>{item.region}</Text>
                    </div>
                    <div className="flex justify-between gap-4">
                      <Text type="secondary">参考价格</Text>
                      <Text strong>{item.price}</Text>
                    </div>
                  </div>
                  <Space wrap>
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                  <Button type="primary" block className="mt-5">查看撮合详情</Button>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Title level={2} className="!mb-2">我的发布</Title>
              <Text type="secondary">查看自己发布的信息及当前撮合进展</Text>
            </div>
            <Button>查看全部</Button>
          </div>
          <Card>
            <Row gutter={[16, 16]}>
              {myPosts.map((item) => (
                <Col xs={24} md={8} key={item.title}>
                  <div className="rounded border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Text strong>{item.title}</Text>
                      <Tag color="processing">{item.status}</Tag>
                    </div>
                    <div className="mt-3 flex justify-between text-sm text-gray-500">
                      <span>{item.date}</span>
                      <span>{item.replies} 条意向</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </section>

        <section className="mt-10">
          <Title level={2} className="!mb-5">发布与服务</Title>
          <Row gutter={[24, 24]}>
            {actionBoards.map((item) => (
              <Col xs={24} sm={12} lg={6} key={item.title}>
                <Card hoverable className="h-full">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 text-3xl text-primary-600">{item.icon}</div>
                    <Title level={4}>{item.title}</Title>
                    <Paragraph className="text-gray-500 flex-1">{item.description}</Paragraph>
                    <Button type="primary" ghost={item.color !== 'blue'}>{item.button}</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3 mb-5">
            <BarChartOutlined className="text-xl text-primary-600" />
            <Title level={2} className="!mb-0">信息板块</Title>
          </div>
          <Row gutter={[24, 24]}>
            {infoSections.map((section) => (
              <Col xs={24} lg={12} key={section.title}>
                <Card title={section.title} className="h-full">
                  <Space direction="vertical" size="middle" className="w-full">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-4 rounded border border-gray-100 p-4">
                        <div>
                          <Text strong>{item.name}</Text>
                          <div className="mt-1 text-sm text-gray-500">{item.meta}</div>
                        </div>
                        <Tag color="blue">{item.tag}</Tag>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
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
            <Button type="primary">完善供求信息</Button>
          </div>
        </section>
      </main>
    </div>
  )
}
