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
const LEGACY_TOKEN_KEY = 'token'
const USER_KEY = 'seller_user'
const ENTERPRISE_ROLE_KEY = 'seller_enterprise_role'

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

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

export const sellerAuthService = {
  login: (payload: SellerLoginPayload) => api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  register: (payload: SellerRegisterPayload) => api.post<unknown, ApiResponse<LoginResponse>>('/auth/register', payload),
  me: () => api.get<unknown, ApiResponse<SellerUser>>('/users/me'),
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
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  sessionStorage.removeItem(LEGACY_TOKEN_KEY)
  removeCookie(LEGACY_TOKEN_KEY)

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
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  sessionStorage.removeItem(LEGACY_TOKEN_KEY)
  removeCookie(LEGACY_TOKEN_KEY)

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

export function clearSellerSession(options?: { preserveBuyerSession?: boolean }) {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  removeCookie(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
  removeCookie(USER_KEY)
  if (!options?.preserveBuyerSession) {
    localStorage.removeItem(ENTERPRISE_ROLE_KEY)
    sessionStorage.removeItem(ENTERPRISE_ROLE_KEY)
    removeCookie(ENTERPRISE_ROLE_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    sessionStorage.removeItem(LEGACY_TOKEN_KEY)
    removeCookie(LEGACY_TOKEN_KEY)
  }
}

export function getSellerToken() {
  const sellerToken = getCookie(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  if (sellerToken) {
    return sellerToken
  }

  const hasSellerUser = Boolean(getCookie(USER_KEY) || sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY))
  return hasSellerUser ? getCookie(LEGACY_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY) : null
}

function getTokenUserID() {
  const payload = parseJwtPayload(getSellerToken() || '')
  return typeof payload?.user_id === 'number' ? payload.user_id : undefined
}

export function getSellerUser(): SellerUser | null {
  const raw = getCookie(USER_KEY) || sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    const seller = JSON.parse(raw) as SellerUser
    const tokenUserID = getTokenUserID()
    if (tokenUserID && seller.id && seller.id !== tokenUserID) {
      return null
    }
    return seller
  } catch {
    return null
  }
}

export function getSellerEnterpriseRole(): string {
  return getCookie(ENTERPRISE_ROLE_KEY) || sessionStorage.getItem(ENTERPRISE_ROLE_KEY) || localStorage.getItem(ENTERPRISE_ROLE_KEY) || ''
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
