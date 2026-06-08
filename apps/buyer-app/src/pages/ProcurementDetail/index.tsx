import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Card, Col, Descriptions, Empty, List, Row, Space, Spin, Statistic, Steps, Tag, Timeline, Typography, message } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, FileDoneOutlined, FormOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementProject } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const processStages = [
  { title: '需求归集', description: '采购需求汇总', icon: <FormOutlined /> },
  { title: '卖家报名', description: '受邀卖家确认参与', icon: <TeamOutlined /> },
  { title: '卖家报价', description: '提交最新有效报价', icon: <ShopOutlined /> },
  { title: '平台定标', description: '选择中标供应商', icon: <CheckCircleOutlined /> },
  { title: '生成订单', description: '转入商城订单', icon: <FileDoneOutlined /> },
]

const statusMeta: Record<string, { label: string; color: string; step: number }> = {
  collecting: { label: '邀约中', color: 'gold', step: 0 },
  quoting: { label: '报价中', color: 'blue', step: 2 },
  awarded: { label: '已定标', color: 'green', step: 3 },
  order_created: { label: '已转订单', color: 'purple', step: 4 },
  closed: { label: '已关闭', color: 'default', step: 4 },
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function formatMoney(value?: number) {
  if (!value) return '-'
  return `¥${Number(value).toLocaleString('zh-CN')}`
}

function formatQuantity(value?: number, unit?: string) {
  return `${Number(value || 0).toLocaleString('zh-CN')} ${unit || '吨'}`
}

export default function ProcurementDetailPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<ProcurementProject | null>(null)

  const loadData = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setProject(await marketService.getProcurementProject(projectId))
    } catch {
      message.error('集采项目详情加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const quoteRanking = useMemo(
    () => [...(project?.quotes || [])].sort((a, b) => a.unitPrice - b.unitPrice),
    [project],
  )

  if (!loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-8 py-12">
          <Card>
            <Empty description="集采项目不存在" />
            <div className="mt-6 text-center">
              <Link to="/procurement"><Button type="primary">返回集采大厅</Button></Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  const meta = project ? statusMeta[project.status] || { label: project.status, color: 'default', step: 0 } : statusMeta.collecting

  return (
    <div className="min-h-screen bg-gray-50">
      <Spin spinning={loading}>
        {project ? (
          <>
            <section className="bg-white py-10">
              <div className="mx-auto max-w-7xl px-8">
                <Link to="/procurement" className="mb-6 inline-flex items-center gap-2 text-primary-600">
                  <ArrowLeftOutlined />
                  返回集采大厅
                </Link>
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Space className="mb-4" size="small" wrap>
                      <Tag color="blue">平台集采项目</Tag>
                      <Tag color={meta.color}>{meta.label}</Tag>
                      {project.orderNo ? <Tag color="purple">订单 {project.orderNo}</Tag> : null}
                    </Space>
                    <Title level={1} className="!mb-3">{project.title}</Title>
                    <Paragraph className="text-lg text-gray-500 !mb-0">
                      项目编号：{project.projectNo} | 商品：{project.productName || '-'} | 品类：{project.category || '-'}
                    </Paragraph>
                  </div>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}><Card><Statistic title="需求总量" value={project.demandQuantity} suffix={project.unit || '吨'} /></Card></Col>
                  <Col xs={24} md={6}><Card><Statistic title="采购企业" value={project.buyerEnterpriseCount} suffix="家" /></Card></Col>
                  <Col xs={24} md={6}><Card><Statistic title="有效报价" value={project.quotedSupplierCount} suffix="家" /></Card></Col>
                  <Col xs={24} md={6}><Card><Statistic title="定标价格" value={project.awardUnitPrice || 0} prefix="¥" /></Card></Col>
                </Row>
              </div>
            </section>

            <main className="mx-auto max-w-7xl px-8 py-10">
              <section>
                <Title level={2} className="!mb-5">项目流程</Title>
                <Card>
                  <Steps
                    current={meta.step}
                    items={processStages.map((stage) => ({
                      title: stage.title,
                      description: stage.description,
                      icon: stage.icon,
                    }))}
                  />
                </Card>
              </section>

              <section className="mt-10">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={15}>
                    <Card title="项目概览">
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="商品名称">{project.productName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="材质/规格">{[project.material, project.spec].filter(Boolean).join(' / ') || '-'}</Descriptions.Item>
                        <Descriptions.Item label="目标价格">{formatMoney(project.targetPrice)}</Descriptions.Item>
                        <Descriptions.Item label="报价截止">{formatDateTime(project.quoteDeadline)}</Descriptions.Item>
                        <Descriptions.Item label="收货地址" span={2}>{project.deliveryAddress || '-'}</Descriptions.Item>
                        <Descriptions.Item label="中标供应商">{project.awardSupplierName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="中标交期">{project.awardDeliveryDays ? `${project.awardDeliveryDays} 天` : '-'}</Descriptions.Item>
                        <Descriptions.Item label="平台备注" span={2}>{project.adminRemark || '-'}</Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="采购需求明细" className="mt-6">
                      <List
                        dataSource={project.requests}
                        locale={{ emptyText: '暂无归集的采购需求' }}
                        renderItem={(item) => (
                          <List.Item>
                            <div className="w-full">
                              <div className="flex items-center justify-between gap-3">
                                <Space wrap>
                                  <Text strong>{item.requestNo}</Text>
                                  <Tag>{item.buyerName || `企业 ${item.buyerEnterpriseId}`}</Tag>
                                </Space>
                                <Text>{formatQuantity(item.quantity, item.unit)}</Text>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                联系人：{item.contactName || '-'} {item.contactPhone || ''}，收货地：{item.deliveryAddress || '-'}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} lg={9}>
                    <Card title="报价看板">
                      {quoteRanking.length > 0 ? (
                        <List
                          dataSource={quoteRanking}
                          renderItem={(item, index) => (
                            <List.Item>
                              <div className="w-full">
                                <div className="flex items-center justify-between gap-3">
                                  <Space wrap>
                                    <Tag color={index === 0 ? 'green' : 'default'}>#{index + 1}</Tag>
                                    <Text strong>{item.sellerName}</Text>
                                  </Space>
                                  <Text strong>{formatMoney(item.unitPrice)}</Text>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  供货量：{formatQuantity(item.supplyQuantity, item.unit)}，交期：{item.deliveryDays} 天
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="卖家尚未提交有效报价" />
                      )}
                    </Card>

                    <Card title="项目动态" className="mt-6">
                      <Timeline
                        items={(project.logs || []).map((item) => ({
                          color: item.color || 'blue',
                          children: (
                            <div>
                              <div>{item.content}</div>
                              <div className="text-xs text-gray-400">{formatDateTime(item.createdAt)}</div>
                            </div>
                          ),
                        }))}
                      />
                    </Card>

                    {project.awardSupplierName ? (
                      <Alert
                        className="mt-6"
                        type={project.orderNo ? 'success' : 'info'}
                        showIcon
                        message={project.orderNo ? '项目已转商城订单' : '项目已完成定标'}
                        description={`中标供应商：${project.awardSupplierName}，中标价：${formatMoney(project.awardUnitPrice)}`}
                      />
                    ) : null}
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
