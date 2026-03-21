import { createContext, useState, useContext } from 'react'

export const useAuth = () => useContext(AuthContext)
import api from '../api/axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('syncspace_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('syncspace_token', res.data.token)
      localStorage.setItem('syncspace_user', JSON.stringify(res.data))
      setUser(res.data)
      return res.data
    } finally { setLoading(false) }
  }

  const register = async (name, email, password, role) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { name, email, password, role })
      localStorage.setItem('syncspace_token', res.data.token)
      localStorage.setItem('syncspace_user', JSON.stringify(res.data))
      setUser(res.data)
      return res.data
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('syncspace_token')
    localStorage.removeItem('syncspace_user')
    setUser(null)
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    localStorage.setItem('syncspace_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
