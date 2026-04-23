import { create } from 'zustand'
import type { User } from '@/types'
import { clearBuyerSession, getBuyerToken, getBuyerUser } from '@/services/auth'

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
    localStorage.setItem('token', token)
    sessionStorage.setItem('token', token)
    localStorage.setItem('buyer_user', JSON.stringify(user))
    sessionStorage.setItem('buyer_user', JSON.stringify(user))
    set({ user, token, isLoggedIn: true })
  },
  logout: () => {
    clearBuyerSession()
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
