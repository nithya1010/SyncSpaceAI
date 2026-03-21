import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, sub, trend, color = 'text-gray-400', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="card p-5 hover:border-[#334155] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-[#1F2937]">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default StatCard
