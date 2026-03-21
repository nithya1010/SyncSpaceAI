import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Shield, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Team Member' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 bg-[#111827] border-r border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-200">SyncSpace AI</span>
        </div>
        <div className="space-y-4">
          {[
            { icon: '🗂', title: 'Task Management', desc: 'Kanban board with drag & drop' },
            { icon: '🏆', title: 'Gamification', desc: 'Earn XP and level up' },
            { icon: '🤖', title: 'AI Assistant', desc: 'Smart task recommendations' },
            { icon: '📊', title: 'Analytics', desc: 'Track team productivity' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center text-sm">
                {f.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-300">{f.title}</p>
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">© 2024 SyncSpace AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-200">SyncSpace AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-100 mb-1">Create account</h1>
            <p className="text-sm text-gray-500">Join your team on SyncSpace AI</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required className="input-field pl-9 pr-9" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field pl-9 appearance-none">
                  <option value="Team Member" className="bg-[#111827]">Team Member</option>
                  <option value="Admin" className="bg-[#111827]">Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-10">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
