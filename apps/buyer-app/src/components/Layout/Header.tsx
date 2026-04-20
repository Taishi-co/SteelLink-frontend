import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Space, Badge, Input, Button } from 'antd'
import { ShoppingCartOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

export default function Header() {
  const location = useLocation()

  const menuItems = [
    { key: '/', label: <Link to="/">首页</Link> },
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

          <Link to="/cart">
            <Badge count={0} size="small">
              <Button type="text" icon={<ShoppingCartOutlined className="text-lg" />} />
            </Badge>
          </Link>

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
        </div>
      </div>
    </AntHeader>
  )
}
