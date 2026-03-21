import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, CheckSquare, Focus, BarChart2,
  Bot, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Zap, Trophy
} from 'lucide-react'
import { useState } from 'react'

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true, kbd: '⌘1' },
      { to: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare, kbd: '⌘2' },
      { to: '/dashboard/focus', label: 'Focus Mode', icon: Focus, kbd: '⌘3' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2, kbd: '⌘4' },
      { to: '/dashboard/ai', label: 'AI Assistant', icon: Bot, kbd: '⌘5' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/profile', label: 'Profile', icon: User, kbd: '⌘6' },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings, kbd: '⌘7' },
    ],
  },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const xpInLevel = (user?.xp || 0) % 100

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-[#0B0F14] border-r border-[#1E293B] flex flex-col shrink-0 overflow-hidden relative z-20"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#1E293B] shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-100 text-sm whitespace-nowrap">SyncSpace</span>
              <span className="text-xs text-indigo-400 font-medium whitespace-nowrap">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center mx-auto">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-[#1F2937] text-gray-600 hover:text-gray-300 transition-all ml-auto"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="label-xs px-3 mb-1">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end, kbd }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active block' : 'nav-item block'
                  }
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="w-4 h-4 shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className="text-sm flex-1 whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && (
                      <span className="kbd text-[10px] opacity-0 group-hover:opacity-100">{kbd}</span>
                    )}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + XP */}
      <div className="border-t border-[#1E293B] p-2 shrink-0">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-3 py-2 mb-1"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Level {user?.level || 0}</span>
              <span className="text-xs text-indigo-400">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpInLevel}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-7 h-7 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center text-xs font-semibold text-gray-300 shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-gray-300 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 mt-1 rounded-lg hover:bg-[#1F2937] text-gray-600 hover:text-gray-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  )
}

export default Sidebar
