import { useState, useMemo, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { Layout, Menu, Avatar, Tooltip } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ShopOutlined,
  HomeOutlined,
  TruckOutlined,
  LineChartOutlined,
  RiseOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CloudServerOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { clearBuyerSession, hasEnterpriseAccess, openSellerCenter, openServiceWorkbench } from '@/services/auth'
import { useUserStore } from '@/stores'
import { getIdentityStatusLabel, certificationService } from '@/services/certificationService'
import type { EnterpriseServicePermission } from '@/services/certificationService'
import { getFallbackServicesByEnterpriseRole } from '@/pages/Dashboard/serviceAccess'

const { Sider, Content } = Layout

interface NavItem {
  key: string
  icon: React.ReactNode
  label: string
  roles?: string[]
  services?: string[]
}

const allNavItems: NavItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '个人工作台' },
  { key: '/dashboard/notifications', icon: <MailOutlined />, label: '站内信' },
  { key: '/dashboard/market', icon: <LineChartOutlined />, label: '钢材行情', roles: ['enterprise'] },
  {
    key: '/dashboard/bidding',
    icon: <RiseOutlined />,
    label: '竞价管理',
    services: ['procurement'],
  },
  {
    key: '/dashboard/orders',
    icon: <UnorderedListOutlined />,
    label: '我的订单',
    services: ['procurement', 'sales'],
  },
  { key: '/dashboard/finance', icon: <DollarOutlined />, label: '资金服务', services: ['procurement', 'sales'] },
  {
    key: '/dashboard/warehouse',
    icon: <CloudServerOutlined />,
    label: '货物管理',
    services: ['procurement', 'sales'],
  },
  {
    key: '/dashboard/logistics',
    icon: <TruckOutlined />,
    label: '物流服务',
    services: ['procurement', 'sales'],
  },
  {
    key: '/dashboard/services',
    icon: <AppstoreOutlined />,
    label: '服务入口',
    roles: ['enterprise'],
  },
]

const accountItems = [
  { key: '/dashboard/identity', icon: <SafetyCertificateOutlined />, label: '实名认证' },
  { key: '/dashboard/enterprise', icon: <BankOutlined />, label: '企业信息' },
]

const SHARED_PERMISSIONS_KEY = 'enterprise_service_permissions'

