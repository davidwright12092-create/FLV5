import { User, SignupData } from '../contexts/AuthContext'

export interface LoginResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface SignupResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordResponse {
  message: string
}

// TODO: Implement authentication service
export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // TODO: Implement login
    throw new Error('Not implemented')
  },

  async signup(data: SignupData): Promise<SignupResponse> {
    // TODO: Implement signup
    throw new Error('Not implemented')
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    // TODO: Implement forgot password
    throw new Error('Not implemented')
  },

  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    // TODO: Implement reset password
    throw new Error('Not implemented')
  },

  async verifyToken(): Promise<User> {
    // TODO: Implement token verification
    throw new Error('Not implemented')
  },

  async logout(): Promise<void> {
    // TODO: Implement logout
    throw new Error('Not implemented')
  },
}

export default authService
