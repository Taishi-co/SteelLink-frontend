import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd'
import { ShopOutlined, TeamOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { clearBuyerSession } from '@/services/auth'
import { useUserStore } from '@/stores'

const { Header: AntHeader } = Layout

const navItems = [
  { key: '/mall', label: '现货商城' },
  { key: '/bidding', label: '竞价交易' },
  { key: '/procurement', label: '集采大厅' },
  { key: '/supply', label: '供求信息' },
  { key: '/about', label: '平台介绍' },
]

export default function HomeHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'orders', label: '我的订单', onClick: () => navigate('/orders') },
    { key: 'divider', type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
  ]

  return (
    <AntHeader className="bg-white shadow-sm flex items-center px-8 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary-600 no-underline">
          SteelLink
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={navItems.map(item => ({
            key: item.key,
            label: <Link to={item.key} className="text-gray-700 hover:text-primary-600">{item.label}</Link>
          }))}
          className="border-none flex-1 justify-center"
          style={{ minWidth: 400 }}
        />

        <Space size="middle">
          <Link to="/mall">
            <Button type="primary" icon={<ShopOutlined />}>进入商城</Button>
          </Link>
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg hover:bg-gray-50">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="text-sm text-gray-700">{user?.username || user?.mobile || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Link to="/login">
                <Button icon={<UserOutlined />}>登录</Button>
              </Link>
              <a href="/seller">
                <Button icon={<TeamOutlined />}>企业入驻</Button>
              </a>
            </>
          )}
        </Space>
      </div>
    </AntHeader>
  )
}
