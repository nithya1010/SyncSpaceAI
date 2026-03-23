import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Zap, LayoutDashboard, CheckSquare, Users, Calendar,
  Bot, Menu, X, LogOut, User, Settings, ChevronDown,
  BarChart2, Focus, MoreHorizontal
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/dashboard',           label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/dashboard/tasks',     label: 'Tasks',        icon: CheckSquare },
  { to: '/dashboard/team',      label: 'Team',         icon: Users },
  { to: '/dashboard/focus',     label: 'Focus',        icon: Focus },
  { to: '/dashboard/analytics', label: 'Analytics',    icon: BarChart2 },
  { to: '/dashboard/ai',        label: 'AI Assistant', icon: Bot },
  { to: '/dashboard/planner',   label: 'AI Planner',   icon: Calendar },
  { to: '/dashboard/profile',   label: 'Profile',      icon: User },
  { to: '/dashboard/settings',  label: 'Settings',     icon: Settings },
]


const TopNav = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="h-14 shrink-0 flex items-center px-4 lg:px-6 border-b border-white/5 z-30"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1060, #302b63)' }}>

        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3 mr-6">
          {/* Hamburger — only on mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight hidden sm:block">SyncSpace</span>
            <span className="text-xs font-semibold text-indigo-400 hidden sm:block">AI</span>
          </div>
        </div>

        {/* Center: Nav links — desktop only (md+) */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right: User avatar + dropdown */}
        <div className="ml-auto flex items-center gap-2" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-gray-200 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-white/5">
                    <p className="text-xs font-medium text-gray-200">{user?.name}</p>
                    <p className="text-[10px] text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { navigate('/dashboard/profile'); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/8 rounded-lg transition-all">
                      <User className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/8 rounded-lg transition-all">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-60 bg-[#111827] z-50 border-r border-white/10 p-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-gray-200">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default TopNav
