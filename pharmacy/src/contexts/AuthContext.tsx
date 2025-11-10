import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authAPI, profileAPI } from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: any
  pharmacy: any
  token: string | null
  loading: boolean
  isProfileComplete: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  forgotPassword: (phone: string) => Promise<void>
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<void>
  updateProfile: (data: any) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    pharmacy,
    token,
    loading,
    isProfileComplete,
    setUser,
    setPharmacy,
    setToken,
    setLoading,
    login: storeLogin,
    logout: storeLogout,
    updatePharmacy
  } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      if (token && user) {
        try {
          // Fetch latest pharmacy data
          const response = await profileAPI.getProfile()
          if (response.data.pharmacy) {
            setPharmacy(response.data.pharmacy)
          }
        } catch (error) {
          console.error('Error fetching pharmacy data:', error)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token, user, setPharmacy, setLoading])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      const { token: newToken, user: userData } = response.data
      
      // Fetch pharmacy data
      let pharmacyData = null
      try {
        const profileResponse = await profileAPI.getProfile()
        pharmacyData = profileResponse.data.pharmacy
      } catch (error) {
        console.error('Error fetching pharmacy profile:', error)
      }
      
      storeLogin(newToken, userData, pharmacyData)
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(data)
      const { token: newToken, user: userData, pharmacy: pharmacyData } = response.data
      
      storeLogin(newToken, userData, pharmacyData)
      toast.success('Registration successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (phone: string) => {
    try {
      setLoading(true)
      await authAPI.forgotPassword(phone)
      toast.success('OTP sent to your phone')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (phone: string, otp: string, newPassword: string) => {
    try {
      setLoading(true)
      await authAPI.resetPassword(phone, otp, newPassword)
      toast.success('Password reset successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      setLoading(true)
      const response = await profileAPI.updateProfile(data)
      updatePharmacy(response.data.pharmacy)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    storeLogout()
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    pharmacy,
    token,
    loading,
    isProfileComplete,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider