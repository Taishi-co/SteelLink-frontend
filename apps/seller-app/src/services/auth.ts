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

const TOKEN_KEY = 'token'
const USER_KEY = 'seller_user'
const BUYER_USER_KEY = 'buyer_user'
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
  const buyerUser = {
    id: user.id,
    username: user.phone || user.email || user.user_no,
    mobile: user.phone,
    companyName: user.enterprise_code || '个人用户',
    role: user.role || 'personal',
    realName: user.real_name || '',
    identityStatus: user.identity_status || 0,
    identityReject: user.identity_reject || '',
    enterpriseCode: user.enterprise_code || '',
    enterpriseRole: '',
  }
  localStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
  sessionStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
  setCookie(BUYER_USER_KEY, JSON.stringify(buyerUser))

  const payload = parseJwtPayload(token)
  if (payload?.enterprise_role) {
    localStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    sessionStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    setCookie(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
    buyerUser.enterpriseRole = payload.enterprise_role as string
    localStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
    sessionStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
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
  const tokenPayload = parseJwtPayload(getSellerToken() || '')
  const buyerUser = {
    id: user.id,
    username: user.phone || user.email || user.user_no,
    mobile: user.phone,
    companyName: user.enterprise_code || '个人用户',
    role: user.role || 'personal',
    realName: user.real_name || '',
    identityStatus: user.identity_status || 0,
    identityReject: user.identity_reject || '',
    enterpriseCode: user.enterprise_code || '',
    enterpriseRole: (tokenPayload?.enterprise_role as string) || getSellerEnterpriseRole(),
  }
  localStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
  sessionStorage.setItem(BUYER_USER_KEY, JSON.stringify(buyerUser))
  setCookie(BUYER_USER_KEY, JSON.stringify(buyerUser))
}

export function clearSellerSession() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  removeCookie(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
  removeCookie(USER_KEY)
  localStorage.removeItem(BUYER_USER_KEY)
  sessionStorage.removeItem(BUYER_USER_KEY)
  removeCookie(BUYER_USER_KEY)
  localStorage.removeItem(ENTERPRISE_ROLE_KEY)
  sessionStorage.removeItem(ENTERPRISE_ROLE_KEY)
  removeCookie(ENTERPRISE_ROLE_KEY)
}

export function getSellerToken() {
  return getCookie(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

function getTokenUserID() {
  const payload = parseJwtPayload(getSellerToken() || '')
  return typeof payload?.user_id === 'number' ? payload.user_id : undefined
}

function sellerFromBuyerCache(): SellerUser | null {
  const buyerRaw = getCookie(BUYER_USER_KEY) || sessionStorage.getItem(BUYER_USER_KEY) || localStorage.getItem(BUYER_USER_KEY)
  if (!buyerRaw) {
    return null
  }
  try {
    const buyer = JSON.parse(buyerRaw) as {
      id?: number
      username?: string
      mobile?: string
      role?: string
      realName?: string
      identityStatus?: number
      identityReject?: string
      enterpriseCode?: string
      enterpriseRole?: string
    }
    return {
      id: buyer.id || 0,
      uid: '',
      user_no: '',
      platform_id: '',
      personal_code: '',
      enterprise_code: buyer.enterpriseCode || '',
      role: buyer.role || 'personal',
      phone: buyer.mobile || buyer.username || '',
      qq: '',
      email: '',
      real_name: buyer.realName || '',
      identity_status: buyer.identityStatus || 0,
      identity_reject: buyer.identityReject || '',
      status: 1,
      created_at: '',
      updated_at: '',
    }
  } catch {
    return null
  }
}

export function getSellerUser(): SellerUser | null {
  const raw = getCookie(USER_KEY) || sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  if (!raw) {
    return sellerFromBuyerCache()
  }

  try {
    const seller = JSON.parse(raw) as SellerUser
    const tokenUserID = getTokenUserID()
    if (tokenUserID && seller.id && seller.id !== tokenUserID) {
      return sellerFromBuyerCache()
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
