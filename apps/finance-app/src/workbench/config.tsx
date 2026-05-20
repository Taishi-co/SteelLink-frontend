import {
  AuditOutlined,
  BankOutlined,
  ControlOutlined,
  DollarCircleOutlined,
  DotChartOutlined,
  EditOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

export type TabKey =
  | 'products'
  | 'risk-review'
  | 'debt-contract'
  | 'disburse'
  | 'pledge'
  | 'warehouse-receipt-pledge'
  | 'collateral-monitor'
  | 'release-pledge'
  | 'finance-flow'
  | 'all'

export type MenuGroupKey = 'product' | 'approval' | 'contract' | 'pledge' | 'center'

const tabKeys: TabKey[] = [
  'products',
  'risk-review',
  'debt-contract',
  'disburse',
  'pledge',
  'warehouse-receipt-pledge',
  'collateral-monitor',
  'release-pledge',
  'finance-flow',
  'all',
]

export function isTabKey(value: string | null): value is TabKey {
  return Boolean(value && tabKeys.includes(value as TabKey))
}

export const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'orange' },
  2: { label: '待签合同', color: 'cyan' },
  3: { label: '待付款', color: 'gold' },
  4: { label: '待确认收款', color: 'purple' },
  5: { label: '待提货', color: 'geekblue' },
  6: { label: '配送中', color: 'cyan' },
  7: { label: '已送达', color: 'green' },
  8: { label: '已完成', color: 'success' },
  9: { label: '已终止', color: 'red' },
  10: { label: '已冻结', color: 'volcano' },
  11: { label: '异常', color: 'red' },
  12: { label: '待选择目的地仓储', color: 'geekblue' },
  13: { label: '待仓库确认', color: 'orange' },
  14: { label: '待卖方确认', color: 'blue' },
  15: { label: '待买方确认', color: 'blue' },
  16: { label: '物流竞价中', color: 'processing' },
  17: { label: '待确认物流', color: 'blue' },
  18: { label: '运输中', color: 'cyan' },
  19: { label: '已收货', color: 'green' },
  20: { label: '已对账', color: 'success' },
  21: { label: '已归档', color: 'default' },
  22: { label: '融资审批中', color: 'purple' },
  23: { label: '待签署融资合同', color: 'magenta' },
  24: { label: '待重新选仓', color: 'volcano' },
  25: { label: '待重新发起物流', color: 'volcano' },
  26: { label: '待选择仓库', color: 'geekblue' },
  27: { label: '待签署物流合同', color: 'gold' },
}

export const productStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'processing' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

export const warehouseReceiptPledgeStatusMap: Record<string, { label: string; color: string }> = {
  submitted: { label: '待风控', color: 'processing' },
  risk_approved: { label: '风控通过', color: 'cyan' },
  risk_rejected: { label: '已驳回', color: 'red' },
  agreement_signed: { label: '协议已签', color: 'blue' },
  disbursed: { label: '已放款', color: 'green' },
  releasing: { label: '释放中', color: 'purple' },
  released: { label: '已释放', color: 'default' },
}

export const menuGroups: Array<{ key: MenuGroupKey; label: string }> = [
  { key: 'product', label: '产品管理' },
  { key: 'approval', label: '融资审批' },
  { key: 'contract', label: '合同放款' },
  { key: 'pledge', label: '质押管理' },
  { key: 'center', label: '订单中心' },
]

export const menuItems = [
  { key: 'products' as TabKey, label: '产品管理', icon: <BankOutlined />, group: 'product' as MenuGroupKey },
  { key: 'risk-review' as TabKey, label: '风控审批', icon: <AuditOutlined />, group: 'approval' as MenuGroupKey },
  { key: 'debt-contract' as TabKey, label: '债务合同', icon: <FileSearchOutlined />, group: 'contract' as MenuGroupKey },
  { key: 'disburse' as TabKey, label: '放款管理', icon: <DollarCircleOutlined />, group: 'contract' as MenuGroupKey },
  { key: 'pledge' as TabKey, label: '货权质押', icon: <SafetyCertificateOutlined />, group: 'pledge' as MenuGroupKey },
  { key: 'warehouse-receipt-pledge' as TabKey, label: '仓单质押', icon: <SafetyCertificateOutlined />, group: 'pledge' as MenuGroupKey },
  { key: 'collateral-monitor' as TabKey, label: '货权监控', icon: <ControlOutlined />, group: 'pledge' as MenuGroupKey },
  { key: 'release-pledge' as TabKey, label: '质押释放', icon: <EditOutlined />, group: 'pledge' as MenuGroupKey },
  { key: 'finance-flow' as TabKey, label: '融资流程', icon: <DotChartOutlined />, group: 'center' as MenuGroupKey },
  { key: 'all' as TabKey, label: '订单中心', icon: <FileSearchOutlined />, group: 'center' as MenuGroupKey },
]

const financingStepDefinitions = [
  { key: 'submitted', title: '申请提交', owner: '买方', hint: '提交融资申请' },
  { key: 'risk_approved', title: '风控审批', owner: '资金方', hint: '风控审核通过' },
  { key: 'buyer_confirmed', title: '确认方案', owner: '买方', hint: '确认授信方案' },
  { key: 'contract_generated', title: '上传合同', owner: '双方', hint: '上传债务质押合同' },
  { key: 'buyer_signed_fee_paid', title: '支付手续费', owner: '买方', hint: '支付融资手续费' },
  { key: 'disbursed', title: '付款完成', owner: '资金方', hint: '付款凭证同步给卖方' },
  { key: 'logistics_collateral', title: '物流入仓', owner: '卖方/物流/仓储', hint: '发起物流并送达监管仓' },
  { key: 'pledged', title: '确认收货质押', owner: '资金方', hint: '确认监管收货后完成质押' },
  { key: 'released', title: '质押释放', owner: '资金方', hint: '释放货权质押' },
]

const financingStatusOrder = [
  'submitted',
  'risk_approved',
  'buyer_confirmed',
  'contract_generated',
  'buyer_signed_fee_paid',
  'disbursed',
  'logistics_collateral',
  'pledged',
  'released',
]

export function getFinancingStepInfo(status?: string) {
  const currentKey = status === 'disbursed' ? 'logistics_collateral' : status
  const currentStep = currentKey ? financingStatusOrder.indexOf(currentKey) : -1
  return { stepDefinitions: financingStepDefinitions, currentStep }
}
