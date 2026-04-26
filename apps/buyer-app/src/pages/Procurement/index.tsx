import { Button, Card, Col, Form, Input, InputNumber, Row, Segmented, Select, Space, Statistic, Steps, Tag, Timeline, Typography, Upload } from 'antd'
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
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Space className="mb-4" size="small">
                <Tag color="blue">牵</Tag>
                <Text type="secondary">牵头方</Text>
                <Tag color="purple">平</Tag>
                <Text type="secondary">平台运营</Text>
              </Space>
              <Title level={1} className="!mb-3">2024年第一季度电解铜联合采购</Title>
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
