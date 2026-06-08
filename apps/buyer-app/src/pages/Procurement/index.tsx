import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Input, Row, Select, Space, Spin, Statistic, Tag, Typography, message } from 'antd'
import { ArrowRightOutlined, FileDoneOutlined, FormOutlined, ReloadOutlined, SearchOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { marketService } from '@/services/marketService'
import type { ProcurementProject } from '@/services/marketService'

const { Title, Paragraph, Text } = Typography

const statusMeta: Record<string, { label: string; color: string }> = {
  collecting: { label: '邀约中', color: 'gold' },
  quoting: { label: '报价中', color: 'blue' },
  awarded: { label: '已定标', color: 'green' },
  order_created: { label: '已转订单', color: 'purple' },
  closed: { label: '已关闭', color: 'default' },
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

export default function ProcurementPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProcurementProject[]>([])
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [category, setCategory] = useState<string | undefined>()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await marketService.listProcurementProjects({
        page: 1,
        page_size: 50,
        keyword: appliedKeyword,
        status,
        category,
      })
      setProjects(response.list)
    } catch {
      message.error('集采项目加载失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [appliedKeyword, category, status])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const quoting = projects.filter((item) => item.status === 'quoting').length
    const awarded = projects.filter((item) => item.status === 'awarded' || item.status === 'order_created').length
    const demand = projects.reduce((sum, item) => sum + Number(item.demandQuantity || 0), 0)
    const suppliers = projects.reduce((sum, item) => sum + Number(item.quotedSupplierCount || 0), 0)
    return { quoting, awarded, demand, suppliers }
  }, [projects])

  const applyFilters = () => {
    setAppliedKeyword(keyword.trim())
  }

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
              <Tag color="blue" className="mb-4">集采项目大厅</Tag>
              <Title level={1} className="!mb-3">集采大厅</Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                这里展示平台已归并的集采项目。买家可以查看归集需求、卖家报价进度和定标结果，决定是否继续提交采购申请。
              </Paragraph>
            </div>
            <Link to="/ai-procurement">
              <Button type="primary" icon={<FormOutlined />}>发起采购申请</Button>
            </Link>
          </div>

          <Spin spinning={loading}>
            <Row gutter={[16, 16]} className="mt-8">
              <Col xs={24} sm={12} lg={6}><Card><Statistic title="报价中项目" value={stats.quoting} suffix="个" prefix={<ShopOutlined />} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card><Statistic title="已归集需求" value={stats.demand} suffix="吨" prefix={<TeamOutlined />} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card><Statistic title="有效报价商家" value={stats.suppliers} suffix="家" prefix={<ShopOutlined />} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card><Statistic title="已定标项目" value={stats.awarded} suffix="个" prefix={<FileDoneOutlined />} /></Card></Col>
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
              placeholder="搜索项目编号、标题、商品"
              className="lg:max-w-md"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={applyFilters}
            />
            <Select
              className="lg:w-44"
              allowClear
              placeholder="项目状态"
              value={status}
              onChange={setStatus}
              options={[
                { label: '邀约中', value: 'collecting' },
                { label: '报价中', value: 'quoting' },
                { label: '已定标', value: 'awarded' },
                { label: '已转订单', value: 'order_created' },
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
          {projects.length > 0 ? (
            <Row gutter={[20, 20]}>
              {projects.map((project) => {
                const meta = statusMeta[project.status] || { label: project.status, color: 'default' }
                return (
                  <Col key={project.id} xs={24} lg={12}>
                    <Card hoverable className="h-full">
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Text type="secondary">{project.projectNo}</Text>
                            <Title level={3} className="!mb-2 !mt-2">{project.title}</Title>
                            <Paragraph className="text-gray-500 !mb-0">{project.productName || '-'} · {project.category || '-'}</Paragraph>
                          </div>
                          <Tag color={meta.color}>{meta.label}</Tag>
                        </div>

                        <Row gutter={[12, 12]}>
                          <Col span={12}><Text type="secondary">需求总量</Text><div className="mt-1 font-semibold">{formatQuantity(project.demandQuantity, project.unit)}</div></Col>
                          <Col span={12}><Text type="secondary">采购企业</Text><div className="mt-1 font-semibold">{project.buyerEnterpriseCount} 家</div></Col>
                          <Col span={12}><Text type="secondary">目标价格</Text><div className="mt-1 font-semibold">{formatMoney(project.targetPrice)}</div></Col>
                          <Col span={12}><Text type="secondary">有效报价</Text><div className="mt-1 font-semibold">{project.quotedSupplierCount} 家</div></Col>
                          <Col span={12}><Text type="secondary">报价截止</Text><div className="mt-1 font-semibold">{formatDateTime(project.quoteDeadline)}</div></Col>
                          <Col span={12}><Text type="secondary">收货地</Text><div className="mt-1 font-semibold">{project.deliveryAddress || '-'}</div></Col>
                        </Row>

                        <div className="rounded border border-gray-100 bg-gray-50 p-3">
                          <Space size="large" wrap>
                            <Text>需求单数：{project.buyerRequestCount}</Text>
                            <Text>邀约卖家：{project.invitedSupplierCount}</Text>
                            <Text>定标价：{project.awardUnitPrice ? formatMoney(project.awardUnitPrice) : '待定'}</Text>
                          </Space>
                        </div>

                        <Link to={`/procurement/${project.id}`} className="mt-auto">
                          <Button type="primary" icon={<ArrowRightOutlined />}>查看项目详情</Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          ) : (
            <Card>
              <Empty description="暂无符合条件的集采项目">
                <Link to="/ai-procurement">
                  <Button type="primary" icon={<FormOutlined />}>去发起采购申请</Button>
                </Link>
              </Empty>
            </Card>
          )}
        </Spin>
      </main>
    </div>
  )
}
