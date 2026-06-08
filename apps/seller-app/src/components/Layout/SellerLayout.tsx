import { useEffect, useState } from 'react'
import { Avatar, Layout, Menu, Tooltip, Typography } from 'antd'
import {
  ArrowRightOutlined,
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
import { clearSellerSession, getSellerUser, isIdentityVerified, hasEnterprise, hasEnterprisePending, isSellerReady, openBuyerCenter, sellerAuthService, sellerHasService, updateSellerUser } from '@/services/auth'

const { Content, Sider } = Layout
const { Text } = Typography
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
    if (sellerHasService('sales')) {
      items.push({ key: '/products', icon: <ShopOutlined />, label: '商品管理' })
      items.push({ key: '/bidding', icon: <RiseOutlined />, label: '参与竞价' })
      items.push({ key: '/group-procurement', icon: <TeamOutlined />, label: '集采竞价' })
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

  const handleLogout = () => {
    clearSellerSession()
    navigate('/login', { replace: true })
  }

  const defaultPath = ready ? '/dashboard' : '/identity'

  if (location.pathname === '/') {
    navigate(defaultPath, { replace: true })
  }

  return (
    <Layout className="dashboard-shell seller-shell min-w-0">
      <Sider
        width={220}
        className="dashboard-sider fixed bottom-0 left-0 top-0 z-50 overflow-auto"
        trigger={null}
      >
        <div className="h-full flex flex-col">
          <div className="dashboard-brand px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="dashboard-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-black">
                R
              </div>
              <div>
                <div className="text-[15px] font-black tracking-[-0.02em] text-[#17221b]">锐联产业协同平台</div>
                <div className="text-[10px] font-bold tracking-[0.16em] text-[#a4662c]">RecoLink Workbench</div>
              </div>
            </div>
          </div>
          <div className="dashboard-account-card mx-3 mb-1 mt-3 rounded-2xl px-3 py-3">
            <div className="mb-1 text-[10px] font-bold tracking-[0.14em] text-[#a4662c]">当前工作台</div>
            <div className="truncate text-xs font-semibold text-[#17221b]">卖家中心</div>
            <div className="mt-1.5 text-[9px] text-[#7a847a]">
              商品、竞价、订单、履约与资金服务
            </div>
          </div>
          {!ready && (
            <div className="mx-3 mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-3">
              <Text className="block text-xs text-orange-600">
                {!identityOk ? '请先完成实名认证' : enterprisePending ? '企业审核中，审核通过后即可使用全部功能' : '请完成企业入驻'}
              </Text>
            </div>
          )}
          <nav className="flex-1 overflow-y-auto px-2.5 pt-2">
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-[#a4662c]">
              业务
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              className="dashboard-menu !border-none !bg-transparent [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-10 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!leading-10"
            />
          </nav>
          <div className="mb-2 px-2.5">
            <div
              className="dashboard-quick-link flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2"
              onClick={() => void openBuyerCenter('/dashboard')}
            >
              <HomeOutlined className="text-sm text-[#2f6b49]" />
              <span className="flex-1 text-xs font-semibold">返回买家工作台</span>
              <ArrowRightOutlined className="text-[10px] text-[#a4662c]" />
            </div>
          </div>
          <div className="border-t border-[#eadcc7] px-4 py-3">
            <div className="flex items-center gap-2">
              <Avatar size={28} icon={<UserOutlined />} className="shrink-0 bg-[#c47b34]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-[#17221b]">
                  {user?.phone || '卖家账号'}
                </div>
                <div className="truncate text-[10px] text-[#7a847a]">卖家后台</div>
              </div>
              <Tooltip title="退出登录">
                <LogoutOutlined
                  className="cursor-pointer text-xs text-[#7a847a] transition-colors hover:text-[#b45324]"
                  onClick={handleLogout}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </Sider>
      <Layout className="min-w-0 transition-all duration-200" style={{ marginLeft: 220 }}>
        <Content className="dashboard-content min-w-0 overflow-x-hidden">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
