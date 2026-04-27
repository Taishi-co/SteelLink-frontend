import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSellerSession, getSellerUser } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/products', icon: <ShopOutlined />, label: '商品管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/identity', icon: <SafetyCertificateOutlined />, label: '实名认证' },
  { key: '/enterprise', icon: <SafetyCertificateOutlined />, label: '企业入驻' },
  { key: '/settings', icon: <SettingOutlined />, label: '店铺设置' },
]

export default function SellerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getSellerUser()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const userMenuItems = [
    { key: 'profile', label: '当前账号', icon: <UserOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      clearSellerSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-sm">
        <div className="h-16 flex items-center justify-center border-b">
          <Text className="text-xl font-bold text-primary-600">SteelLink</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none h-[calc(100vh-64px)]"
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm h-16">
          <Text className="text-lg font-medium">卖家后台</Text>
          <Space size="middle">
            <a href="/">
              <Button icon={<HomeOutlined />}>买家首页</Button>
            </a>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text>{user?.phone || '卖家账号'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg min-h-[calc(100vh-112px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
