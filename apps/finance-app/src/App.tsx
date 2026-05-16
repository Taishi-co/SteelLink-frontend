import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Form, Input, InputNumber, Layout, List, Modal, Row, Space, Spin, Steps, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  DollarCircleOutlined,
  FileSearchOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  DeleteOutlined,
  DotChartOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import { financeOrderService } from '@/services/orderService'
import type { CollateralMonitorInfo, OrderInfo, WarehouseReceiptPledgeInfo } from '@/services/orderService'
import { financeService, type FinanceServiceItem } from '@/services/financeService'
import { hasFinanceCapability } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Title, Text, Paragraph } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  12: { label: '待仓库确认', color: 'orange' },
  13: { label: '待卖方确认', color: 'blue' },
  14: { label: '待买方确认', color: 'blue' },
  2: { label: '待签合同', color: 'cyan' },
  3: { label: '待付款', color: 'gold' },
  4: { label: '待确认收款', color: 'purple' },
  21: { label: '融资审批中', color: 'purple' },
  22: { label: '待签署融资合同', color: 'magenta' },
  5: { label: '待提货', color: 'geekblue' },
  15: { label: '物流竞价中', color: 'processing' },
  16: { label: '待确认物流', color: 'blue' },
  17: { label: '运输中', color: 'cyan' },
  6: { label: '已发货', color: 'cyan' },
  7: { label: '已到货', color: 'green' },
  18: { label: '已收货', color: 'green' },
  8: { label: '已完成', color: 'success' },
  19: { label: '已对账', color: 'success' },
  20: { label: '已归档', color: 'default' },
  9: { label: '已终止', color: 'red' },
  11: { label: '异常', color: 'red' },
}

type TabKey = 'products' | 'risk-review' | 'debt-contract' | 'disburse' | 'pledge' | 'warehouse-receipt-pledge' | 'collateral-monitor' | 'release-pledge' | 'finance-flow' | 'all'
const productStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'processing' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

