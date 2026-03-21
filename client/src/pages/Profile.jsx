import { useState, useContext, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Github, Lock, CheckCircle, AlertCircle, Upload, FileText, Trash2 } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { updateProfile, uploadResume, deleteResume } from '../api/user'
import { analyzeResume } from '../api/ai'
import PageHeader from '../components/PageHeader'
import XPProgress from '../components/XPProgress'
import ResumeAnalysis from '../components/ResumeAnalysis'

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [form, setForm] = useState({
    name: user?.name || '',
    githubUsername: user?.githubUsername || '',
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [analysis,  setAnalysis]  = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisErr, setAnalysisErr] = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile(form)
      updateUser(res.data)
      showToast('Profile updated')
    } catch { showToast('Failed to update', false) }
    finally { setSaving(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return showToast('Passwords do not match', false)
    setSaving(true)
    try {
      await updateProfile({ password: pwForm.newPassword, currentPassword: pwForm.currentPassword })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password updated')
    } catch { showToast('Failed to update password', false) }
    finally { setSaving(false) }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeUploading(true)
    try {
      const res = await uploadResume(file)
      updateUser(res.data)
      showToast('Resume uploaded successfully')
    } catch (err) {
      showToast(err?.response?.data?.message || 'Upload failed', false)
    } finally {
      setResumeUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResumeDelete = async () => {
    if (!confirm('Remove your resume?')) return
    try {
      const res = await deleteResume()
      updateUser(res.data)
      setAnalysis(null)
      setAnalysisErr(null)
      showToast('Resume removed')
    } catch { showToast('Failed to remove resume', false) }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalysisErr(null)
    try {
      const res = await analyzeResume()
      setAnalysis(res.data)
    } catch (err) {
      setAnalysisErr(err?.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U'
  const roleColor = user?.role === 'admin' ? 'text-amber-400 bg-amber-400/10 border-amber-500/20'
    : user?.role === 'leader' ? 'text-indigo-400 bg-indigo-600/10 border-indigo-500/20'
    : 'text-gray-400 bg-gray-700/30 border-gray-600/20'

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Profile" description="Manage your account and personal details" />

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${
            toast.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {toast.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          className="card p-6 flex flex-col items-center text-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-indigo-400">{initial}</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-200">{user?.name}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{user?.email}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${roleColor}`}>
            {user?.role}
          </span>

          {/* Stats */}
          <div className="w-full space-y-2 pt-2 border-t border-[#1E293B]">
            {[
              { label: 'Tasks Completed', value: user?.tasksCompleted || 0 },
              { label: 'Current Level', value: user?.level || 0 },
              { label: 'Total XP', value: user?.xp || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-300 font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="w-full">
            <XPProgress compact={false} />
          </div>
        </motion.div>

        {/* Right forms */}
        <div className="md:col-span-2 space-y-4">
          {/* Personal info */}
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <p className="text-sm font-medium text-gray-300 mb-4">Personal Information</p>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="label-xs block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    className="input-field pl-8 w-full"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="label-xs block mb-1.5">GitHub Username</label>
                <div className="relative">
                  <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    className="input-field pl-8 w-full"
                    value={form.githubUsername}
                    onChange={e => setForm(p => ({ ...p, githubUsername: e.target.value }))}
                    placeholder="github_username"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            className="card p-6"
          >
            <p className="text-sm font-medium text-gray-300 mb-4">Change Password</p>
            <form onSubmit={savePassword} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label-xs block mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="password"
                      className="input-field pl-8 w-full"
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Resume Uploader */}
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <p className="text-sm font-medium text-gray-300 mb-1">Resume</p>
            <p className="text-xs text-gray-600 mb-4">Upload your CV / Resume (PDF or Word · max 5 MB)</p>

            {user?.resumeUrl ? (
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={16} className="text-indigo-400 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{user.resumeName || 'resume'}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`http://localhost:5000${user.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={handleResumeDelete}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove resume"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  resumeUploading
                    ? 'border-indigo-500/40 bg-indigo-600/5'
                    : 'border-[#1E293B] hover:border-indigo-500/40 hover:bg-indigo-600/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={resumeUploading}
                />
                {resumeUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-xs text-gray-500">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-gray-700">PDF, DOC, DOCX up to 5 MB</span>
                  </>
                )}
              </label>
            )}
          </motion.div>

          {/* AI Resume Intelligence */}
          <ResumeAnalysis
            data={analysis}
            loading={analyzing}
            error={analysisErr}
            onAnalyze={handleAnalyze}
            hasResume={!!user?.resumeUrl}
          />
        </div>
      </div>
    </div>
  )
}

export default Profile
