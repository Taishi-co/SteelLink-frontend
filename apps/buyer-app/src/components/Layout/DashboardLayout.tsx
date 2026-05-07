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
  AppstoreAddOutlined,
  CloudServerOutlined,
  ShopOutlined,
  LineChartOutlined,
  RiseOutlined,
  TruckOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { clearBuyerSession, hasEnterpriseAccess } from '@/services/auth'
import { useUserStore } from '@/stores'
import { getIdentityStatusLabel, certificationService } from '@/services/certificationService'
import type { EnterpriseServicePermission } from '@/services/certificationService'

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
  { key: '/dashboard/market', icon: <LineChartOutlined />, label: '钢材行情' },
  { key: '/dashboard/bidding', icon: <RiseOutlined />, label: '竞价管理', services: ['procurement'] },
  { key: '/dashboard/orders', icon: <UnorderedListOutlined />, label: '我的订单', services: ['procurement', 'sales'] },
  { key: '/dashboard/finance', icon: <DollarOutlined />, label: '凭单融资', services: ['finance'] },
  { key: '/dashboard/logistics', icon: <ShopOutlined />, label: '仓储物流', services: ['logistics', 'warehouse'] },
  { key: '/dashboard/services', icon: <AppstoreOutlined />, label: '服务入口', roles: ['enterprise'] },
]

const serviceNavItems: Record<ServiceKey, NavItem> = {
  logistics: { key: '/dashboard/logistics', icon: <TruckOutlined />, label: '物流平台' },
  warehouse: { key: '/dashboard/warehouse', icon: <CloudServerOutlined />, label: '仓储平台' },
  finance: { key: '/dashboard/finance', icon: <DollarOutlined />, label: '资金服务' },
}

const accountItems = [
  { key: '/dashboard/identity', icon: <SafetyCertificateOutlined />, label: '实名认证' },
  { key: '/dashboard/enterprise', icon: <BankOutlined />, label: '企业信息' },
]

