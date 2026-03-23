import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Check, X, Loader2, AlertCircle, PartyPopper } from 'lucide-react'
import api from '../api/axios'

const AcceptInvite = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [info, setInfo] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | success-accept | success-reject | error
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link. No token found.')
      return
    }
    api.get(`/invite/info?token=${token}`)
      .then(res => {
        setInfo(res.data)
        if (res.data.status !== 'pending') {
          setStatus('error')
          setMessage(`This invitation has already been ${res.data.status}.`)
        } else {
          setStatus('ready')
        }
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Invalid or expired invitation.')
      })
  }, [token])

  const handleAction = async (action) => {
    setProcessing(true)
    try {
      const endpoint = action === 'accept' ? '/invite/accept' : '/invite/reject'
      const res = await api.post(endpoint, { token })
      setMessage(res.data.message)
      setStatus(action === 'accept' ? 'success-accept' : 'success-reject')
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1060, #0B0F14)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">SyncSpace <span className="text-indigo-400">AI</span></span>
        </div>

        <div className="glass-card p-8 text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Loading your invitation...</p>
            </div>
          )}

          {status === 'ready' && info && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">🎉</span>
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">You're Invited!</h1>
              <p className="text-gray-400 text-sm mb-1">
                <strong className="text-white">{info.invitedBy}</strong> invited you to join
              </p>
              <p className="text-indigo-300 font-semibold text-lg mb-1">&ldquo;{info.projectName}&rdquo;</p>
              <p className="text-gray-500 text-xs mb-6">
                as <span className="text-indigo-400 font-medium capitalize">{info.role}</span> · {info.email}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('reject')}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-gray-300 hover:text-red-400 text-sm font-medium transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
                <button
                  onClick={() => handleAction('accept')}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {processing
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Check className="w-4 h-4" /> Accept</>
                  }
                </button>
              </div>
            </>
          )}

          {status === 'success-accept' && (
            <div className="py-4">
              <PartyPopper className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Welcome aboard! 🎉</h2>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium">
                Go to Login →
              </button>
            </div>
          )}

          {status === 'success-reject' && (
            <div className="py-4">
              <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-gray-500" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Invitation Declined</h2>
              <p className="text-gray-400 text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Invalid Invitation</h2>
              <p className="text-gray-400 text-sm">{message}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AcceptInvite
