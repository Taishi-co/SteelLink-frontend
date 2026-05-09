import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd'
import { TeamOutlined, UserOutlined, LogoutOutlined, ShoppingCartOutlined, OrderedListOutlined, SafetyCertificateOutlined, BankOutlined, DashboardOutlined, ShopOutlined } from '@ant-design/icons'
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

const sellerDashboardHref = import.meta.env.DEV ? 'http://localhost:5174/seller/dashboard' : '/seller/dashboard'

export default function HomeHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const selectedKey = navItems.find(item => item.key !== '/' && location.pathname.startsWith(item.key))?.key
    || (location.pathname === '/' ? '/' : '')

  const userMenuItems = [
    { key: 'dashboard', label: '个人工作台', icon: <DashboardOutlined />, onClick: () => navigate('/dashboard') },
    ...(hasEnterpriseAccess(user) ? [{ key: 'seller', label: '卖家中心', icon: <ShopOutlined />, onClick: () => { window.location.href = sellerDashboardHref } }] : []),
    { key: 'identity', label: `实名认证 (${getIdentityStatusLabel(user?.identityStatus ?? 0)})`, icon: <SafetyCertificateOutlined />, onClick: () => navigate('/dashboard/identity') },
    { key: 'enterprise', label: user?.enterpriseCode ? '企业信息' : '企业入驻', icon: <BankOutlined />, onClick: () => navigate(user?.enterpriseCode ? '/dashboard/enterprise' : '/enterprise') },
    { key: 'orders', label: '我的订单', icon: <OrderedListOutlined />, onClick: () => navigate('/dashboard/orders') },
    { key: 'cart', label: '购物车', icon: <ShoppingCartOutlined />, onClick: () => navigate('/cart') },
    { key: 'divider', type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ]

  return (
    <AntHeader className="bg-white shadow-sm flex items-center px-8 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary-600 no-underline flex-shrink-0">
          SteelLink
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems.map(item => ({
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
          className="border-none flex-1 justify-center"
          style={{ minWidth: 560 }}
        />

        <Space size="middle" className="flex-shrink-0">
          {isLoggedIn ? (
            <>
              <Button
                type="primary"
                icon={<DashboardOutlined />}
                onClick={() => navigate('/dashboard')}
              >
                个人工作台
              </Button>
              {hasEnterpriseAccess(user) && (
                <a href={sellerDashboardHref}>
                  <Button icon={<ShopOutlined />}>卖家中心</Button>
                </a>
              )}
              <NotificationBell />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                  <span className="text-sm text-gray-700">{user?.realName || user?.username || user?.mobile || '用户'}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button type="primary">登录 / 注册</Button>
              </Link>
              <Link to="/dashboard/enterprise">
                <Button icon={<TeamOutlined />}>企业入驻</Button>
              </Link>
            </>
          )}
        </Space>
      </div>
    </AntHeader>
  )
}
