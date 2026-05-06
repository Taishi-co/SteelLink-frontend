import { BankOutlined, CloudServerOutlined, TruckOutlined } from '@ant-design/icons'

export type ServiceKey = 'logistics' | 'warehouse' | 'finance'

export interface ServiceDefinition {
  key: ServiceKey
  title: string
  shortTitle: string
  description: string
  route: string
  iconType: 'truck' | 'warehouse' | 'finance'
  color: string
  capabilities: string[]
}

const STORAGE_KEY = 'steellink_dashboard_enabled_services'
export const SERVICE_ACCESS_EVENT = 'steellink-service-access-change'

export const serviceDefinitions: ServiceDefinition[] = [
  {
    key: 'logistics',
    title: '物流平台',
    shortTitle: '物流',
    description: '承接运输委托、派车、在途跟踪、签收回单和结算。',
    route: '/dashboard/logistics',
    iconType: 'truck',
    color: '#2563eb',
    capabilities: ['整车运输', '短驳配送', '在途轨迹', '回单结算'],
  },
  {
    key: 'warehouse',
    title: '仓储平台',
    shortTitle: '仓储',
    description: '管理仓容、入出库预约、库存监管、仓单资料和费用。',
    route: '/dashboard/warehouse',
    iconType: 'warehouse',
    color: '#16a34a',
    capabilities: ['仓容发布', '入出库预约', '库存监管', '仓单资料'],
  },
  {
    key: 'finance',
    title: '资金服务平台',
    shortTitle: '资金',
    description: '处理订单融资、仓单质押、授信审批、放款和贷后监控。',
    route: '/dashboard/finance',
    iconType: 'finance',
    color: '#7c3aed',
    capabilities: ['订单融资', '仓单质押', '授信审批', '贷后预警'],
  },
]

export const defaultEnabledServices: ServiceKey[] = ['finance', 'logistics']

export function getServiceDefinition(key: ServiceKey) {
  return serviceDefinitions.find((item) => item.key === key)
}

export function readEnabledServices(): ServiceKey[] {
  if (typeof window === 'undefined') return defaultEnabledServices
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultEnabledServices
  try {
    const parsed = JSON.parse(raw) as string[]
    const valid = parsed.filter((item): item is ServiceKey => serviceDefinitions.some((service) => service.key === item))
    return valid.length ? valid : defaultEnabledServices
  } catch {
    return defaultEnabledServices
  }
}

export function writeEnabledServices(keys: ServiceKey[]) {
  if (typeof window === 'undefined') return
  const unique = Array.from(new Set(keys))
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique))
  window.dispatchEvent(new CustomEvent(SERVICE_ACCESS_EVENT, { detail: unique }))
}

export function isServiceEnabled(key: ServiceKey) {
  return readEnabledServices().includes(key)
}

export const serviceIconMap = {
  truck: TruckOutlined,
  warehouse: CloudServerOutlined,
  finance: BankOutlined,
}
