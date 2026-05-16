import api from './api'

export interface SellerUser {
  id: number
  uid: string
  user_no: string
  platform_id: string
  personal_code: string
  enterprise_code: string
  role: string
  phone: string
  qq: string
  email: string
  real_name?: string
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
  user: SellerUser
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface SellerLoginPayload {
  account: string
  password: string
}

export interface SellerRegisterPayload {
  phone: string
  password: string
  email?: string
  qq?: string
}

const TOKEN_KEY = 'seller_token'
const USER_KEY = 'seller_user'
const ENTERPRISE_ROLE_KEY = 'seller_enterprise_role'
const BUYER_TOKEN_KEY = 'buyer_token'

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

function getStorageItem(keys: string[]) {
  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key) || getCookie(key)
    if (value) {
      return value
    }
  }
  return null
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

export const sellerAuthService = {
  login: (payload: SellerLoginPayload) => api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  register: (payload: SellerRegisterPayload) => api.post<unknown, ApiResponse<LoginResponse>>('/auth/register', payload),
  me: () => api.get<unknown, ApiResponse<SellerUser>>('/users/me'),
  consumeSwitchSession: (switchToken: string) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/switch-session/consume', { switch_token: switchToken, target: 'seller' }),
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

export function saveSellerSession(token: string, user: SellerUser) {
  localStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  setCookie(TOKEN_KEY, token)

  const payload = parseJwtPayload(token)
  if (payload?.enterprise_role) {
    localStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    sessionStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    setCookie(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
  } else {
    localStorage.removeItem(ENTERPRISE_ROLE_KEY)
    sessionStorage.removeItem(ENTERPRISE_ROLE_KEY)
    removeCookie(ENTERPRISE_ROLE_KEY)
  }
}

export function saveSellerToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)

  const payload = parseJwtPayload(token)
  const user = getSellerUser()
  if (user) {
    updateSellerUser({
      ...user,
      role: (payload?.user_type as string) || user.role,
      enterprise_code: (payload?.enterprise_code as string) || user.enterprise_code || '',
    })
  }

  if (payload?.enterprise_role) {
    localStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    sessionStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    setCookie(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
  } else {
    localStorage.removeItem(ENTERPRISE_ROLE_KEY)
    sessionStorage.removeItem(ENTERPRISE_ROLE_KEY)
    removeCookie(ENTERPRISE_ROLE_KEY)
  }
}

export function updateSellerUser(user: SellerUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  setCookie(USER_KEY, JSON.stringify(user))
}

export function clearSellerSession() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  removeCookie(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
  removeCookie(USER_KEY)
  localStorage.removeItem(ENTERPRISE_ROLE_KEY)
  sessionStorage.removeItem(ENTERPRISE_ROLE_KEY)
  removeCookie(ENTERPRISE_ROLE_KEY)
}

export function getSellerToken() {
  return getStorageItem([TOKEN_KEY])
}

export function getSellerUser(): SellerUser | null {
  const raw = getStorageItem([USER_KEY])
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as SellerUser
  } catch {
    return null
  }
}

export function getSellerEnterpriseRole(): string {
  return getStorageItem([ENTERPRISE_ROLE_KEY]) || ''
}

export function getSellerEnterpriseID(): number {
  const payload = parseJwtPayload(getSellerToken() || '')
  const id = payload?.enterprise_id
  return typeof id === 'number' ? id : Number(id || 0)
}

export function isIdentityVerified(user: SellerUser | null): boolean {
  return user?.identity_status === 2
}

export function hasEnterprise(user: SellerUser | null): boolean {
  const tokenPayload = parseJwtPayload(getSellerToken() || '')
  return !!user?.enterprise_code && user?.role === 'enterprise' && tokenPayload?.user_type === 'enterprise'
}

export function hasEnterprisePending(user: SellerUser | null): boolean {
  return !!user?.enterprise_code && user?.role !== 'enterprise'
}

export function isSellerReady(user: SellerUser | null): boolean {
  return isIdentityVerified(user) && hasEnterprise(user)
}

export function hasSavedBuyerSession() {
  return Boolean(getStorageItem([BUYER_TOKEN_KEY]))
}

export function getBuyerCenterHref(path = '/dashboard') {
  const targetPath = path.startsWith('/') ? path : `/${path}`
  const base = import.meta.env.DEV ? 'http://localhost:5173' : ''
  if (hasSavedBuyerSession()) {
    return `${base}${targetPath}`
  }
  return `${base}/login?redirect=${encodeURIComponent(targetPath)}`
}
