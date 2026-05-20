import { useEffect, useState } from 'react'
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  BankOutlined,
  DashboardOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  RiseOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSellerSession, getSellerUser, isIdentityVerified, hasEnterprise, hasEnterprisePending, isSellerReady, sellerAuthService, sellerHasService, updateSellerUser } from '@/services/auth'

const { Content, Header, Sider } = Layout
const { Text } = Typography
export default function SellerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(getSellerUser())
  const buyerBaseURL = import.meta.env.DEV ? 'http://localhost:5173' : ''

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
    if (sellerHasService('sales')) {
      items.push({ key: '/products', icon: <ShopOutlined />, label: '商品管理' })
      items.push({ key: '/bidding', icon: <RiseOutlined />, label: '参与竞价' })
    }
    if (sellerHasService('warehouse')) {
      items.push({ key: '/warehouses', icon: <BankOutlined />, label: '仓库管理' })
    }
    items.push({ key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' })
    items.push({ key: '/notifications', icon: <MailOutlined />, label: '站内信' })
    if (sellerHasService('sales')) {
      items.push({ key: '/fulfillment', icon: <TruckOutlined />, label: '履约核销' })
      items.push({ key: '/finance', icon: <BankOutlined />, label: '资金服务' })
    }
    items.push({ key: '/enterprise', icon: <TeamOutlined />, label: '企业信息' })
    if (sellerHasService('sales')) {
      items.push({ key: '/settings', icon: <SettingOutlined />, label: '店铺设置' })
    }
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
    <Layout className="seller-shell min-w-0">
      <Sider width={220} className="seller-sider shrink-0">
        <div className="flex h-[78px] items-center border-b border-[#eadcc7] px-5">
          <Space>
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#214332] font-black text-[#f3c17c]">R</span>
            <span>
              <Text className="block text-[15px] font-black text-[#17221b]">锐联卖家</Text>
              <Text className="text-[10px] font-bold tracking-[0.14em] text-[#a4662c]">RecoLink</Text>
            </span>
          </Space>
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
          className="seller-menu h-[calc(100vh-78px)] border-none !bg-transparent px-2 pt-3 [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-10 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!leading-10"
        />
      </Sider>
      <Layout className="min-w-0">
        <Header className="flex h-16 items-center justify-between border-b border-[#eadcc7] bg-[#fffdf8]/90 px-6 shadow-[0_10px_30px_rgba(64,44,25,.06)] backdrop-blur-xl">
          <div>
            <Text className="block text-base font-black text-[#17221b]">卖家后台</Text>
            <Text className="text-xs text-[#7a847a]">商品、竞价、订单、履约与店铺设置</Text>
          </div>
          <Space size="middle">
            <a href={`${buyerBaseURL}/dashboard`}>
              <Button icon={<HomeOutlined />} className="rounded-full border-[#d0b991] bg-white">买家首页</Button>
            </a>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space className="cursor-pointer rounded-full border border-[#dfd0ba] bg-white/70 px-3 py-2 shadow-sm">
                <Avatar icon={<UserOutlined />} className="bg-[#c47b34]" />
                <Text className="font-semibold text-[#17221b]">{user?.phone || '卖家账号'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="seller-content m-7 min-h-[calc(100vh-120px)] min-w-0 overflow-x-hidden p-7">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
