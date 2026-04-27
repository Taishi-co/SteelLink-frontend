import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import SellerLayout from '@/components/Layout/SellerLayout'
import DashboardPage from '@/pages/Dashboard'
import EnterprisePage from '@/pages/Enterprise'
import IdentityPage from '@/pages/Identity'
import LoginPage from '@/pages/Login'
import OrdersPage from '@/pages/Orders'
import ProductsPage from '@/pages/Products'
import SettingsPage from '@/pages/Settings'
import { getSellerToken } from '@/services/auth'

function ProtectedRoute() {
  if (!getSellerToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SellerLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="identity" element={<IdentityPage />} />
          <Route path="enterprise" element={<EnterprisePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
