import { motion } from 'framer-motion'

const XPProgress = ({ xp = 0, level = 0, compact = false }) => {
  const xpInLevel = xp % 100
  const toNext = 100 - xpInLevel

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#1E293B] flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-400">{level}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Level {level}</span>
            <span>{xpInLevel}/100</span>
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-300">XP Progress</p>
          <p className="text-xs text-gray-600 mt-0.5">{toNext} XP to Level {level + 1}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-indigo-400 leading-none">{level}</span>
            <span className="text-[9px] text-indigo-500/70 leading-none mt-0.5">LVL</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xpInLevel}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-indigo-500 rounded-full"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>{xpInLevel} XP</span>
        <span>100 XP</span>
      </div>
    </div>
  )
}

export default XPProgress
