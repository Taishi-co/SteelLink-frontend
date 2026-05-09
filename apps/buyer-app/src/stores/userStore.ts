import { create } from 'zustand'
import type { User } from '@/types'
import { BUYER_TOKEN_REFRESH_EVENT, clearBuyerSession, getBuyerToken, getBuyerUser } from '@/services/auth'

const initialUser = getBuyerUser()
const initialToken = getBuyerToken()

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: initialUser,
  token: initialToken,
  isLoggedIn: Boolean(initialUser && initialToken),
  login: (user, token) => {
    set({ user, token, isLoggedIn: true })
  },
  logout: () => {
    clearBuyerSession()
    set({ user: null, token: null, isLoggedIn: false })
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener(BUYER_TOKEN_REFRESH_EVENT, () => {
    const user = getBuyerUser()
    const token = getBuyerToken()
    useUserStore.setState({ user, token, isLoggedIn: Boolean(user && token) })
  })
}
