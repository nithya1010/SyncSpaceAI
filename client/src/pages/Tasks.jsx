import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'

const COLUMNS = ['To Do', 'In Progress', 'Completed']

const COL_CONFIG = {
  'To Do': { dot: 'bg-gray-500', count_bg: 'bg-gray-500/10 text-gray-400' },
  'In Progress': { dot: 'bg-blue-500', count_bg: 'bg-blue-500/10 text-blue-400' },
  'Completed': { dot: 'bg-green-500', count_bg: 'bg-green-500/10 text-green-400' },
}

const PRIORITIES = ['All', 'High', 'Medium', 'Low']
const STATUSES = ['All', 'To Do', 'In Progress', 'Completed']
const DEFAULT_FORM = { title: '', description: '', priority: 'Medium', status: 'To Do', xpReward: '' }

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [modal, setModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const res = await getTasks()
      setTasks(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = tasks.filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false
    if (filterStatus !== 'All' && t.status !== filterStatus) return false
    return true
  })

  const openCreate = (status = 'To Do') => {
    setEditTask(null)
    setForm({ ...DEFAULT_FORM, status })
    setModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({ title: task.title, description: task.description, priority: task.priority, status: task.status, xpReward: task.xpReward })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTask) {
        const res = await updateTask(editTask._id, form)
        setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t))
        if (editTask.status !== 'Completed' && form.status === 'Completed') window.location.reload()
      } else {
        const res = await createTask(form)
        setTasks(prev => [res.data, ...prev])
      }
      setModal(false)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await deleteTask(id)
    setTasks(tasks.filter(t => t._id !== id))
  }

  const handleStatusChange = async (id, status) => {
    const task = tasks.find(t => t._id === id)
    const wasCompleted = task?.status === 'Completed'
    const res = await updateTask(id, { status })
    setTasks(prev => prev.map(t => t._id === id ? res.data : t))
    if (!wasCompleted && status === 'Completed') window.location.reload()
  }

  const handleDrop = async (e, status) => {
    const id = e.dataTransfer.getData('taskId')
    setDragOver(null)
    if (!id) return
    const task = tasks.find(t => t._id === id)
    if (!task || task.status === status) return
    await handleStatusChange(id, status)
  }

  const getCol = (col) => filtered.filter(t => t.status === col)

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Tasks"
        description={`${tasks.length} total · ${tasks.filter(t => t.status === 'In Progress').length} active`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`btn-secondary gap-2 ${showFilter ? 'border-indigo-500/50 text-indigo-400' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="flex border border-[#1E293B] rounded-xl overflow-hidden">
              <button onClick={() => setView('kanban')} className={`p-2 transition-all ${view === 'kanban' ? 'bg-[#1F2937] text-gray-200' : 'text-gray-600 hover:text-gray-400 hover:bg-[#1F2937]/50'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')} className={`p-2 transition-all ${view === 'list' ? 'bg-[#1F2937] text-gray-200' : 'text-gray-600 hover:text-gray-400 hover:bg-[#1F2937]/50'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => openCreate()} className="btn-primary">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        }
      />

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="card p-4 flex flex-wrap gap-6">
              <div>
                <p className="label-xs mb-2">Priority</p>
                <div className="flex gap-1.5">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterPriority === p ? 'bg-indigo-600 text-white' : 'bg-[#1F2937] text-gray-400 hover:text-gray-200 border border-[#1E293B]'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-xs mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-[#1F2937] text-gray-400 hover:text-gray-200 border border-[#1E293B]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === 'kanban' ? (
        /* Kanban */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div
              key={col}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col)}
              className={`min-h-96 flex flex-col rounded-xl border transition-all duration-150 ${dragOver === col ? 'border-indigo-500/50 bg-indigo-600/5' : 'border-[#1E293B] bg-[#111827]/50'}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${COL_CONFIG[col].dot}`} />
                  <span className="text-sm font-medium text-gray-300">{col}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${COL_CONFIG[col].count_bg}`}>
                    {getCol(col).length}
                  </span>
                </div>
                <button
                  onClick={() => openCreate(col)}
                  className="p-1 rounded-lg hover:bg-[#1F2937] text-gray-600 hover:text-gray-300 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                <AnimatePresence>
                  {getCol(col).map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('taskId', task._id); setDraggingId(task._id) }}
                      onDragEnd={() => setDraggingId(null)}
                      className={draggingId === task._id ? 'opacity-40' : ''}
                    >
                      <TaskCard task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} view="kanban" />
                    </div>
                  ))}
                </AnimatePresence>
                {getCol(col).length === 0 && (
                  <div
                    onClick={() => openCreate(col)}
                    className="flex items-center justify-center h-24 border-2 border-dashed border-[#1E293B] rounded-xl text-gray-700 text-xs hover:border-indigo-500/30 hover:text-gray-500 transition-all cursor-pointer"
                  >
                    Drop task here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1E293B] bg-[#1F2937]/40">
            <div className="w-2" />
            <div className="flex-1 text-xs text-gray-600 font-medium">Task</div>
            <div className="w-20 text-xs text-gray-600 font-medium text-right hidden sm:block">Priority</div>
            <div className="w-16 text-xs text-gray-600 font-medium text-right">XP</div>
            <div className="w-20 text-xs text-gray-600 font-medium text-right hidden md:block">Actions</div>
          </div>
          <div>
            <AnimatePresence>
              {filtered.map(task => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} view="list" />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600 text-sm">
                No tasks found. <button onClick={() => openCreate()} className="text-indigo-400 hover:text-indigo-300">Create one</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editTask ? 'Edit task' : 'New task'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Task title" className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field appearance-none">
                <option value="Low" className="bg-[#111827]">Low</option>
                <option value="Medium" className="bg-[#111827]">Medium</option>
                <option value="High" className="bg-[#111827]">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field appearance-none">
                <option value="To Do" className="bg-[#111827]">To Do</option>
                <option value="In Progress" className="bg-[#111827]">In Progress</option>
                <option value="Completed" className="bg-[#111827]">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">XP</label>
              <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: e.target.value })} placeholder="Auto" className="input-field" min="1" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editTask ? 'Update' : 'Create task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tasks
