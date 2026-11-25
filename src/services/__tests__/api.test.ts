import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios, { type InternalAxiosRequestConfig } from 'axios'

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { default: mockAxios }
})

vi.mock('../../store/authStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ logout: vi.fn() })) },
}))

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    sessionStorage.clear()
  })

  it('creates axios instance with correct config', async () => {
    const axiosModule = await import('axios')
    const apiFactory = vi.mocked(axiosModule.default.create)

    await import('../api')

    expect(apiFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('mengambil token dari sessionStorage', async () => {
    sessionStorage.setItem('token', 'token-tab-ini')
    await import('../api')
    const mockApi = vi.mocked(axios).create()
    const interceptor = vi.mocked(mockApi.interceptors.request.use).mock.calls[0][0]
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig

    interceptor(config)

    expect(config.headers.Authorization).toBe('Bearer token-tab-ini')
  })

  it('get calls axios.get with params', async () => {
    const { get } = await import('../api')
    const mockApi = vi.mocked(axios).create()
    vi.mocked(mockApi.get).mockResolvedValue({ data: { data: 'result' } })

    const result = await get<string>('/test', { key: 'value' })

    expect(mockApi.get).toHaveBeenCalledWith('/test', { params: { key: 'value' } })
    expect(result).toEqual({ data: 'result' })
  })

  it('post calls axios.post with body', async () => {
    const { post } = await import('../api')
    const mockApi = vi.mocked(axios).create()
    vi.mocked(mockApi.post).mockResolvedValue({ data: { data: 'created' } })

    const result = await post<string>('/create', { name: 'test' })

    expect(mockApi.post).toHaveBeenCalledWith('/create', { name: 'test' })
    expect(result).toEqual({ data: 'created' })
  })

  it('put calls axios.put', async () => {
    const { put } = await import('../api')
    const mockApi = vi.mocked(axios).create()
    vi.mocked(mockApi.put).mockResolvedValue({ data: { data: 'updated' } })

    const result = await put<string>('/update/1', { status: 'done' })

    expect(mockApi.put).toHaveBeenCalledWith('/update/1', { status: 'done' })
    expect(result).toEqual({ data: 'updated' })
  })

  it('del calls axios.delete', async () => {
    const { del } = await import('../api')
    const mockApi = vi.mocked(axios).create()
    vi.mocked(mockApi.delete).mockResolvedValue({ data: { data: 'deleted' } })

    const result = await del<string>('/delete/1')

    expect(mockApi.delete).toHaveBeenCalledWith('/delete/1')
    expect(result).toEqual({ data: 'deleted' })
  })
})
