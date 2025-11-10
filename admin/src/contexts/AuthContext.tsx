import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  admin: any
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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
    admin,
    token,
    loading,
    setLoading,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore()

  useEffect(() => {
    setLoading(false)
  }, [setLoading])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      const { token: newToken } = response.data
      
      // Create admin object from login response
      const adminData = {
        _id: 'admin',
        email,
        role: 'admin'
      }
      
      storeLogin(newToken, adminData)
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
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
    admin,
    token,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider