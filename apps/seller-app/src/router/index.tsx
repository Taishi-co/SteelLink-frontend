import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import SellerLayout from '@/components/Layout/SellerLayout'
import DashboardPage from '@/pages/Dashboard'
import EnterprisePage from '@/pages/Enterprise'
import IdentityPage from '@/pages/Identity'
import LoginPage from '@/pages/Login'
import OrdersPage from '@/pages/Orders'
import ProductsPage from '@/pages/Products'
import SettingsPage from '@/pages/Settings'
import FulfillmentPage from '@/pages/Fulfillment'
import { getSellerToken, getSellerUser, isIdentityVerified, hasEnterprise } from '@/services/auth'

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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SellerLayout />}>
          <Route index element={<Navigate to="/identity" replace />} />
          <Route path="identity" element={<IdentityPage />} />
          <Route path="enterprise" element={<EnterprisePage />} />
          <Route element={<RequireIdentity />}>
            <Route element={<RequireEnterprise />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="fulfillment" element={<FulfillmentPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
