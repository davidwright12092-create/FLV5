import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const api = axios.create({
  baseURL: API_URL,
})

// TODO: Configure request interceptor for authentication
// api.interceptors.request.use(...)

// TODO: Configure response interceptor for error handling
// api.interceptors.response.use(...)

export default api
