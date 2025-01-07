import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  language: string
  notifications: {
    desktop: boolean
    sounds: boolean
    mentions: boolean
    messages: boolean
  }
  chatSettings: {
    enterToSend: boolean
    showTimestamps: boolean
    compactView: boolean
    showTypingIndicators: boolean
  }
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setFontSize: (size: number) => void
  setLanguage: (lang: string) => void
  setNotifications: (settings: Partial<SettingsState['notifications']>) => void
  setChatSettings: (settings: Partial<SettingsState['chatSettings']>) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 14,
      language: 'en',
      notifications: {
        desktop: true,
        sounds: true,
        mentions: true,
        messages: true,
      },
      chatSettings: {
        enterToSend: true,
        showTimestamps: true,
        compactView: false,
        showTypingIndicators: true,
      },
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLanguage: (language) => set({ language }),
      setNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      setChatSettings: (settings) =>
        set((state) => ({
          chatSettings: { ...state.chatSettings, ...settings },
        })),
    }),
    {
      name: 'chatgenius-settings',
    }
  )
) 