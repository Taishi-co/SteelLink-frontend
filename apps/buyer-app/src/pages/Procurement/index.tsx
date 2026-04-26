import { Button, Card, Col, Form, Input, InputNumber, Progress, Row, Segmented, Select, Space, Statistic, Steps, Tag, Timeline, Typography, Upload } from 'antd'
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FormOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const hallStats = [
  { label: '进行中集采', value: 12, suffix: '场' },
  { label: '累计参采企业', value: 386, suffix: '家' },
  { label: '归集采购金额', value: 28.6, suffix: '亿' },
  { label: '平均降本率', value: 6.8, suffix: '%' },
]

const procurementActivities = [
  {
    id: 'GP20240115001',
    title: '2024年第一季度电解铜联合采购',
    leader: '华东有色金属集采联盟',
    status: '筹备中',
    statusColor: 'gold',
    category: '大宗商品',
    target: '5,000 吨',
    budget: '¥1.0亿',
    stage: '集采筹备',
    progress: 8,
    companies: 0,
    quotes: 0,
    region: '上海 / 江苏 / 浙江',
    openDate: '2024-01-15',
  },
  {
    id: 'GP20240108006',
    title: '华南制造业螺纹钢联合采购',
    leader: '华南工程材料联合体',
    status: '企业报名',
    statusColor: 'blue',
    category: '建筑钢材',
    target: '12,000 吨',
    budget: '¥4,600万',
    stage: '企业报名',
    progress: 22,
    companies: 18,
    quotes: 0,
    region: '广州 / 深圳 / 佛山',
    openDate: '2024-01-08',
  },
  {
    id: 'GP20231228003',
    title: '长三角冷轧卷板年度框架集采',
    leader: '长三角汽车零部件采购联盟',
    status: '竞价报价',
    statusColor: 'purple',
    category: '工业品',
    target: '8,000 吨',
    budget: '¥3,200万',
    stage: '竞价报价',
    progress: 38,
    companies: 26,
    quotes: 9,
    region: '苏州 / 无锡 / 宁波',
    openDate: '2023-12-28',
  },
  {
    id: 'GP20231215002',
    title: '西南基建项目中厚板集采',
    leader: '西南基建供应链协同组',
    status: '评审定标',
    statusColor: 'cyan',
    category: '大宗商品',
    target: '6,500 吨',
    budget: '¥2,900万',
    stage: '评审定标',
    progress: 48,
    companies: 14,
    quotes: 7,
    region: '成都 / 重庆 / 贵阳',
    openDate: '2023-12-15',
  },
]

const processStages = [
  { title: '集采筹备', icon: <FormOutlined /> },
  { title: '企业报名', icon: <TeamOutlined /> },
  { title: '竞价报价', icon: <ShopOutlined /> },
  { title: '评审定标', icon: <TrophyOutlined /> },
  { title: '合同签约', icon: <FileProtectOutlined /> },
  { title: '履约备货', icon: <CloudUploadOutlined /> },
  { title: '货款结算', icon: <BankOutlined /> },
  { title: '成交归档', icon: <FileDoneOutlined /> },
  { title: '售后评价', icon: <SafetyCertificateOutlined /> },
]

const subStages = ['提交需求', '平台审核', '发布上线']

const realtimeStats = [
  { label: '参采企业', value: 0, suffix: '家' },
  { label: '归集需求', value: 0, suffix: '吨' },
  { label: '入围供应商', value: 0, suffix: '家' },
  { label: '收到报价', value: 0, suffix: '份' },
  { label: '已签合同', value: 0, suffix: '份' },
]

const previewItems = [
  { label: '品类', value: '大宗商品' },
  { label: '需求总量', value: '5,000 吨' },
  { label: '预算区间', value: '¥100~150亿' },
  { label: '交货周期', value: '30天' },
  { label: '报价方式', value: '公开报价' },
  { label: '评审标准', value: '综合评分' },
]

