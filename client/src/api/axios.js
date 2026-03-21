import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('syncspace_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('syncspace_token')
      localStorage.removeItem('syncspace_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default instance
