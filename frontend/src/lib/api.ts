import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    if (status === 403 && (detail === 'subscription_inactive' || detail === 'subscription_expired')) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = `/login?blocked=${detail}`
    }

    return Promise.reject(error)
  }
)

export default api