const activityLogs = [
  { children: '牵头方创建集采筹备草稿，等待需求表单提交。', color: 'blue' },
  { children: '平台运营待接收审核任务。', color: 'gray' },
  { children: 'AI需求校验尚未启动。', color: 'gray' },
]

export default function ProcurementPage() {
  const featuredActivity = procurementActivities[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={1} className="!mb-3">集采大厅</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                汇聚牵头方发起的联合采购活动，企业可报名拼单，供应商可参与报价，平台运营负责审核、评审与归档。
              </Paragraph>
            </div>
            <Space>
              <Button>查看我的报名</Button>
              <Button type="primary" icon={<FormOutlined />}>发起集采</Button>
            </Space>
          </div>

          <Row gutter={[16, 16]} className="mb-8">
            {hallStats.map((item) => (
              <Col key={item.label} xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic title={item.label} value={item.value} suffix={item.suffix} precision={item.label.includes('率') ? 1 : 0} />
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Space wrap>
                <Segmented options={['全部', '筹备中', '企业报名', '竞价报价', '评审定标', '合同签约']} defaultValue="全部" />
                <Select
                  defaultValue="全部品类"
                  style={{ width: 140 }}
                  options={[
                    { label: '全部品类', value: '全部品类' },
                    { label: '大宗商品', value: '大宗商品' },
                    { label: '工业品', value: '工业品' },
                    { label: '建筑钢材', value: '建筑钢材' },
                  ]}
                />
              </Space>
              <Input.Search placeholder="搜索集采活动、编号、牵头方" allowClear style={{ maxWidth: 360 }} />
            </div>
          </Card>

          <Row gutter={[24, 24]} className="mb-10">
            {procurementActivities.map((activity) => (
              <Col key={activity.id} xs={24} lg={12}>
                <Card hoverable className={`h-full ${activity.id === featuredActivity.id ? 'border-primary-300' : ''}`}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <Space className="mb-3" size="small">
                        <Tag color={activity.statusColor}>{activity.status}</Tag>
                        <Text type="secondary">{activity.id}</Text>
                      </Space>
                      <Title level={4} className="!mb-2">{activity.title}</Title>
                      <Text type="secondary">牵头方：{activity.leader}</Text>
                    </div>
                    <Button type={activity.id === featuredActivity.id ? 'primary' : 'default'}>查看详情</Button>
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Text type="secondary">品类</Text>
                      <div className="mt-1 font-semibold">{activity.category}</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">目标数量</Text>
                      <div className="mt-1 font-semibold">{activity.target}</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">预算</Text>
                      <div className="mt-1 font-semibold">{activity.budget}</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">参采企业</Text>
                      <div className="mt-1 font-semibold">{activity.companies} 家</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">收到报价</Text>
                      <div className="mt-1 font-semibold">{activity.quotes} 份</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">区域</Text>
                      <div className="mt-1 font-semibold">{activity.region}</div>
                    </Col>
                  </Row>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm text-gray-500">
                      <span>当前阶段：{activity.stage}</span>
                      <span>发起日期：{activity.openDate}</span>
                    </div>
                    <Progress percent={activity.progress} size="small" />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={2} className="!mb-2">活动工作台</Title>
              <Text type="secondary">当前展示选中活动的牵头方筹备工作台。</Text>
            </div>
            <Tag color="blue" className="w-fit px-3 py-1">当前选中：{featuredActivity.id}</Tag>
          </div>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Space className="mb-4" size="small">
                <Tag color="blue">牵</Tag>
                <Text type="secondary">牵头方</Text>
                <Tag color="purple">平</Tag>
                <Text type="secondary">平台运营</Text>
              </Space>
              <Title level={2} className="!mb-3">2024年第一季度电解铜联合采购</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                编号：GP20240115001 | 牵头方：华东有色金属集采联盟
              </Paragraph>
            </div>
            <Tag color="gold" className="px-4 py-2 text-base">筹备中</Tag>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card>
                <Text type="secondary">集采品类</Text>
                <div className="mt-2 text-xl font-semibold">大宗商品</div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Text type="secondary">目标数量</Text>
                <div className="mt-2 text-xl font-semibold">5,000 吨</div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Text type="secondary">预算区间</Text>
                <div className="mt-2 text-xl font-semibold">¥1.0亿</div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Text type="secondary">当前阶段</Text>
                <div className="mt-2 text-xl font-semibold">集采筹备</div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <section>
          <Title level={2} className="!mb-5">实时数据</Title>
          <Row gutter={[16, 16]}>
            {realtimeStats.map((item) => (
              <Col key={item.label} xs={24} sm={12} lg={5}>
                <Card>
                  <Statistic title={item.label} value={item.value} suffix={item.suffix} />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mt-10">
          <Title level={2} className="!mb-5">集采全流程进度</Title>
          <Card>
            <Steps
              current={0}
              items={processStages.map((stage, index) => ({
                title: stage.title,
                icon: stage.icon,
                description: `${index + 1}`,
              }))}
            />
          </Card>
        </section>

        <section className="mt-10">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card
                title="第一阶段：集采筹备与发起"
                extra={<Tag color="blue">牵头方操作</Tag>}
              >
                <Steps
                  size="small"
                  current={0}
                  className="mb-8"
                  items={subStages.map((title, index) => ({ title, description: `${index + 1}` }))}
                />

                <Form layout="vertical">
                  <Title level={4}>1 集采基础信息</Title>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="集采品类">
                        <Segmented block options={['大宗商品', '工业品']} defaultValue="大宗商品" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="采购标的">
                        <Input placeholder="如：电解铜/T1级" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="需求总量">
                        <InputNumber addonAfter="吨" defaultValue={5000} min={0} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="预算区间（亿）">
                        <Space.Compact className="w-full">
                          <InputNumber defaultValue={100} min={0} className="w-full" />
                          <InputNumber defaultValue={150} min={0} className="w-full" />
                        </Space.Compact>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="交货周期（天）">
                        <InputNumber defaultValue={30} min={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="交货地点">
                        <Input placeholder="如：上海、江苏、浙江指定仓库" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={4}>2 集采规则设定</Title>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item label="拼单门槛（家）" extra="达到此数量才可开标">
                        <InputNumber defaultValue={10} min={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="金额门槛（亿）" extra="需求总金额需达到此门槛">
                        <InputNumber defaultValue={30} min={0} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="报价方式">
                        <Select defaultValue="公开报价" options={[{ label: '公开报价', value: '公开报价' }, { label: '暗标竞价', value: '暗标竞价' }]} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="评审标准">
                        <Select defaultValue="综合评分" options={[{ label: '综合评分', value: '综合评分' }, { label: '最低价中标', value: '最低价中标' }, { label: '资质优先', value: '资质优先' }]} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={4}>3 资质文件上传</Title>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="牵头方授权书">
                        <Upload.Dragger beforeUpload={() => false} maxCount={1}>
                          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                          <p className="ant-upload-text">点击上传</p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="集采计划说明">
                        <Upload.Dragger beforeUpload={() => false} maxCount={1}>
                          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                          <p className="ant-upload-text">点击上传</p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={4}>4 AI需求校验</Title>
                  <Space>
                    <Button icon={<AuditOutlined />}>启动AI校验</Button>
                    <Button type="primary" icon={<CheckCircleOutlined />}>提交集采需求</Button>
                  </Space>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size="large" className="w-full">
                <Card title="集采预览">
                  <Space direction="vertical" size="middle" className="w-full">
                    {previewItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded border border-gray-100 p-3">
                        <Text type="secondary">{item.label}</Text>
                        <Text strong>{item.value}</Text>
                      </div>
                    ))}
                  </Space>
                </Card>

                <Card title="活动日志">
                  <Timeline items={activityLogs} />
                </Card>
              </Space>
            </Col>
          </Row>
        </section>
      </main>
    </div>
  )
}
