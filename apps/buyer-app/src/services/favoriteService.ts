import api from './api'
import type { ApiResponse, FavoriteDTO, AddFavoriteRequest } from '@/types'

interface FavoriteListResponse {
  list: FavoriteDTO[]
  total: number
}

interface FavoriteCountResponse {
  count: number
}

interface IsFavoriteResponse {
  is_favorite: boolean
}

function mapFavorite(item: FavoriteDTO) {
  return {
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    category: item.category,
    spec: item.spec,
    price: item.price,
    image: item.image,
    sellerId: item.seller_id,
    sellerName: item.seller_name,
    createdAt: item.created_at,
  }
}

export const favoriteService = {
  add: async (data: AddFavoriteRequest) => {
    const response = await api.post<ApiResponse<FavoriteDTO>, ApiResponse<FavoriteDTO>>('/favorites', data)
    return {
      ...response,
      data: mapFavorite(response.data),
    }
  },

  getList: async () => {
    const response = await api.get<ApiResponse<FavoriteListResponse>, ApiResponse<FavoriteListResponse>>('/favorites')
    return {
      ...response,
      data: {
        ...response.data,
        list: response.data.list.map(mapFavorite),
      },
    }
  },

  remove: async (id: number) => {
    return api.delete<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>(`/favorites/${id}`)
  },

  removeByProduct: async (productId: number) => {
    return api.delete<ApiResponse<{ message: string }>, ApiResponse<{ message: string }>>(`/favorites/product/${productId}`)
  },

  check: async (productId: number) => {
    const response = await api.get<ApiResponse<IsFavoriteResponse>, ApiResponse<IsFavoriteResponse>>(`/favorites/check/${productId}`)
    return response.data.is_favorite
  },

  getCount: async () => {
    const response = await api.get<ApiResponse<FavoriteCountResponse>, ApiResponse<FavoriteCountResponse>>('/favorites/count')
    return response.data.count
  },
}