function setSharedPermissionsCookie(value: string) {
  document.cookie = `${SHARED_PERMISSIONS_KEY}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [servicePermissions, setServicePermissions] = useState<EnterpriseServicePermission[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()

  useEffect(() => {
    if (!hasEnterpriseAccess(user)) {
      setServicePermissions([])
      return
    }
    certificationService
      .getMyServices()
      .then((res) => {
        if (res.code === 0 && res.data?.permissions) {
          setServicePermissions(res.data.permissions)
          const serialized = JSON.stringify(res.data.permissions)
          localStorage.setItem(SHARED_PERMISSIONS_KEY, serialized)
          sessionStorage.setItem(SHARED_PERMISSIONS_KEY, serialized)
          setSharedPermissionsCookie(serialized)
        }
      })
      .catch(() => {})
  }, [user])

  const approvedServices = useMemo(() => {
    return new Set<string>(servicePermissions.filter((p) => p.status === 2).map((p) => p.service))
  }, [servicePermissions])

  const fallbackServices = useMemo(() => {
    return new Set<string>(getFallbackServicesByEnterpriseRole(user?.enterpriseRole))
  }, [user?.enterpriseRole])

  const effectiveServices = useMemo(() => {
    if (approvedServices.size > 0) {
      return approvedServices
    }
    return fallbackServices
  }, [approvedServices, fallbackServices])

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.roles && !item.roles.includes(user?.role || '')) return false
      if (item.services && !item.services.some((s) => effectiveServices.has(s))) return false
      return true
    })
  }, [user?.role, effectiveServices])

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const identityLabel = getIdentityStatusLabel(user?.identityStatus ?? 0)

  const switchToSellerCenter = () => {
    void openSellerCenter('/seller/dashboard')
  }

  const getSelectedKey = () => {
    const exact = navItems.find((item) => location.pathname === item.key)
    if (exact) return [exact.key]
    const prefix = navItems.find(
      (item) => item.key !== '/dashboard' && location.pathname.startsWith(item.key)
    )
    if (prefix) return [prefix.key]
    const accountMatch = accountItems.find((item) => location.pathname.startsWith(item.key))
    if (accountMatch) return [accountMatch.key]
    if (location.pathname === '/dashboard') return ['/dashboard']
    return ['/dashboard']
  }

  return (
    <Layout className="dashboard-shell">
      <Sider
        width={220}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="dashboard-sider fixed bottom-0 left-0 top-0 z-50 overflow-auto"
        trigger={null}
      >
        <div className="h-full flex flex-col">
          <div className="dashboard-brand px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="dashboard-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-black">
                R
              </div>
              {!collapsed && (
                <div>
                  <div className="text-[15px] font-black tracking-[-0.02em] text-[#17221b]">锐联产业协同平台</div>
                  <div className="text-[10px] font-bold tracking-[0.16em] text-[#a4662c]">RecoLink Workbench</div>
                </div>
              )}
            </div>
          </div>

          {!collapsed && user?.enterpriseCode && (
            <div className="dashboard-account-card mx-3 mb-1 mt-3 rounded-2xl px-3 py-3">
              <div className="mb-1 text-[10px] font-bold tracking-[0.14em] text-[#a4662c]">当前账户</div>
              <div className="truncate text-xs font-semibold text-[#17221b]">{user.companyName}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="rounded-full bg-[#edf6ef] px-2 py-0.5 text-[9px] font-semibold text-[#2f6b49]">
                  {user.enterpriseRole === 'buyer'
                    ? '采购方'
                    : user.enterpriseRole === 'seller'
                      ? '供应商'
                      : user.enterpriseRole === 'logistics'
                        ? '物流商'
                        : user.enterpriseRole === 'warehouse'
                          ? '仓储商'
                          : user.enterpriseRole === 'fund'
                            ? '资金方'
                            : '企业'}
                </span>
                <span className="text-[9px] text-[#7a847a]">{identityLabel}</span>
              </div>
            </div>
          )}

          {!collapsed && !user?.enterpriseCode && (
            <div className="dashboard-account-card mx-3 mb-1 mt-3 rounded-2xl px-3 py-3">
              <div className="mb-1 text-[10px] font-bold tracking-[0.14em] text-[#a4662c]">个人账户</div>
              <div className="text-xs font-semibold text-[#17221b]">
                {user?.username || user?.mobile || '用户'}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] text-[#7a847a]">{identityLabel}</span>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2.5 pt-2 overflow-y-auto">
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a4662c]">
              {collapsed ? '' : '业务'}
            </div>
            <Menu
              mode="inline"
              selectedKeys={getSelectedKey()}
              onClick={({ key }) => navigate(key)}
              items={navItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
              className="dashboard-menu !border-none !bg-transparent [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-10 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!leading-10"
            />

            <div className="px-3 mt-4 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a4662c]">
              {collapsed ? '' : '账户'}
            </div>
            <Menu
              mode="inline"
              selectedKeys={getSelectedKey()}
              onClick={({ key }) => navigate(key)}
              items={accountItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
              className="dashboard-menu !border-none !bg-transparent [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-10 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!leading-10"
            />
          </nav>

          <div className="px-2.5 mb-2">
            {effectiveServices.has('sales') && (
              <div
                className="dashboard-quick-link mb-2 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
                onClick={switchToSellerCenter}
              >
                <ShopOutlined className="text-sm text-[#2f6b49]" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-semibold">
                      进入卖家中心
                    </span>
                    <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
                  </>
                )}
              </div>
            )}
            {effectiveServices.has('finance') && (
              <div
                className="dashboard-quick-link mb-2 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
                onClick={() => void openServiceWorkbench('finance', 5177, '/finance/')}
              >
                <BankOutlined className="text-sm text-[#2f6b49]" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-semibold">
                      进入资金方工作台
                    </span>
                    <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
                  </>
                )}
              </div>
            )}
            {effectiveServices.has('logistics') && (
              <div
                className="dashboard-quick-link mb-2 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
                onClick={() => void openServiceWorkbench('logistics', 5175, '/logistics/')}
              >
                <TruckOutlined className="text-sm text-[#2f6b49]" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-semibold">
                      进入物流管理中心
                    </span>
                    <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
                  </>
                )}
              </div>
            )}
            {effectiveServices.has('warehouse') && (
              <div
                className="dashboard-quick-link mb-2 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
                onClick={() => void openServiceWorkbench('warehouse', 5176, '/warehouse/')}
              >
                <HomeOutlined className="text-sm text-[#2f6b49]" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-semibold">
                      进入仓储管理中心
                    </span>
                    <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
                  </>
                )}
              </div>
            )}
            <Link to="/mall">
              <div
                className="dashboard-quick-link flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
              >
                <ShoppingOutlined className="text-sm text-[#2f6b49]" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-xs font-semibold">进入商城</span>
                    <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
                  </>
                )}
              </div>
            </Link>
          </div>

          <div className="border-t border-[#eadcc7] px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar size={28} icon={<UserOutlined />} className="shrink-0 bg-[#c47b34]" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-semibold text-[#17221b]">
                    {user?.realName || user?.username || '用户'}
                  </div>
                  <div className="truncate text-[10px] text-[#7a847a]">{user?.mobile || ''}</div>
                </div>
              )}
              {!collapsed && (
                <Tooltip title="退出登录">
                  <LogoutOutlined
                    className="cursor-pointer text-xs text-[#7a847a] transition-colors hover:text-[#b45324]"
                    onClick={handleLogout}
                  />
                </Tooltip>
              )}
            </div>
          </div>

          <div
            className="flex h-10 cursor-pointer items-center justify-center border-t border-[#eadcc7] text-[#7a847a] transition-colors hover:text-[#214332]"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ArrowRightOutlined /> : <LogoutOutlined className="rotate-180" />}
          </div>
        </div>
      </Sider>

      <Layout className="transition-all duration-200" style={{ marginLeft: collapsed ? 64 : 220 }}>
        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
