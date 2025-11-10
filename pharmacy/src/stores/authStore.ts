import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  name: string
  email: string
  role: string 
}

interface Pharmacy {
  _id: string
  name: string
  ownerName?: string
  licenseNumber?: string
  phone: string
  email: string
  address?: string
  city?: string
  woreda?: string
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
  deliveryAvailable: boolean
  isActive: boolean
  status: 'pending' | 'approved' | 'rejected'
}

interface AuthState {
  user: User | null
  pharmacy: Pharmacy | null
  token: string | null
  loading: boolean
  isProfileComplete: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setPharmacy: (pharmacy: Pharmacy | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setIsProfileComplete: (complete: boolean) => void
  login: (token: string, user: User, pharmacy?: Pharmacy) => void
  logout: () => void
  updatePharmacy: (pharmacy: Partial<Pharmacy>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pharmacy: null,
      token: null,
      loading: false,
      isProfileComplete: false,

      setUser: (user) => set({ user }),
      setPharmacy: (pharmacy) => {
        const isComplete = pharmacy ? 
          !!(pharmacy.name && pharmacy.ownerName && pharmacy.licenseNumber && 
             pharmacy.city && pharmacy.woreda) : false
        set({ pharmacy, isProfileComplete: isComplete })
      },
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setIsProfileComplete: (complete) => set({ isProfileComplete: complete }),
      
      login: (token, user, pharmacy) => {
        const isComplete = pharmacy ? 
          !!(pharmacy.name && pharmacy.ownerName && pharmacy.licenseNumber && 
             pharmacy.city && pharmacy.woreda) : false
        set({ 
          token, 
          user, 
          pharmacy, 
          isProfileComplete: isComplete 
        })
      },
      
      logout: () => {
        set({ 
          user: null, 
          pharmacy: null, 
          token: null, 
          isProfileComplete: false 
        })
        // Redirect to login after logout
        window.location.href = '/login'
      },
      
      updatePharmacy: (updates) => {
        const currentPharmacy = get().pharmacy
        if (currentPharmacy) {
          const updatedPharmacy = { ...currentPharmacy, ...updates }
          const isComplete = !!(updatedPharmacy.name && updatedPharmacy.ownerName && 
                               updatedPharmacy.licenseNumber && updatedPharmacy.city && 
                               updatedPharmacy.woreda)
          set({ 
            pharmacy: updatedPharmacy, 
            isProfileComplete: isComplete 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        pharmacy: state.pharmacy,
        token: state.token,
        isProfileComplete: state.isProfileComplete
      })
    }
  )
)