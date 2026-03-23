import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Shield, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'

// SCALABLE ROLE MAPPING
const ROLE_OPTIONS = [
  { label: 'Team Member', value: 'member' },
  { label: 'Admin', value: 'admin' }
]

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
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
    <div className="min-h-screen bg-[#0B0F14] flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="flex flex-col justify-between w-full lg:w-96 p-6 sm:p-8 lg:p-10 bg-[#111827] border-b lg:border-b-0 lg:border-r border-[#1E293B]">
        <div className="flex items-center gap-2 mb-6 lg:mb-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-200 tracking-tight">SyncSpace AI</span>
        </div>
        
        {/* Hides the features list on very small mobile to save space, but shows on sm and above */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 lg:space-y-6">
          {[
            { icon: '🗂', title: 'Task Management', desc: 'Kanban board with drag & drop' },
            { icon: '🏆', title: 'Gamification', desc: 'Earn XP and level up' },
            { icon: '🤖', title: 'AI Assistant', desc: 'Smart task recommendations' },
            { icon: '📊', title: 'Analytics', desc: 'Track team productivity' },
          ].map(f => (
            <div key={f.title} className="flex items-start lg:items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center text-sm sm:text-lg shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-300">{f.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="hidden lg:block text-xs text-gray-600 mt-8">© 2024 SyncSpace AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 border-t border-white/5 lg:border-none">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-[340px] sm:max-w-md bg-[#0B0F14] sm:bg-[#111827]/30 sm:border border-[#1E293B] sm:rounded-2xl sm:p-8"
        >
          <div className="mb-6 sm:mb-8 mt-2 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1.5 sm:mb-2 tracking-tight">Create account</h1>
            <p className="text-sm sm:text-base text-gray-400">Join your team on SyncSpace AI</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 mb-5 sm:mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-500" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 focus:bg-[#1F2937] rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-500 pl-10 pr-4 py-3 sm:py-3.5 transition-colors outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-500" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 focus:bg-[#1F2937] rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-500 pl-10 pr-4 py-3 sm:py-3.5 transition-colors outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 focus:bg-[#1F2937] rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-500 pl-10 pr-11 py-3 sm:py-3.5 transition-colors outline-none" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1">
                  {showPw ? <EyeOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Eye className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-500 pointer-events-none" />
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 focus:bg-[#1F2937] rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-500 pl-10 pr-10 py-3 sm:py-3.5 transition-colors outline-none appearance-none cursor-pointer">
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#1F2937] text-gray-200 py-2">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 sm:py-3.5 font-medium flex items-center justify-center gap-2 transition-all mt-4 sm:mt-6 shadow-lg shadow-indigo-500/20">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-sm sm:text-base">Create account</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-gray-500 mt-8 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
