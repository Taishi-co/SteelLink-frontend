import {
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

export type TabKey = 'dashboard' | 'pending' | 'movements' | 'logistics' | 'inventory' | 'resources' | 'all'

const tabKeys: TabKey[] = ['dashboard', 'pending', 'movements', 'logistics', 'inventory', 'resources', 'all']

export function isTabKey(value: string | null): value is TabKey {
  return Boolean(value && tabKeys.includes(value as TabKey))
}

export const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  12: { label: '待选择目的地仓储', color: 'geekblue' },
  13: { label: '待仓库确认', color: 'orange' },
  14: { label: '待卖方确认', color: 'blue' },
  15: { label: '待买方确认', color: 'blue' },
  2: { label: '待签合同', color: 'cyan' },
  3: { label: '待付款', color: 'gold' },
  4: { label: '待确认收款', color: 'purple' },
  5: { label: '待提货', color: 'geekblue' },
  16: { label: '物流竞价中', color: 'processing' },
  17: { label: '待确认物流', color: 'blue' },
  18: { label: '运输中', color: 'cyan' },
  6: { label: '已发货', color: 'cyan' },
  7: { label: '已到货', color: 'green' },
  19: { label: '已收货', color: 'green' },
  8: { label: '已完成', color: 'success' },
  20: { label: '已对账', color: 'success' },
  21: { label: '已归档', color: 'default' },
  22: { label: '融资审批中', color: 'purple' },
  23: { label: '待签署融资合同', color: 'magenta' },
  24: { label: '待重新选仓', color: 'volcano' },
  25: { label: '待重新发起物流', color: 'volcano' },
  26: { label: '待选择仓库', color: 'geekblue' },
  27: { label: '待签署物流合同', color: 'gold' },
}

export const resourceStatusMap: Record<number, { label: string; color: string }> = {
  1: { label: '待审核', color: 'orange' },
  2: { label: '已通过', color: 'success' },
  3: { label: '已驳回', color: 'error' },
  4: { label: '已下线', color: 'default' },
}

export const menuItems = [
  { key: 'dashboard' as TabKey, label: '工作台概览', icon: <DashboardOutlined /> },
  { key: 'pending' as TabKey, label: '待确认订单', icon: <ExclamationCircleOutlined /> },
  { key: 'movements' as TabKey, label: '出入库管理', icon: <DatabaseOutlined /> },
  { key: 'logistics' as TabKey, label: '物流履约协同', icon: <SafetyCertificateOutlined /> },
  { key: 'inventory' as TabKey, label: '库存快照', icon: <SafetyCertificateOutlined /> },
  { key: 'resources' as TabKey, label: '仓库资源管理', icon: <AppstoreOutlined /> },
  { key: 'all' as TabKey, label: '全部订单', icon: <InboxOutlined /> },
]
