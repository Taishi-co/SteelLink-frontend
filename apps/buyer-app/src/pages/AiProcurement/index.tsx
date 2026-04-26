import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Input, Progress, Row, Space, Spin, Steps, Tag, Timeline, Typography, message } from 'antd'
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  LoginOutlined,
  MessageOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { getBuyerToken } from '@/services/auth'
import { aiProcurementService } from '@/services/aiProcurementService'
import type { AIProcurementInfo, AIProcurementParseResult, AIProcurementStageCode, StageInfo } from '@/services/aiProcurementService'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const stageIcons: Record<AIProcurementStageCode, ReactNode> = {
  instruction_parsing: <MessageOutlined />,
  product_matching: <FileSearchOutlined />,
  order_generation: <ShoppingCartOutlined />,
  financing_matching: <BankOutlined />,
  review_submission: <AuditOutlined />,
}

const stageOrder: AIProcurementStageCode[] = [
  'instruction_parsing',
  'product_matching',
  'order_generation',
  'financing_matching',
  'review_submission',
]

const defaultStages: StageInfo[] = [
  { code: 'instruction_parsing', name: '指令解析', status: 'pending', description: '识别采购品类、数量、用途和融资意图' },
  { code: 'product_matching', name: '商品匹配', status: 'pending', description: '按商品、库存、价格和供应商能力匹配' },
  { code: 'order_generation', name: '订单生成', status: 'pending', description: '生成订单草稿和交易要素' },
  { code: 'financing_matching', name: '融资匹配', status: 'pending', description: '匹配订单融资和备选金融产品' },
  { code: 'review_submission', name: '审核提交', status: 'pending', description: '提交平台审核并进入后续履约' },
]

