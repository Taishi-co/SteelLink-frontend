import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Space, Badge, Input, Button, Dropdown, Avatar } from 'antd'
import { ShoppingCartOutlined, UserOutlined, SearchOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons'
import { clearBuyerSession } from '@/services/auth'
import { useUserStore } from '@/stores'

const { Header: AntHeader } = Layout

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()

  const menuItems = [
    { key: '/products', label: <Link to="/products">商品列表</Link> },
  ]

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
    <AntHeader className="bg-white shadow-sm flex items-center px-6 h-16">
      <div className="flex items-center gap-8 flex-1">
        <Link to="/" className="text-xl font-bold text-primary-600 no-underline">
          SteelLink
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="flex-1 border-none"
          style={{ minWidth: 200 }}
        />

        <div className="flex items-center gap-4">
          <Input
            placeholder="搜索钢材..."
            prefix={<SearchOutlined />}
            className="w-64"
          />

          <Link to="/">
            <Button type="text" icon={<HomeOutlined />}>首页</Button>
          </Link>

          <Link to="/cart">
            <Badge count={0} size="small">
              <Button type="text" icon={<ShoppingCartOutlined className="text-lg" />} />
            </Badge>
          </Link>

          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg hover:bg-gray-50">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="text-sm text-gray-700">{user?.username || user?.mobile || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="default" icon={<UserOutlined />}>登录</Button>
              </Link>
              <Link to="/login">
                <Button type="primary">注册</Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  )
}
