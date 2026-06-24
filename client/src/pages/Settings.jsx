import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Bell, Lock, Trash2, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-[#1E293B]'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
)

const Section = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card overflow-hidden"
  >
    <div className="px-5 py-3.5 border-b border-[#1E293B]">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</p>
    </div>
    <div className="divide-y divide-[#1E293B]">{children}</div>
  </motion.div>
)

const Row = ({ icon: Icon, label, description, children }) => (
  <div className="flex items-center justify-between px-5 py-4 gap-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={15} className="text-gray-600" />}
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
)

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
]

const Settings = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('syncspace_theme') || 'dark')
  const [compact, setCompact] = useState(() => (localStorage.getItem('syncspace_compact') === 'true'))
  const [notifs, setNotifs] = useState({ taskReminders: true, xpUpdates: true, teamActivity: false, weeklyDigest: true })
  const [privacy, setPrivacy] = useState({ showActivity: true, showXP: true })

  // Persist theme and compact sidebar preference
  useEffect(() => {
    try { localStorage.setItem('syncspace_theme', theme) } catch (e) {}
    // rudimentary theme application: add class to <html>
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('syncspace_compact', compact) } catch (e) {}
  }, [compact])

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <PageHeader title="Settings" description="Customize your SyncSpace experience" />

      {/* Appearance */}
      <Section title="Appearance" delay={0}>
        <Row icon={Monitor} label="Theme" description="Choose your preferred color scheme">
          <div className="flex gap-1.5">
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  theme === id
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-400'
                    : 'btn-ghost text-gray-500'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={Monitor} label="Compact Sidebar" description="Collapse sidebar by default">
          <Toggle checked={compact} onChange={v => setCompact(v)} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" delay={0.05}>
        {[
          { key: 'taskReminders', label: 'Task Reminders', description: 'Get reminded about due tasks' },
          { key: 'xpUpdates', label: 'XP & Level Updates', description: 'Notify on level up and XP milestones' },
          { key: 'teamActivity', label: 'Team Activity', description: 'Updates from your team members' },
          { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly productivity summary email' },
        ].map(({ key, label, description }) => (
          <Row key={key} icon={Bell} label={label} description={description}>
            <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
          </Row>
        ))}
      </Section>

      {/* Privacy */}
      <Section title="Privacy" delay={0.1}>
        <Row icon={Lock} label="Show Activity Status" description="Let teammates see when you're active">
          <Toggle checked={privacy.showActivity} onChange={v => setPrivacy(p => ({ ...p, showActivity: v }))} />
        </Row>
        <Row icon={Lock} label="Show XP on Leaderboard" description="Display your XP on team leaderboard">
          <Toggle checked={privacy.showXP} onChange={v => setPrivacy(p => ({ ...p, showXP: v }))} />
        </Row>
      </Section>

      {/* Account */}
      <Section title="Account" delay={0.15}>
        <Row icon={ChevronRight} label="Export Data" description="Download all your task and profile data">
          <button className="btn-secondary text-xs px-3 py-1.5">Export</button>
        </Row>
        <Row icon={Trash2} label="Delete Account" description="Permanently delete your account and data">
          <button className="btn-danger text-xs px-3 py-1.5 text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
            Delete
          </button>
        </Row>
      </Section>

      <p className="text-center text-xs text-gray-700 pb-4">SyncSpace AI · v1.0.0</p>
    </div>
  )
}

export default Settings
