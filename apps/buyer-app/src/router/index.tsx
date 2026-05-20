import { lazy, Suspense, type ReactNode } from 'react'
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
const ServiceMarketPage = lazy(() => import('@/pages/ServiceMarket'))
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
const NotificationsPage = lazy(() => import('@/pages/Notifications'))
const DashboardMarket = lazy(() => import('@/pages/Dashboard/Market'))
const DashboardServices = lazy(() => import('@/pages/Dashboard/Services'))
const DashboardFinance = lazy(() => import('@/pages/Dashboard/Finance'))
const DashboardLogistics = lazy(() => import('@/pages/Dashboard/Logistics'))
const DashboardWarehouse = lazy(() => import('@/pages/Dashboard/Warehouse'))
const ServiceWorkspacePage = lazy(() => import('@/pages/ServiceWorkspace'))
const WarehouseMallPage = lazy(() => import('@/pages/ServiceMall/Warehouse'))
const LogisticsMallPage = lazy(() => import('@/pages/ServiceMall/Logistics'))
const WarehouseDetailPage = lazy(() => import('@/pages/ServiceMall/WarehouseDetail'))
const LogisticsDetailPage = lazy(() => import('@/pages/ServiceMall/LogisticsDetail'))
const WarehouseManagePage = lazy(() => import('@/pages/ServiceManage/Warehouse'))
const LogisticsManagePage = lazy(() => import('@/pages/ServiceManage/Logistics'))
const FinanceManagePage = lazy(() => import('@/pages/ServiceManage/Finance'))

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

function lazyPage(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={lazyPage(<LoginPage />)} />

      <Route path="/" element={<HomeLayout />}>
        <Route index element={lazyPage(<HomePage />)} />
        <Route path="mall" element={lazyPage(<MallPage />)} />
        <Route path="warehouses" element={lazyPage(<WarehouseMallPage />)} />
        <Route path="warehouses/:id" element={lazyPage(<WarehouseDetailPage />)} />
        <Route path="logistics-services" element={lazyPage(<LogisticsMallPage />)} />
        <Route path="logistics-services/:id" element={lazyPage(<LogisticsDetailPage />)} />
        <Route path="matching" element={lazyPage(<MatchingPage />)} />
        <Route path="service-market" element={lazyPage(<ServiceMarketPage />)} />
        <Route path="ai-procurement" element={lazyPage(<AiProcurementPage />)} />
        <Route path="ai-procurement/:step" element={lazyPage(<AiProcurementPage />)} />
        <Route path="bidding" element={lazyPage(<BiddingPage />)} />
        <Route path="procurement" element={lazyPage(<ProcurementPage />)} />
        <Route path="procurement/:id" element={lazyPage(<ProcurementDetailPage />)} />
        <Route path="supply" element={<SupplyPage />} />
        <Route path="about" element={lazyPage(<AboutPage />)} />
        <Route path="enterprise" element={lazyPage(<EnterpriseIntroPage />)} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route path="products" element={lazyPage(<ProductsPage />)} />
        <Route path="products/:id" element={lazyPage(<ProductDetailPage />)} />
        <Route path="cart" element={lazyPage(<CartPage />)} />
        <Route path="favorites" element={lazyPage(<FavoritesPage />)} />
        <Route path="checkout" element={lazyPage(<CheckoutPage />)} />
        <Route path="orders" element={lazyPage(<OrdersPage />)} />
        <Route path="orders/:id" element={lazyPage(<OrderDetailPage />)} />
      </Route>

      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={lazyPage(<PersonalWorkspacePage />)} />
        <Route path="market" element={lazyPage(<DashboardMarket />)} />
        <Route path="services" element={lazyPage(<DashboardServices />)} />
        <Route path="bidding" element={lazyPage(<BiddingModulePage />)} />
        <Route path="orders" element={lazyPage(<OrdersPage />)} />
        <Route path="orders/:id" element={lazyPage(<OrderDetailPage />)} />
        <Route path="notifications" element={lazyPage(<NotificationsPage />)} />
        <Route path="identity" element={lazyPage(<IdentityPage />)} />
        <Route path="enterprise" element={lazyPage(<EnterprisePage />)} />
        <Route path="finance" element={lazyPage(<DashboardFinance />)} />
        <Route path="logistics" element={lazyPage(<DashboardLogistics />)} />
        <Route path="warehouse" element={lazyPage(<DashboardWarehouse />)} />
        <Route path="services/:service" element={lazyPage(<ServiceWorkspacePage />)} />
        <Route path="warehouse-resources" element={lazyPage(<WarehouseManagePage />)} />
        <Route path="logistics-resources" element={lazyPage(<LogisticsManagePage />)} />
        <Route path="finance-products" element={lazyPage(<FinanceManagePage />)} />
      </Route>
    </Routes>
  )
}
