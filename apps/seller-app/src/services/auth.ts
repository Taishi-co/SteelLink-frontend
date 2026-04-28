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
const ENTERPRISE_ROLE_KEY = 'seller_enterprise_role'

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
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  const payload = parseJwtPayload(token)
  if (payload?.enterprise_role) {
    localStorage.setItem(ENTERPRISE_ROLE_KEY, payload.enterprise_role as string)
  } else {
    localStorage.removeItem(ENTERPRISE_ROLE_KEY)
  }
}

export function updateSellerUser(user: SellerUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSellerSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ENTERPRISE_ROLE_KEY)
}

export function getSellerToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getSellerUser(): SellerUser | null {
  const raw = localStorage.getItem(USER_KEY)
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
  return localStorage.getItem(ENTERPRISE_ROLE_KEY) || ''
}

export function isIdentityVerified(user: SellerUser | null): boolean {
  return (user?.identity_status ?? 0) >= 2
}

export function hasEnterprise(user: SellerUser | null): boolean {
  return !!user?.enterprise_code && user?.role === 'enterprise'
}

export function hasEnterprisePending(user: SellerUser | null): boolean {
  return !!user?.enterprise_code && user?.role !== 'enterprise'
}

export function isSellerReady(user: SellerUser | null): boolean {
  return isIdentityVerified(user) && hasEnterprise(user)
}
