import api from './api'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ProductCategory {
  id: number
  parent_id: number
  name: string
  display_name: string
  code: string
  icon: string
  image_url: string
  sort: number
  status: number
}

export interface ProductGrade {
  id: number
  category_id: number
  name: string
  display_name: string
  code: string
  aliases: string[]
  standard: string
  sort: number
  status: number
}

export interface ProductSteelMill {
  id: number
  name: string
  display_name: string
  code: string
  aliases: string[]
  letter: string
  logo_url: string
  sort: number
  status: number
}

export const fallbackProductCategories: ProductCategory[] = [
  '热轧板卷',
  '冷轧板卷',
  '中厚板',
  '型材',
  '管材',
  '建材',
].map((name, index) => ({
  id: index + 1,
  parent_id: 0,
  name,
  display_name: name,
  code: name,
  icon: '',
  image_url: '',
  sort: index,
  status: 1,
}))

export const categoryService = {
  list: () => api.get<unknown, ApiResponse<ProductCategory[]>>('/product-categories'),
  listGrades: (params?: { category_id?: number; category?: string }) =>
    api.get<unknown, ApiResponse<ProductGrade[]>>('/product-grades', { params }),
  listSteelMills: () =>
    api.get<unknown, ApiResponse<ProductSteelMill[]>>('/product-steel-mills'),
}