function formatMoney(value?: number) {
  if (!value) {
    return '待计算'
  }
  return `¥${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function formatRate(value: number) {
  if (!value) {
    return '按授信评估'
  }
  return `年化 ${value.toFixed(1)}%`
}

function normalizeStages(stages?: StageInfo[]) {
  if (!stages?.length) {
    return defaultStages
  }
  const stageMap = new Map(stages.map((stage) => [stage.code, stage]))
  return stageOrder.map((code) => stageMap.get(code) || defaultStages.find((stage) => stage.code === code)!)
}

function getCurrentStageIndex(stages: StageInfo[]) {
  const processingIndex = stages.findIndex((stage) => stage.status === 'processing')
  if (processingIndex >= 0) {
    return processingIndex
  }
  const completedCount = stages.filter((stage) => stage.status === 'completed').length
  return Math.max(0, Math.min(completedCount, stages.length - 1))
}

function getResultFromProcurement(procurement: AIProcurementInfo): AIProcurementParseResult {
  return {
    parsed: procurement.parsed_instruction,
    matched_products: procurement.matched_products,
    order_draft: procurement.order_draft,
    finance_plans: procurement.finance_plans,
    audit_items: procurement.audit_items,
    stages: procurement.stages,
  }
}

export default function AiProcurementPage() {
  const [prompt, setPrompt] = useState('')
  const [parsing, setParsing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingMine, setLoadingMine] = useState(false)
  const [result, setResult] = useState<AIProcurementParseResult | null>(null)
  const [currentProcurement, setCurrentProcurement] = useState<AIProcurementInfo | null>(null)
  const [mine, setMine] = useState<AIProcurementInfo[]>([])
  const isLoggedIn = Boolean(getBuyerToken())

  const loadMine = useCallback(async () => {
    if (!isLoggedIn) {
      setMine([])
      return
    }
    setLoadingMine(true)
    try {
      const response = await aiProcurementService.listMine({ page: 1, page_size: 5 })
      setMine(response.list)
    } catch (error) {
      message.error('AI采购记录加载失败')
    } finally {
      setLoadingMine(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    void loadMine()
  }, [loadMine])

  const stages = useMemo(() => normalizeStages(result?.stages), [result?.stages])
  const currentStep = useMemo(() => getCurrentStageIndex(stages), [stages])

  const handleParse = async () => {
    const value = prompt.trim()
    if (!isLoggedIn) {
      message.warning('请先登录后再使用AI采购')
      return
    }
    if (!value) {
      message.warning('请先输入采购需求')
      return
    }
    setParsing(true)
    try {
      const parseResult = await aiProcurementService.parse(value)
      setResult(parseResult)
      setCurrentProcurement(null)
      message.success('采购指令解析完成')
    } catch (error) {
      message.error('采购指令解析失败')
    } finally {
      setParsing(false)
    }
  }

  const handleCreate = async () => {
    const value = prompt.trim()
    if (!isLoggedIn) {
      message.warning('请先登录后再发起AI采购')
      return
    }
    if (!value) {
      message.warning('请先输入采购需求')
      return
    }
    setCreating(true)
    try {
      const procurement = await aiProcurementService.create(value)
      setCurrentProcurement(procurement)
      setResult(getResultFromProcurement(procurement))
      await loadMine()
      message.success('AI采购单已创建')
    } catch (error) {
      message.error('AI采购单创建失败，请确认企业账号已完成认证')
    } finally {
      setCreating(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!currentProcurement) {
      message.warning('请先创建AI采购单')
      return
    }
    setSubmitting(true)
    try {
      const procurement = await aiProcurementService.submitReview(currentProcurement.id)
      setCurrentProcurement(procurement)
      setResult(getResultFromProcurement(procurement))
      await loadMine()
      message.success('已提交审核')
    } catch (error) {
      message.error('提交审核失败')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedResult = result

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={1} className="!mb-3">AI采购</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                用自然语言描述采购目标，系统自动完成需求解析、商品匹配、订单生成、融资匹配与审核提交。
              </Paragraph>
            </div>
            {!isLoggedIn ? (
              <Link to="/login">
                <Button type="primary" icon={<LoginOutlined />}>登录后使用</Button>
              </Link>
            ) : (
              <Button type="primary" icon={<RobotOutlined />} onClick={handleCreate} loading={creating}>
                发起 AI 采购
              </Button>
            )}
          </div>

          <Card className="mt-8">
            <Text strong>采购对话</Text>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <TextArea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="例如：帮我采购100套工业轴承，用于设备维修，需要申请订单融资"
                autoSize={{ minRows: 3, maxRows: 4 }}
              />
              <Button
                type="primary"
                size="large"
                icon={<MessageOutlined />}
                className="h-full min-h-[96px]"
                onClick={handleParse}
                loading={parsing}
              >
                解析采购指令
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <section>
          <Title level={2} className="!mb-5">采购流程可视化</Title>
          <Card>
            <Steps
              current={currentStep}
              items={stages.map((item) => ({
                title: item.name,
                description: item.description,
                icon: stageIcons[item.code],
              }))}
            />
          </Card>
        </section>

        {!selectedResult ? (
          <Card className="mt-10">
            <Empty description={isLoggedIn ? '输入采购需求并解析后展示真实工作流结果' : '登录后可解析采购需求并创建AI采购单'} />
          </Card>
        ) : (
          <>
            <section className="mt-10">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <Card title="1. 指令解析" className="h-full">
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="flex items-center justify-between rounded border border-gray-100 p-3">
                        <Text type="secondary">采购物品</Text>
                        <Text strong>{selectedResult.parsed.product_name || '-'}</Text>
                      </div>
                      <div className="flex items-center justify-between rounded border border-gray-100 p-3">
                        <Text type="secondary">采购数量</Text>
                        <Text strong>{selectedResult.parsed.quantity} {selectedResult.parsed.unit}</Text>
                      </div>
                      <div className="flex items-center justify-between rounded border border-gray-100 p-3">
                        <Text type="secondary">业务用途</Text>
                        <Text strong>{selectedResult.parsed.usage || '-'}</Text>
                      </div>
                      <div className="flex items-center justify-between rounded border border-gray-100 p-3">
                        <Text type="secondary">金融需求</Text>
                        <Text strong>{selectedResult.parsed.financing_required ? '订单融资' : '暂无'}</Text>
                      </div>
                      <Progress percent={Math.round((selectedResult.parsed.confidence || 0) * 100)} size="small" />
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={16}>
                  <Card title="2. 商品匹配" className="h-full">
                    {selectedResult.matched_products.length > 0 ? (
                      <Space direction="vertical" size="middle" className="w-full">
                        {selectedResult.matched_products.map((item, index) => (
                          <div key={`${item.product_id || index}-${item.product_name}`} className="grid gap-4 rounded border border-gray-100 p-4 md:grid-cols-[1fr_140px_96px] md:items-center">
                            <div>
                              <Text strong>{item.product_name}</Text>
                              <div className="mt-1 text-sm text-gray-500">{item.steel_mill || item.match_reason}</div>
                            </div>
                            <Text strong>{formatMoney(item.unit_price)} / 件</Text>
                            <Progress percent={item.score} size="small" />
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Empty description="暂无商品匹配结果" />
                    )}
                  </Card>
                </Col>
              </Row>
            </section>

            <section className="mt-10">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="3. 订单生成" className="h-full">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div className="rounded bg-gray-50 p-4">
                          <Text type="secondary">推荐订单金额</Text>
                          <div className="mt-2 text-lg font-semibold text-gray-900">{formatMoney(selectedResult.order_draft.estimated_amount)}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="rounded bg-gray-50 p-4">
                          <Text type="secondary">采购数量</Text>
                          <div className="mt-2 text-lg font-semibold text-gray-900">
                            {selectedResult.order_draft.quantity} {selectedResult.order_draft.unit}
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="rounded bg-gray-50 p-4">
                          <Text type="secondary">付款方式</Text>
                          <div className="mt-2 text-lg font-semibold text-gray-900">{selectedResult.order_draft.payment_method || '-'}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="rounded bg-gray-50 p-4">
                          <Text type="secondary">交付说明</Text>
                          <div className="mt-2 text-lg font-semibold text-gray-900">{selectedResult.order_draft.delivery_note || '-'}</div>
                        </div>
                      </Col>
                    </Row>
                    <Button type="primary" block className="mt-5" onClick={handleCreate} loading={creating}>
                      {currentProcurement ? '更新为采购单结果' : '生成采购单'}
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="4. 融资匹配" className="h-full">
                    {selectedResult.finance_plans.length > 0 ? (
                      <Space direction="vertical" size="middle" className="w-full">
                        {selectedResult.finance_plans.map((item) => (
                          <div key={`${item.provider}-${item.product_name}`} className="flex items-center justify-between gap-4 rounded border border-gray-100 p-4">
                            <div>
                              <Text strong>{item.provider} · {item.product_name}</Text>
                              <div className="mt-1 text-sm text-gray-500">{formatMoney(item.amount)} · {formatRate(item.rate)} · {item.term_days} 天</div>
                            </div>
                            <Tag color={item.matched ? 'blue' : 'default'}>{item.matched ? '匹配' : '备选'}</Tag>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Empty description="当前采购需求未要求融资或暂无融资方案" />
                    )}
                  </Card>
                </Col>
              </Row>
            </section>

            <section className="mt-10">
              <Card title="5. 审核提交">
                <Timeline
                  items={selectedResult.audit_items.map((item) => ({
                    color: item.status === 'passed' || item.status === 'submitted' ? 'green' : 'gray',
                    dot: item.status === 'passed' || item.status === 'submitted' ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                    children: (
                      <div>
                        <Text strong>{item.name}</Text>
                        <div className="text-sm text-gray-500">{item.message}</div>
                      </div>
                    ),
                  }))}
                />
                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Text type="secondary">提交前会合并订单、融资与企业资料，由业务和风控共同审核。</Text>
                  <Button type="primary" icon={<AuditOutlined />} onClick={handleSubmitReview} loading={submitting} disabled={!currentProcurement}>
                    提交审核
                  </Button>
                </div>
              </Card>
            </section>
          </>
        )}

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <Title level={2} className="!mb-0">我的AI采购</Title>
            <Button onClick={() => void loadMine()} loading={loadingMine}>刷新</Button>
          </div>
          <Spin spinning={loadingMine}>
            <Card>
              {mine.length > 0 ? (
                <Space direction="vertical" size="middle" className="w-full">
                  {mine.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full rounded border border-gray-100 bg-white p-4 text-left transition hover:border-primary-300 hover:bg-primary-50"
                      onClick={() => {
                        setCurrentProcurement(item)
                        setResult(getResultFromProcurement(item))
                        setPrompt(item.prompt)
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Text strong>{item.procurement_no}</Text>
                          <div className="mt-1 text-sm text-gray-500">{item.prompt}</div>
                        </div>
                        <Tag color={item.status === 'review_submitted' ? 'green' : 'blue'}>{item.status}</Tag>
                      </div>
                    </button>
                  ))}
                </Space>
              ) : (
                <Empty description={isLoggedIn ? '暂无AI采购记录' : '登录后查看我的AI采购'} />
              )}
            </Card>
          </Spin>
        </section>
      </main>
    </div>
  )
}
