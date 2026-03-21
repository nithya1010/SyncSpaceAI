import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, CheckSquare, ChevronRight, Focus as FocusIcon, Coffee, Zap } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getTasks, updateTask } from '../api/tasks'

const MODES = [
  { label: 'Focus', duration: 25 * 60, color: 'text-indigo-400', icon: FocusIcon },
  { label: 'Short Break', duration: 5 * 60, color: 'text-green-400', icon: Coffee },
  { label: 'Long Break', duration: 15 * 60, color: 'text-blue-400', icon: Coffee },
]

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const Focus = () => {
  const [tasks, setTasks] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    setTimeLeft(MODES[modeIdx].duration)
    setRunning(false)
    clearInterval(intervalRef.current)
  }, [modeIdx])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (modeIdx === 0) setSessions(s => s + 1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx])

  const loadTasks = async () => {
    try {
      const res = await getTasks()
      const active = res.data.filter(t => t.status !== 'Completed')
      setTasks(active)
      if (active.length > 0) setActiveTask(active[0])
    } catch (e) { console.error(e) }
  }

  const reset = () => {
    setRunning(false)
    setTimeLeft(MODES[modeIdx].duration)
    clearInterval(intervalRef.current)
  }

  const completeTask = async () => {
    if (!activeTask) return
    try {
      await updateTask(activeTask._id, { status: 'Completed' })
      setTasks(prev => prev.filter(t => t._id !== activeTask._id))
      const remaining = tasks.filter(t => t._id !== activeTask._id)
      setActiveTask(remaining.length > 0 ? remaining[0] : null)
      window.location.reload()
    } catch (e) { console.error(e) }
  }

  const totalDuration = MODES[modeIdx].duration
  const pct = ((totalDuration - timeLeft) / totalDuration) * 100
  const mode = MODES[modeIdx]

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="Focus Mode" description="Deep work, distraction-free. One task at a time." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timer column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mode selector */}
          <div className="card p-1 flex gap-1">
            {MODES.map((m, i) => (
              <button
                key={m.label}
                onClick={() => setModeIdx(i)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${modeIdx === i ? 'bg-[#1F2937] text-gray-200' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timer */}
          <div className="card p-8 text-center">
            {/* Progress ring (SVG) */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1E293B" strokeWidth="4" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={modeIdx === 0 ? '#4F46E5' : modeIdx === 1 ? '#22C55E' : '#3B82F6'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <motion.span
                  key={timeLeft}
                  className={`text-4xl font-mono font-bold ${mode.color}`}
                >
                  {formatTime(timeLeft)}
                </motion.span>
                <span className="text-xs text-gray-600 mt-1">{mode.label}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="btn-secondary w-10 h-10 justify-center !px-0">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRunning(!running)}
                className="w-14 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-sm"
              >
                {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#1E293B] flex items-center justify-center">
                <span className="text-xs font-mono text-gray-400">{sessions}</span>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="card p-4">
            <p className="text-xs text-gray-600 mb-3">Session progress</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < sessions % 4 ? 'bg-indigo-500' : 'bg-[#1E293B]'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">{sessions} sessions completed · Every 4 sessions = long break</p>
          </div>
        </div>

        {/* Task focus column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active task */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">Now focusing on</p>
              {activeTask && (
                <button onClick={completeTask} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
                  <CheckSquare className="w-3.5 h-3.5" /> Done
                </button>
              )}
            </div>
            {activeTask ? (
              <div>
                <p className="text-sm font-medium text-gray-200 mb-2">{activeTask.title}</p>
                {activeTask.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{activeTask.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${activeTask.priority === 'High' ? 'priority-high' : activeTask.priority === 'Medium' ? 'priority-medium' : 'priority-low'} status-badge`}>
                    {activeTask.priority}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-indigo-400">
                    <Zap className="w-3 h-3" />
                    <span>+{activeTask.xpReward} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <FocusIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600">All tasks completed!</p>
              </div>
            )}
          </div>

          {/* Task queue */}
          <div className="card p-5">
            <p className="text-xs text-gray-500 font-medium mb-3">Queue ({tasks.length})</p>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {tasks.map((task, i) => (
                <button
                  key={task._id}
                  onClick={() => setActiveTask(task)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeTask?._id === task._id ? 'bg-indigo-600/20 border border-indigo-500/20' : 'hover:bg-[#1F2937]'}`}
                >
                  <span className="text-xs text-gray-600 w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-300 flex-1 truncate">{task.title}</span>
                  {activeTask?._id === task._id && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-3">No pending tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Focus
