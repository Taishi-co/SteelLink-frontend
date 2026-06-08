import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, List, Row, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, ClockCircleOutlined, FileDoneOutlined, ShoppingCartOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementProject, ProcurementRequest } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { color: string; text: string }> = {
  collecting: { color: 'gold', text: '邀约中' },
  quoting: { color: 'blue', text: '报价中' },
  awarded: { color: 'green', text: '已定标' },
  order_created: { color: 'purple', text: '已转订单' },
  closed: { color: 'default', text: '已关闭' },
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

function statusTag(status: string) {
  const meta = statusMeta[status] || { color: 'default', text: status || '-' }
  return <Tag color={meta.color}>{meta.text}</Tag>
}

export default function GroupProcurementModulePage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProcurementProject[]>([])
  const [requests, setRequests] = useState<ProcurementRequest[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectResult, requestResult] = await Promise.all([
        marketService.listMyProcurementProjects({ page: 1, page_size: 50 }),
        marketService.listMyProcurementRequests({ page: 1, page_size: 50 }),
      ])
      setProjects(projectResult.list)
      setRequests(requestResult.list)
    } catch {
      message.error('我的集采加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const quoting = projects.filter((item) => item.status === 'quoting').length
    const ordered = projects.filter((item) => item.status === 'order_created').length
    const demand = requests.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    return { quoting, ordered, demand }
  }, [projects, requests])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-8 py-10">
        <section className="rounded bg-white p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color="green">采购方工作台</Tag>
              <Title level={1} className="!mb-3 !mt-4">我的集采</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                查看本企业已提交的采购需求，以及这些需求当前归属的集采项目、报价进度和最终定标结果。
              </Paragraph>
            </div>
            <Link to="/procurement">
              <Button type="primary" icon={<ShoppingCartOutlined />}>进入集采大厅</Button>
            </Link>
          </div>
        </section>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="mt-8">
            <Col xs={24} md={6}><Card><Statistic title="已归属项目" value={projects.length} suffix="个" prefix={<TeamOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="报价中" value={stats.quoting} suffix="个" prefix={<ClockCircleOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="已转订单" value={stats.ordered} suffix="个" prefix={<FileDoneOutlined />} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="累计需求量" value={stats.demand} suffix="吨" prefix={<ShoppingCartOutlined />} /></Card></Col>
          </Row>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <Title level={2} className="!mb-0">我的集采项目</Title>
              <Tag>{projects.length} 个</Tag>
            </div>
            {projects.length > 0 ? (
              <Row gutter={[16, 16]}>
                {projects.map((project) => (
                  <Col key={project.id} xs={24} lg={12}>
                    <Card hoverable className="h-full">
                      <Space direction="vertical" size="middle" className="w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Text type="secondary">{project.projectNo}</Text>
                            <Title level={4} className="!mb-1 !mt-2">{project.title}</Title>
                            <Text type="secondary">{project.productName || '-'} · {project.category || '-'}</Text>
                          </div>
                          {statusTag(project.status)}
                        </div>

                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">我的需求数</Text><div className="mt-1 font-semibold">{project.requests.length} 条</div></Col>
                          <Col span={12}><Text type="secondary">项目需求量</Text><div className="mt-1 font-semibold">{formatQuantity(project.demandQuantity, project.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">报价商家</Text><div className="mt-1 font-semibold">{project.quotedSupplierCount} 家</div></Col>
                          <Col span={12}><Text type="secondary">定标价格</Text><div className="mt-1 font-semibold">{formatMoney(project.awardUnitPrice)}</div></Col>
                        </Row>

                        <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                          报价截止：{formatDateTime(project.quoteDeadline)}；中标供应商：{project.awardSupplierName || '待定'}
                        </div>

                        <Link to={`/procurement/${project.id}`}>
                          <Button type="primary" icon={<ArrowRightOutlined />}>查看项目详情</Button>
                        </Link>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card>
                <Empty description="暂无已归属的集采项目">
                  <Link to="/procurement">
                    <Button type="primary" icon={<ShoppingCartOutlined />}>去查看集采大厅</Button>
                  </Link>
                </Empty>
              </Card>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <Title level={2} className="!mb-0">我的采购需求</Title>
              <Tag>{requests.length} 条</Tag>
            </div>
            <Card>
              <List
                dataSource={requests}
                locale={{ emptyText: '暂无采购需求记录' }}
                renderItem={(item) => (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-3">
                        <Space wrap>
                          <Text strong>{item.requestNo}</Text>
                          <Tag>{item.status || '-'}</Tag>
                        </Space>
                        <Text>{formatQuantity(item.quantity, item.unit)}</Text>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {item.productName || '-'} · 目标价 {formatMoney(item.targetPrice)} · 收货地 {item.deliveryAddress || '-'}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </section>
        </Spin>
      </main>
    </div>
  )
}
