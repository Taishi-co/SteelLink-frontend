import api from './api'

interface LogisticsProfile {
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
  user: LogisticsProfile
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LogisticsLoginPayload {
  account: string
  password: string
}

const TOKEN_KEY = 'logistics_token'
const USER_KEY = 'logistics_user'
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
  return localStorage.getItem('token') || sessionStorage.getItem('token') || getCookie('token')
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

export const logisticsAuthService = {
  login: (payload: LogisticsLoginPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  me: () => api.get<unknown, ApiResponse<LogisticsProfile>>('/users/me'),
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

export function saveLogisticsSession(token: string, profile: LogisticsProfile) {
  setStorageItem(TOKEN_KEY, token)
  setStorageItem(USER_KEY, JSON.stringify(profile))
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(profile))
}

export function getLogisticsToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    getCookie(TOKEN_KEY) ||
    getSharedToken()
  )
}

export function getLogisticsUser(): LogisticsProfile | null {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || getCookie(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LogisticsProfile
  } catch {
    return null
  }
}

export function saveLogisticsToken(token: string) {
  setStorageItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)
}

export function clearLogisticsSession() {
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
}

export function hasLogisticsCapability(): boolean {
  const payload = parseJwtPayload(getLogisticsToken() || '')
  const payloadCaps = payload?.service_capabilities as string[] | undefined
  const payloadRole = payload?.role as string | undefined
  const payloadEnterpriseRole = payload?.enterprise_role as string | undefined
  const user = getLogisticsUser()
  const userCaps = user?.service_capabilities
  const sharedPermissions = getSharedPermissions()

  if (payloadCaps?.includes('logistics') || userCaps?.includes('logistics')) {
    return true
  }

  if (sharedPermissions.some((item) => item.service === 'logistics' && item.status === 2)) {
    return true
  }

  return (
    payloadRole === 'logistics' ||
    payloadEnterpriseRole === 'logistics' ||
    user?.role === 'logistics' ||
    user?.enterprise_role === 'logistics'
  )
}
