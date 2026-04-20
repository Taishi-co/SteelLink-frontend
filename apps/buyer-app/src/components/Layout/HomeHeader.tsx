import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Space } from 'antd'
import { ShopOutlined, TeamOutlined } from '@ant-design/icons'

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

  return (
    <AntHeader className="bg-white shadow-sm flex items-center px-8 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary-600 no-underline">
          SteelLink
        </Link>

        {/* Navigation */}
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

        {/* Action Buttons */}
        <Space size="middle">
          <Link to="/mall">
            <Button type="primary" icon={<ShopOutlined />}>
              进入商城
            </Button>
          </Link>
          <a href="/seller">
            <Button icon={<TeamOutlined />}>
              企业入驻
            </Button>
          </a>
        </Space>
      </div>
    </AntHeader>
  )
}
