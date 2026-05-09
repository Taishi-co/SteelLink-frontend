import api from './api'
import type { ApiResponse, CartItemDTO, AddCartRequest, UpdateCartRequest } from '@/types'

interface CartListResponse {
  list: CartItemDTO[]
  total: number
}

interface CartCountResponse {
  count: number
}

function mapCartItem(item: CartItemDTO) {
  return {
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    imageUrl: item.image_url,
    specs: item.spec,
    price: item.price,
    quantity: item.quantity,
    seller: item.seller_name,
    warehouseInfo: item.warehouse_info,
    unit: item.unit,
    subTotal: item.sub_total,
  }
}

export const cartService = {
  addItem: async (data: AddCartRequest) => {
    const response = await api.post<ApiResponse<CartItemDTO>, ApiResponse<CartItemDTO>>('/cart/items', data)
    return {
      ...response,
      data: mapCartItem(response.data),
    }
  },

  getItems: async () => {
    const response = await api.get<ApiResponse<CartListResponse>, ApiResponse<CartListResponse>>('/cart/items')
    return {
      ...response,
      data: {
        ...response.data,
        list: response.data.list.map(mapCartItem),
      },
    }
  },

  updateItem: async (id: number, data: UpdateCartRequest) => {
    const response = await api.put<ApiResponse<CartItemDTO>, ApiResponse<CartItemDTO>>(`/cart/items/${id}`, data)
    return {
      ...response,
      data: mapCartItem(response.data),
    }
  },

  removeItem: async (id: number) => {
    return api.delete<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>(`/cart/items/${id}`)
  },

  clearCart: async () => {
    return api.delete<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>('/cart')
  },

  getCount: async () => {
    const response = await api.get<ApiResponse<CartCountResponse>, ApiResponse<CartCountResponse>>('/cart/count')
    return response.data.count
  },
}
