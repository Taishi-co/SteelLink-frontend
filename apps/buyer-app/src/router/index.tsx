import { Routes, Route } from 'react-router-dom'
import HomeLayout from '@/components/Layout/HomeLayout'
import MainLayout from '@/components/Layout/MainLayout'
import HomePage from '@/pages/Home'
import MallPage from '@/pages/Mall'
import ProductsPage from '@/pages/Products'
import ProductDetailPage from '@/pages/ProductDetail'
import CartPage from '@/pages/Cart'
import LoginPage from '@/pages/Login'
import CheckoutPage from '@/pages/Checkout'
import OrderDetailPage from '@/pages/OrderDetail'
import OrdersPage from '@/pages/Orders'
import MatchingPage from '@/pages/Matching'
import AiProcurementPage from '@/pages/AiProcurement'

// Placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">{title}</h1>
      <p className="text-gray-500">功能开发中，敬请期待...</p>
    </div>
  </div>
)

const BiddingPage = () => <PlaceholderPage title="竞价交易" />
const ProcurementPage = () => <PlaceholderPage title="集采大厅" />
const SupplyPage = () => <PlaceholderPage title="供求信息" />
const AboutPage = () => <PlaceholderPage title="平台介绍" />

export function AppRouter() {
  return (
    <Routes>
      {/* Login page - no layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Home page - with HomeLayout */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="mall" element={<MallPage />} />
        <Route path="matching" element={<MatchingPage />} />
        <Route path="ai-procurement" element={<AiProcurementPage />} />
        <Route path="bidding" element={<BiddingPage />} />
        <Route path="procurement" element={<ProcurementPage />} />
        <Route path="supply" element={<SupplyPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      {/* Buyer pages - with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
      </Route>
    </Routes>
  )
}
