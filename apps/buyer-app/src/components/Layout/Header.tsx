import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Space, Badge, Input, Button, Dropdown } from 'antd'
import { ShoppingCartOutlined, UserOutlined, SearchOutlined, HomeOutlined } from '@ant-design/icons'
import { clearBuyerSession, getBuyerUser } from '@/services/auth'
import { useUserStore } from '@/stores/userStore'

const { Header: AntHeader } = Layout

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user) || getBuyerUser()
  const logout = useUserStore((state) => state.logout)

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const menuItems = [
    { key: '/products', label: <Link to="/products">商品列表</Link> },
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
            <Button type="text" icon={<HomeOutlined />}>
              首页
            </Button>
          </Link>

          <Link to="/cart">
            <Badge count={0} size="small">
              <Button type="text" icon={<ShoppingCartOutlined className="text-lg" />} />
            </Badge>
          </Link>

          {user ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'orders', label: <Link to="/orders">我的订单</Link> },
                  { key: 'logout', label: '退出登录', onClick: handleLogout },
                ],
              }}
            >
              <Button type="default" icon={<UserOutlined />}>
                {user.mobile || user.username}
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="default" icon={<UserOutlined />}>
                  登录
                </Button>
              </Link>
              <Link to="/login">
                <Button type="primary">
                  注册
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  )
}
