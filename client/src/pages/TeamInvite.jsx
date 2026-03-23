import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Shield, Send, Check, AlertCircle } from 'lucide-react'
import api from '../api/axios'

const ROLE_OPTIONS = [
  { label: 'Team Member', value: 'member' },
  { label: 'Admin', value: 'admin' },
]

const TeamInvite = () => {
  const [form, setForm] = useState({ email: '', role: 'member', projectName: 'SyncSpace AI' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    setSuccess(''); setError('')
    setLoading(true)
    try {
      await api.post('/invite', form)
      setSuccess(`Invitation sent to ${form.email}!`)
      setForm(f => ({ ...f, email: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-100 mb-1">Invite Team Members</h1>
        <p className="text-gray-400 text-sm">Send email invitations to collaborate on your project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Invite Form */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" /> Send Invitation
            </h2>

            {success && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm mb-4">
                <Check className="w-4 h-4 shrink-0" /> {success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name</label>
                <input type="text" value={form.projectName}
                  onChange={e => setForm({ ...form, projectName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-colors"
                  placeholder="My Project" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Teammate Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 outline-none transition-colors"
                    placeholder="teammate@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 outline-none appearance-none transition-colors">
                    {ROLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-[#1F2937]">{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 mt-2">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Invitation</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">How it works</h3>
            <ol className="space-y-3">
              {[
                { n: '1', text: 'Enter your teammate\'s email and assign a role.' },
                { n: '2', text: 'They receive a branded email with an accept link.' },
                { n: '3', text: 'Clicking "Accept" grants them access to the project.' },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Roles</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded">Admin</span>
                <span className="text-xs text-gray-500">Full project access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded">Member</span>
                <span className="text-xs text-gray-500">Task management only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamInvite
