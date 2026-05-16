import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Space, Badge, Input, Button, Dropdown, Avatar } from 'antd'
import { ShoppingCartOutlined, UserOutlined, SearchOutlined, HomeOutlined, LogoutOutlined, HeartOutlined, ShoppingOutlined } from '@ant-design/icons'
import { clearBuyerSession } from '@/services/auth'
import { useUserStore } from '@/stores'
import { useCartStore } from '@/stores/cartStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useEffect } from 'react'

const { Header: AntHeader } = Layout

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()
  const { totalItems, fetchCart } = useCartStore()
  const { totalCount, fetchFavorites } = useFavoriteStore()

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
      fetchFavorites()
    }
  }, [isLoggedIn, fetchCart, fetchFavorites])

  const menuItems = [
    { key: '/products', label: <Link to="/products">商品列表</Link> },
  ]

  const handleLogout = () => {
    clearBuyerSession()
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'orders', label: '我的订单', icon: <ShoppingOutlined />, onClick: () => navigate('/orders') },
    { key: 'cart', label: '我的购物车', icon: <ShoppingCartOutlined />, onClick: () => navigate('/cart') },
    { key: 'favorites', label: '我的收藏', icon: <HeartOutlined />, onClick: () => navigate('/favorites') },
    { key: 'divider', type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
  ]

  return (
    <AntHeader className="flex h-20 items-center border-b border-[#eadcc7] bg-[#fffdf8]/95 px-6 shadow-[0_10px_30px_rgba(64,44,25,.06)] backdrop-blur-xl">
      <div className="flex items-center gap-8 flex-1">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#214332] text-lg font-black text-[#f3c17c]">
            R
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-black tracking-[-0.02em] text-[#17221b]">锐联产业协同平台</span>
            <span className="block text-xs font-bold tracking-[0.08em] text-[#a4662c]">RecoLink</span>
          </span>
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

          <Link to="/favorites">
            <Badge count={totalCount} size="small">
              <Button type="text" icon={<HeartOutlined className="text-lg" />} />
            </Badge>
          </Link>

          <Link to="/cart">
            <Badge count={totalItems} size="small">
              <Button type="text" icon={<ShoppingCartOutlined className="text-lg" />} />
            </Badge>
          </Link>

          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex cursor-pointer items-center gap-2 rounded-full border border-[#dfd0ba] bg-white/70 px-3 py-2 shadow-sm hover:bg-white">
                <Avatar size="small" icon={<UserOutlined />} className="bg-[#c47b34]" />
                <span className="text-sm font-semibold text-[#17221b]">{user?.username || user?.mobile || '用户'}</span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="default" icon={<UserOutlined />}>登录</Button>
              </Link>
              <Link to="/login">
                <Button type="primary" className="reco-primary-button rounded-full">注册</Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  )
}
