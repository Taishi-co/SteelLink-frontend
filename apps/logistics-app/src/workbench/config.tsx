import {
  AppstoreOutlined,
  CarOutlined,
  DollarCircleOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

export type TabKey = 'dashboard' | 'bidding' | 'logistics-flow' | 'resources' | 'fleet'

export function isTabKey(value: string | null): value is TabKey {
  return Boolean(value && ['dashboard', 'bidding', 'logistics-flow', 'resources', 'fleet'].includes(value))
}

export const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

export const logisticsOrderStatusMap: Record<string, { label: string; color: string }> = {
  task_created: { label: '运输任务已创建', color: 'default' },
  pickup_scheduled: { label: '提货已预约', color: 'processing' },
  arrival_signed_in: { label: '已到场签到', color: 'blue' },
  outbound_confirmed: { label: '已出库确认', color: 'cyan' },
  loading_confirmed: { label: '已装货确认', color: 'cyan' },
  in_transit: { label: '运输中', color: 'geekblue' },
  arrival_confirmed: { label: '已到货确认', color: 'green' },
  receipt_signed: { label: '已验收签收', color: 'green' },
  inbound_completed: { label: '已入库完成', color: 'success' },
  completed: { label: '履约完成', color: 'success' },
  pending: { label: '待接单', color: 'default' },
  accepted: { label: '已接单', color: 'processing' },
  delivered: { label: '已送达', color: 'green' },
  cancelled: { label: '已取消', color: 'error' },
}

export const menuItems = [
  { key: 'dashboard' as TabKey, label: '工作台概览', icon: <RocketOutlined /> },
  { key: 'bidding' as TabKey, label: '竞价与接单', icon: <DollarCircleOutlined /> },
  { key: 'logistics-flow' as TabKey, label: '物流流程', icon: <CarOutlined /> },
  { key: 'resources' as TabKey, label: '运力资源管理', icon: <AppstoreOutlined /> },
  { key: 'fleet' as TabKey, label: '司机车辆档案', icon: <SafetyCertificateOutlined /> },
]

const stepDefinitions = [
  { key: 'task_created', title: '运输任务', owner: '系统', hint: '运输任务已创建' },
  { key: 'pickup_scheduled', title: '提货预约', owner: '物流方', hint: '预约提货时间' },
  { key: 'arrival_signed_in', title: '到场签到', owner: '物流方', hint: '车辆到达仓库签到' },
  { key: 'outbound_confirmed', title: '出库确认', owner: '仓储方', hint: '仓库执行出库操作' },
  { key: 'loading_confirmed', title: '装货确认', owner: '物流方', hint: '确认货物装载完毕' },
  { key: 'in_transit', title: '运输中', owner: '物流方', hint: '货物在途运输' },
  { key: 'arrival_confirmed', title: '到货确认', owner: '物流方', hint: '到达目的地确认' },
  { key: 'inbound_completed', title: '收货仓验货入库', owner: '仓储方', hint: '收货仓验货并上传入库资料' },
  { key: 'receipt_signed', title: '确认收货', owner: '买方/资金方', hint: '查看入库资料后确认收货' },
  { key: 'completed', title: '履约结束', owner: '系统', hint: '物流履约流程结束' },
]

const statusOrder = [
  'task_created',
  'pickup_scheduled',
  'arrival_signed_in',
  'outbound_confirmed',
  'loading_confirmed',
  'in_transit',
  'arrival_confirmed',
  'inbound_completed',
  'receipt_signed',
  'completed',
]

export function getLogisticsStepInfo(status: string) {
  let completedStep = statusOrder.indexOf(status)
  if (completedStep === -1) {
    if (status === 'pending') completedStep = 0
    else if (status === 'accepted') completedStep = 1
  }

  const currentStep = Math.min(completedStep + 1, stepDefinitions.length - 1)
  return { stepDefinitions, currentStep }
}
