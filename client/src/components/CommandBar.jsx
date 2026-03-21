import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, LogOut, User, Settings, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

const PAGE_COMMANDS = [
  { label: 'Go to Dashboard', path: '/dashboard', kbd: '⌘1' },
  { label: 'Go to Tasks', path: '/dashboard/tasks', kbd: '⌘2' },
  { label: 'Go to Focus Mode', path: '/dashboard/focus', kbd: '⌘3' },
  { label: 'Go to Analytics', path: '/dashboard/analytics', kbd: '⌘4' },
  { label: 'Go to AI Assistant', path: '/dashboard/ai', kbd: '⌘5' },
  { label: 'Go to Profile', path: '/dashboard/profile', kbd: '⌘6' },
  { label: 'Go to Settings', path: '/dashboard/settings', kbd: '⌘7' },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/focus': 'Focus Mode',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/ai': 'AI Assistant',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
}

const CommandBar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)
  const profileRef = useRef(null)

  const pageTitle = pageTitles[location.pathname] || 'SyncSpace AI'

  const filtered = query.length > 0
    ? PAGE_COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : PAGE_COMMANDS

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setProfileOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (path) => {
    navigate(path)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <header className="h-14 bg-[#0B0F14] border-b border-[#1E293B] flex items-center px-4 gap-4 shrink-0 sticky top-0 z-10">
        {/* Breadcrumb title */}
        <div className="flex-shrink-0">
          <p className="text-sm font-medium text-gray-300">{pageTitle}</p>
        </div>

        <div className="flex-1" />

        {/* Search trigger */}
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B] text-gray-500 text-sm hover:border-[#334155] hover:text-gray-400 transition-all w-56"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left text-xs">Quick search...</span>
          <kbd className="kbd">⌘K</kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden p-2 rounded-lg hover:bg-[#1F2937] text-gray-500 hover:text-gray-300 transition-all"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#1F2937] text-gray-500 hover:text-gray-300 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1F2937] transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center text-xs font-semibold text-gray-300">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-gray-300 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">Lv.{user?.level}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 hidden md:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-48 card shadow-lg py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-[#1E293B]">
                  <p className="text-xs font-medium text-gray-300">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <button onClick={() => { navigate('/dashboard/profile'); setProfileOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1F2937] transition-all">
                  <User className="w-3.5 h-3.5" /> Profile
                </button>
                <button onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1F2937] transition-all">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <div className="border-t border-[#1E293B] mt-1 pt-1">
                  <button onClick={() => { logout(); navigate('/login') }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setQuery('') } }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setQuery('') }} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E293B]">
                <Search className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search pages, tasks, commands..."
                  className="flex-1 bg-transparent text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-600 hover:text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="kbd">ESC</kbd>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {filtered.length > 0 ? (
                  <>
                    <p className="label-xs px-4 py-2">Navigation</p>
                    {filtered.map(cmd => (
                      <button
                        key={cmd.path}
                        onClick={() => handleSelect(cmd.path)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-[#1F2937] transition-all"
                      >
                        <span>{cmd.label}</span>
                        <kbd className="kbd">{cmd.kbd}</kbd>
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-600 text-sm">No results found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CommandBar
