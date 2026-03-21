import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckSquare, Users, BarChart2, Brain, Timer, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: CheckSquare, label: 'Task Kanban', desc: 'Manage work with drag-and-drop columns and priority tracking.' },
  { icon: Timer, label: 'Focus Mode', desc: 'Pomodoro timer with task queue to keep you in deep work.' },
  { icon: Brain, label: 'AI Assistant', desc: 'Smart recommendations based on your task patterns and progress.' },
  { icon: BarChart2, label: 'Analytics', desc: 'Weekly insights, XP growth charts, and completion metrics.' },
  { icon: Users, label: 'Team View', desc: 'Collaborate with teammates and track collective progress.' },
  { icon: Zap, label: 'XP & Levels', desc: 'Earn experience points for completed tasks and level up.' },
]

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-gray-300">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-8 border-b border-[#1E293B] bg-[#0B0F14]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-sm font-semibold text-gray-200">SyncSpace AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost text-sm px-3 py-1.5">Log in</Link>
          <Link to="/register" className="btn-primary text-sm px-3 py-1.5">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30 bg-indigo-600/10 text-indigo-400 mb-6">
            <Zap size={11} />
            Productivity OS for high-performance teams
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100 leading-tight tracking-tight mb-5">
            Work smarter.<br />
            <span className="text-indigo-400">Ship faster.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            SyncSpace AI combines task management, focus tools, and AI-powered insights into one calm, structured workspace.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
              Start for free <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-secondary px-5 py-2.5 text-sm">Sign in</Link>
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-24 max-w-4xl w-full text-left"
        >
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="card p-5 hover:border-indigo-500/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Icon size={16} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-gray-200 mb-1">{label}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#1E293B] text-xs text-gray-700">
        © {new Date().getFullYear()} SyncSpace AI · Built for productive teams
      </footer>
    </div>
  )
}

export default LandingPage
