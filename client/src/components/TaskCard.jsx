import { motion } from 'framer-motion'
import { MoreHorizontal, Zap, Trash2, Edit2, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const PRIORITY_STYLES = {
  High: { dot: 'bg-red-500', text: 'priority-high' },
  Medium: { dot: 'bg-amber-500', text: 'priority-medium' },
  Low: { dot: 'bg-green-500', text: 'priority-low' },
}

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, view = 'kanban' }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -4 }}
        className="flex items-center gap-4 px-4 py-3 hover:bg-[#1F2937] transition-all duration-150 border-b border-[#1E293B] last:border-0 group"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-gray-300 ${task.status === 'Completed' ? 'line-through text-gray-600' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-600 truncate mt-0.5">{task.description}</p>
          )}
        </div>
        <span className={`status-badge text-xs ${p.text}`}>{task.priority}</span>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Zap className="w-3 h-3" />
          <span>{task.xpReward}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {task.status !== 'Completed' && (
            <button
              onClick={() => onStatusChange(task._id, task.status === 'To Do' ? 'In Progress' : 'Completed')}
              className="p-1.5 rounded-lg hover:bg-indigo-600/20 text-gray-600 hover:text-indigo-400 transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-[#374151] text-gray-600 hover:text-gray-300 transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      whileHover={{ y: -1 }}
      className="card p-4 cursor-grab active:cursor-grabbing hover:border-[#334155] transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${p.dot}`} />
          <p className={`text-sm font-medium text-gray-300 leading-snug ${task.status === 'Completed' ? 'line-through text-gray-600' : ''}`}>
            {task.title}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md hover:bg-[#374151] text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 card shadow-lg py-1 z-10">
              <button onClick={() => { onEdit(task); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]">
                <Edit2 className="w-3 h-3" /> Edit task
              </button>
              {task.status !== 'Completed' && (
                <button
                  onClick={() => { onStatusChange(task._id, task.status === 'To Do' ? 'In Progress' : 'Completed'); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]"
                >
                  <ArrowRight className="w-3 h-3" />
                  {task.status === 'To Do' ? 'Start' : 'Complete'}
                </button>
              )}
              <button onClick={() => { onDelete(task._id); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 ml-4 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between ml-4">
        <span className={`status-badge text-xs ${p.text}`}>{task.priority}</span>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Zap className="w-3 h-3" />
          <span>+{task.xpReward}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
