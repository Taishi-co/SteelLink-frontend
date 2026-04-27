import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, Col, Empty, Form, Input, InputNumber, Row, Segmented, Select, Space, Spin, Statistic, Steps, Tag, Timeline, Typography, Upload, message } from 'antd'
import {
  ArrowLeftOutlined,
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
import { marketService } from '@/services/marketService'
import type { ProcurementActivity } from '@/services/marketService'

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
const stageIndexMap: Record<string, number> = {
  集采筹备: 0,
  企业报名: 1,
  竞价报价: 2,
  评审定标: 3,
  合同签约: 4,
  履约备货: 5,
  货款结算: 6,
  成交归档: 7,
  售后评价: 8,
}

function formatQuantity(value: number, unit: string) {
  return `${value.toLocaleString('zh-CN')} ${unit || '吨'}`
}

export default function ProcurementDetailPage() {
  const params = useParams()
  const activityID = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<ProcurementActivity | null>(null)

  const loadData = useCallback(async () => {
    if (!activityID) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setActivity(await marketService.getProcurement(activityID))
    } catch (error) {
      message.error('集采活动详情加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [activityID])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (!loading && !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-8 py-12">
          <Card>
            <Empty description="集采活动不存在" />
            <div className="mt-6 text-center">
              <Link to="/procurement"><Button type="primary">返回集采大厅</Button></Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  const previewItems = activity ? [
    { label: '品类', value: activity.category },
    { label: '采购标的', value: activity.target },
    { label: '需求总量', value: formatQuantity(activity.targetQuantity, activity.unit) },
    { label: '预算区间', value: activity.budgetDisplay },
    { label: '交货周期', value: `${activity.deliveryDays}天` },
    { label: '报价方式', value: activity.quoteMode },
    { label: '评审标准', value: activity.evaluationMode },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Spin spinning={loading}>
        {activity ? (
          <>
            <section className="bg-white py-10">
              <div className="mx-auto max-w-7xl px-8">
                <Link to="/procurement" className="mb-6 inline-flex items-center gap-2 text-primary-600">
                  <ArrowLeftOutlined />
                  返回集采大厅
                </Link>
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Space className="mb-4" size="small">
                      <Tag color="blue">牵</Tag>
                      <Text type="secondary">牵头方</Text>
                      <Tag color="purple">平</Tag>
                      <Text type="secondary">平台运营</Text>
                    </Space>
                    <Title level={1} className="!mb-3">{activity.title}</Title>
                    <Paragraph className="text-lg text-gray-500 !mb-0">
                      编号：{activity.procurementNo} | 牵头方：{activity.leaderName}
                    </Paragraph>
                  </div>
                  <Tag color="gold" className="px-4 py-2 text-base">{activity.stage}</Tag>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}><Card><Text type="secondary">集采品类</Text><div className="mt-2 text-xl font-semibold">{activity.category}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">目标数量</Text><div className="mt-2 text-xl font-semibold">{formatQuantity(activity.targetQuantity, activity.unit)}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">预算区间</Text><div className="mt-2 text-xl font-semibold">{activity.budgetDisplay}</div></Card></Col>
                  <Col xs={24} md={6}><Card><Text type="secondary">当前阶段</Text><div className="mt-2 text-xl font-semibold">{activity.stage}</div></Card></Col>
                </Row>
              </div>
            </section>

            <main className="mx-auto max-w-7xl px-8 py-10">
              <section>
                <Title level={2} className="!mb-5">实时数据</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="参采企业" value={activity.participatingCount} suffix="家" /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="归集需求" value={activity.demandQuantity} suffix={activity.unit} /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="入围供应商" value={activity.qualifiedSuppliers} suffix="家" /></Card></Col>
                  <Col xs={24} sm={12} lg={5}><Card><Statistic title="收到报价" value={activity.quoteCount} suffix="份" /></Card></Col>
                  <Col xs={24} sm={12} lg={4}><Card><Statistic title="已签合同" value={activity.contractCount} suffix="份" /></Card></Col>
                </Row>
              </section>

              <section className="mt-10">
                <Title level={2} className="!mb-5">集采全流程进度</Title>
                <Card>
                  <Steps
                    current={stageIndexMap[activity.stage] || 0}
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
                    <Card title="第一阶段：集采筹备与发起" extra={<Tag color="blue">牵头方操作</Tag>}>
                      <Steps size="small" current={0} className="mb-8" items={subStages.map((title, index) => ({ title, description: `${index + 1}` }))} />

                      <Form layout="vertical">
                        <Title level={4}>1 集采基础信息</Title>
                        <Row gutter={16}>
                          <Col xs={24} md={12}><Form.Item label="集采品类"><Segmented block options={['大宗商品', '工业品']} value={activity.category} /></Form.Item></Col>
                          <Col xs={24} md={12}><Form.Item label="采购标的"><Input value={activity.target} readOnly /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="需求总量"><Input value={formatQuantity(activity.targetQuantity, activity.unit)} readOnly /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="预算区间"><Input value={activity.budgetDisplay} readOnly /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="交货周期（天）"><InputNumber value={activity.deliveryDays} className="w-full" readOnly /></Form.Item></Col>
                          <Col span={24}><Form.Item label="交货地点"><Input value={activity.region} readOnly /></Form.Item></Col>
                        </Row>

                        <Title level={4}>2 集采规则设定</Title>
                        <Row gutter={16}>
                          <Col xs={24} md={8}><Form.Item label="拼单门槛（家）"><InputNumber value={10} className="w-full" readOnly /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="金额门槛"><Input value={activity.budgetDisplay} readOnly /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="报价方式"><Select value={activity.quoteMode} options={[{ label: activity.quoteMode, value: activity.quoteMode }]} /></Form.Item></Col>
                          <Col xs={24} md={8}><Form.Item label="评审标准"><Select value={activity.evaluationMode} options={[{ label: activity.evaluationMode, value: activity.evaluationMode }]} /></Form.Item></Col>
                        </Row>

                        <Title level={4}>3 资质文件上传</Title>
                        <Row gutter={16}>
                          {(activity.documents.length > 0 ? activity.documents : ['牵头方授权书', '集采计划说明']).map((document) => (
                            <Col key={document} xs={24} md={12}>
                              <Form.Item label={document}>
                                <Upload.Dragger beforeUpload={() => false} maxCount={1}>
                                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                                  <p className="ant-upload-text">点击上传</p>
                                </Upload.Dragger>
                              </Form.Item>
                            </Col>
                          ))}
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
                        <Timeline items={activity.logs.map((log) => ({ children: log.content, color: log.color }))} />
                      </Card>
                    </Space>
                  </Col>
                </Row>
              </section>
            </main>
          </>
        ) : null}
      </Spin>
    </div>
  )
}
