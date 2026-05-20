import api from './api'

interface WarehouseProfile {
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
  user: WarehouseProfile
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface WarehouseLoginPayload {
  account: string
  password: string
}

const TOKEN_KEY = 'warehouse_token'
const USER_KEY = 'warehouse_user'
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
  return getStoredToken(['buyer_token', 'seller_token', 'logistics_token', 'finance_token', 'token'])
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

function getStoredToken(keys: string[]) {
  for (const key of keys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key) || getCookie(key)
    if (!token) continue
    if (isJwtExpired(token)) {
      removeStorageItem(key)
      removeCookie(key)
      continue
    }
    return token
  }
  return null
}

export const warehouseAuthService = {
  login: (payload: WarehouseLoginPayload) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/login', payload),
  me: () => api.get<unknown, ApiResponse<WarehouseProfile>>('/users/me'),
  consumeSwitchSession: (switchToken: string) =>
    api.post<unknown, ApiResponse<LoginResponse>>('/auth/switch-session/consume', {
      switch_token: switchToken,
      target: 'warehouse',
    }),
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

function isJwtExpired(token: string, skewSeconds = 30) {
  const payload = parseJwtPayload(token)
  const exp = payload?.exp
  const expiresAt = typeof exp === 'number' ? exp : Number(exp || 0)
  return !expiresAt || expiresAt * 1000 <= Date.now() + skewSeconds * 1000
}

export function saveWarehouseSession(token: string, profile: WarehouseProfile) {
  setStorageItem(TOKEN_KEY, token)
  setStorageItem(USER_KEY, JSON.stringify(profile))
  setCookie(TOKEN_KEY, token)
  setCookie(USER_KEY, JSON.stringify(profile))
}

export function getWarehouseToken() {
  return getStoredToken([TOKEN_KEY]) || getSharedToken()
}

export function getWarehouseUser(): WarehouseProfile | null {
  const raw =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || getCookie(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WarehouseProfile
  } catch {
    return null
  }
}

export function saveWarehouseToken(token: string) {
  setStorageItem(TOKEN_KEY, token)
  setCookie(TOKEN_KEY, token)
}

export function clearWarehouseSession() {
  removeStorageItem(TOKEN_KEY)
  removeStorageItem(USER_KEY)
  removeCookie(TOKEN_KEY)
  removeCookie(USER_KEY)
}

export function hasWarehouseCapability(): boolean {
  const payload = parseJwtPayload(getWarehouseToken() || '')
  const payloadCaps = payload?.service_capabilities as string[] | undefined
  const payloadRole = payload?.role as string | undefined
  const payloadEnterpriseRole = payload?.enterprise_role as string | undefined
  const user = getWarehouseUser()
  const userCaps = user?.service_capabilities
  const sharedPermissions = getSharedPermissions()

  if (payloadCaps?.includes('warehouse') || userCaps?.includes('warehouse')) {
    return true
  }

  if (sharedPermissions.some((item) => item.service === 'warehouse' && item.status === 2)) {
    return true
  }

  return (
    payloadRole === 'warehouse' ||
    payloadEnterpriseRole === 'warehouse' ||
    user?.role === 'warehouse' ||
    user?.enterprise_role === 'warehouse'
  )
}