const sellerDashboardHref = import.meta.env.DEV ? 'http://localhost:5174/seller/dashboard' : '/seller/dashboard'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [servicePermissions, setServicePermissions] = useState<EnterpriseServicePermission[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()
  const [enabledServices, setEnabledServices] = useState<ServiceKey[]>(() => readEnabledServices())

  useEffect(() => {
    const handleAccessChange = () => setEnabledServices(readEnabledServices())
    window.addEventListener('storage', handleAccessChange)
    window.addEventListener(SERVICE_ACCESS_EVENT, handleAccessChange)
    return () => {
      window.removeEventListener('storage', handleAccessChange)
      window.removeEventListener(SERVICE_ACCESS_EVENT, handleAccessChange)
    }
  }, [])

  useEffect(() => {
    if (!hasEnterpriseAccess(user)) {
      setServicePermissions([])
      return
    }
    certificationService.getMyServices().then((res) => {
      if (res.code === 0 && res.data?.permissions) {
        setServicePermissions(res.data.permissions)
      }
    }).catch(() => {})
  }, [user?.role, user?.enterpriseCode])

  const approvedServices = useMemo(() => {
    return new Set<string>(
      servicePermissions
        .filter((p) => p.status === 2)
        .map((p) => p.service)
    )
  }, [servicePermissions])

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.roles && !item.roles.includes(user?.role || '')) return false
      if (item.services && !item.services.some((s) => approvedServices.has(s))) return false
      return true
    })
  }, [user?.role, approvedServices])

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const identityLabel = getIdentityStatusLabel(user?.identityStatus ?? 0)

  const getSelectedKey = () => {
    const exact = navItems.find(item => location.pathname === item.key)
    if (exact) return [exact.key]
    const prefix = navItems.find(item => item.key !== '/dashboard' && location.pathname.startsWith(item.key))
    if (prefix) return [prefix.key]
    const accountMatch = accountItems.find(item => location.pathname.startsWith(item.key))
    if (accountMatch) return [accountMatch.key]
    if (location.pathname === '/dashboard') return ['/dashboard']
    return ['/dashboard']
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        width={220}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="!bg-[#0c1a38] fixed left-0 top-0 bottom-0 z-50 overflow-auto"
        trigger={null}
      >
        <div className="h-full flex flex-col">
          <div className="px-5 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #1e4fc2)', boxShadow: '0 2px 8px rgba(30,79,194,.4)' }}
              >
                <DashboardOutlined className="text-white text-sm" />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-white font-bold text-[15px] tracking-wide">SteelLink</div>
                  <div className="text-white/30 text-[10px]">钢联贸易平台</div>
                </div>
              )}
            </div>
          </div>

          {!collapsed && user?.enterpriseCode && (
            <div className="mx-3 mt-3 mb-1 bg-white/5 rounded-lg px-3 py-2.5">
              <div className="text-white/35 text-[10px] mb-1">当前账户</div>
              <div className="text-white/85 text-xs font-medium truncate">{user.companyName}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] bg-emerald-500/18 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                  {user.enterpriseRole === 'buyer' ? '采购方' : user.enterpriseRole === 'seller' ? '供应商' : user.enterpriseRole === 'logistics' ? '物流商' : user.enterpriseRole === 'warehouse' ? '仓储商' : user.enterpriseRole === 'fund' ? '资金方' : '企业'}
                </span>
                <span className="text-[9px] text-white/30">{identityLabel}</span>
              </div>
            </div>
          )}

          {!collapsed && !user?.enterpriseCode && (
            <div className="mx-3 mt-3 mb-1 bg-white/5 rounded-lg px-3 py-2.5">
              <div className="text-white/35 text-[10px] mb-1">个人账户</div>
              <div className="text-white/85 text-xs font-medium">{user?.username || user?.mobile || '用户'}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] text-white/30">{identityLabel}</span>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2.5 pt-2 overflow-y-auto">
            <div className="text-white/25 text-[10px] px-3 mb-1.5 uppercase tracking-wider">
              {collapsed ? '' : '业务'}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={getSelectedKey()}
              onClick={({ key }) => navigate(key)}
              items={navItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
              className="!bg-transparent !border-none [&_.ant-menu-item]:!h-9 [&_.ant-menu-item]:!leading-9 [&_.ant-menu-item]:!my-0.5 [&_.ant-menu-item]:!rounded-lg [&_.ant-menu-item-selected]:!bg-white/10 [&_.ant-menu-item-selected]:!text-white [&_.ant-menu-item]:!text-white/45 [&_.ant-menu-item:hover]:!text-white/80 [&_.ant-menu-item:hover]:!bg-white/6"
            />

            <div className="text-white/25 text-[10px] px-3 mt-4 mb-1.5 uppercase tracking-wider">
              {collapsed ? '' : '账户'}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={getSelectedKey()}
              onClick={({ key }) => navigate(key)}
              items={accountItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
              className="!bg-transparent !border-none [&_.ant-menu-item]:!h-9 [&_.ant-menu-item]:!leading-9 [&_.ant-menu-item]:!my-0.5 [&_.ant-menu-item]:!rounded-lg [&_.ant-menu-item-selected]:!bg-white/10 [&_.ant-menu-item-selected]:!text-white [&_.ant-menu-item]:!text-white/45 [&_.ant-menu-item:hover]:!text-white/80 [&_.ant-menu-item:hover]:!bg-white/6"
            />
          </nav>

          <div className="px-2.5 mb-2">
            {hasEnterpriseAccess(user) && (
              <a href={sellerDashboardHref}>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer mb-2"
                  style={{ background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.25)' }}
                >
                  <ShopOutlined className="text-emerald-400 text-sm" />
                  {!collapsed && (
                    <>
                      <span className="text-xs text-emerald-400 font-semibold flex-1">进入卖家中心</span>
                      <ArrowRightOutlined className="text-emerald-400 text-[10px]" />
                    </>
                  )}
                </div>
              </a>
            )}
            <Link to="/mall">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)' }}
              >
                <ShoppingOutlined className="text-indigo-400 text-sm" />
                {!collapsed && (
                  <>
                    <span className="text-xs text-indigo-400 font-semibold flex-1">进入商城</span>
                    <ArrowRightOutlined className="text-indigo-400 text-[10px]" />
                  </>
                )}
              </div>
            </Link>
          </div>

          <div className="px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Avatar size={28} icon={<UserOutlined />} className="bg-indigo-500 shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-white/82 text-xs font-medium truncate">{user?.realName || user?.username || '用户'}</div>
                  <div className="text-white/30 text-[10px] truncate">{user?.mobile || ''}</div>
                </div>
              )}
              {!collapsed && (
                <Tooltip title="退出登录">
                  <LogoutOutlined
                    className="text-white/30 hover:text-red-400 cursor-pointer text-xs transition-colors"
                    onClick={handleLogout}
                  />
                </Tooltip>
              )}
            </div>
          </div>

          <div
            className="flex items-center justify-center h-10 cursor-pointer border-t border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ArrowRightOutlined /> : <LogoutOutlined className="rotate-180" />}
          </div>
        </div>
      </Sider>

      <Layout className="transition-all duration-200" style={{ marginLeft: collapsed ? 64 : 220 }}>
        <Content className="bg-[#f0f4f9] min-h-screen p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
