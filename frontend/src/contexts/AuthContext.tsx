import { createContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export interface User {
  id: string
  email: string
  fullName: string
  companyName: string
  role: 'admin' | 'manager' | 'user'
  avatar?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  loginAsDemo: () => void
  logout: () => void
  updateUser: (user: User) => void
}

export interface SignupData {
  fullName: string
  email: string
  password: string
  companyName: string
  industry: string
  companySize: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')

        if (token) {
          // TODO: Replace with actual API call to validate token and get user data
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Mock user data
          const mockUser: User = {
            id: '1',
            email: 'john.doe@company.com',
            fullName: 'John Doe',
            companyName: 'ACME Services Inc.',
            role: 'admin',
          }

          setUser(mockUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock response
      const token = 'mock-jwt-token-' + Date.now()
      const mockUser: User = {
        id: '1',
        email,
        fullName: 'John Doe',
        companyName: 'ACME Services Inc.',
        role: 'admin',
      }

      localStorage.setItem('token', token)
      setUser(mockUser)

      // Navigate to dashboard after successful login
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Invalid credentials')
    }
  }

  const signup = async (data: SignupData) => {
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response
      const token = 'mock-jwt-token-' + Date.now()
      const mockUser: User = {
        id: '1',
        email: data.email,
        fullName: data.fullName,
        companyName: data.companyName,
        role: 'admin',
      }

      localStorage.setItem('token', token)
      setUser(mockUser)

      // Navigate to dashboard after successful signup
      navigate('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      throw new Error('Failed to create account')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@fieldlink.com',
      fullName: 'Demo User',
      companyName: 'FieldLink Demo',
      role: 'admin',
    }

    localStorage.setItem('token', 'demo-token')
    setUser(demoUser)
    navigate('/dashboard')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    loginAsDemo,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
