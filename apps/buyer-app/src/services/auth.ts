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

interface SwitchSessionResponse {
  switch_token: string
}

type SwitchTarget = 'seller' | 'logistics' | 'warehouse' | 'finance'

export interface BuyerLoginPayload {
  account: string
  password: string
}

export interface BuyerRegisterPayload {
  phone: string
  password: string
  email?: string
}

const TOKEN_KEY = 'buyer_token'
const USER_KEY = 'buyer_user'
const SELLER_TOKEN_KEY = 'seller_token'
const SHARED_TOKEN_KEYS = [TOKEN_KEY, SELLER_TOKEN_KEY, 'logistics_token', 'warehouse_token', 'finance_token', 'token']
export const BUYER_TOKEN_REFRESH_EVENT = 'buyer-token-refreshed'
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

function getStorageItem(keys: string[]) {
  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key) || getCookie(key)
    if (value) {
      if (isTokenStorageKey(key) && isJwtExpired(value)) {
        removeStorageItem(key)
        removeCookie(key)
        continue
      }
      return value
    }
  }
  return null
}

function removeStorageItem(key: string) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

function isTokenStorageKey(key: string) {
  return key === 'token' || key.endsWith('_token')
}

function isJwtExpired(token: string, skewSeconds = 30) {
  const payload = parseJwtPayload(token)
  const exp = payload?.exp
  const expiresAt = typeof exp === 'number' ? exp : Number(exp || 0)
  return !expiresAt || expiresAt * 1000 <= Date.now() + skewSeconds * 1000
}

export const buyerAuthService = {
  login: (payload: BuyerLoginPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  register: (payload: BuyerRegisterPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/register', payload),
  me: () => api.get<unknown, ApiResponse<BuyerProfile>>('/users/me'),
  createSwitchSession: (target: SwitchTarget = 'seller') =>
    api.post<unknown, ApiResponse<SwitchSessionResponse>>('/auth/switch-session', { target }),
  consumeSwitchSession: (switchToken: string) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/switch-session/consume', { switch_token: switchToken, target: 'buyer' }),
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
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(memoryUser))
}

export function updateBuyerSessionUser(profile: BuyerProfile) {
  memoryUser = normalizeBuyerUser(profile)
  setStorageItem(USER_KEY, JSON.stringify(memoryUser))
  setCookie(USER_KEY, JSON.stringify(memoryUser))
}

export function getBuyerUser(): User | null {
  const raw = getStorageItem([USER_KEY])
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
  const storedToken = getStorageItem(SHARED_TOKEN_KEYS)
  if (storedToken) {
    memoryToken = storedToken
    setStorageItem(TOKEN_KEY, storedToken)
    setCookie(TOKEN_KEY, storedToken)
    return storedToken
  }
  if (memoryToken && !isJwtExpired(memoryToken)) {
    setCookie(TOKEN_KEY, memoryToken)
    return memoryToken
  }
  memoryToken = null
  return null
}

export function saveBuyerToken(token: string) {
  memoryToken = token
  setStorageItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)

  const payload = parseJwtPayload(token)
  const currentUser = getBuyerUser()
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      role: ((payload?.user_type as User['role']) || currentUser.role) as User['role'],
      enterpriseCode: (payload?.enterprise_code as string) || currentUser.enterpriseCode || '',
      enterpriseRole: (payload?.enterprise_role as string) || currentUser.enterpriseRole || '',
    }
    memoryUser = updatedUser
    setStorageItem(USER_KEY, JSON.stringify(updatedUser))
    setCookie(USER_KEY, JSON.stringify(updatedUser))
  }

  window.dispatchEvent(new Event(BUYER_TOKEN_REFRESH_EVENT))
}

export function clearBuyerSession() {
  memoryToken = null
  memoryUser = null
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
}

export function isEnterpriseToken() {
  const payload = parseJwtPayload(getBuyerToken() || '')
  return payload?.user_type === 'enterprise'
}

export function getBuyerEnterpriseID() {
  const payload = parseJwtPayload(getBuyerToken() || '')
  const id = payload?.enterprise_id
  return typeof id === 'number' ? id : Number(id || 0)
}

export function hasEnterpriseAccess(user: User | null) {
  return !!user?.enterpriseCode && user.role === 'enterprise' && isEnterpriseToken()
}

export function hasSavedSellerSession() {
  return Boolean(getStorageItem([SELLER_TOKEN_KEY]))
}

function getCrossAppBaseURL(port: number) {
  if (!import.meta.env.DEV) {
    return ''
  }
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:${port}`
}

export function getSellerCenterHref(path = '/seller/dashboard') {
  const targetPath = path.startsWith('/seller') ? path : `/seller${path}`
  const base = getCrossAppBaseURL(5174)
  if (hasSavedSellerSession()) {
    return `${base}${targetPath}`
  }
  return `${base}/seller/login?redirect=${encodeURIComponent(targetPath)}`
}

export async function openSellerCenter(path = '/seller/dashboard') {
  const targetPath = path.startsWith('/seller') ? path : `/seller${path}`
  const base = getCrossAppBaseURL(5174)

  try {
    const response = await buyerAuthService.createSwitchSession()
    if (response.code === 0 && response.data?.switch_token) {
      window.location.href = `${base}/seller/login?switch_token=${encodeURIComponent(response.data.switch_token)}&redirect=${encodeURIComponent(targetPath)}`
      return
    }
  } catch {
    // Fall back to the target app's own session handling below.
  }

  window.location.href = getSellerCenterHref(targetPath)
}

export async function openServiceWorkbench(target: Exclude<SwitchTarget, 'seller'>, port: number, path: string, tab?: string) {
  const base = getCrossAppBaseURL(port)
  const params = new URLSearchParams()
  if (tab) {
    params.set('tab', tab)
  }

  try {
    const response = await buyerAuthService.createSwitchSession(target)
    if (response.code === 0 && response.data?.switch_token) {
      params.set('switch_token', response.data.switch_token)
    }
  } catch {
    // Fall back to shared-token handling in the target workbench.
  }

  const query = params.toString()
  window.location.href = `${base}${path}${query ? `?${query}` : ''}`
}
