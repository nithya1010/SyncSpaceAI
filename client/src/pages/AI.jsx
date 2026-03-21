import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap, Lightbulb, ListTodo, BarChart2, RefreshCw } from 'lucide-react'
import { getAIRecommendation } from '../api/ai'
import PageHeader from '../components/PageHeader'

const SUGGESTIONS = [
  { icon: Lightbulb, label: 'Suggest my next task' },
  { icon: ListTodo, label: 'Review my workload' },
  { icon: BarChart2, label: 'How is my productivity?' },
  { icon: Zap, label: 'What skills am I building?' },
]

const formatBotMsg = (text = '') =>
  text.split('\n').filter(Boolean).map((line, i) => (
    <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'pl-3 text-gray-400' : 'text-gray-300'}>
      {line}
    </p>
  ))

const AI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hi! I\'m your AI productivity assistant. I can analyze your tasks, suggest priorities, and help you stay focused. What would you like to know?',
      ts: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text: q, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await getAIRecommendation()
      const d = res.data
      let reply = ''
      if (d.recommendation) reply += d.recommendation + '\n\n'
      if (d.tip) reply += '💡 Tip: ' + d.tip
      if (!reply) reply = 'Your task data has been analyzed. Keep up the great work!'

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, ts: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: 'I couldn\'t connect to the AI service right now. Please try again.',
        ts: new Date(),
      }])
    } finally {
      setLoading(false) }
  }

  const clear = () => setMessages([{
    id: 1, role: 'bot',
    text: 'Conversation cleared. How can I help you today?',
    ts: new Date(),
  }])

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="AI Assistant"
        description="Smart productivity insights powered by your task data"
        actions={
          <button onClick={clear} className="btn-ghost flex items-center gap-1.5 text-xs">
            <RefreshCw size={13} /> Clear
          </button>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === 'bot' ? 'bg-indigo-600/20 border border-indigo-500/20' : 'bg-[#1F2937]'
              }`}>
                {msg.role === 'bot'
                  ? <Bot size={14} className="text-indigo-400" />
                  : <User size={14} className="text-gray-400" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed space-y-1 ${
                msg.role === 'user'
                  ? 'bg-indigo-600/20 border border-indigo-500/20 text-gray-200'
                  : 'bg-[#111827] border border-[#1E293B] text-gray-300'
              }`}>
                {msg.role === 'bot' ? formatBotMsg(msg.text) : <p>{msg.text}</p>}
                <p className="text-[10px] text-gray-600 pt-0.5">
                  {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-indigo-400" />
            </div>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 flex gap-1 items-center">
              {[0, 0.15, 0.3].map((d, i) => (
                <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: d, duration: 0.6 }}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 block" />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 pb-3">
          {SUGGESTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => send(label)}
              className="card card-hover flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              <Icon size={13} className="text-indigo-400 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="py-3 border-t border-[#1E293B]">
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="flex gap-2"
        >
          <input
            className="input-field flex-1 text-sm"
            placeholder="Ask anything about your tasks..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-3 py-2 disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AI