const warehouseReceiptPledgeStatusMap: Record<string, { label: string; color: string }> = {
  submitted: { label: '待风控', color: 'processing' },
  risk_approved: { label: '风控通过', color: 'cyan' },
  risk_rejected: { label: '已驳回', color: 'red' },
  agreement_signed: { label: '协议已签', color: 'blue' },
  disbursed: { label: '已放款', color: 'green' },
  releasing: { label: '释放中', color: 'purple' },
  released: { label: '已释放', color: 'default' },
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('products')
  const [productForm] = Form.useForm()
  const [financeProducts, setFinanceProducts] = useState<FinanceServiceItem[]>([])
  const [productLoading, setProductLoading] = useState(false)
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<FinanceServiceItem | null>(null)
  const [editProductModalVisible, setEditProductModalVisible] = useState(false)
  const [editProductForm] = Form.useForm()
  const [riskOrders, setRiskOrders] = useState<OrderInfo[]>([])
  const [debtOrders, setDebtOrders] = useState<OrderInfo[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])
  const [collateralList, setCollateralList] = useState<CollateralMonitorInfo[]>([])
  const [warehouseReceiptPledges, setWarehouseReceiptPledges] = useState<WarehouseReceiptPledgeInfo[]>([])
  const [loading, setLoading] = useState(false)

  const [riskModal, setRiskModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [riskApproved, setRiskApproved] = useState(true)
  const [riskAmount, setRiskAmount] = useState<number>(0)
  const [riskTermDays, setRiskTermDays] = useState<number>(30)
  const [riskAnnualRate, setRiskAnnualRate] = useState<number>(0)
  const [riskServiceFee, setRiskServiceFee] = useState<number>(0)
  const [riskRemark, setRiskRemark] = useState('')

  const [debtModal, setDebtModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [debtContractNo, setDebtContractNo] = useState('')
  const [debtContractURL, setDebtContractURL] = useState('')
  const [debtContractHash, setDebtContractHash] = useState('')

  const [disburseModal, setDisburseModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [disbursementVoucher, setDisbursementVoucher] = useState('')
  const [fundingCommission, setFundingCommission] = useState<number>(0)
  const [commissionVoucher, setCommissionVoucher] = useState('')
  const [disburseRemark, setDisburseRemark] = useState('')

  const [pledgeModal, setPledgeModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [pledgeVoucherURL, setPledgeVoucherURL] = useState('')
  const [releaseCondition, setReleaseCondition] = useState('')
  const [pledgeRemark, setPledgeRemark] = useState('')

  const [releaseModal, setReleaseModal] = useState<{ visible: boolean; orderId: number | null }>({ visible: false, orderId: null })
  const [releaseReason, setReleaseReason] = useState('')
  const [releaseVoucherURL, setReleaseVoucherURL] = useState('')
  const [collateralReceiptModal, setCollateralReceiptModal] = useState<{ visible: boolean; record: CollateralMonitorInfo | null }>({ visible: false, record: null })
  const [collateralReceiptURL, setCollateralReceiptURL] = useState('')
  const [collateralReceiptRemark, setCollateralReceiptRemark] = useState('')
  const [wrpRiskModal, setWrpRiskModal] = useState<{ visible: boolean; record: WarehouseReceiptPledgeInfo | null }>({ visible: false, record: null })
  const [wrpRiskApproved, setWrpRiskApproved] = useState(true)
  const [wrpApprovedAmount, setWrpApprovedAmount] = useState<number>(0)
  const [wrpTermDays, setWrpTermDays] = useState<number>(30)
  const [wrpAnnualRate, setWrpAnnualRate] = useState<number>(0)
  const [wrpRiskRemark, setWrpRiskRemark] = useState('')
  const [wrpAgreementModal, setWrpAgreementModal] = useState<{ visible: boolean; record: WarehouseReceiptPledgeInfo | null }>({ visible: false, record: null })
  const [wrpPledgeAgreementURL, setWrpPledgeAgreementURL] = useState('')
  const [wrpSupervisionAgreementURL, setWrpSupervisionAgreementURL] = useState('')
  const [wrpDisburseModal, setWrpDisburseModal] = useState<{ visible: boolean; record: WarehouseReceiptPledgeInfo | null }>({ visible: false, record: null })
  const [wrpDisbursementVoucherURL, setWrpDisbursementVoucherURL] = useState('')
  const [wrpDisburseRemark, setWrpDisburseRemark] = useState('')
  const [wrpReleaseModal, setWrpReleaseModal] = useState<{ visible: boolean; record: WarehouseReceiptPledgeInfo | null }>({ visible: false, record: null })
  const [wrpReleaseVoucherURL, setWrpReleaseVoucherURL] = useState('')
  const [wrpReleaseRemark, setWrpReleaseRemark] = useState('')
  
  const [expandedFinanceOrders, setExpandedFinanceOrders] = useState<number[]>([])

  const showCompleted = (title: string, next: string, targetTab: TabKey = 'all') => {
    Modal.success({
      title,
      closable: true,
      maskClosable: true,
      content: (
        <Space direction="vertical" size={8}>
          <Text>已完成：{title.replace('已完成', '')}</Text>
          <Text type="secondary">下一步：{next}</Text>
          <Text type="secondary">可留在当前页继续处理，或切到推荐工作区查看后续任务。</Text>
        </Space>
      ),
      okCancel: true,
      okText: '查看推荐工作区',
      cancelText: '留在当前页',
      onOk: () => setActiveTab(targetTab),
    })
  }

  const fetchRiskOrders = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listFinancing()
      setRiskOrders(list || [])
    } catch {
      message.error('获取融资审批订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    setProductLoading(true)
    try {
      const list = await financeService.listMine()
      setFinanceProducts(list || [])
    } catch {
      message.error('获取金融产品失败')
    } finally {
      setProductLoading(false)
    }
  }

  const fetchDebtOrders = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listPendingDebt()
      setDebtOrders(list || [])
    } catch {
      message.error('获取待签署合同订单失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listAll()
      setAllOrders(list || [])
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCollateralMonitor = async () => {
    setLoading(true)
    try {
      const list = await financeOrderService.listCollateralMonitor()
      setCollateralList(list || [])
    } catch {
      message.error('获取货权监控失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouseReceiptPledges = async () => {
    setLoading(true)
    try {
      const result = await financeOrderService.listWarehouseReceiptPledges({ page_size: 100 })
      setWarehouseReceiptPledges(result.list || [])
    } catch {
      message.error('获取仓单质押申请失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'risk-review') fetchRiskOrders()
    else if (activeTab === 'debt-contract') fetchDebtOrders()
    else if (activeTab === 'disburse') fetchDebtOrders()
    else if (activeTab === 'pledge') fetchAll()
    else if (activeTab === 'warehouse-receipt-pledge') fetchWarehouseReceiptPledges()
    else if (activeTab === 'collateral-monitor') fetchCollateralMonitor()
    else if (activeTab === 'release-pledge') fetchAll()
    else if (activeTab === 'finance-flow') fetchAll()
    else if (activeTab === 'all') fetchAll()
  }, [activeTab])

  const handleCreateProduct = async (values: Partial<FinanceServiceItem>) => {
    setCreatingProduct(true)
    try {
      await financeService.create(values)
      showCompleted('金融产品提交已完成', '等待平台管理端审核，通过后买卖方可在资金服务中申请。', 'products')
      productForm.resetFields()
      fetchProducts()
    } catch {
      message.error('提交金融产品失败')
    } finally {
      setCreatingProduct(false)
    }
  }

  const openEditProduct = (record: FinanceServiceItem) => {
    setEditingProduct(record)
    editProductForm.setFieldsValue({
      name: record.name,
      finance_type: record.finance_type,
      min_amount: record.min_amount,
      max_amount: record.max_amount,
      term_days: record.term_days,
      annual_rate: record.annual_rate,
      fee_rule: record.fee_rule,
      risk_control_rule: record.risk_control_rule,
      description: record.description,
    })
    setEditProductModalVisible(true)
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    try {
      const values = await editProductForm.validateFields()
      await financeService.update(editingProduct.id, values)
      message.success('金融产品更新成功')
      setEditProductModalVisible(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error('更新失败')
    }
  }

  const handleOfflineProduct = async (record: FinanceServiceItem) => {
    Modal.confirm({
      title: '确认下线该金融产品？',
      content: `产品：${record.name}，下线后买方将无法申请该产品。`,
      okText: '确认下线',
      okType: 'danger',
      onOk: async () => {
        try {
          await financeService.delete(record.id)
          message.success('金融产品已下线')
          fetchProducts()
        } catch {
          message.error('下线失败')
        }
      },
    })
  }

  const handleSubmitRisk = async () => {
    if (!riskModal.orderId) return
    try {
      await financeOrderService.submitRiskResult(riskModal.orderId, {
        approved: riskApproved,
        approved_amount: riskApproved ? riskAmount : undefined,
        term_days: riskApproved ? riskTermDays : undefined,
        annual_rate: riskApproved ? riskAnnualRate : undefined,
        service_fee: riskApproved ? riskServiceFee : undefined,
        risk_remark: riskRemark || undefined,
      })
      showCompleted(riskApproved ? '风控审批已完成' : '风控拒绝已完成', riskApproved ? '等待买方确认授信金额和定价。' : '订单已终止并反馈到管理端事件记录。', riskApproved ? 'debt-contract' : 'all')
      setRiskModal({ visible: false, orderId: null })
      setRiskAmount(0)
      setRiskTermDays(30)
      setRiskAnnualRate(0)
      setRiskServiceFee(0)
      setRiskRemark('')
      fetchRiskOrders()
    } catch {
      message.error('操作失败')
    }
  }

  const handleGenerateDebt = async () => {
    if (!debtModal.orderId) return
    try {
      await financeOrderService.generateDebtContract(debtModal.orderId, {
        debt_contract_no: debtContractNo || undefined,
        debt_contract_url: debtContractURL,
        debt_contract_hash: debtContractHash || undefined,
      })
      showCompleted('债务合同生成已完成', '等待买方签署债务合同并支付手续费。', 'debt-contract')
      setDebtModal({ visible: false, orderId: null })
      setDebtContractNo('')
      setDebtContractURL('')
      setDebtContractHash('')
      fetchDebtOrders()
    } catch {
      message.error('生成债务合同失败')
    }
  }

  const handleDisburse = async () => {
    if (!disburseModal.orderId) return
    try {
      await financeOrderService.disburse(disburseModal.orderId, {
        disbursement_voucher: disbursementVoucher,
        funding_commission: fundingCommission,
        commission_voucher: commissionVoucher,
        remark: disburseRemark || undefined,
      })
      showCompleted('资金方放款已完成', '合规要求：必须继续记录货权质押后，订单才能进入物流履约。', 'all')
      setDisburseModal({ visible: false, orderId: null })
      setDisbursementVoucher('')
      setFundingCommission(0)
      setCommissionVoucher('')
      setDisburseRemark('')
      fetchDebtOrders()
    } catch {
      message.error('放款失败')
    }
  }

  const handleRecordPledge = async () => {
    if (!pledgeModal.orderId) return
    try {
      await financeOrderService.recordPledge(pledgeModal.orderId, {
        pledge_voucher_url: pledgeVoucherURL,
        release_condition: releaseCondition,
        pledge_remark: pledgeRemark || undefined,
      })
      showCompleted('货权质押记录已完成', '订单已满足物流履约前置合规要求，等待卖方发起物流竞价。', 'all')
      setPledgeModal({ visible: false, orderId: null })
      setPledgeVoucherURL('')
      setReleaseCondition('')
      setPledgeRemark('')
      fetchAll()
    } catch {
      message.error('记录货权质押失败')
    }
  }

  const handleReleasePledge = async () => {
    if (!releaseModal.orderId) return
    try {
      await financeOrderService.releasePledge(releaseModal.orderId, {
        reason: releaseReason,
        voucher_url: releaseVoucherURL || undefined,
      })
      showCompleted('货权质押释放已完成', '释放事件已进入订单链路，可回工作台查看。', 'all')
      setReleaseModal({ visible: false, orderId: null })
      setReleaseReason('')
      setReleaseVoucherURL('')
      fetchAll()
    } catch {
      message.error('释放货权质押失败')
    }
  }

  const handleCollateralReceipt = async () => {
    const record = collateralReceiptModal.record
    if (!record?.logistics_order_id) return
    if (!collateralReceiptURL) {
      message.warning('请填写资金方收货单 URL')
      return
    }
    try {
      await financeOrderService.confirmCollateralReceipt(record.logistics_order_id, {
        receipt_url: collateralReceiptURL,
        remark: collateralReceiptRemark || '资金方确认监管收货',
      })
      message.success('资金方监管收货已确认')
      setCollateralReceiptModal({ visible: false, record: null })
      setCollateralReceiptURL('')
      setCollateralReceiptRemark('')
      fetchCollateralMonitor()
    } catch {
      message.error('资金方确认收货失败')
    }
  }

  const handleWarehouseReceiptPledgeRisk = async () => {
    const record = wrpRiskModal.record
    if (!record) return
    try {
      await financeOrderService.reviewWarehouseReceiptPledge(record.id, {
        approved: wrpRiskApproved,
        approved_amount: wrpRiskApproved ? wrpApprovedAmount : undefined,
        term_days: wrpRiskApproved ? wrpTermDays : undefined,
        annual_rate: wrpRiskApproved ? wrpAnnualRate : undefined,
        risk_remark: wrpRiskRemark || undefined,
      })
      showCompleted(wrpRiskApproved ? '仓单质押风控已完成' : '仓单质押驳回已完成', wrpRiskApproved ? '下一步登记仓单质押协议和监管协议。' : '申请已退回给申请企业查看。', 'warehouse-receipt-pledge')
      setWrpRiskModal({ visible: false, record: null })
      setWrpRiskApproved(true)
      setWrpApprovedAmount(0)
      setWrpTermDays(30)
      setWrpAnnualRate(0)
      setWrpRiskRemark('')
      fetchWarehouseReceiptPledges()
    } catch {
      message.error('仓单质押风控提交失败')
    }
  }

  const handleWarehouseReceiptPledgeAgreement = async () => {
    const record = wrpAgreementModal.record
    if (!record) return
    try {
      await financeOrderService.signWarehouseReceiptPledgeAgreement(record.id, {
        pledge_agreement_url: wrpPledgeAgreementURL,
        supervision_agreement_url: wrpSupervisionAgreementURL,
      })
      showCompleted('仓单质押协议登记已完成', '下一步确认放款并冻结监管仓库存货权。', 'warehouse-receipt-pledge')
      setWrpAgreementModal({ visible: false, record: null })
      setWrpPledgeAgreementURL('')
      setWrpSupervisionAgreementURL('')
      fetchWarehouseReceiptPledges()
    } catch {
      message.error('仓单质押协议登记失败')
    }
  }

  const handleWarehouseReceiptPledgeDisburse = async () => {
    const record = wrpDisburseModal.record
    if (!record) return
    try {
      await financeOrderService.disburseWarehouseReceiptPledge(record.id, {
        disbursement_voucher_url: wrpDisbursementVoucherURL,
        remark: wrpDisburseRemark || undefined,
      })
      showCompleted('仓单质押放款已完成', '系统会尝试按仓单号匹配监管仓库存快照并标记冻结。', 'warehouse-receipt-pledge')
      setWrpDisburseModal({ visible: false, record: null })
      setWrpDisbursementVoucherURL('')
      setWrpDisburseRemark('')
      fetchWarehouseReceiptPledges()
    } catch {
      message.error('仓单质押放款失败')
    }
  }

  const handleWarehouseReceiptPledgeRelease = async () => {
    const record = wrpReleaseModal.record
    if (!record) return
    try {
      await financeOrderService.releaseWarehouseReceiptPledge(record.id, {
        release_voucher_url: wrpReleaseVoucherURL || undefined,
        release_remark: wrpReleaseRemark,
      })
      showCompleted('仓单质押货权释放已完成', '申请企业可在资金服务页查看释放结果。', 'warehouse-receipt-pledge')
      setWrpReleaseModal({ visible: false, record: null })
      setWrpReleaseVoucherURL('')
      setWrpReleaseRemark('')
      fetchWarehouseReceiptPledges()
    } catch {
      message.error('仓单质押货权释放失败')
    }
  }

  const riskColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    {
      title: '申请金额',
      key: 'request_amount',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const amount = record.financing_info?.requested_amount
        return amount ? `¥${amount.toLocaleString()}` : '--'
      },
    },
    {
      title: '融资依据',
      key: 'collateral',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const fin = record.financing_info
        if (!fin) return '--'
        return fin.finance_service_id ? `服务商 #${fin.finance_service_id}` : '--'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: number) => {
        const meta = statusMap[s] || { label: `状态${s}`, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: OrderInfo) => (
        <Button
          type="primary"
          size="small"
          icon={<AuditOutlined />}
          onClick={() => {
            setRiskApproved(true)
            setRiskAmount(record.financing_info?.requested_amount || 0)
            setRiskTermDays(record.financing_info?.term_days || 30)
            setRiskAnnualRate(record.financing_info?.annual_rate || 0)
            setRiskModal({ visible: true, orderId: record.id })
          }}
        >
          风控审核
        </Button>
      ),
    },
  ]

  const getFinancingStepInfo = (status?: string) => {
    const stepDefinitions = [
      { key: 'pending', title: '申请提交', owner: '买方', hint: '提交融资申请' },
      { key: 'risk_approved', title: '风控审批', owner: '资金方', hint: '风控审核通过' },
      { key: 'buyer_confirmed', title: '确认方案', owner: '买方', hint: '确认授信方案' },
      { key: 'contract_generated', title: '签署合同', owner: '双方', hint: '签署债务质押合同' },
      { key: 'buyer_signed_fee_paid', title: '支付手续费', owner: '买方', hint: '支付融资手续费' },
      { key: 'disbursed', title: '放款完成', owner: '资金方', hint: '资金方放款' },
      { key: 'pledged', title: '货权质押', owner: '资金方', hint: '记录货权质押' },
      { key: 'released', title: '质押释放', owner: '资金方', hint: '释放货权质押' },
    ]
    const statusOrder = ['pending', 'risk_approved', 'buyer_confirmed', 'contract_generated', 'buyer_signed_fee_paid', 'disbursed', 'pledged', 'released']
    const currentStep = status ? statusOrder.indexOf(status) : -1
    return { stepDefinitions, currentStep }
  }

  const debtColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    {
      title: '审批金额',
      key: 'approved_amount',
      width: 120,
      render: (_: unknown, record: OrderInfo) => {
        const amount = record.financing_info?.approved_amount
        return amount ? `¥${amount.toLocaleString()}` : '--'
      },
    },
    {
      title: '融资进度',
      key: 'financing_status',
      width: 140,
      render: (_: unknown, record: OrderInfo) => {
        const fs = record.financing_info?.status
        const map: Record<string, { label: string; color: string }> = {
          buyer_confirmed: { label: '待生成合同', color: 'orange' },
          contract_generated: { label: '待买方签署', color: 'blue' },
          buyer_signed_fee_paid: { label: '待放款', color: 'purple' },
          disbursed: { label: '已放款', color: 'green' },
          pledged: { label: '已质押', color: 'cyan' },
          released: { label: '已释放', color: 'default' },
        }
        const meta = map[fs || ''] || { label: fs || '--', color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '融资流程',
      key: 'financing_flow',
      width: 320,
      render: (_: unknown, record: OrderInfo) => {
        const { stepDefinitions, currentStep } = getFinancingStepInfo(record.financing_info?.status)
        return (
          <div className="grid grid-cols-4 gap-1">
            {stepDefinitions.map((step, index) => {
              const stepState =
                index < currentStep
                  ? 'completed'
                  : index === currentStep
                    ? 'current'
                    : 'pending'
              const tagColor =
                stepState === 'completed'
                  ? 'success'
                  : stepState === 'current'
                    ? 'processing'
                    : 'default'
              return (
                <div
                  key={step.key}
                  className="rounded border border-slate-200 bg-slate-50 p-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-slate-700">{step.title}</span>
                    <Tag color={tagColor} className="text-[10px]">
                      {stepState === 'completed' ? '完成' : stepState === 'current' ? '进行中' : '待处理'}
                    </Tag>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">{step.owner}</div>
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: OrderInfo) => {
        const fs = record.financing_info?.status
        return (
          <Space>
            <Button size="small" icon={<FileSearchOutlined />} onClick={() => setDebtModal({ visible: true, orderId: record.id })} disabled={fs !== 'buyer_confirmed'}>
              生成债务合同
            </Button>
            <Button type="primary" size="small" icon={<DollarCircleOutlined />} onClick={() => {
              setDisburseModal({ visible: true, orderId: record.id })
            }} disabled={fs !== 'buyer_signed_fee_paid'}>
              放款
            </Button>
          </Space>
        )
      },
    },
  ]

  const allColumns: ColumnsType<OrderInfo> = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (v: number) => `¥${v?.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: number) => {
        const meta = statusMap[s] || { label: `状态${s}`, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '融资信息',
      key: 'financing',
      width: 160,
      render: (_: unknown, record: OrderInfo) => {
        const fin = record.financing_info
        if (!fin) return '--'
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>申请: ¥{fin.requested_amount?.toLocaleString()}</Text>
            {fin.approved_amount && <Text style={{ fontSize: 12 }}>审批: ¥{fin.approved_amount?.toLocaleString()}</Text>}
            {fin.disbursed_at && <Text style={{ fontSize: 12, color: '#52c41a' }}>已放款</Text>}
          </Space>
        )
      },
    },
    {
      title: '资金方操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: OrderInfo) => {
        const status = record.financing_info?.status
        if (status === 'disbursed') {
          return <Button size="small" onClick={() => setPledgeModal({ visible: true, orderId: record.id })}>记录质押</Button>
        }
        if (status === 'pledged') {
          return <Button size="small" onClick={() => setReleaseModal({ visible: true, orderId: record.id })}>释放质押</Button>
        }
        return <Text type="secondary">--</Text>
      },
    },
  ]

  const productColumns: ColumnsType<FinanceServiceItem> = [
    { title: '产品名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类型', dataIndex: 'finance_type', key: 'finance_type', width: 120, render: (v?: string) => v || '-' },
    {
      title: '额度范围',
      key: 'amount',
      width: 170,
      render: (_, row) => `${(row.min_amount || 0).toLocaleString()} - ${(row.max_amount || 0).toLocaleString()} 元`,
    },
    {
      title: '账期/费率',
      key: 'term_rate',
      width: 140,
      render: (_, row) => `${row.term_days || 0} 天 / ${row.annual_rate || 0}%`,
    },
    { title: '手续费规则', dataIndex: 'fee_rule', key: 'fee_rule', width: 180, render: (v?: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: number) => {
        const meta = productStatusMap[v] || { label: '未知', color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    { title: '审核备注', dataIndex: 'audit_remark', key: 'audit_remark', width: 180, render: (v?: string) => v || '-' },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: FinanceServiceItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditProduct(record)} disabled={record.status === 4}>编辑</Button>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleOfflineProduct(record)} disabled={record.status === 4}>下线</Button>
        </Space>
      ),
    },
  ]

  const warehouseReceiptPledgeColumns: ColumnsType<WarehouseReceiptPledgeInfo> = [
    { title: '申请号', dataIndex: 'application_no', key: 'application_no', width: 170 },
    { title: '申请方', dataIndex: 'applicant_role', key: 'applicant_role', width: 90, render: (v: string) => v === 'sales' ? '卖方' : v === 'procurement' ? '买方' : '-' },
    { title: '资金产品', dataIndex: 'finance_service_name', key: 'finance_service_name', width: 160, render: (v?: string) => v || '-' },
    {
      title: '监管仓/仓单',
      key: 'warehouse_receipt',
      width: 240,
      render: (_: unknown, record: WarehouseReceiptPledgeInfo) => (
        <Space direction="vertical" size={0}>
          <Text>{record.warehouse_name || '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>仓单：{record.receipt_no || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '货物',
      key: 'goods',
      width: 180,
      render: (_: unknown, record: WarehouseReceiptPledgeInfo) => (
        <Space direction="vertical" size={0}>
          <Text>{record.goods_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.quantity || 0} 吨 {record.quality_grade || ''}</Text>
        </Space>
      ),
    },
    {
      title: '金额',
      key: 'amount',
      width: 150,
      render: (_: unknown, record: WarehouseReceiptPledgeInfo) => (
        <Space direction="vertical" size={0}>
          <Text>申请 ¥{Number(record.requested_amount || 0).toLocaleString()}</Text>
          {record.approved_amount ? <Text type="secondary" style={{ fontSize: 12 }}>审批 ¥{Number(record.approved_amount || 0).toLocaleString()}</Text> : null}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const meta = warehouseReceiptPledgeStatusMap[v] || { label: v || '-', color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: unknown, record: WarehouseReceiptPledgeInfo) => (
        <Space wrap>
          <Button
            size="small"
            type={record.status === 'submitted' ? 'primary' : 'default'}
            disabled={record.status !== 'submitted'}
            onClick={() => {
              setWrpRiskApproved(true)
              setWrpApprovedAmount(record.requested_amount || 0)
              setWrpTermDays(record.term_days || 30)
              setWrpAnnualRate(record.annual_rate || 0)
              setWrpRiskModal({ visible: true, record })
            }}
          >
            风控
          </Button>
          <Button
            size="small"
            disabled={record.status !== 'risk_approved'}
            onClick={() => setWrpAgreementModal({ visible: true, record })}
          >
            协议
          </Button>
          <Button
            size="small"
            type={record.status === 'agreement_signed' ? 'primary' : 'default'}
            disabled={record.status !== 'agreement_signed'}
            onClick={() => setWrpDisburseModal({ visible: true, record })}
          >
            放款
          </Button>
          <Button
            size="small"
            disabled={record.status !== 'disbursed'}
            onClick={() => setWrpReleaseModal({ visible: true, record })}
          >
            释放
          </Button>
        </Space>
      ),
    },
  ]

  const menuItems = [
    { key: 'products' as TabKey, label: '产品管理', icon: <BankOutlined />, group: 'product' },
    { key: 'risk-review' as TabKey, label: '风控审批', icon: <AuditOutlined />, group: 'approval' },
    { key: 'debt-contract' as TabKey, label: '债务合同', icon: <FileSearchOutlined />, group: 'contract' },
    { key: 'disburse' as TabKey, label: '放款管理', icon: <DollarCircleOutlined />, group: 'contract' },
    { key: 'pledge' as TabKey, label: '货权质押', icon: <SafetyCertificateOutlined />, group: 'pledge' },
    { key: 'warehouse-receipt-pledge' as TabKey, label: '仓单质押', icon: <SafetyCertificateOutlined />, group: 'pledge' },
    { key: 'collateral-monitor' as TabKey, label: '货权监控', icon: <ControlOutlined />, group: 'pledge' },
    { key: 'release-pledge' as TabKey, label: '质押释放', icon: <EditOutlined />, group: 'pledge' },
    { key: 'finance-flow' as TabKey, label: '融资流程', icon: <DotChartOutlined />, group: 'center' },
    { key: 'all' as TabKey, label: '订单中心', icon: <FileSearchOutlined />, group: 'center' },
  ]

  if (!hasFinanceCapability()) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 480, textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
          <Title level={4}>需要资金服务商权限</Title>
          <Paragraph type="secondary">当前账户未开通资金服务商能力，请联系平台管理员申请开通。</Paragraph>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #edf0f5' }}>
          <Space>
            <DollarCircleOutlined style={{ color: '#7c3aed' }} />
            <Text strong>RecoLink 资金</Text>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <div className="space-y-2">
            <div className="px-3 py-2">
              <Text className="text-xs font-medium text-slate-500">产品管理</Text>
            </div>
            {menuItems.filter((item) => item.group === 'product').map((item) => (
              <List.Item
                key={item.key}
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                  </Text>
                </Space>
              </List.Item>
            ))}
            
            <div className="border-t border-slate-200 my-2" />
            
            <div className="px-3 py-2">
              <Text className="text-xs font-medium text-slate-500">融资审批</Text>
            </div>
            {menuItems.filter((item) => item.group === 'approval').map((item) => (
              <List.Item
                key={item.key}
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                    {item.key === 'risk-review' && riskOrders.length > 0 && (
                      <Badge count={riskOrders.length} style={{ marginLeft: 8 }} />
                    )}
                  </Text>
                </Space>
              </List.Item>
            ))}
            
            <div className="border-t border-slate-200 my-2" />
            
            <div className="px-3 py-2">
              <Text className="text-xs font-medium text-slate-500">合同放款</Text>
            </div>
            {menuItems.filter((item) => item.group === 'contract').map((item) => (
              <List.Item
                key={item.key}
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                    {item.key === 'debt-contract' && debtOrders.length > 0 && (
                      <Badge count={debtOrders.length} style={{ marginLeft: 8 }} />
                    )}
                  </Text>
                </Space>
              </List.Item>
            ))}
            
            <div className="border-t border-slate-200 my-2" />
            
            <div className="px-3 py-2">
              <Text className="text-xs font-medium text-slate-500">质押管理</Text>
            </div>
            {menuItems.filter((item) => item.group === 'pledge').map((item) => (
              <List.Item
                key={item.key}
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                  </Text>
                </Space>
              </List.Item>
            ))}
            
            <div className="border-t border-slate-200 my-2" />
            
            <div className="px-3 py-2">
              <Text className="text-xs font-medium text-slate-500">订单中心</Text>
            </div>
            {menuItems.filter((item) => item.group === 'center').map((item) => (
              <List.Item
                key={item.key}
                style={{ border: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: activeTab === item.key ? '#f0eaff' : 'transparent' }}
                onClick={() => setActiveTab(item.key)}
              >
                <Space>
                  {item.icon}
                  <Text type={activeTab === item.key ? undefined : 'secondary'}>
                    {item.label}
                  </Text>
                </Space>
              </List.Item>
            ))}
          </div>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>资金服务方工作台</Text>
          <Space>
            <Button icon={<AuditOutlined />} onClick={() => { 
              if (activeTab === 'products') fetchProducts(); 
              else if (activeTab === 'risk-review') fetchRiskOrders(); 
              else if (activeTab === 'debt-contract') fetchDebtOrders();
              else if (activeTab === 'disburse') fetchDebtOrders();
              else if (activeTab === 'pledge') fetchAll();
              else if (activeTab === 'warehouse-receipt-pledge') fetchWarehouseReceiptPledges();
              else if (activeTab === 'collateral-monitor') fetchCollateralMonitor();
              else if (activeTab === 'release-pledge') fetchAll();
              else if (activeTab === 'finance-flow') fetchAll();
              else fetchAll(); 
            }}>
              刷新
            </Button>
            <Button icon={<HomeOutlined />} href="/">买家首页</Button>
          </Space>
        </Header>
        <Content className="service-content" style={{ padding: 24 }}>
          {activeTab === 'products' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已提交产品</Typography.Text><br /><Title level={3}>{financeProducts.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已审核通过</Typography.Text><br /><Title level={3}>{financeProducts.filter((item) => item.status === 2).length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待平台审核</Typography.Text><br /><Title level={3}>{financeProducts.filter((item) => item.status === 1).length}</Title></Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={9}>
                  <Card title="上架金融产品">
                    <Form form={productForm} layout="vertical" onFinish={handleCreateProduct}>
                      <Form.Item label="产品名称" name="name" rules={[{ required: true, message: '请输入产品名称' }]}>
                        <Input placeholder="例如托盘垫资-30天账期" />
                      </Form.Item>
                      <Form.Item label="服务类型" name="finance_type">
                        <Input placeholder="托盘垫资 / 订单融资 / 保理" />
                      </Form.Item>
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item label="最低额度" name="min_amount">
                            <InputNumber style={{ width: '100%' }} min={0} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="最高额度" name="max_amount">
                            <InputNumber style={{ width: '100%' }} min={0} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item label="账期天数" name="term_days">
                            <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="年化费率(%)" name="annual_rate">
                            <InputNumber style={{ width: '100%' }} min={0} precision={4} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label="手续费规则" name="fee_rule">
                        <Input placeholder="例如按授信金额 0.3%" />
                      </Form.Item>
                      <Form.Item label="风控要求" name="risk_control_rule">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Form.Item label="服务描述" name="description">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" loading={creatingProduct} block>提交平台审核</Button>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} xl={15}>
                  <Card title="我的金融产品">
                    <Spin spinning={productLoading}>
                      <Table columns={productColumns} dataSource={financeProducts} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 940 }} locale={{ emptyText: '暂无金融产品' }} />
                    </Spin>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {activeTab === 'risk-review' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">待审申请</Typography.Text><br /><Title level={3}>{riskOrders.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">授信余额</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">预警案件</Typography.Text><br /><Title level={3}>--</Title></Card>
                </Col>
              </Row>
              <Card title="融资审批池" extra={<Tag color="purple">状态 21</Tag>}>
                <Spin spinning={loading}>
                  <Table columns={riskColumns} dataSource={riskOrders} rowKey="id" pagination={false} scroll={{ x: 940 }} locale={{ emptyText: '暂无待审批融资申请' }} />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'debt-contract' && (
            <>
              <Card title="合同与放款" extra={<Tag color="magenta">状态 22</Tag>} style={{ marginBottom: 16 }}>
                <Spin spinning={loading}>
                  <Table columns={debtColumns} dataSource={debtOrders} rowKey="id" pagination={false} scroll={{ x: 820 }} locale={{ emptyText: '暂无待处理合同' }} />
                </Spin>
              </Card>
              <Card title="标准审核流">
                <Steps
                  direction="vertical"
                  current={2}
                  items={[
                    { title: '资料校验', description: '企业认证、合同、订单、仓单', status: 'finish' },
                    { title: '风控评估', description: '交易真实性、库存监管、授信占用', status: 'finish' },
                    { title: '放款确认', description: '合同签署、资金划拨、费用确认', status: 'process' },
                    { title: '贷后监控', description: '回款、库存、履约状态预警', status: 'wait' },
                  ]}
                />
              </Card>
            </>
          )}

          {activeTab === 'disburse' && (
            <Card title="放款管理" extra={<Tag color="green">待放款</Tag>}>
              <Spin spinning={loading}>
                <Table 
                  columns={[
                    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
                    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
                    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
                    {
                      title: '审批金额',
                      key: 'approved_amount',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const amount = record.financing_info?.approved_amount
                        return amount ? `¥${amount.toLocaleString()}` : '--'
                      },
                    },
                    {
                      title: '融资状态',
                      key: 'financing_status',
                      width: 140,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        const map: Record<string, { label: string; color: string }> = {
                          buyer_confirmed: { label: '待生成合同', color: 'orange' },
                          contract_generated: { label: '待买方签署', color: 'blue' },
                          buyer_signed_fee_paid: { label: '待放款', color: 'purple' },
                          disbursed: { label: '已放款', color: 'green' },
                          pledged: { label: '已质押', color: 'cyan' },
                          released: { label: '已释放', color: 'default' },
                        }
                        const meta = map[fs || ''] || { label: fs || '--', color: 'default' }
                        return <Tag color={meta.color}>{meta.label}</Tag>
                      },
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        if (fs === 'buyer_signed_fee_paid') {
                          return (
                            <Button type="primary" size="small" icon={<DollarCircleOutlined />} onClick={() => {
                              setDisburseModal({ visible: true, orderId: record.id })
                            }}>
                              放款
                            </Button>
                          )
                        }
                        return <Text type="secondary">--</Text>
                      },
                    },
                  ]}
                  dataSource={debtOrders} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }} 
                  scroll={{ x: 940 }} 
                  locale={{ emptyText: '暂无待放款订单' }} 
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'pledge' && (
            <Card title="货权质押" extra={<Tag color="cyan">已放款待质押</Tag>}>
              <Spin spinning={loading}>
                <Table 
                  columns={[
                    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
                    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
                    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
                    {
                      title: '放款金额',
                      key: 'approved_amount',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const amount = record.financing_info?.approved_amount
                        return amount ? `¥${amount.toLocaleString()}` : '--'
                      },
                    },
                    {
                      title: '质押状态',
                      key: 'pledge_status',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        if (fs === 'disbursed') return <Tag color="orange">待质押</Tag>
                        if (fs === 'pledged') return <Tag color="cyan">已质押</Tag>
                        return <Text type="secondary">--</Text>
                      },
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        if (fs === 'disbursed') {
                          return (
                            <Button type="primary" size="small" icon={<SafetyCertificateOutlined />} onClick={() => {
                              setPledgeModal({ visible: true, orderId: record.id })
                            }}>
                              记录质押
                            </Button>
                          )
                        }
                        return <Text type="secondary">--</Text>
                      },
                    },
                  ]}
                  dataSource={allOrders.filter((order) => order.financing_info?.status === 'disbursed')} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }} 
                  scroll={{ x: 800 }} 
                  locale={{ emptyText: '暂无待质押订单' }} 
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'release-pledge' && (
            <Card title="质押释放" extra={<Tag color="purple">已质押待释放</Tag>}>
              <Spin spinning={loading}>
                <Table 
                  columns={[
                    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 160 },
                    { title: '买方', dataIndex: 'buyer_name', key: 'buyer_name', width: 120 },
                    { title: '卖方', dataIndex: 'seller_name', key: 'seller_name', width: 120 },
                    {
                      title: '质押金额',
                      key: 'approved_amount',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const amount = record.financing_info?.approved_amount
                        return amount ? `¥${amount.toLocaleString()}` : '--'
                      },
                    },
                    {
                      title: '质押状态',
                      key: 'pledge_status',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        if (fs === 'pledged') return <Tag color="cyan">已质押</Tag>
                        if (fs === 'released') return <Tag color="success">已释放</Tag>
                        return <Text type="secondary">--</Text>
                      },
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_: unknown, record: OrderInfo) => {
                        const fs = record.financing_info?.status
                        if (fs === 'pledged') {
                          return (
                            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => {
                              setReleaseModal({ visible: true, orderId: record.id })
                            }}>
                              释放质押
                            </Button>
                          )
                        }
                        return <Text type="secondary">--</Text>
                      },
                    },
                  ]}
                  dataSource={allOrders.filter((order) => order.financing_info?.status === 'pledged')} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }} 
                  scroll={{ x: 800 }} 
                  locale={{ emptyText: '暂无待释放质押订单' }} 
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'warehouse-receipt-pledge' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={6}>
                  <Card><Typography.Text type="secondary">全部申请</Typography.Text><br /><Title level={3}>{warehouseReceiptPledges.length}</Title></Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card><Typography.Text type="secondary">待风控</Typography.Text><br /><Title level={3}>{warehouseReceiptPledges.filter((item) => item.status === 'submitted').length}</Title></Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card><Typography.Text type="secondary">待放款</Typography.Text><br /><Title level={3}>{warehouseReceiptPledges.filter((item) => item.status === 'agreement_signed').length}</Title></Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card><Typography.Text type="secondary">已放款</Typography.Text><br /><Title level={3}>{warehouseReceiptPledges.filter((item) => item.status === 'disbursed').length}</Title></Card>
                </Col>
              </Row>
              <Card title="仓单质押申请" extra={<Tag color="geekblue">监管仓 / 仓单 / 协议 / 释放</Tag>}>
                <Spin spinning={loading}>
                  <Table
                    columns={warehouseReceiptPledgeColumns}
                    dataSource={warehouseReceiptPledges}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Text type="secondary">仓单文件：{record.receipt_voucher_url || '--'}</Text>
                          <Text type="secondary">质押协议：{record.pledge_agreement_url || '--'}</Text>
                          <Text type="secondary">监管协议：{record.supervision_agreement_url || '--'}</Text>
                          <Text type="secondary">放款凭证：{record.disbursement_voucher_url || '--'}</Text>
                          <Text type="secondary">释放凭证：{record.release_voucher_url || '--'}</Text>
                          <Text type="secondary">备注：{record.risk_remark || record.release_remark || record.remark || '--'}</Text>
                        </Space>
                      ),
                    }}
                    locale={{ emptyText: '暂无仓单质押申请' }}
                  />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'collateral-monitor' && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">监控订单</Typography.Text><br /><Title level={3}>{collateralList.length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已质押</Typography.Text><br /><Title level={3}>{collateralList.filter((item) => item.financing_status === 'pledged').length}</Title></Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card><Typography.Text type="secondary">已释放</Typography.Text><br /><Title level={3}>{collateralList.filter((item) => item.financing_status === 'released').length}</Title></Card>
                </Col>
              </Row>
              <Card title="货权监控看板" extra={<Tag color="geekblue">仓库 / 物流 / 单据</Tag>}>
                <Spin spinning={loading}>
                  <Table
                    rowKey="financing_request_id"
                    dataSource={collateralList}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1280 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          <Card size="small" title="库存快照">
                            <Table
                              size="small"
                              rowKey="id"
                              dataSource={record.inventory_snapshots || []}
                              pagination={false}
                              columns={[
                                { title: '快照号', dataIndex: 'snapshot_no', key: 'snapshot_no', width: 150 },
                                { title: '商品', dataIndex: 'product_name', key: 'product_name', width: 120 },
                                { title: '批次', dataIndex: 'batch_no', key: 'batch_no', width: 100, render: (v: string) => v || '--' },
                                { title: '库位', dataIndex: 'location_code', key: 'location_code', width: 100, render: (v: string) => v || '--' },
                                { title: '库存', dataIndex: 'quantity', key: 'quantity', width: 90, render: (v: number) => `${Number(v || 0).toLocaleString()} 吨` },
                                { title: '冻结', dataIndex: 'frozen_quantity', key: 'frozen_quantity', width: 90, render: (v: number) => `${Number(v || 0).toLocaleString()} 吨` },
                                { title: '质检', dataIndex: 'quality_status', key: 'quality_status', width: 90 },
                                { title: '质押', dataIndex: 'pledge_status', key: 'pledge_status', width: 90 },
                                { title: '同步', dataIndex: 'sync_status', key: 'sync_status', width: 90 },
                              ]}
                              locale={{ emptyText: '暂无库存快照' }}
                            />
                          </Card>
                          <Card size="small" title="履约单据">
                            <List
                              size="small"
                              dataSource={record.fulfillment_docs || []}
                              locale={{ emptyText: '暂无履约单据' }}
                              renderItem={(doc) => (
                                <List.Item>
                                  <List.Item.Meta
                                    title={
                                      <Space>
                                        <Tag>{doc.doc_type}</Tag>
                                        <Text>{doc.uploaded_role || '--'}</Text>
                                      </Space>
                                    }
                                    description={
                                      <Space direction="vertical" size={2}>
                                        <Text type="secondary">{doc.remark || '无备注'}</Text>
                                        <Text type="secondary">{doc.file_url || '--'}</Text>
                                      </Space>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          </Card>
                        </Space>
                      ),
                    }}
                    columns={[
                      {
                        title: '订单号',
                        dataIndex: 'order_no',
                        key: 'order_no',
                        width: 160,
                        render: (v: string) => <Text strong>{v}</Text>,
                      },
                      {
                        title: '审批金额',
                        dataIndex: 'approved_amount',
                        key: 'approved_amount',
                        width: 120,
                        render: (v: number) => (v ? `¥${v.toLocaleString()}` : '--'),
                      },
                      {
                        title: '融资状态',
                        dataIndex: 'financing_status',
                        key: 'financing_status',
                        width: 130,
                        render: (v: string) => {
                          const map: Record<string, { label: string; color: string }> = {
                            disbursed: { label: '已放款', color: 'green' },
                            pledged: { label: '已质押', color: 'geekblue' },
                            released: { label: '已释放', color: 'success' },
                          }
                          const meta = map[v] || { label: v || '--', color: 'default' }
                          return <Tag color={meta.color}>{meta.label}</Tag>
                        },
                      },
                      {
                        title: '订单状态',
                        dataIndex: 'order_status',
                        key: 'order_status',
                        width: 120,
                        render: (v: number) => {
                          const meta = statusMap[v] || { label: `状态${v}`, color: 'default' }
                          return <Tag color={meta.color}>{meta.label}</Tag>
                        },
                      },
                      {
                        title: '监管仓库',
                        key: 'warehouse',
                        width: 220,
                        render: (_: unknown, record: CollateralMonitorInfo) => (
                          <Space direction="vertical" size={0}>
                            <Text>{record.warehouse_name || '非平台监管仓'}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.warehouse_address || '--'}</Text>
                          </Space>
                        ),
                      },
                      {
                        title: '物流状态',
                        dataIndex: 'logistics_status',
                        key: 'logistics_status',
                        width: 130,
                        render: (v: string) => <Tag color={v ? 'processing' : 'default'}>{v || '未创建'}</Tag>,
                      },
                      {
                        title: '最近物流事件',
                        dataIndex: 'last_logistics_event',
                        key: 'last_logistics_event',
                        width: 180,
                        ellipsis: true,
                        render: (v: string) => v || '--',
                      },
                      {
                        title: '库存/单据',
                        key: 'assets',
                        width: 120,
                        render: (_: unknown, record: CollateralMonitorInfo) =>
                          `${record.inventory_snapshots?.length || 0} 快照 / ${record.fulfillment_docs?.length || 0} 单据`,
                      },
                      {
                        title: '质押凭证',
                        key: 'pledge_voucher',
                        width: 120,
                        render: (_: unknown, record: CollateralMonitorInfo) =>
                          record.pledge_voucher_url ? <Tag color="cyan">已上传</Tag> : <Tag>未上传</Tag>,
                      },
                      {
                        title: '释放条件',
                        dataIndex: 'release_condition',
                        key: 'release_condition',
                        width: 180,
                        ellipsis: true,
                        render: (v: string) => v || '--',
                      },
                      {
                        title: '监管操作',
                        key: 'monitor_action',
                        width: 130,
                        render: (_: unknown, record: CollateralMonitorInfo) => {
                          if (!record.logistics_order_id) return <Text type="secondary">无物流单</Text>
                          if (record.financing_status !== 'pledged') return <Text type="secondary">--</Text>
                          if (record.logistics_status !== 'inbound_completed') return <Text type="secondary">待收货仓入库</Text>
                          return (
                            <Button size="small" type="primary" onClick={() => setCollateralReceiptModal({ visible: true, record })}>
                              确认收货
                            </Button>
                          )
                        },
                      },
                    ]}
                    locale={{ emptyText: '暂无货权监控数据' }}
                  />
                </Spin>
              </Card>
            </>
          )}

          {activeTab === 'finance-flow' && (
            <Card title="融资流程总览">
              <Spin spinning={loading}>
                <Table
                  dataSource={allOrders.filter((order) => order.financing_info)}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  expandable={{
                    expandedRowKeys: expandedFinanceOrders,
                    onExpandedRowsChange: (keys) => setExpandedFinanceOrders(keys as number[]),
                    expandedRowRender: (record) => {
                      const { currentStep, stepDefinitions } = getFinancingStepInfo(record.financing_info?.status)
                      return (
                        <div style={{ padding: '16px 24px', background: '#fafafa' }}>
                          <Steps
                            current={currentStep}
                            size="small"
                            items={stepDefinitions.map((step, index) => ({
                              title: step.title,
                              description: step.owner,
                              status: index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait',
                            }))}
                          />
                          <div style={{ marginTop: 16, display: 'flex', gap: 32, color: '#666' }}>
                            <span>审批金额：<strong style={{ color: '#333' }}>¥{(record.financing_info?.approved_amount || 0).toLocaleString()}</strong></span>
                            <span>账期：<strong style={{ color: '#333' }}>{record.financing_info?.term_days || '--'}天</strong></span>
                            <span>年化费率：<strong style={{ color: '#333' }}>{record.financing_info?.annual_rate || '--'}%</strong></span>
                            <span>手续费：<strong style={{ color: '#333' }}>¥{(record.financing_info?.service_fee || 0).toLocaleString()}</strong></span>
                          </div>
                        </div>
                      )
                    },
                  }}
                  columns={[
                    {
                      title: '订单号',
                      dataIndex: 'order_no',
                      key: 'order_no',
                      width: 160,
                      render: (text: string) => <Text strong>{text}</Text>,
                    },
                    {
                      title: '买方',
                      dataIndex: 'buyer_name',
                      key: 'buyer_name',
                      width: 140,
                    },
                    {
                      title: '订单金额',
                      dataIndex: 'total_amount',
                      key: 'total_amount',
                      width: 120,
                      render: (v: number) => `¥${(v || 0).toLocaleString()}`,
                    },
                    {
                      title: '融资状态',
                      key: 'financing_status',
                      width: 160,
                      render: (_: unknown, record: OrderInfo) => {
                        const statusMap: Record<string, { label: string; color: string }> = {
                          pending: { label: '待风控审核', color: 'orange' },
                          risk_approved: { label: '风控已通过', color: 'cyan' },
                          buyer_confirmed: { label: '买方已确认', color: 'blue' },
                          contract_generated: { label: '合同已生成', color: 'purple' },
                          buyer_signed_fee_paid: { label: '待放款', color: 'magenta' },
                          disbursed: { label: '已放款', color: 'green' },
                          pledged: { label: '已质押', color: 'geekblue' },
                          released: { label: '已完成', color: 'success' },
                        }
                        const meta = statusMap[record.financing_info?.status || ''] || { label: record.financing_info?.status || '--', color: 'default' }
                        return <Tag color={meta.color}>{meta.label}</Tag>
                      },
                    },
                    {
                      title: '当前节点',
                      key: 'current_step',
                      render: (_: unknown, record: OrderInfo) => {
                        const { currentStep, stepDefinitions } = getFinancingStepInfo(record.financing_info?.status)
                        const current = stepDefinitions[currentStep]
                        return current ? `${currentStep + 1}. ${current.title}` : '--'
                      },
                    },
                  ]}
                  locale={{ emptyText: '暂无融资订单' }}
                />
              </Spin>
            </Card>
          )}

          {activeTab === 'all' && (
            <Card title="全部订单">
              <Spin spinning={loading}>
                <Table columns={allColumns} dataSource={allOrders} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 940 }} locale={{ emptyText: '暂无订单' }} />
              </Spin>
            </Card>
          )}

          <Modal
            title="风控审核"
            open={riskModal.visible}
            onOk={handleSubmitRisk}
            onCancel={() => {
              setRiskModal({ visible: false, orderId: null })
              setRiskAmount(0)
              setRiskTermDays(30)
              setRiskAnnualRate(0)
              setRiskServiceFee(0)
              setRiskRemark('')
            }}
            okText="提交审核"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>审批结果：</Text>
                <Space>
                  <Tag color={riskApproved ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setRiskApproved(true)}>通过</Tag>
                  <Tag color={!riskApproved ? 'red' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setRiskApproved(false)}>拒绝</Tag>
                </Space>
              </div>
              {riskApproved && (
                <>
                  <div>
                    <Text>审批金额 (元)：</Text>
                    <InputNumber style={{ width: '100%' }} min={0} value={riskAmount} onChange={(v) => setRiskAmount(v || 0)} />
                  </div>
                  <div>
                    <Text>账期 (天)：</Text>
                    <InputNumber style={{ width: '100%' }} min={1} value={riskTermDays} onChange={(v) => setRiskTermDays(v || 30)} />
                  </div>
                  <div>
                    <Text>年化费率 (%)：</Text>
                    <InputNumber style={{ width: '100%' }} min={0} precision={2} value={riskAnnualRate} onChange={(v) => setRiskAnnualRate(v || 0)} />
                  </div>
                  <div>
                    <Text>手续费 (元)：</Text>
                    <InputNumber style={{ width: '100%' }} min={0} precision={2} value={riskServiceFee} onChange={(v) => setRiskServiceFee(v || 0)} />
                  </div>
                </>
              )}
              <div>
                <Text>审核备注：</Text>
                <Input value={riskRemark} onChange={(e) => setRiskRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="生成债务质押合同"
            open={debtModal.visible}
            onOk={handleGenerateDebt}
            onCancel={() => {
              setDebtModal({ visible: false, orderId: null })
              setDebtContractNo('')
              setDebtContractURL('')
              setDebtContractHash('')
            }}
            okText="生成合同"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>合同编号：</Text>
                <Input value={debtContractNo} onChange={(e) => setDebtContractNo(e.target.value)} placeholder="留空则由后端生成" />
              </div>
              <div>
                <Text>合同文件 URL：</Text>
                <Input value={debtContractURL} onChange={(e) => setDebtContractURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>合同哈希：</Text>
                <Input value={debtContractHash} onChange={(e) => setDebtContractHash(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="确认放款"
            open={disburseModal.visible}
            onOk={handleDisburse}
            onCancel={() => {
              setDisburseModal({ visible: false, orderId: null })
              setDisbursementVoucher('')
              setFundingCommission(0)
              setCommissionVoucher('')
              setDisburseRemark('')
            }}
            okText="确认放款"
            okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph>确认资金方分佣已支付，并向卖方定向放款。</Paragraph>
              <div>
                <Text>分佣金额 (元)：</Text>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} value={fundingCommission} onChange={(v) => setFundingCommission(v || 0)} />
              </div>
              <div>
                <Text>分佣凭证 URL：</Text>
                <Input value={commissionVoucher} onChange={(e) => setCommissionVoucher(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>放款凭证 URL：</Text>
                <Input value={disbursementVoucher} onChange={(e) => setDisbursementVoucher(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>备注：</Text>
                <Input value={disburseRemark} onChange={(e) => setDisburseRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="记录货权质押"
            open={pledgeModal.visible}
            onOk={handleRecordPledge}
            onCancel={() => {
              setPledgeModal({ visible: false, orderId: null })
              setPledgeVoucherURL('')
              setReleaseCondition('')
              setPledgeRemark('')
            }}
            okText="记录质押"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>质押凭证 URL：</Text>
                <Input value={pledgeVoucherURL} onChange={(e) => setPledgeVoucherURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>释放条件：</Text>
                <Input value={releaseCondition} onChange={(e) => setReleaseCondition(e.target.value)} placeholder="例如买方结清账期款项且卖方完成对账" />
              </div>
              <div>
                <Text>质押备注：</Text>
                <Input value={pledgeRemark} onChange={(e) => setPledgeRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="释放货权质押"
            open={releaseModal.visible}
            onOk={handleReleasePledge}
            onCancel={() => {
              setReleaseModal({ visible: false, orderId: null })
              setReleaseReason('')
              setReleaseVoucherURL('')
            }}
            okText="释放质押"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text>释放原因：</Text>
                <Input value={releaseReason} onChange={(e) => setReleaseReason(e.target.value)} placeholder="必填" />
              </div>
              <div>
                <Text>释放凭证 URL：</Text>
                <Input value={releaseVoucherURL} onChange={(e) => setReleaseVoucherURL(e.target.value)} placeholder="选填，https://..." />
              </div>
            </Space>
          </Modal>

          <Modal
            title="资金方监管收货确认"
            open={collateralReceiptModal.visible}
            onOk={handleCollateralReceipt}
            onCancel={() => {
              setCollateralReceiptModal({ visible: false, record: null })
              setCollateralReceiptURL('')
              setCollateralReceiptRemark('')
            }}
            okText="上传并确认"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph type="secondary">
                收货仓完成验货入库并上传封条照片、入库单、收货单后，资金方确认监管收货。
              </Paragraph>
              <div>
                <Text>收货单 URL：</Text>
                <Input value={collateralReceiptURL} onChange={(e) => setCollateralReceiptURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>确认备注：</Text>
                <Input value={collateralReceiptRemark} onChange={(e) => setCollateralReceiptRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="仓单质押风控"
            open={wrpRiskModal.visible}
            onOk={handleWarehouseReceiptPledgeRisk}
            onCancel={() => {
              setWrpRiskModal({ visible: false, record: null })
              setWrpRiskApproved(true)
              setWrpApprovedAmount(0)
              setWrpTermDays(30)
              setWrpAnnualRate(0)
              setWrpRiskRemark('')
            }}
            okText="提交风控"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph type="secondary">
                校验仓单真实性、货权归属、监管仓库存和申请企业资信后提交结果。
              </Paragraph>
              <div>
                <Text>审批结果：</Text>
                <Space>
                  <Tag color={wrpRiskApproved ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setWrpRiskApproved(true)}>通过</Tag>
                  <Tag color={!wrpRiskApproved ? 'red' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setWrpRiskApproved(false)}>拒绝</Tag>
                </Space>
              </div>
              {wrpRiskApproved && (
                <>
                  <div>
                    <Text>审批金额 (元)：</Text>
                    <InputNumber style={{ width: '100%' }} min={0} precision={2} value={wrpApprovedAmount} onChange={(v) => setWrpApprovedAmount(v || 0)} />
                  </div>
                  <div>
                    <Text>账期 (天)：</Text>
                    <InputNumber style={{ width: '100%' }} min={1} precision={0} value={wrpTermDays} onChange={(v) => setWrpTermDays(v || 30)} />
                  </div>
                  <div>
                    <Text>年化费率 (%)：</Text>
                    <InputNumber style={{ width: '100%' }} min={0} precision={4} value={wrpAnnualRate} onChange={(v) => setWrpAnnualRate(v || 0)} />
                  </div>
                </>
              )}
              <div>
                <Text>风控备注：</Text>
                <Input value={wrpRiskRemark} onChange={(e) => setWrpRiskRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="登记仓单质押与监管协议"
            open={wrpAgreementModal.visible}
            onOk={handleWarehouseReceiptPledgeAgreement}
            onCancel={() => {
              setWrpAgreementModal({ visible: false, record: null })
              setWrpPledgeAgreementURL('')
              setWrpSupervisionAgreementURL('')
            }}
            okText="确认协议已签"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph type="secondary">
                申请企业将仓单质押给资方，并和监管仓/资方签署监管协议后登记。
              </Paragraph>
              <div>
                <Text>仓单质押协议 URL：</Text>
                <Input value={wrpPledgeAgreementURL} onChange={(e) => setWrpPledgeAgreementURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>监管协议 URL：</Text>
                <Input value={wrpSupervisionAgreementURL} onChange={(e) => setWrpSupervisionAgreementURL(e.target.value)} placeholder="https://..." />
              </div>
            </Space>
          </Modal>

          <Modal
            title="仓单质押放款"
            open={wrpDisburseModal.visible}
            onOk={handleWarehouseReceiptPledgeDisburse}
            onCancel={() => {
              setWrpDisburseModal({ visible: false, record: null })
              setWrpDisbursementVoucherURL('')
              setWrpDisburseRemark('')
            }}
            okText="确认放款"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph type="secondary">
                放款后系统会尝试按仓库、货物和仓单号匹配库存快照，并标记质押冻结。
              </Paragraph>
              <div>
                <Text>放款凭证 URL：</Text>
                <Input value={wrpDisbursementVoucherURL} onChange={(e) => setWrpDisbursementVoucherURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Text>放款备注：</Text>
                <Input value={wrpDisburseRemark} onChange={(e) => setWrpDisburseRemark(e.target.value)} placeholder="选填" />
              </div>
            </Space>
          </Modal>

          <Modal
            title="释放仓单质押货权"
            open={wrpReleaseModal.visible}
            onOk={handleWarehouseReceiptPledgeRelease}
            onCancel={() => {
              setWrpReleaseModal({ visible: false, record: null })
              setWrpReleaseVoucherURL('')
              setWrpReleaseRemark('')
            }}
            okText="确认释放"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Paragraph type="secondary">
                申请企业销售回款并还款后，资方按笔释放对应货权。
              </Paragraph>
              <div>
                <Text>释放凭证 URL：</Text>
                <Input value={wrpReleaseVoucherURL} onChange={(e) => setWrpReleaseVoucherURL(e.target.value)} placeholder="选填，https://..." />
              </div>
              <div>
                <Text>释放说明：</Text>
                <Input value={wrpReleaseRemark} onChange={(e) => setWrpReleaseRemark(e.target.value)} placeholder="必填，例如已回款还款，释放本笔仓单货权" />
              </div>
            </Space>
          </Modal>

          <Modal
            title={editingProduct ? '编辑金融产品' : '查看金融产品'}
            open={editProductModalVisible}
            onOk={handleEditProduct}
            onCancel={() => { setEditProductModalVisible(false); setEditingProduct(null) }}
            width={640}
            okText="保存"
            destroyOnClose
          >
            <Form form={editProductForm} layout="vertical">
              <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
                <Input placeholder="例：供应链托盘融资" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="finance_type" label="融资类型">
                    <Input placeholder="例：存货质押融资" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="term_days" label="账期(天)">
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="min_amount" label="最低额度(元)">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="max_amount" label="最高额度(元)">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="annual_rate" label="年化费率(%)">
                    <InputNumber style={{ width: '100%' }} min={0} precision={4} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="fee_rule" label="手续费规则">
                    <Input placeholder="例如按授信金额 0.3%" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="risk_control_rule" label="风控要求">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="description" label="服务描述">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
