import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/Layout/MainLayout'
import HomePage from '@/pages/Home'
import ProductsPage from '@/pages/Products'
import ProductDetailPage from '@/pages/ProductDetail'
import CartPage from '@/pages/Cart'
import LoginPage from '@/pages/Login'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}
