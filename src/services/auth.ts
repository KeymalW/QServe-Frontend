import { get, post } from './api'
import { USE_MOCK_DATA } from '../mocks/mockMode'
import { mockAdminExists, mockGetProfile, mockLogin, mockLogout, mockRegister } from '../mocks/mockBackend'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth'

function normalizeLoginResponse(res: LoginResponse): LoginResponse {
  const rawUser = res.user as User & { tenant_id?: number | null; tenant_slug?: string | null }
  const user = { ...res.user }
  if (user.tenantId === null || user.tenantId === undefined) {
    user.tenantId = res.tenant?.id ?? rawUser.tenant_id ?? null
  }
  if (!user.tenantSlug) {
    user.tenantSlug = res.tenant?.slug ?? rawUser.tenant_slug ?? null
  }
  return { ...res, user }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK_DATA) {
    return normalizeLoginResponse(mockLogin(payload.username, payload.password))
  }

  const res = await post<LoginResponse>('/auth/login', payload)
  return normalizeLoginResponse(res.data)
}

export async function logout(): Promise<void> {
  if (USE_MOCK_DATA) {
    mockLogout()
    return
  }

  await post('/auth/logout')
}

export async function getProfile(): Promise<User> {
  if (USE_MOCK_DATA) {
    return mockGetProfile()
  }

  const res = await get<User>('/auth/profile')
  return res.data
}

export async function register(payload: RegisterRequest): Promise<LoginResponse> {
  if (USE_MOCK_DATA) {
    return mockRegister(payload)
  }

  const res = await post<LoginResponse>('/auth/register', payload)
  return normalizeLoginResponse(res.data)
}

export async function checkAdminExists(): Promise<boolean> {
  if (USE_MOCK_DATA) {
    return mockAdminExists()
  }

  const res = await get<{ exists: boolean }>('/auth/admin-exists')
  return res.data.exists
}
