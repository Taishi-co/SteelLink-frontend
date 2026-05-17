import api from './api'

interface FinanceProfile {
  id: number
  user_no: string
  platform_id: string
  personal_code: string
  enterprise_code: string
  role: string
  enterprise_role: string
  phone: string
  email: string
  real_name: string
  identity_status: number
  status: number
  service_capabilities?: string[]
  created_at: string
  updated_at: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: FinanceProfile
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface FinanceLoginPayload {
  account: string
  password: string
}

const TOKEN_KEY = 'finance_token'
const USER_KEY = 'finance_user'
const SHARED_PERMISSIONS_KEY = 'enterprise_service_permissions'

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function getCookie(name: string) {
  const prefix = `${name}=`
  const match = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
  if (!match) return null
  return decodeURIComponent(match.slice(prefix.length))
}

function getSharedToken() {
  return (
    localStorage.getItem('buyer_token') ||
    sessionStorage.getItem('buyer_token') ||
    getCookie('buyer_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    getCookie('token')
  )
}

function getSharedPermissions() {
  const raw =
    localStorage.getItem(SHARED_PERMISSIONS_KEY) ||
    sessionStorage.getItem(SHARED_PERMISSIONS_KEY) ||
    getCookie(SHARED_PERMISSIONS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Array<{ service?: string; status?: number }>
  } catch {
    return []
  }
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

export const financeAuthService = {
  login: (payload: FinanceLoginPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  me: () => api.get<unknown, ApiResponse<FinanceProfile>>('/users/me'),
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

export function saveFinanceSession(token: string, profile: FinanceProfile) {
  setStorageItem(TOKEN_KEY, token)
  setStorageItem(USER_KEY, JSON.stringify(profile))
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(profile))
}

export function getFinanceToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    getCookie(TOKEN_KEY) ||
    getSharedToken()
  )
}

export function getFinanceUser(): FinanceProfile | null {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || getCookie(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as FinanceProfile
  } catch {
    return null
  }
}

export function saveFinanceToken(token: string) {
  setStorageItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)
}

export function clearFinanceSession() {
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
}

export function hasFinanceCapability(): boolean {
  const payload = parseJwtPayload(getFinanceToken() || '')
  const payloadCaps = payload?.service_capabilities as string[] | undefined
  const payloadRole = payload?.role as string | undefined
  const payloadEnterpriseRole = payload?.enterprise_role as string | undefined
  const user = getFinanceUser()
  const userCaps = user?.service_capabilities
  const sharedPermissions = getSharedPermissions()

  if (payloadCaps?.includes('finance') || userCaps?.includes('finance')) {
    return true
  }

  if (sharedPermissions.some((item) => item.service === 'finance' && item.status === 2)) {
    return true
  }

  return (
    payloadRole === 'finance' ||
    payloadEnterpriseRole === 'fund' ||
    user?.role === 'finance' ||
    user?.enterprise_role === 'fund'
  )
}
