import api from './api'
import type { User } from '@/types'

interface BuyerProfile {
  id: number
  user_no: string
  platform_id: string
  personal_code: string
  enterprise_code: string
  role: string
  enterprise_role: string
  phone: string
  qq: string
  email: string
  real_name: string
  id_card: string
  identity_status: number
  identity_reject: string
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
const SELLER_USER_KEY = 'seller_user'
const SELLER_ENTERPRISE_ROLE_KEY = 'seller_enterprise_role'
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
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  register: (payload: BuyerRegisterPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/register', payload),
  me: () => api.get<unknown, ApiResponse<BuyerProfile>>('/users/me'),
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function normalizeBuyerUser(profile: BuyerProfile): User {
  return {
    id: profile.id,
    username: profile.phone || profile.email || profile.user_no,
    mobile: profile.phone,
    companyName: profile.enterprise_code || '个人用户',
    role: (profile.role as User['role']) || 'personal',
    realName: profile.real_name || '',
    identityStatus: profile.identity_status || 0,
    identityReject: profile.identity_reject || '',
    enterpriseCode: profile.enterprise_code || '',
    enterpriseRole: profile.enterprise_role || '',
  }
}

export function saveBuyerSession(token: string, profile: BuyerProfile) {
  memoryToken = token
  memoryUser = normalizeBuyerUser(profile)
  setStorageItem(TOKEN_KEY, token)
  setStorageItem(USER_KEY, JSON.stringify(memoryUser))
  setStorageItem(SELLER_USER_KEY, JSON.stringify(profile))
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(memoryUser))
  setCookie(SELLER_USER_KEY, JSON.stringify(profile))

  const payload = parseJwtPayload(token)
  if (payload?.enterprise_role) {
    setStorageItem(SELLER_ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    setCookie(SELLER_ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
  } else {
    removeStorageItem(SELLER_ENTERPRISE_ROLE_KEY)
    removeCookie(SELLER_ENTERPRISE_ROLE_KEY)
  }
}

export function updateBuyerSessionUser(profile: BuyerProfile) {
  memoryUser = normalizeBuyerUser(profile)
  setStorageItem(USER_KEY, JSON.stringify(memoryUser))
  setStorageItem(SELLER_USER_KEY, JSON.stringify(profile))
  setCookie(USER_KEY, JSON.stringify(memoryUser))
  setCookie(SELLER_USER_KEY, JSON.stringify(profile))
}

export function getBuyerUser(): User | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || getCookie(USER_KEY)
  if (!raw) {
    return memoryUser
  }

  try {
    const user = JSON.parse(raw) as User
    setCookie(USER_KEY, JSON.stringify(user))
    return user
  } catch {
    return memoryUser
  }
}

export function getBuyerToken() {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY) || memoryToken
  if (token) {
    setCookie(TOKEN_KEY, token)
  }
  return token
}

export function clearBuyerSession() {
  memoryToken = null
  memoryUser = null
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeStorageItem(SELLER_USER_KEY)
  removeStorageItem(SELLER_ENTERPRISE_ROLE_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
  removeCookie(SELLER_USER_KEY)
  removeCookie(SELLER_ENTERPRISE_ROLE_KEY)
}

export function isEnterpriseToken() {
  const payload = parseJwtPayload(getBuyerToken() || '')
  return payload?.user_type === 'enterprise'
}

export function hasEnterpriseAccess(user: User | null) {
  return !!user?.enterpriseCode && user.role === 'enterprise' && isEnterpriseToken()
}
