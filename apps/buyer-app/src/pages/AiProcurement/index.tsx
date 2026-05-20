import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AutoComplete, Button, Card, Col, Descriptions, Empty, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Spin, Steps, Switch, Tag, Typography, message } from 'antd'
import {
  AuditOutlined,
  BankOutlined,
  CopyOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LoginOutlined,
  MessageOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { getBuyerToken } from '@/services/auth'
import { aiProcurementService } from '@/services/aiProcurementService'
import { categoryService, fallbackProductCategories, type ProductCategory } from '@/services/categoryService'
import { serviceOfferService } from '@/services/serviceOfferService'
import { supplyDemandService } from '@/services/supplyDemandService'
import type {
  AIProcurementInfo,
  AIProcurementParseResult,
  AIProcurementStageCode,
  FinancePlan,
  LogisticsOption,
  MatchedProduct,
  OrderFormPayload,
  ParsedInstruction,
} from '@/services/aiProcurementService'
import type { WarehouseServiceItem } from '@/services/serviceOfferService'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

interface ProcurementStep {
  step: number
  code: AIProcurementStageCode
  title: string
  description: string
}

const procurementSteps: ProcurementStep[] = [
  { step: 1, code: 'instruction_parsing', title: '指令解析', description: '确认商品、数量、用途和融资意图' },
  { step: 2, code: 'product_matching', title: '商品匹配', description: '召回候选商品并选择下单商品' },
  { step: 3, code: 'logistics_warehouse_matching', title: '物流仓储匹配', description: '按发货仓库、收货地址和物流服务估算到手成本' },
  { step: 4, code: 'order_generation', title: '订单生成', description: '填写真实订单信息并锁定库存' },
  { step: 5, code: 'financing_matching', title: '融资匹配', description: '按需匹配订单融资方案' },
  { step: 6, code: 'review_submission', title: '审核提交', description: '确认订单和融资后提交审核' },
]

const stageIcons: Record<AIProcurementStageCode, ReactNode> = {
  instruction_parsing: <MessageOutlined />,
  product_matching: <FileSearchOutlined />,
  logistics_warehouse_matching: <TruckOutlined />,
  order_generation: <ShoppingCartOutlined />,
  financing_matching: <BankOutlined />,
  review_submission: <AuditOutlined />,
}

const examplePrompts = [
  '帮我采购100套工业轴承，用于设备维修，需要申请订单融资',
  '采购300吨HRB400E螺纹钢，华东交付，优先选择现货库存',
  '找5家可供应热轧卷板的钢厂资源，要求两周内交付并支持账期',
]

const defaultParsed: ParsedInstruction = {
  product_name: '',
  category: '',
  quantity: 1,
  unit: '吨',
  usage: '',
  financing_required: false,
  keywords: [],
  confidence: 0,
  delivery_address: '',
  delivery_address_source: 'manual',
  delivery_warehouse_id: undefined,
  delivery_warehouse_name: '',
}

function formatMoney(value?: number) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
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

function getStepFromParam(step?: string) {
  const numericStep = Number(step)
  if (Number.isInteger(numericStep) && numericStep >= 1 && numericStep <= procurementSteps.length) {
    return numericStep
  }
  return null
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

function toOrderFormPayload(values: OrderFormPayload): OrderFormPayload {
  const destWarehouseServiceId = Number(values.dest_warehouse_service_id || 0)
  return {
    quantity: Number(values.quantity || 0),
    contact_name: values.contact_name,
    contact_phone: values.contact_phone,
    warehouse_name: values.warehouse_name,
    dest_warehouse_service_id: destWarehouseServiceId > 0 ? destWarehouseServiceId : undefined,
    delivery_address: values.delivery_address,
    delivery_method: values.delivery_method,
    payment_method: values.payment_method,
    delivery_note: values.delivery_note,
    remark: values.remark,
  }
}

function sumSelectedQuantity(items: MatchedProduct[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

function nearlyEqual(left: number, right: number) {
  return Math.abs(left - right) < 0.0001
}

function warehouseAddress(item: WarehouseServiceItem) {
  return [item.province, item.city, item.district, item.address].filter(Boolean).join('')
}

function productLandedTotal(item: MatchedProduct) {
  return item.landed_total || item.total_amount || item.quantity * item.unit_price
}

function scaledFreightEstimate(item: MatchedProduct, quantity: number) {
  if (!item.freight_estimate || !item.quantity) {
    return 0
  }
  return (item.freight_estimate / item.quantity) * quantity
}

function applyLogisticsOption(product: MatchedProduct, option: LogisticsOption): MatchedProduct {
  return {
    ...product,
    logistics_service_id: option.service_id,
    logistics_service_name: option.service_name,
    logistics_route: option.route,
    freight_estimate: option.freight_estimate,
    landed_total: option.landed_total,
    unit_landed_price: option.unit_landed_price,
    logistics_match_status: 'matched',
  }
}

function hasPendingLogisticsResolution(items: MatchedProduct[]) {
  return items.some((item) => item.logistics_match_status === 'no_match' || item.logistics_match_status === 'destination_missing')
}

function isOrderableProduct(item: MatchedProduct) {
  return Number(item.product_id || 0) > 0
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const messageText = response?.data?.message
    if (messageText) {
      return messageText
    }
  }
  return fallback
}

function mergeParsedInstruction(base: ParsedInstruction, values: Partial<ParsedInstruction>): ParsedInstruction {
  const quantity = Number(values.quantity ?? base.quantity)
  const confidence = Number(values.confidence ?? base.confidence)
  return {
    ...base,
    ...values,
    product_name: String(values.product_name ?? base.product_name ?? '').trim(),
    category: String(values.category ?? base.category ?? '').trim(),
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : base.quantity,
    unit: String(values.unit ?? base.unit ?? '').trim(),
    usage: String(values.usage ?? base.usage ?? '').trim(),
    financing_required: Boolean(values.financing_required ?? base.financing_required),
    keywords: values.keywords && values.keywords.length > 0 ? values.keywords : base.keywords,
    confidence: Number.isFinite(confidence) && confidence >= 0 ? confidence : base.confidence,
    delivery_address: String(values.delivery_address ?? base.delivery_address ?? '').trim(),
    delivery_address_source: values.delivery_address_source ?? base.delivery_address_source,
    delivery_warehouse_id: values.delivery_warehouse_id ?? base.delivery_warehouse_id,
    delivery_warehouse_name: String(values.delivery_warehouse_name ?? base.delivery_warehouse_name ?? '').trim(),
  }
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  textArea.style.top = '0'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const copied = document.execCommand('copy')
    if (!copied) {
      throw new Error('copy failed')
    }
  } finally {
    document.body.removeChild(textArea)
  }
}

export default function AiProcurementPage() {
  const navigate = useNavigate()
  const params = useParams<{ step?: string }>()
  const activeStep = getStepFromParam(params.step)
  const [instructionForm] = Form.useForm<ParsedInstruction>()
  const [orderForm] = Form.useForm<OrderFormPayload>()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingMine, setLoadingMine] = useState(false)
  const [result, setResult] = useState<AIProcurementParseResult | null>(null)
  const [currentProcurement, setCurrentProcurement] = useState<AIProcurementInfo | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<MatchedProduct[]>([])
  const [selectedFinanceServiceId, setSelectedFinanceServiceId] = useState<number | undefined>()
  const [mine, setMine] = useState<AIProcurementInfo[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseServiceItem[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>(fallbackProductCategories)
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

  useEffect(() => {
    serviceOfferService.listWarehouses({ page: 1, page_size: 50 })
      .then((response) => setWarehouses(response.data.list))
      .catch(() => setWarehouses([]))
  }, [])

  useEffect(() => {
    categoryService.list()
      .then((response) => setCategories(response.data.length > 0 ? response.data : fallbackProductCategories))
      .catch(() => setCategories(fallbackProductCategories))
  }, [])

  useEffect(() => {
    if (result?.parsed) {
      instructionForm.setFieldsValue(result.parsed)
    }
  }, [instructionForm, result?.parsed])

  useEffect(() => {
    if (selectedProducts.length > 0) {
      orderForm.setFieldsValue({
        quantity: sumSelectedQuantity(selectedProducts),
        warehouse_name: selectedProducts.map((item) => item.origin_warehouse_name || String(item.warehouse?.warehouse_name || '')).filter(Boolean).join('；'),
        dest_warehouse_service_id: result?.parsed.delivery_warehouse_id,
        delivery_address: result?.parsed.delivery_address || '',
        payment_method: '线上合同 + 对公转账',
        delivery_method: '平台协同配送',
      })
    }
  }, [orderForm, result?.parsed.delivery_address, selectedProducts])

  const currentStep = activeStep ? activeStep - 1 : 0
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.display_name || category.name,
        value: category.name,
      })),
    [categories],
  )

  const updateResult = (patch: Partial<AIProcurementParseResult>) => {
    setResult((prev) => ({
      parsed: patch.parsed ?? prev?.parsed ?? defaultParsed,
      matched_products: patch.matched_products ?? prev?.matched_products ?? [],
      order_draft: patch.order_draft ?? prev?.order_draft ?? {
        order_no: '',
        product_name: '',
        quantity: 0,
        unit: '',
        estimated_amount: 0,
        payment_method: '',
        delivery_note: '',
      },
      finance_plans: patch.finance_plans ?? prev?.finance_plans ?? [],
      audit_items: patch.audit_items ?? prev?.audit_items ?? [],
      stages: patch.stages ?? prev?.stages ?? [],
    }))
  }

  const getLatestParsedInstruction = useCallback(() => {
    if (!result) {
      return null
    }
    return mergeParsedInstruction(result.parsed, instructionForm.getFieldsValue())
  }, [instructionForm, result])

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
    setBusy(true)
    try {
      const parseResult = await aiProcurementService.parse(value)
      setResult(parseResult)
      setCurrentProcurement(null)
      setSelectedProducts([])
      setSelectedFinanceServiceId(undefined)
      navigate('/ai-procurement/1')
      message.success('采购指令解析完成，请确认参数')
    } catch (error) {
      message.error(getApiErrorMessage(error, '采购指令解析失败'))
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmInstruction = async () => {
    if (!result) {
      message.warning('请先解析采购需求')
      return
    }
    setBusy(true)
    try {
      const values = await instructionForm.validateFields()
      const parsedForRequest = mergeParsedInstruction(result.parsed, values)
      const confirmed = await aiProcurementService.confirmInstruction(prompt, parsedForRequest)
      const confirmedParsed = mergeParsedInstruction(confirmed.parsed, parsedForRequest)
      instructionForm.setFieldsValue(confirmedParsed)
      const matched = await aiProcurementService.matchProducts(confirmedParsed)
      updateResult({
        parsed: confirmedParsed,
        matched_products: matched.matched_products,
        stages: matched.stages,
      })
      setSelectedProducts([])
      navigate('/ai-procurement/2')
      message.success('参数已确认，商品召回完成')
    } catch (error) {
      message.error(getApiErrorMessage(error, '确认参数或召回商品失败'))
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmProduct = async () => {
    const selectedQuantity = sumSelectedQuantity(selectedProducts)
    if (selectedProducts.length === 0) {
      message.warning('请选择至少一个商品')
      return
    }
    if (selectedProducts.some((item) => !isOrderableProduct(item))) {
      message.warning('参考采购方案不能直接下单，请选择有商品编号的现货商品')
      return
    }
    const parsedForRequest = getLatestParsedInstruction()
    if (!parsedForRequest || !nearlyEqual(selectedQuantity, parsedForRequest.quantity)) {
      message.warning(`拼单数量需要等于采购数量：${parsedForRequest?.quantity || 0}${parsedForRequest?.unit || ''}`)
      return
    }
    setBusy(true)
    try {
      const matched = await aiProcurementService.matchLogisticsWarehouse({
        parsed: parsedForRequest,
        selected_products: selectedProducts,
      })
      setSelectedProducts(matched.matched_products)
      updateResult({
        parsed: parsedForRequest,
        matched_products: matched.matched_products,
        stages: matched.stages,
      })
      navigate('/ai-procurement/3')
      message.success('物流仓储方案匹配完成')
    } catch (error) {
      message.error(getApiErrorMessage(error, '物流仓储匹配失败'))
    } finally {
      setBusy(false)
    }
  }

  const handleGenerateOrder = async () => {
    if (!result || selectedProducts.length === 0) {
      message.warning('请先确认参数并选择商品')
      return
    }
    setBusy(true)
    try {
      const values = await orderForm.validateFields()
      const parsedForRequest = getLatestParsedInstruction()
      if (!parsedForRequest) {
        message.warning('请先确认参数')
        return
      }
      const destWarehouseServiceId = Number(parsedForRequest.delivery_warehouse_id || values.dest_warehouse_service_id || 0)
      const response = await aiProcurementService.generateOrder({
        prompt,
        parsed: parsedForRequest,
        selected_products: selectedProducts,
        order_form: {
          ...toOrderFormPayload(values),
          dest_warehouse_service_id: destWarehouseServiceId > 0 ? destWarehouseServiceId : undefined,
          quantity: sumSelectedQuantity(selectedProducts),
        },
      })
      const procurementResult = getResultFromProcurement(response.procurement)
      setCurrentProcurement(response.procurement)
      setResult(procurementResult)
      setSelectedProducts(procurementResult.matched_products.filter((product) => product.selected))
      setSelectedFinanceServiceId(response.procurement.finance_plans.find((item) => item.selected)?.finance_service_id)
      if (response.procurement.financing_required) {
        const financeMatched = await aiProcurementService.matchFinance(response.procurement.id, true)
        const financeResult = getResultFromProcurement(financeMatched)
        setCurrentProcurement(financeMatched)
        setResult(financeResult)
        setSelectedProducts(financeResult.matched_products.filter((product) => product.selected))
        setSelectedFinanceServiceId(financeMatched.finance_plans[0]?.finance_service_id)
        navigate('/ai-procurement/5')
      } else {
        navigate('/ai-procurement/6')
      }
      message.success('真实订单已生成')
    } catch (error) {
      message.error(getApiErrorMessage(error, '订单生成失败，请确认商品库存和企业认证状态'))
    } finally {
      setBusy(false)
    }
  }

  const handleMatchFinance = async (required: boolean, financeServiceId?: number) => {
    if (!currentProcurement) {
      message.warning('请先生成订单')
      return
    }
    setBusy(true)
    try {
      const procurement = await aiProcurementService.matchFinance(currentProcurement.id, required, financeServiceId)
      const procurementResult = getResultFromProcurement(procurement)
      setCurrentProcurement(procurement)
      setResult(procurementResult)
      setSelectedProducts(procurementResult.matched_products.filter((product) => product.selected))
      const selectedID = procurement.finance_plans.find((item) => item.selected)?.finance_service_id
      setSelectedFinanceServiceId(selectedID || procurement.finance_plans[0]?.finance_service_id)
      if (required && !financeServiceId && procurement.finance_plans.length > 0) {
        navigate('/ai-procurement/5')
        message.success('融资产品已召回，请选择心仪产品')
        return
      }
      navigate('/ai-procurement/6')
      message.success(required ? '融资方案匹配完成' : '已跳过融资匹配')
    } catch (error) {
      message.error(getApiErrorMessage(error, '融资匹配失败'))
    } finally {
      setBusy(false)
    }
  }

  const submitReviewWithHistoryChoice = (saveHistory: boolean) => {
    if (!currentProcurement) {
      message.warning('请先生成订单')
      return
    }
    setSubmitting(true)
    aiProcurementService.submitReview(currentProcurement.id, saveHistory)
      .then(async (procurement) => {
        setCurrentProcurement(procurement)
        setResult(getResultFromProcurement(procurement))
        await loadMine()
        message.success(saveHistory ? '已提交审核并保存到历史AI采购' : '已提交审核，本次信息不保存到历史AI采购')
        navigate('/ai-procurement')
      })
      .catch((error) => message.error(getApiErrorMessage(error, '提交审核失败')))
      .finally(() => setSubmitting(false))
  }

  const handleSubmitReview = () => {
    if (!currentProcurement) {
      message.warning('请先生成订单')
      return
    }
    Modal.confirm({
      title: '提交审核',
      content: '提交后是否需要保存此次AI采购信息到历史AI采购？',
      okText: '提交并保存',
      cancelText: '提交但不保存',
      onOk: () => submitReviewWithHistoryChoice(true),
      onCancel: () => submitReviewWithHistoryChoice(false),
    })
  }

  const openProcurement = (item: AIProcurementInfo, step = 6) => {
    setCurrentProcurement(item)
    setResult(getResultFromProcurement(item))
    setPrompt(item.prompt)
    setSelectedProducts(item.matched_products.filter((product) => product.selected))
    navigate(`/ai-procurement/${step}`)
  }

  const handleRepeatProcurement = (item: AIProcurementInfo) => {
    setPrompt(item.prompt)
    setResult(null)
    setCurrentProcurement(null)
    setSelectedProducts([])
    instructionForm.resetFields()
    orderForm.resetFields()
    navigate('/ai-procurement')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    message.success('已填入采购对话，可重新解析')
  }

  const handleCopyProcurementPrompt = async (item: AIProcurementInfo) => {
    try {
      await copyText(item.prompt)
      message.success('采购对话已复制')
    } catch {
      message.error('复制失败，请手动复制采购对话')
    }
  }

  const handleToggleProduct = (product: MatchedProduct) => {
    if (!isOrderableProduct(product)) {
      message.warning('该条是参考采购方案，未绑定真实现货商品，不能直接下单')
      return
    }
    setSelectedProducts((prev) => {
      const exists = prev.some((item) => item.product_id === product.product_id)
      if (exists) {
        return prev.filter((item) => item.product_id !== product.product_id)
      }
      const remaining = Math.max((result?.parsed.quantity || 0) - sumSelectedQuantity(prev), 0)
      const available = product.available_qty || product.quantity || remaining
      return [...prev, { ...product, selected: true, quantity: Math.min(remaining || available, available) }]
    })
  }

  const handleProductQuantityChange = (product: MatchedProduct, quantity: number | null) => {
    const nextQuantity = Number(quantity || 0)
    setSelectedProducts((prev) => prev.map((item) => (
      item.product_id === product.product_id
        ? {
            ...item,
            quantity: nextQuantity,
            total_amount: nextQuantity * item.unit_price,
            freight_estimate: scaledFreightEstimate(item, nextQuantity),
            landed_total: nextQuantity * item.unit_price + scaledFreightEstimate(item, nextQuantity),
            unit_landed_price: item.unit_price + scaledFreightEstimate(item, nextQuantity) / (nextQuantity || 1),
          }
        : item
    )))
  }

  const handleSelectLogisticsOption = (product: MatchedProduct, serviceID: number) => {
    const option = product.logistics_options?.find((item) => item.service_id === serviceID)
    if (!option) {
      return
    }
    setSelectedProducts((prev) => prev.map((item) => (
      item.product_id === product.product_id ? applyLogisticsOption(item, option) : item
    )))
  }

  const handlePublishLogisticsDemand = async (product: MatchedProduct) => {
    if (!result) {
      return
    }
    setBusy(true)
    try {
      await supplyDemandService.create({
        type: 'logistics',
        title: `AI采购物流需求：${product.product_name}`,
        category: '物流运输',
        material: product.product_name,
        quantity: product.quantity,
        unit: result.parsed.unit,
        delivery_address: product.destination_address || result.parsed.delivery_address,
        description: [
          `商品：${product.product_name}`,
          `数量：${product.quantity}${result.parsed.unit}`,
          `发货仓库：${product.origin_warehouse_name || String(product.warehouse?.warehouse_name || '-')}`,
          `起运地址：${product.origin_address || String(product.warehouse?.address || '-')}`,
          `收货地址：${product.destination_address || result.parsed.delivery_address || '-'}`,
          '来源：AI采购物流仓储匹配未找到合适物流方案',
        ].join('\n'),
        tags: ['AI采购', '物流需求'],
      })
      message.success('已发布物流需求，可在供需撮合查看')
      navigate('/matching')
    } catch (error) {
      message.error(getApiErrorMessage(error, '物流需求发布失败'))
    } finally {
      setBusy(false)
    }
  }

  const handleNegotiateLogistics = (product: MatchedProduct) => {
    setSelectedProducts((prev) => prev.map((item) => (
      item.product_id === product.product_id
        ? {
            ...item,
            logistics_service_id: undefined,
            logistics_service_name: '协商解决',
            logistics_route: '待买卖双方或平台协调',
            freight_estimate: 0,
            landed_total: item.total_amount,
            unit_landed_price: item.unit_price,
            logistics_match_status: 'negotiation',
          }
        : item
    )))
    orderForm.setFieldsValue({
      delivery_method: '物流服务商协商',
      delivery_note: `${product.product_name} 物流方案先协商确认，以最终报价、时效和履约保障为准。`,
    })
    message.info(`${product.product_name} 已标记为协商解决`)
  }

  const setExamplePrompt = (value: string) => {
    setPrompt(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showWorkflow = !activeStep || activeStep < 6

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={1} className="!mb-3">AI采购</Title>
              <Paragraph className="text-lg text-gray-500 !mb-0">
                先确认参数，再选择商品、生成真实订单、按需融资，最后提交审核。
              </Paragraph>
            </div>
            {!isLoggedIn && (
              <Link to="/login">
                <Button type="primary" icon={<LoginOutlined />}>登录后使用</Button>
              </Link>
            )}
          </div>

          {showWorkflow && (
            <Card className="mt-8">
              <Steps
                current={currentStep}
                responsive
                items={procurementSteps.map((item) => ({
                  title: <Link to={`/ai-procurement/${item.step}`}>{item.title}</Link>,
                  description: item.description,
                  icon: stageIcons[item.code],
                }))}
              />
            </Card>
          )}

          {!activeStep && (
            <Card className="mt-6">
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
                  loading={busy}
                >
                  解析采购指令
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        {activeStep ? (
          <StepPage
            activeStep={activeStep}
            result={result}
            currentProcurement={currentProcurement}
            selectedProducts={selectedProducts}
            selectedFinanceServiceId={selectedFinanceServiceId}
            onSelectedFinanceServiceChange={setSelectedFinanceServiceId}
            busy={busy}
            submitting={submitting}
            instructionForm={instructionForm}
            orderForm={orderForm}
            warehouses={warehouses}
            categoryOptions={categoryOptions}
            onConfirmInstruction={handleConfirmInstruction}
            onToggleProduct={handleToggleProduct}
            onProductQuantityChange={handleProductQuantityChange}
            onSelectLogisticsOption={handleSelectLogisticsOption}
            onPublishLogisticsDemand={handlePublishLogisticsDemand}
            onNegotiateLogistics={handleNegotiateLogistics}
            onConfirmProduct={handleConfirmProduct}
            onGenerateOrder={handleGenerateOrder}
            onMatchFinance={handleMatchFinance}
            onSubmitReview={handleSubmitReview}
          />
        ) : (
          <HomeSections
            isLoggedIn={isLoggedIn}
            mine={mine}
            loadingMine={loadingMine}
            onRefreshMine={loadMine}
            onOpenProcurement={openProcurement}
            onRepeatProcurement={handleRepeatProcurement}
            onCopyProcurementPrompt={handleCopyProcurementPrompt}
            onSetExamplePrompt={setExamplePrompt}
          />
        )}
      </main>
    </div>
  )
}

function HomeSections({
  isLoggedIn,
  mine,
  loadingMine,
  onRefreshMine,
  onOpenProcurement,
  onRepeatProcurement,
  onCopyProcurementPrompt,
  onSetExamplePrompt,
}: {
  isLoggedIn: boolean
  mine: AIProcurementInfo[]
  loadingMine: boolean
  onRefreshMine: () => Promise<void>
  onOpenProcurement: (item: AIProcurementInfo, step?: number) => void
  onRepeatProcurement: (item: AIProcurementInfo) => void
  onCopyProcurementPrompt: (item: AIProcurementInfo) => Promise<void>
  onSetExamplePrompt: (value: string) => void
}) {
  return (
    <>
      <section>
        <div className="mb-5 flex items-center justify-between">
          <Title level={2} className="!mb-0">我的AI采购</Title>
          <Button onClick={() => void onRefreshMine()} loading={loadingMine}>刷新</Button>
        </div>
        <Spin spinning={loadingMine}>
          <Card>
            {mine.length > 0 ? (
              <Space direction="vertical" size="middle" className="w-full">
                {mine.map((item) => (
                  <div
                    key={item.id}
                    className="w-full rounded border border-gray-100 bg-white p-4 transition hover:border-primary-300"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <Text strong>{item.procurement_no}</Text>
                        <div className="mt-1 break-words text-sm text-gray-500">{item.prompt}</div>
                      </div>
                      <div className="flex flex-col gap-3 lg:items-end">
                        <Tag color={item.status === 'review_submitted' ? 'green' : 'blue'}>{item.status}</Tag>
                        <Space wrap>
                          <Button icon={<ReloadOutlined />} onClick={() => onRepeatProcurement(item)}>
                            再买一次
                          </Button>
                          <Button icon={<EyeOutlined />} onClick={() => onOpenProcurement(item)}>
                            查看详情
                          </Button>
                          <Button icon={<CopyOutlined />} onClick={() => void onCopyProcurementPrompt(item)}>
                            复制
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description={isLoggedIn ? '暂无AI采购记录' : '登录后查看我的AI采购'} />
            )}
          </Card>
        </Spin>
      </section>

      <section className="mt-10">
        <Title level={2} className="!mb-5">AI采购例子</Title>
        <Row gutter={[16, 16]}>
          {examplePrompts.map((item) => (
            <Col xs={24} md={8} key={item}>
              <Card className="h-full">
                <Paragraph className="min-h-[48px] !mb-5 text-gray-700">{item}</Paragraph>
                <Button block icon={<MessageOutlined />} onClick={() => onSetExamplePrompt(item)}>
                  填入对话框
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  )
}

function StepPage({
  activeStep,
  result,
  currentProcurement,
  selectedProducts,
  selectedFinanceServiceId,
  onSelectedFinanceServiceChange,
  busy,
  submitting,
  instructionForm,
  orderForm,
  warehouses,
  categoryOptions,
  onConfirmInstruction,
  onToggleProduct,
  onProductQuantityChange,
  onSelectLogisticsOption,
  onPublishLogisticsDemand,
  onNegotiateLogistics,
  onConfirmProduct,
  onGenerateOrder,
  onMatchFinance,
  onSubmitReview,
}: {
  activeStep: number
  result: AIProcurementParseResult | null
  currentProcurement: AIProcurementInfo | null
  selectedProducts: MatchedProduct[]
  selectedFinanceServiceId?: number
  onSelectedFinanceServiceChange: (id?: number) => void
  busy: boolean
  submitting: boolean
  instructionForm: ReturnType<typeof Form.useForm<ParsedInstruction>>[0]
  orderForm: ReturnType<typeof Form.useForm<OrderFormPayload>>[0]
  warehouses: WarehouseServiceItem[]
  categoryOptions: Array<{ label: string; value: string }>
  onConfirmInstruction: () => Promise<void>
  onToggleProduct: (product: MatchedProduct) => void
  onProductQuantityChange: (product: MatchedProduct, quantity: number | null) => void
  onSelectLogisticsOption: (product: MatchedProduct, serviceID: number) => void
  onPublishLogisticsDemand: (product: MatchedProduct) => Promise<void>
  onNegotiateLogistics: (product: MatchedProduct) => void
  onConfirmProduct: () => Promise<void>
  onGenerateOrder: () => Promise<void>
  onMatchFinance: (required: boolean, financeServiceId?: number) => Promise<void>
  onSubmitReview: () => void
}) {
  const step = procurementSteps[activeStep - 1]

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Text type="secondary">第 {activeStep} 步</Text>
          <Title level={2} className="!mb-1">{step.title}</Title>
          <Paragraph className="text-gray-500 !mb-0">{step.description}</Paragraph>
        </div>
        <Space wrap>
          <Link to="/ai-procurement"><Button>返回首页</Button></Link>
          {activeStep > 1 && <Link to={`/ai-procurement/${activeStep - 1}`}><Button>上一步</Button></Link>}
        </Space>
      </div>

      {!result ? (
        <Card>
          <Empty description="请先在 AI采购首页输入采购需求并解析，或从我的AI采购中选择历史记录" />
        </Card>
      ) : (
        renderStepContent({
          activeStep,
          result,
          currentProcurement,
          selectedProducts,
          selectedFinanceServiceId,
          onSelectedFinanceServiceChange,
          busy,
          submitting,
          instructionForm,
          orderForm,
          warehouses,
          categoryOptions,
          onConfirmInstruction,
          onToggleProduct,
          onProductQuantityChange,
          onSelectLogisticsOption,
          onPublishLogisticsDemand,
          onNegotiateLogistics,
          onConfirmProduct,
          onGenerateOrder,
          onMatchFinance,
          onSubmitReview,
        })
      )}
    </section>
  )
}

function renderStepContent(props: {
  activeStep: number
  result: AIProcurementParseResult
  currentProcurement: AIProcurementInfo | null
  selectedProducts: MatchedProduct[]
  selectedFinanceServiceId?: number
  onSelectedFinanceServiceChange: (id?: number) => void
  busy: boolean
  submitting: boolean
  instructionForm: ReturnType<typeof Form.useForm<ParsedInstruction>>[0]
  orderForm: ReturnType<typeof Form.useForm<OrderFormPayload>>[0]
  warehouses: WarehouseServiceItem[]
  categoryOptions: Array<{ label: string; value: string }>
  onConfirmInstruction: () => Promise<void>
  onToggleProduct: (product: MatchedProduct) => void
  onProductQuantityChange: (product: MatchedProduct, quantity: number | null) => void
  onSelectLogisticsOption: (product: MatchedProduct, serviceID: number) => void
  onPublishLogisticsDemand: (product: MatchedProduct) => Promise<void>
  onNegotiateLogistics: (product: MatchedProduct) => void
  onConfirmProduct: () => Promise<void>
  onGenerateOrder: () => Promise<void>
  onMatchFinance: (required: boolean, financeServiceId?: number) => Promise<void>
  onSubmitReview: () => void
}) {
  const { activeStep, result, currentProcurement, selectedProducts, selectedFinanceServiceId, busy, submitting, instructionForm, orderForm, warehouses, categoryOptions } = props

  if (activeStep === 1) {
    return (
      <Card title="确认解析参数">
        <Form form={instructionForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="product_name" label="采购物品" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item name="category" label="品类" rules={[{ required: true, message: '请选择或输入品类' }]}>
                <AutoComplete
                  options={categoryOptions}
                  placeholder="请选择品类，不存在时可直接输入"
                  filterOption={(inputValue, option) =>
                    String(option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
                    String(option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}><Form.Item name="quantity" label="采购数量" rules={[{ required: true }]}><InputNumber className="w-full" min={0.01} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="unit" label="单位" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="financing_required" label="是否需要融资" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={24}><Form.Item name="usage" label="业务用途" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}>
              <Form.Item name="delivery_address_source" label="收货地址类型">
                <Radio.Group>
                  <Radio value="manual">手动地址</Radio>
                  <Radio value="buyer_warehouse">平台仓库</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="delivery_warehouse_id" label="选择收货仓库">
                <Select
                  allowClear
                  placeholder="可选择平台已审核仓库作为收货地址"
                  options={warehouses.map((item) => ({
                    value: item.id,
                    label: `${item.warehouse_name} · ${warehouseAddress(item) || item.city || '-'}`,
                  }))}
                  onChange={(value) => {
                    const selected = warehouses.find((item) => item.id === value)
                    if (!selected) {
                      instructionForm.setFieldsValue({
                        delivery_address_source: 'manual',
                        delivery_warehouse_name: '',
                      })
                      return
                    }
                    instructionForm.setFieldsValue({
                      delivery_address_source: 'buyer_warehouse',
                      delivery_warehouse_name: selected.warehouse_name,
                      delivery_address: warehouseAddress(selected),
                    })
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="delivery_address" label="收货地址" rules={[{ required: true, message: '请输入收货地址，用于估算物流到手价' }]}>
                <Input placeholder="例如：上海市宝山区月罗公路钢材园区，或选择平台仓库自动填入" />
              </Form.Item>
            </Col>
            <Form.Item name="delivery_warehouse_name" hidden><Input /></Form.Item>
          </Row>
          <Button type="primary" icon={<FileSearchOutlined />} loading={busy} onClick={() => void props.onConfirmInstruction()}>
            确认参数并召回商品
          </Button>
        </Form>
      </Card>
    )
  }

  if (activeStep === 2) {
    return (
      <Card title="选择召回商品">
        {result.matched_products.length > 0 ? (
          <Space direction="vertical" size="middle" className="w-full">
            {result.matched_products.map((item) => (
              <div key={`${item.product_id}-${item.product_no}`} className={`rounded border p-4 ${selectedProducts.some((product) => product.product_id === item.product_id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}>
                <div className="grid gap-4 md:grid-cols-[1fr_220px_220px] md:items-center">
                  <div>
                    <Text strong>{item.product_name}</Text>
                    <div className="mt-1 text-sm text-gray-500">{item.steel_mill || '-'} · {item.category || '-'} · {item.match_reason}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {isOrderableProduct(item) ? <Tag>{item.product_no}</Tag> : <Tag color="orange">参考方案</Tag>}
                      <Tag>可用 {item.available_qty || item.quantity}</Tag>
                      {item.delivery_days ? <Tag>{item.delivery_days}天交付</Tag> : null}
                    </div>
                  </div>
                  <div>
                    <Text strong>{formatMoney(item.unit_price)} / {result.parsed.unit}</Text>
                    <div className="mt-1 text-sm text-gray-500">商品金额 {formatMoney(item.total_amount)}</div>
                    <div className="mt-1 text-sm text-gray-500">匹配度 {item.score || 0}</div>
                  </div>
                  <Space>
                    <Button onClick={() => showProductDetail(item)}>详情</Button>
                    <Button
                      disabled={!isOrderableProduct(item)}
                      type={selectedProducts.some((product) => product.product_id === item.product_id) ? 'primary' : 'default'}
                      onClick={() => props.onToggleProduct(item)}
                    >
                      {selectedProducts.some((product) => product.product_id === item.product_id) ? '已选' : '选择'}
                    </Button>
                  </Space>
                </div>
                {!isOrderableProduct(item) && (
                  <div className="mt-3 rounded border border-orange-100 bg-orange-50 p-3 text-sm text-orange-700">
                    当前仅生成参考采购方案，未匹配到可下单现货。请返回调整参数，或发布供求信息等待供应商响应。
                  </div>
                )}
                {selectedProducts.some((product) => product.product_id === item.product_id) && (
                  <div className="mt-4 max-w-xs">
                    <InputNumber
                      className="w-full"
                      min={0.01}
                      max={item.available_qty || item.quantity}
                      value={selectedProducts.find((product) => product.product_id === item.product_id)?.quantity}
                      addonAfter={result.parsed.unit}
                      onChange={(value) => props.onProductQuantityChange(item, value)}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="rounded border border-gray-100 bg-gray-50 p-4">
              <Text>
                已选 {selectedProducts.length} 个商品，合计 {sumSelectedQuantity(selectedProducts)} / {result.parsed.quantity} {result.parsed.unit}
                ，商品金额 {formatMoney(selectedProducts.reduce((sum, item) => sum + item.total_amount, 0))}
              </Text>
            </div>
            <Button type="primary" icon={<TruckOutlined />} loading={busy} onClick={() => void props.onConfirmProduct()}>确认商品，匹配物流仓储</Button>
          </Space>
        ) : (
          <Empty description="暂无商品匹配结果，请返回上一步调整参数" />
        )}
      </Card>
    )
  }

  if (activeStep === 3) {
    return (
      <Card title="物流仓储匹配">
        {selectedProducts.length > 0 ? (
          <Space direction="vertical" size="middle" className="w-full">
            <div className="rounded border border-gray-100 bg-gray-50 p-4">
              <Text>
                预估运费 {formatMoney(selectedProducts.reduce((sum, item) => sum + Number(item.freight_estimate || 0), 0))}
                ，到手总额 {formatMoney(selectedProducts.reduce((sum, item) => sum + productLandedTotal(item), 0))}
              </Text>
            </div>
            <Space direction="vertical" size="small" className="w-full">
              {selectedProducts.map((item) => (
                <div key={item.product_id} className="rounded border border-gray-100 bg-white p-4">
                  <Descriptions bordered size="small" column={{ xs: 1, md: 4 }}>
                    <Descriptions.Item label="商品">{item.product_name}</Descriptions.Item>
                    <Descriptions.Item label="钢厂">{item.steel_mill || '-'}</Descriptions.Item>
                    <Descriptions.Item label="数量">{item.quantity} {result.parsed.unit}</Descriptions.Item>
                    <Descriptions.Item label="到手金额">{formatMoney(productLandedTotal(item))}</Descriptions.Item>
                    <Descriptions.Item label="发货仓库">{item.origin_warehouse_name || String(item.warehouse?.warehouse_name || '-')}</Descriptions.Item>
                    <Descriptions.Item label="起运地址">{item.origin_address || String(item.warehouse?.address || '-')}</Descriptions.Item>
                    <Descriptions.Item label="收货地址">{item.destination_address || result.parsed.delivery_address || '-'}</Descriptions.Item>
                    <Descriptions.Item label="当前方案">{item.logistics_service_name || (item.logistics_match_status === 'no_match' ? '暂无适合物流' : '-')}</Descriptions.Item>
                  </Descriptions>

                  {item.logistics_options && item.logistics_options.length > 0 ? (
                    <>
                      <Radio.Group
                        className="mt-4 w-full"
                        value={item.logistics_service_id}
                        onChange={(event) => props.onSelectLogisticsOption(item, Number(event.target.value))}
                      >
                        <Space direction="vertical" size="small" className="w-full">
                          {item.logistics_options.map((option) => (
                            <Radio key={option.service_id} value={option.service_id} className="w-full rounded border border-gray-100 p-3">
                              <div className="grid gap-3 md:grid-cols-[1fr_180px_160px] md:items-center">
                                <div>
                                  <Text strong>{option.service_name}</Text>
                                  <div className="mt-1 text-sm text-gray-500">{option.route || '线路待确认'} · {option.vehicle_type || '车型待确认'} · {option.match_reason}</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {option.service_scope ? <Tag>{option.service_scope}</Tag> : null}
                                    {option.load_capacity ? <Tag>载重 {option.load_capacity}{result.parsed.unit}</Tag> : null}
                                    {option.price_rule ? <Tag>{option.price_rule}</Tag> : null}
                                  </div>
                                </div>
                                <div>
                                  <Text strong>{formatMoney(option.freight_estimate)}</Text>
                                  <div className="mt-1 text-sm text-gray-500">预估运费</div>
                                </div>
                                <div>
                                  <Text strong>{formatMoney(option.landed_total)}</Text>
                                  <div className="mt-1 text-sm text-gray-500">到手总额</div>
                                </div>
                              </div>
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                      <Space wrap className="mt-4">
                        <Button onClick={() => props.onNegotiateLogistics(item)}>采用协商报价</Button>
                        <Text type="secondary">已有推荐物流时，也可以先与服务商协商运价、时效和履约保障。</Text>
                      </Space>
                    </>
                  ) : (
                    <div className="mt-4 rounded border border-dashed border-gray-200 bg-gray-50 p-4">
                      <Text>当前发货仓库到收货地点暂无适合物流方案。</Text>
                      <Space wrap className="mt-3">
                        <Button type="primary" loading={busy} onClick={() => void props.onPublishLogisticsDemand(item)}>发布物流需求</Button>
                        <Button onClick={() => props.onNegotiateLogistics(item)}>选择协商解决</Button>
                      </Space>
                    </div>
                  )}
                </div>
              ))}
            </Space>
            {hasPendingLogisticsResolution(selectedProducts) ? (
              <Button type="primary" icon={<ShoppingCartOutlined />} disabled>确认物流仓储方案，填写订单</Button>
            ) : (
              <Link to="/ai-procurement/4">
                <Button type="primary" icon={<ShoppingCartOutlined />}>确认物流仓储方案，填写订单</Button>
              </Link>
            )}
          </Space>
        ) : (
          <Empty description="请先在商品匹配阶段选择商品" />
        )}
      </Card>
    )
  }

  if (activeStep === 4) {
    return (
      <Card title="生成真实订单">
        {selectedProducts.length > 0 ? (
          <>
            <Form form={orderForm} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={8}><Form.Item name="quantity" label="下单数量"><InputNumber className="w-full" disabled addonAfter={result.parsed.unit} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="contact_name" label="联系人" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="warehouse_name" label="卖家发货仓库" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Form.Item name="dest_warehouse_service_id" hidden><InputNumber /></Form.Item>
                <Col xs={24} md={12}><Form.Item name="delivery_method" label="物流方式" rules={[{ required: true }]}><Radio.Group><Radio value="平台协同配送">平台协同配送</Radio><Radio value="物流服务商协商">物流服务商协商</Radio><Radio value="自行提货">自行提货</Radio></Radio.Group></Form.Item></Col>
                <Col xs={24}><Form.Item name="delivery_address" label="收货地址" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="payment_method" label="付款方式" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="delivery_note" label="交付说明"><Input /></Form.Item></Col>
                <Col xs={24}><Form.Item name="remark" label="订单备注"><TextArea autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item></Col>
              </Row>
              <Button type="primary" icon={<ShoppingCartOutlined />} loading={busy} onClick={() => void props.onGenerateOrder()}>
                生成真实订单
              </Button>
            </Form>
          </>
        ) : (
          <Empty description="请先在商品匹配阶段选择商品" />
        )}
      </Card>
    )
  }

  if (activeStep === 5) {
    const selectedPlan = result.finance_plans.find((item) => item.finance_service_id === selectedFinanceServiceId)
    if (!currentProcurement?.financing_required) {
      return (
        <Card title="融资匹配">
          <Empty description="当前采购参数不需要融资，可直接进入审核提交" />
          <Button type="primary" className="mt-4" onClick={() => void props.onMatchFinance(false)}>跳过融资，进入审核</Button>
        </Card>
      )
    }
    return (
      <Card title="融资匹配">
        {result.finance_plans.length > 0 ? (
          <Space direction="vertical" size="middle" className="w-full">
            <Radio.Group className="w-full" value={selectedFinanceServiceId} onChange={(event) => props.onSelectedFinanceServiceChange(Number(event.target.value))}>
              <Space direction="vertical" size="middle" className="w-full">
                {result.finance_plans.map((item) => (
                  <FinancePlanOption key={`${item.finance_service_id || item.provider}-${item.product_name}`} item={item} />
                ))}
              </Space>
            </Radio.Group>
            <Button
              type="primary"
              disabled={!selectedPlan?.finance_service_id}
              loading={busy}
              onClick={() => void props.onMatchFinance(true, selectedPlan?.finance_service_id)}
            >
              确认融资产品，进入审核
            </Button>
          </Space>
        ) : (
          <Button type="primary" icon={<BankOutlined />} loading={busy} onClick={() => void props.onMatchFinance(true)}>
            召回融资方案
          </Button>
        )}
      </Card>
    )
  }

  return (
    <Card title="审核提交">
      {result.order_draft.orders && result.order_draft.orders.length > 0 ? (
        <Space direction="vertical" size="small" className="w-full">
          {result.order_draft.orders.map((order) => (
            <Descriptions key={order.order_id} bordered column={{ xs: 1, md: 3 }}>
              <Descriptions.Item label="订单号">{order.order_no}</Descriptions.Item>
              <Descriptions.Item label="卖家">{order.seller_name}</Descriptions.Item>
              <Descriptions.Item label="商品数">{order.product_count}</Descriptions.Item>
              <Descriptions.Item label="数量">{order.quantity} {result.order_draft.unit}</Descriptions.Item>
              <Descriptions.Item label="金额">{formatMoney(order.total_amount)}</Descriptions.Item>
              <Descriptions.Item label="付款方式">{order.payment_method || result.order_draft.payment_method}</Descriptions.Item>
            </Descriptions>
          ))}
        </Space>
      ) : (
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="订单号">{result.order_draft.order_no || '-'}</Descriptions.Item>
          <Descriptions.Item label="商品">{result.order_draft.product_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="数量">{result.order_draft.quantity} {result.order_draft.unit}</Descriptions.Item>
          <Descriptions.Item label="金额">{formatMoney(result.order_draft.estimated_amount)}</Descriptions.Item>
          <Descriptions.Item label="联系人">{result.order_draft.contact_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{result.order_draft.contact_phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="交付地址" span={2}>{result.order_draft.delivery_address || '-'}</Descriptions.Item>
          <Descriptions.Item label="交付说明" span={2}>{result.order_draft.delivery_note || '-'}</Descriptions.Item>
        </Descriptions>
      )}

      <Title level={4} className="!mt-8">融资详情</Title>
      {result.finance_plans.length > 0 ? (
        <Space direction="vertical" size="middle" className="w-full">
          {result.finance_plans.map((item) => (
            <div key={`${item.finance_service_id || item.provider}-${item.product_name}`} className="rounded border border-gray-100 p-4">
              <Text strong>{item.provider} · {item.product_name}</Text>
              <div className="mt-1 text-sm text-gray-500">{formatMoney(item.amount)} · {formatRate(item.rate)} · {item.term_days} 天</div>
              <div className="mt-2 flex gap-2">
                {item.ai_recommended && <Tag color="blue">AI推荐</Tag>}
                {item.selected && <Tag color="green">已预选</Tag>}
              </div>
            </div>
          ))}
        </Space>
      ) : (
        <Empty description="本次采购未选择融资" />
      )}

      <div className="mt-6 flex justify-end">
        <Button type="primary" icon={<AuditOutlined />} loading={submitting} disabled={!currentProcurement} onClick={props.onSubmitReview}>
          提交审核
        </Button>
      </div>
    </Card>
  )
}

function FinancePlanOption({ item }: { item: FinancePlan }) {
  return (
    <Radio className="w-full" value={item.finance_service_id}>
      <div className={`ml-2 rounded border p-4 ${item.selected || item.ai_recommended ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-white'}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Text strong>{item.provider} · {item.product_name}</Text>
            <div className="mt-1 text-sm text-gray-500">{formatMoney(item.amount)} · {formatRate(item.rate)} · {item.term_days} 天</div>
            <div className="mt-1 text-sm text-gray-500">{item.reason}</div>
          </div>
          <Space>
            {item.ai_recommended && <Tag color="blue">AI推荐</Tag>}
            {item.matched && <Tag color="green">可申请</Tag>}
          </Space>
        </div>
      </div>
    </Radio>
  )
}

function showProductDetail(item: MatchedProduct) {
  Modal.info({
    title: item.product_name,
    width: 720,
    content: (
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="商品编号">{item.product_no}</Descriptions.Item>
        <Descriptions.Item label="钢厂">{item.steel_mill || '-'}</Descriptions.Item>
        <Descriptions.Item label="品类">{item.category || '-'}</Descriptions.Item>
        <Descriptions.Item label="库存">{item.available_qty || item.quantity}</Descriptions.Item>
        <Descriptions.Item label="单价">{formatMoney(item.unit_price)}</Descriptions.Item>
        <Descriptions.Item label="捆包号">{item.bundle_no || '-'}</Descriptions.Item>
        <Descriptions.Item label="描述">{item.description || item.match_reason}</Descriptions.Item>
      </Descriptions>
    ),
  })
}
