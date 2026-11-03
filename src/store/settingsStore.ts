import { create } from 'zustand'
import { getGeneralSettings, updateGeneralSettings } from '../services/settings'
import { useAuthStore } from './authStore'
import type { GeneralSettings } from '../types/admin'

interface SettingsState {
  general: GeneralSettings | null
  loading: boolean
  fetchGeneral: () => Promise<void>
  saveGeneral: (patch: Partial<GeneralSettings>) => Promise<GeneralSettings>
  setGeneral: (general: GeneralSettings) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  general: null,
  loading: false,

  fetchGeneral: async () => {
    set({ loading: true })
    try {
      const general = await getGeneralSettings()
      set({ general })
    } catch {
      /* biarkan fallback ke BRANDING default */
    } finally {
      set({ loading: false })
    }
  },

  saveGeneral: async (patch) => {
    const updated = await updateGeneralSettings(patch)
    set({ general: updated })
    return updated
  },

  setGeneral: (general) => set({ general }),
}))

// Jangan biarkan nama/logo tenant sebelumnya terbawa ke sesi tenant lain.
useAuthStore.subscribe((state, prev) => {
  if (state.isAuthenticated === prev.isAuthenticated) return
  useSettingsStore.setState({ general: null, loading: false })
})
