import axios from 'axios'

export const TOKEN_KEY = 'imk_admin_token'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY)
      if (window.location.pathname.startsWith('/admin')) window.location.assign('/admin/login')
    }
    return Promise.reject(err)
  },
)

// Pull the server's friendly message out of an axios error
export const errorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Is it running?' : err.message)

// Build multipart data, skipping undefined values
export function toFormData(values) {
  const fd = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return
    fd.append(key, value === null ? '' : value)
  })
  return fd
}

export default api
