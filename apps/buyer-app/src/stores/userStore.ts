import { create } from 'zustand'
import type { User } from '@/types'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  login: (user, token) => set({ user, token, isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
