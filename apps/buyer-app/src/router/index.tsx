import { Routes, Route } from 'react-router-dom'
import HomeLayout from '@/components/Layout/HomeLayout'
import MainLayout from '@/components/Layout/MainLayout'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import RequireAuth from '@/components/RequireAuth'
import HomePage from '@/pages/Home'
import MallPage from '@/pages/Mall'
import ProductsPage from '@/pages/Products'
import ProductDetailPage from '@/pages/ProductDetail'
import CartPage from '@/pages/Cart'
import FavoritesPage from '@/pages/Favorites'
import LoginPage from '@/pages/Login'
import CheckoutPage from '@/pages/Checkout'
import OrderDetailPage from '@/pages/OrderDetail'
import OrdersPage from '@/pages/Orders'
import MatchingPage from '@/pages/Matching'
import AiProcurementPage from '@/pages/AiProcurement'
import AboutPage from '@/pages/About'
import IdentityPage from '@/pages/Identity'
import EnterprisePage from '@/pages/Enterprise'
import EnterpriseIntroPage from '@/pages/EnterpriseIntro'
import ProcurementPage from '@/pages/Procurement'
import BiddingPage from '@/pages/Bidding'
import BiddingModulePage from '@/pages/BiddingModule'
import ProcurementDetailPage from '@/pages/ProcurementDetail'
import DashboardOverview from '@/pages/Dashboard/Overview'
import DashboardMarket from '@/pages/Dashboard/Market'
import DashboardFinance from '@/pages/Dashboard/Finance'
import DashboardLogistics from '@/pages/Dashboard/Logistics'

const SupplyPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">供求信息</h1>
      <p className="text-gray-500">功能开发中，敬请期待...</p>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<HomeLayout />}>
        <Route index element={<HomePage />} />
        <Route path="mall" element={<MallPage />} />
        <Route path="matching" element={<MatchingPage />} />
        <Route path="ai-procurement" element={<AiProcurementPage />} />
        <Route path="bidding" element={<BiddingPage />} />
        <Route path="bidding/:module" element={<BiddingModulePage />} />
        <Route path="procurement" element={<ProcurementPage />} />
        <Route path="procurement/:id" element={<ProcurementDetailPage />} />
        <Route path="supply" element={<SupplyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="enterprise" element={<EnterpriseIntroPage />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
      </Route>

      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<DashboardOverview />} />
        <Route path="market" element={<DashboardMarket />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="identity" element={<IdentityPage />} />
        <Route path="enterprise" element={<EnterprisePage />} />
        <Route path="finance" element={<DashboardFinance />} />
        <Route path="logistics" element={<DashboardLogistics />} />
      </Route>
    </Routes>
  )
}
