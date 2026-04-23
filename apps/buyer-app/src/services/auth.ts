import api from './api'
import type { User } from '@/types'

interface BuyerProfile {
  id: number
  user_no: string
  platform_id: string
  personal_code: string
  enterprise_code: string
  role: string
  phone: string
  qq: string
  email: string
  status: number
  created_at: string
  updated_at: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: BuyerProfile
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface BuyerLoginPayload {
  account: string
  password: string
}

export interface BuyerRegisterPayload {
  phone: string
  password: string
  email?: string
}

const TOKEN_KEY = 'token'
const USER_KEY = 'buyer_user'
let memoryToken: string | null = null
let memoryUser: User | null = null

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function getCookie(name: string) {
  const prefix = `${name}=`
  const match = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))

  if (!match) {
    return null
  }

  return decodeURIComponent(match.slice(prefix.length))
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

function setStorageItem(key: string, value: string) {
  localStorage.setItem(key, value)
  sessionStorage.setItem(key, value)
}

function removeStorageItem(key: string) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

export const buyerAuthService = {
  login: (payload: BuyerLoginPayload) =>
    api.post<any, ApiResponse<LoginResponse>>('/auth/login', payload),
  register: (payload: BuyerRegisterPayload) =>
    api.post<any, ApiResponse<LoginResponse>>('/auth/register', payload),
}

export function normalizeBuyerUser(profile: BuyerProfile): User {
  return {
    id: profile.id,
    username: profile.phone || profile.email || profile.user_no,
    mobile: profile.phone,
    companyName: profile.enterprise_code || '个人用户',
    role: 'buyer',
  }
}

export function saveBuyerSession(token: string, profile: BuyerProfile) {
  memoryToken = token
  memoryUser = normalizeBuyerUser(profile)
  setStorageItem(TOKEN_KEY, token)
  setStorageItem(USER_KEY, JSON.stringify(memoryUser))
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(memoryUser))
}

export function getBuyerUser(): User | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || getCookie(USER_KEY)
  if (!raw) {
    return memoryUser
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    return memoryUser
  }
}

export function getBuyerToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY) || memoryToken
}

export function clearBuyerSession() {
  memoryToken = null
  memoryUser = null
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
}
