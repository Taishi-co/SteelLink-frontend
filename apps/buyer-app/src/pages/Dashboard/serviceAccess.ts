import { BankOutlined, CloudServerOutlined, ShopOutlined, ShoppingCartOutlined, TruckOutlined } from '@ant-design/icons'

export type ServiceKey = 'sales' | 'procurement' | 'logistics' | 'warehouse' | 'finance'

export interface ServicePermissionLike {
  service: string
  status: number
}

export interface ServiceDefinition {
  key: ServiceKey
  title: string
  shortTitle: string
  role: string
  description: string
  route: string
  iconType: 'sales' | 'procurement' | 'truck' | 'warehouse' | 'finance'
  color: string
  capabilities: string[]
}

const STORAGE_KEY = 'steellink_dashboard_enabled_services'
export const SERVICE_ACCESS_EVENT = 'steellink-service-access-change'

export const serviceDefinitions: ServiceDefinition[] = [
  {
    key: 'sales',
    title: '销售交易能力',
    shortTitle: '销售',
    role: '供应商',
    description: '发布商品、参与竞价报价、管理销售订单和店铺履约配置。',
    route: '/dashboard/services/sales',
    iconType: 'sales',
    color: '#b45309',
    capabilities: ['商品发布', '参与竞价', '订单管理', '店铺设置'],
  },
  {
    key: 'procurement',
    title: '采购交易能力',
    shortTitle: '采购',
    role: '采购商',
    description: '采购下单、发起竞价、AI 采购和交易履约协同。',
    route: '/dashboard/services/procurement',
    iconType: 'procurement',
    color: '#2f6b49',
    capabilities: ['采购下单', '竞价管理', 'AI采购', '服务申请'],
  },
  {
    key: 'logistics',
    title: '物流服务商能力',
    shortTitle: '物流',
    role: '物流方',
    description: '承接运输委托、派车、在途跟踪、签收回单和结算。',
    route: '/dashboard/services/logistics',
    iconType: 'truck',
    color: '#2563eb',
    capabilities: ['司机管理', '运力资源', '物流竞价', '履约单据'],
  },
  {
    key: 'warehouse',
    title: '仓储服务商能力',
    shortTitle: '仓储',
    role: '仓储方',
    description: '管理仓容、入出库预约、库存监管、仓单资料和费用。',
    route: '/dashboard/services/warehouse',
    iconType: 'warehouse',
    color: '#16a34a',
    capabilities: ['仓库上架', '入出库验货', '库存监管', '仓单资料'],
  },
  {
    key: 'finance',
    title: '资金服务商能力',
    shortTitle: '资金',
    role: '资金方',
    description: '查看平台已审核资金产品，在订单支付节点申请托盘垫资、订单融资或账期服务。',
    route: '/dashboard/services/finance',
    iconType: 'finance',
    color: '#7c3aed',
    capabilities: ['金融产品', '合同放款', '货权监控', '仓单质押'],
  },
]

export const defaultEnabledServices: ServiceKey[] = serviceDefinitions.map((item) => item.key)

export function getServiceDefinition(key: ServiceKey) {
  return serviceDefinitions.find((item) => item.key === key)
}

export function getFallbackServicesByEnterpriseRole(enterpriseRole?: string): ServiceKey[] {
  switch (enterpriseRole) {
    case 'buyer':
      return ['procurement']
    case 'seller':
      return ['sales']
    case 'logistics':
      return ['logistics']
    case 'warehouse':
      return ['warehouse']
    case 'fund':
      return ['finance']
    default:
      return []
  }
}

export function getEffectiveServiceStatus(
  serviceKey: ServiceKey,
  permissions: ServicePermissionLike[] = [],
  enterpriseRole?: string,
) {
  const permission = permissions.find((item) => item.service === serviceKey)
  if (permission) {
    return permission.status
  }
  return getFallbackServicesByEnterpriseRole(enterpriseRole).includes(serviceKey) ? 2 : 0
}

export function isServiceAvailable(
  serviceKey: ServiceKey,
  permissions: ServicePermissionLike[] = [],
  enterpriseRole?: string,
) {
  return getEffectiveServiceStatus(serviceKey, permissions, enterpriseRole) === 2
}

export function readEnabledServices(): ServiceKey[] {
  if (typeof window === 'undefined') return defaultEnabledServices
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultEnabledServices
  try {
    const parsed = JSON.parse(raw) as string[]
    const valid = parsed.filter((item): item is ServiceKey => serviceDefinitions.some((service) => service.key === item))
    if (!valid.length) return defaultEnabledServices
    return Array.from(new Set(valid))
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
  sales: ShopOutlined,
  procurement: ShoppingCartOutlined,
  truck: TruckOutlined,
  warehouse: CloudServerOutlined,
  finance: BankOutlined,
}
