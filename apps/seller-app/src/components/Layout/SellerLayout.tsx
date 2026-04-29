import { useEffect, useState } from 'react'
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSellerSession, getSellerUser, isIdentityVerified, hasEnterprise, hasEnterprisePending, isSellerReady, sellerAuthService, updateSellerUser } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Text } = Typography
const buyerHomeHref = import.meta.env.DEV ? 'http://localhost:5173/' : '/'

export default function SellerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(getSellerUser())

  useEffect(() => {
    let ignore = false
    sellerAuthService.me()
      .then((res) => {
        if (!ignore && res.code === 0 && res.data) {
          updateSellerUser(res.data)
          setUser(res.data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(getSellerUser())
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const identityOk = isIdentityVerified(user)
  const enterpriseOk = hasEnterprise(user)
  const enterprisePending = hasEnterprisePending(user)
  const ready = isSellerReady(user)

  const menuItems = (() => {
    const items: Array<{ key: string; icon: React.ReactNode; label: string }> = []

    if (!identityOk) {
      items.push({ key: '/identity', icon: <SafetyCertificateOutlined />, label: '实名认证' })
      items.push({ key: '/enterprise', icon: <TeamOutlined />, label: '企业入驻' })
      return items
    }

    if (!enterpriseOk) {
      items.push({ key: '/identity', icon: <SafetyCertificateOutlined />, label: '实名认证' })
      items.push({ key: '/enterprise', icon: <TeamOutlined />, label: enterprisePending ? '企业审核中' : '企业入驻' })
      return items
    }

    items.push({ key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' })
    items.push({ key: '/products', icon: <ShopOutlined />, label: '商品管理' })
    items.push({ key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' })
    items.push({ key: '/fulfillment', icon: <TruckOutlined />, label: '履约核销' })
    items.push({ key: '/enterprise', icon: <TeamOutlined />, label: '企业信息' })
    items.push({ key: '/settings', icon: <SettingOutlined />, label: '店铺设置' })
    return items
  })()

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

  const defaultPath = ready ? '/dashboard' : '/identity'

  if (location.pathname === '/') {
    navigate(defaultPath, { replace: true })
  }

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-sm">
        <div className="h-16 flex items-center justify-center border-b">
          <Text className="text-xl font-bold text-primary-600">SteelLink</Text>
        </div>
        {!ready && (
          <div className="px-4 py-3 mx-3 mt-3 bg-orange-50 rounded-lg border border-orange-100">
            <Text className="text-xs text-orange-600 block">
              {!identityOk ? '请先完成实名认证' : enterprisePending ? '企业审核中，审核通过后即可使用全部功能' : '请完成企业入驻'}
            </Text>
          </div>
        )}
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
            <a href={buyerHomeHref}>
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
