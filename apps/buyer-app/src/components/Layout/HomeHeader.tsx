import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd'
import {
  BankOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  OrderedListOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { clearBuyerSession, hasEnterpriseAccess } from '@/services/auth'
import { getIdentityStatusLabel } from '@/services/certificationService'
import { useUserStore } from '@/stores'
import NotificationBell from '@/components/NotificationBell'

const { Header: AntHeader } = Layout

const navItems = [
  { key: '/', label: '首页' },
  { key: '/mall', label: '现货商城' },
  { key: '/matching', label: '供求信息' },
  { key: '/service-market', label: '物流仓储' },
  { key: '/ai-procurement', label: 'AI采购' },
  { key: '/bidding', label: '竞价交易' },
  { key: '/procurement', label: '集采大厅' },
  { key: '/about', label: '平台介绍' },
]

export default function HomeHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()
  const sellerBaseURL = import.meta.env.DEV ? 'http://localhost:5174' : ''

  const switchToSellerCenter = () => {
    window.location.href = `${sellerBaseURL}/seller/dashboard`
  }

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const selectedKey = navItems.find(item => item.key !== '/' && location.pathname.startsWith(item.key))?.key
    || (location.pathname === '/' ? '/' : '')

  const userMenuItems = [
    { key: 'dashboard', label: '个人工作台', icon: <DashboardOutlined />, onClick: () => navigate('/dashboard') },
    ...(hasEnterpriseAccess(user) ? [{ key: 'seller', label: '卖家中心', icon: <ShopOutlined />, onClick: switchToSellerCenter }] : []),
    { key: 'identity', label: `实名认证 (${getIdentityStatusLabel(user?.identityStatus ?? 0)})`, icon: <SafetyCertificateOutlined />, onClick: () => navigate('/dashboard/identity') },
    { key: 'enterprise', label: user?.enterpriseCode ? '企业信息' : '企业入驻', icon: <BankOutlined />, onClick: () => navigate(user?.enterpriseCode ? '/dashboard/enterprise' : '/enterprise') },
    { key: 'orders', label: '我的订单', icon: <OrderedListOutlined />, onClick: () => navigate('/dashboard/orders') },
    { key: 'cart', label: '购物车', icon: <ShoppingCartOutlined />, onClick: () => navigate('/cart') },
    { key: 'divider', type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ]

  const mobileMenuItems = navItems.map(item => ({
    key: item.key,
    label: item.label,
    onClick: () => navigate(item.key),
  }))

  return (
    <AntHeader className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-[#eadcc7] bg-[#fffdf8]/95 px-4 shadow-[0_10px_30px_rgba(64,44,25,.06)] backdrop-blur-xl md:px-8">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-5">
        <Link to="/" className="group flex min-w-0 flex-shrink-0 items-center gap-3 no-underline">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#214332] text-lg font-black text-[#f3c17c] shadow-[0_10px_24px_rgba(33,67,50,.18)]">
            R
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-black tracking-[-0.02em] text-[#17221b] sm:text-[17px]">锐联产业协同平台</span>
            <span className="block text-[12px] font-bold tracking-[0.08em] text-[#a4662c]">RecoLink</span>
          </span>
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems.map(item => ({
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
          className="home-nav hidden min-w-[560px] flex-1 justify-center border-none bg-transparent lg:flex"
        />

        <Space size="middle" className="hidden flex-shrink-0 md:flex">
          {isLoggedIn ? (
            <>
              <Button
                type="primary"
                icon={<DashboardOutlined />}
                onClick={() => navigate('/dashboard')}
                className="rounded-full bg-[#214332] px-5 font-semibold hover:!bg-[#2d5a43]"
              >
                个人工作台
              </Button>
              {hasEnterpriseAccess(user) && (
                <Button className="rounded-full" icon={<ShopOutlined />} onClick={switchToSellerCenter}>卖家中心</Button>
              )}
              <NotificationBell />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex cursor-pointer items-center gap-2 rounded-full border border-[#dfd0ba] bg-white/70 px-3 py-2 shadow-sm transition-colors hover:bg-white">
                  <Avatar size="small" icon={<UserOutlined />} className="bg-[#c47b34]" />
                  <span className="max-w-[120px] truncate text-sm font-semibold text-[#17221b]">{user?.realName || user?.username || user?.mobile || '用户'}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button type="primary" className="rounded-full bg-[#214332] px-5 font-semibold hover:!bg-[#2d5a43]">登录 / 注册</Button>
              </Link>
              <Link to="/dashboard/enterprise">
                <Button icon={<TeamOutlined />} className="rounded-full border-[#d0b991] bg-white">企业入驻</Button>
              </Link>
            </>
          )}
        </Space>

        <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
          <Button className="inline-flex rounded-full lg:hidden" icon={<MenuOutlined />} />
        </Dropdown>
      </div>
    </AntHeader>
  )
}
