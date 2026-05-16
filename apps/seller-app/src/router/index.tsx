import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import SellerLayout from '@/components/Layout/SellerLayout'
import { getSellerToken, getSellerUser, isIdentityVerified, hasEnterprise } from '@/services/auth'

const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const EnterprisePage = lazy(() => import('@/pages/Enterprise'))
const IdentityPage = lazy(() => import('@/pages/Identity'))
const LoginPage = lazy(() => import('@/pages/Login'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const WarehousesPage = lazy(() => import('@/pages/Warehouses'))
const BiddingPage = lazy(() => import('@/pages/Bidding'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const FulfillmentPage = lazy(() => import('@/pages/Fulfillment'))
const NotificationsPage = lazy(() => import('@/pages/Notifications'))
const FinancePage = lazy(() => import('@/pages/Finance'))

function ProtectedRoute() {
  if (!getSellerToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function RequireIdentity() {
  if (!isIdentityVerified(getSellerUser())) {
    return <Navigate to="/identity" replace />
  }
  return <Outlet />
}

function RequireEnterprise() {
  if (!hasEnterprise(getSellerUser())) {
    return <Navigate to="/enterprise" replace />
  }
  return <Outlet />
}

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
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SellerLayout />}>
          <Route index element={<Navigate to="/identity" replace />} />
          <Route path="identity" element={lazyPage(<IdentityPage />)} />
          <Route path="enterprise" element={lazyPage(<EnterprisePage />)} />
          <Route element={<RequireIdentity />}>
            <Route element={<RequireEnterprise />}>
              <Route path="dashboard" element={lazyPage(<DashboardPage />)} />
              <Route path="products" element={lazyPage(<ProductsPage />)} />
              <Route path="warehouses" element={lazyPage(<WarehousesPage />)} />
              <Route path="bidding" element={lazyPage(<BiddingPage />)} />
              <Route path="orders" element={lazyPage(<OrdersPage />)} />
              <Route path="notifications" element={lazyPage(<NotificationsPage />)} />
              <Route path="fulfillment" element={lazyPage(<FulfillmentPage />)} />
              <Route path="finance" element={lazyPage(<FinancePage />)} />
              <Route path="settings" element={lazyPage(<SettingsPage />)} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
