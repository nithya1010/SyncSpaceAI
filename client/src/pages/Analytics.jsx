import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts'
import { getAnalytics } from '../api/user'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { CheckSquare, Zap, TrendingUp, Activity } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const res = await getAnalytics()
      setData(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completionRate = data?.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0

  const xpWeekly = data?.weekly?.map((d, i) => ({
    ...d,
    xp: d.completed * 25,
    cumulative: data.weekly.slice(0, i + 1).reduce((s, w) => s + w.completed * 25, 0),
  })) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Productivity insights and performance metrics"
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Completed" value={data?.completedTasks || 0} color="text-green-400" delay={0} />
        <StatCard icon={Activity} label="Total Tasks" value={data?.totalTasks || 0} color="text-blue-400" delay={0.05} />
        <StatCard icon={Zap} label="Total XP" value={data?.totalXP || 0} color="text-indigo-400" delay={0.1} />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} color="text-amber-400" delay={0.15} />
      </div>

      {/* Charts 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <p className="text-sm font-medium text-gray-300 mb-1">Tasks Completed</p>
          <p className="text-xs text-gray-600 mb-4">Per day over the last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.weekly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.06)' }} />
              <Bar dataKey="completed" name="Tasks" fill="#4F46E5" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <p className="text-sm font-medium text-gray-300 mb-1">XP Earned</p>
          <p className="text-xs text-gray-600 mb-4">Experience points per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={xpWeekly}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="xp" name="XP" stroke="#4F46E5" strokeWidth={2} fill="url(#xpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Cumulative XP */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <p className="text-sm font-medium text-gray-300 mb-1">Cumulative Growth</p>
        <p className="text-xs text-gray-600 mb-4">Total XP accumulated over time</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={xpWeekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="cumulative" name="Cum. XP" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Progress bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <p className="text-sm font-medium text-gray-300 mb-4">Task Completion</p>
          <div className="space-y-4">
            {[
              { label: 'Completed', value: data?.completedTasks || 0, total: data?.totalTasks || 0, color: 'bg-green-500' },
              { label: 'In Progress', value: (data?.totalTasks || 0) - (data?.completedTasks || 0), total: data?.totalTasks || 0, color: 'bg-blue-500' },
            ].map(({ label, value, total, color }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <p className="text-sm font-medium text-gray-300 mb-4">Level Progress</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-400">{data?.level || 0}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Level {data?.level || 0}</p>
              <p className="text-xs text-gray-600">{data?.totalXP || 0} total XP</p>
            </div>
          </div>
          <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(data?.totalXP || 0) % 100}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{(data?.totalXP || 0) % 100} XP</span>
            <span>{100 - ((data?.totalXP || 0) % 100)} to Level {(data?.level || 0) + 1}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics
