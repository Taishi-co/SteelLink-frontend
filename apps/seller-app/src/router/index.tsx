import { Routes, Route, Navigate } from 'react-router-dom'
import SellerLayout from '@/components/Layout/SellerLayout'
import DashboardPage from '@/pages/Dashboard'
import ProductsPage from '@/pages/Products'
import OrdersPage from '@/pages/Orders'
import SettingsPage from '@/pages/Settings'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SellerLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
