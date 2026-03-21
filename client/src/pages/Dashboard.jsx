import { useWorkspace } from "../context/WorkspaceContext";
import { useState, useEffect } from 'react'
import axios from "axios";
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  CheckSquare, Clock, Zap, Users, TrendingUp,
  Bot, ListTodo, Activity
} from 'lucide-react'
import StatCard from '../components/StatCard'
import XPProgress from '../components/XPProgress'
import PageHeader from '../components/PageHeader'
import { getTaskStats } from '../api/tasks'
import { getTeamMembers, getAnalytics } from '../api/user'
import { getAIRecommendation } from '../api/ai'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts'
import { useNavigate } from 'react-router-dom'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="text-gray-200 font-medium">{payload[0].value} tasks</p>
      </div>
    )
  }
  return null
}

const Dashboard = () => {
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0 })
  const [team, setTeam] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [aiData, setAiData] = useState(null)

  useEffect(() => {
  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/workspaces",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.length > 0) {
        setActiveWorkspace(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  fetchWorkspaces();
}, []);

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [sRes, tRes, aRes] = await Promise.all([getTaskStats(), getTeamMembers(), getAnalytics()])
      setStats(sRes.data)
      setTeam(tRes.data)
      setAnalytics(aRes.data)
      try {
        const aiRes = await getAIRecommendation()
        setAiData(aiRes.data)
      } catch { /* optional */ }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]}`}
        description={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${stats.inProgress} tasks in progress`}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListTodo} label="To Do" value={stats.todo} color="text-gray-400" delay={0} />
        <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="text-blue-400" delay={0.05} />
        <StatCard icon={CheckSquare} label="Completed" value={stats.completed} color="text-green-400" delay={0.1} />
        <StatCard icon={Users} label="Team Members" value={team.length} color="text-indigo-400" delay={0.15} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-300">Weekly Activity</p>
              <p className="text-xs text-gray-600 mt-0.5">Tasks completed per day</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Activity className="w-3 h-3" />
              <span>Last 7 days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics?.weekly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.08)' }} />
              <Bar dataKey="completed" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-col gap-4"
        >
          <XPProgress xp={user?.xp || 0} level={user?.level || 0} />

          {/* Quick stats */}
          <div className="card p-5">
            <p className="text-xs font-medium text-gray-500 mb-3">Completion Rate</p>
            <div className="space-y-3">
              {[
                { label: 'Done', count: stats.completed, color: 'bg-green-500' },
                { label: 'Active', count: stats.inProgress, color: 'bg-blue-500' },
                { label: 'Queued', count: stats.todo, color: 'bg-gray-600' },
              ].map(({ label, count, color }) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600/20">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-300">AI Insight</p>
            </div>
            <button onClick={() => navigate('/dashboard/ai')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Open Assistant →
            </button>
          </div>

          {aiData ? (
            <div className="space-y-3">
              {aiData.recommendation && (
                <div className="p-3 bg-[#1F2937] rounded-xl border border-[#1E293B]">
                  <p className="text-xs text-gray-500 mb-1">Next task recommendation</p>
                  <p className="text-sm text-gray-200 font-medium">{aiData.recommendation.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-600 px-1.5 py-0.5 bg-[#0B0F14] rounded">
                      {aiData.recommendation.priority}
                    </span>
                    <span className="text-xs text-indigo-400">+{aiData.recommendation.xpReward} XP</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">{aiData.tip}</p>
            </div>
          ) : (
            <div className="py-6 text-center">
              <Bot className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Add tasks to get AI insights</p>
            </div>
          )}
        </motion.div>

        {/* Team leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Team Rankings</p>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </div>
          <div className="space-y-2">
            {team.slice(0, 5).map((member, idx) => (
              <div key={member._id} className="flex items-center gap-3 py-1.5">
                <span className={`text-xs font-mono w-4 shrink-0 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                  {idx + 1}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 font-medium truncate">{member.name}</p>
                  <p className="text-xs text-gray-600">Lv.{member.level} · {member.xp} XP</p>
                </div>
                {member._id === user?._id && (
                  <span className="text-xs px-1.5 py-0.5 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/20">you</span>
                )}
              </div>
            ))}
            {team.length === 0 && (
              <p className="text-center text-xs text-gray-600 py-6">No team data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
