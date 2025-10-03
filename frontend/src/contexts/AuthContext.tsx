import { createContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  bypassAuth: () => void
  logout: () => void
  updateUser: (user: User) => void
}

export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
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
          const userData = await authService.verifyToken()
          const userWithFullName = {
            ...userData,
            fullName: `${userData.firstName} ${userData.lastName}`,
          }
          setUser(userWithFullName)
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
      const response = await authService.login(email, password)

      // Extract user and token from response.data
      const { user: userData, token } = response.data

      // Add fullName for display purposes
      const userWithFullName = {
        ...userData,
        fullName: `${userData.firstName} ${userData.lastName}`,
      }

      localStorage.setItem('token', token)
      setUser(userWithFullName)

      // Navigate to dashboard after successful login
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Invalid credentials')
    }
  }

  const signup = async (data: SignupData) => {
    try {
      const response = await authService.signup(data)

      // Extract user and token from response.data
      const { user: userData, token } = response.data

      // Add fullName for display purposes
      const userWithFullName = {
        ...userData,
        fullName: `${userData.firstName} ${userData.lastName}`,
      }

      localStorage.setItem('token', token)
      setUser(userWithFullName)

      // Navigate to dashboard after successful signup
      navigate('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      throw new Error('Failed to create account')
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      setUser(null)
      // Use window.location for a hard redirect to ensure clean logout
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to navigate if window.location fails
      navigate('/')
    }
  }

  const bypassAuth = () => {
    // Create a mock user for development
    const mockUser: User = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      fullName: 'Dev User',
    }

    // Set a mock token
    localStorage.setItem('token', 'dev-bypass-token')
    setUser(mockUser)
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
    bypassAuth,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
