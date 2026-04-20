import api from './api'
import type { ApiResponse, PaginatedResponse, Product } from '@/types'

export const productService = {
  getProducts: (params?: { category?: string; keyword?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params }),

  getProduct: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  getCategories: () =>
    api.get<ApiResponse<{ id: number; name: string }[]>>('/categories'),
}
