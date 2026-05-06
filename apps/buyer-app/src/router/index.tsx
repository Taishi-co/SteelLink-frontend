import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomeLayout from '@/components/Layout/HomeLayout'
import MainLayout from '@/components/Layout/MainLayout'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import RequireAuth from '@/components/RequireAuth'

const HomePage = lazy(() => import('@/pages/Home'))
const MallPage = lazy(() => import('@/pages/Mall'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'))
const CartPage = lazy(() => import('@/pages/Cart'))
const FavoritesPage = lazy(() => import('@/pages/Favorites'))
const LoginPage = lazy(() => import('@/pages/Login'))
const CheckoutPage = lazy(() => import('@/pages/Checkout'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetail'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const MatchingPage = lazy(() => import('@/pages/Matching'))
const AiProcurementPage = lazy(() => import('@/pages/AiProcurement'))
const AboutPage = lazy(() => import('@/pages/About'))
const IdentityPage = lazy(() => import('@/pages/Identity'))
const EnterprisePage = lazy(() => import('@/pages/Enterprise'))
const EnterpriseIntroPage = lazy(() => import('@/pages/EnterpriseIntro'))
const ProcurementPage = lazy(() => import('@/pages/Procurement'))
const BiddingPage = lazy(() => import('@/pages/Bidding'))
const BiddingModulePage = lazy(() => import('@/pages/BiddingModule'))
const ProcurementDetailPage = lazy(() => import('@/pages/ProcurementDetail'))
const PersonalWorkspacePage = lazy(() => import('@/pages/PersonalWorkspace'))
const DashboardMarket = lazy(() => import('@/pages/Dashboard/Market'))
const DashboardFinance = lazy(() => import('@/pages/Dashboard/Finance'))
const DashboardLogistics = lazy(() => import('@/pages/Dashboard/Logistics'))
const ServiceWorkspacePage = lazy(() => import('@/pages/ServiceWorkspace'))
const ServiceOverviewPage = lazy(() => import('@/pages/ServiceWorkspace').then((module) => ({ default: module.ServiceOverview })))
const WarehouseMallPage = lazy(() => import('@/pages/ServiceMall/Warehouse'))
const LogisticsMallPage = lazy(() => import('@/pages/ServiceMall/Logistics'))
const WarehouseManagePage = lazy(() => import('@/pages/ServiceManage/Warehouse'))
const LogisticsManagePage = lazy(() => import('@/pages/ServiceManage/Logistics'))

const SupplyPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">供求信息</h1>
      <p className="text-gray-500">功能开发中，敬请期待...</p>
    </div>
  </div>
)

function RouteFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-gray-500">
      页面加载中...
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<HomeLayout />}>
          <Route index element={<HomePage />} />
          <Route path="mall" element={<MallPage />} />
          <Route path="warehouses" element={<WarehouseMallPage />} />
          <Route path="logistics-services" element={<LogisticsMallPage />} />
          <Route path="matching" element={<MatchingPage />} />
          <Route path="ai-procurement" element={<AiProcurementPage />} />
          <Route path="ai-procurement/:step" element={<AiProcurementPage />} />
          <Route path="bidding" element={<BiddingPage />} />
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
          <Route index element={<PersonalWorkspacePage />} />
          <Route path="market" element={<DashboardMarket />} />
          <Route path="bidding" element={<BiddingModulePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="identity" element={<IdentityPage />} />
          <Route path="enterprise" element={<EnterprisePage />} />
          <Route path="finance" element={<DashboardFinance />} />
          <Route path="logistics" element={<DashboardLogistics />} />
          <Route path="services" element={<ServiceOverviewPage />} />
          <Route path="services/:service" element={<ServiceWorkspacePage />} />
          <Route path="warehouse-resources" element={<WarehouseManagePage />} />
          <Route path="logistics-resources" element={<LogisticsManagePage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
