import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Admin {
  _id: string
  email: string
  role: string
}

interface AuthState {
  admin: Admin | null
  token: string | null
  loading: boolean
  
  // Actions
  setAdmin: (admin: Admin | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (token: string, admin: Admin) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      loading: false,

      setAdmin: (admin) => set({ admin }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      
      login: (token, admin) => set({ token, admin }),
      
      logout: () => {
        set({ admin: null, token: null })
        window.location.href = '/login'
      }
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token
      })
    }
  )
)