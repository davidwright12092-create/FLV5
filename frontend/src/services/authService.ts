import axios from 'axios'
import { User, SignupData } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export interface LoginResponse {
  user: User
  token: string
}

export interface SignupResponse {
  user: User
  token: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordResponse {
  message: string
}

// Authentication API calls
export const authService = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  // Signup
  async signup(data: SignupData): Promise<SignupResponse> {
    const response = await api.post<SignupResponse>('/auth/signup', data)
    return response.data
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    })
    return response.data
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', {
      token,
      password,
    })
    return response.data
  },

  // Verify token and get user
  async verifyToken(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}

export default authService
