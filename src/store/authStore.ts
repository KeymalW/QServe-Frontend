import { create } from 'zustand'
import type { User } from '../types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

function loadFromStorage(): { user: User | null; token: string | null; isAuthenticated: boolean } {
  try {
    const token = sessionStorage.getItem('token')
    const userStr = sessionStorage.getItem('user')
    if (token && userStr) {
      return {
        user: JSON.parse(userStr) as User,
        token,
        isAuthenticated: true,
      }
    }
  } catch {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }
  return { user: null, token: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadFromStorage(),

  login: (user, token) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
