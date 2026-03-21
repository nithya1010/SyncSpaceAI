import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Code2, Layout, Server, Database, Cloud,
  Cpu, Wrench, Users, Star, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useState } from 'react'

/* ── helpers ─────────────────────────────────────────────── */
const PROFICIENCY_COLOR = {
  Advanced:     'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
  Intermediate: 'bg-amber-500/10  text-amber-400  border-amber-500/30',
  Beginner:     'bg-gray-700/30   text-gray-400   border-gray-600/30',
}

const CATEGORY_META = {
  programming_languages: { label: 'Programming Languages', icon: Code2,   color: 'text-violet-400' },
  frontend:              { label: 'Frontend',               icon: Layout,  color: 'text-sky-400'    },
  backend:               { label: 'Backend',                icon: Server,  color: 'text-green-400'  },
  databases:             { label: 'Databases',              icon: Database,color: 'text-orange-400' },
  devops_cloud:          { label: 'DevOps & Cloud',         icon: Cloud,   color: 'text-cyan-400'   },
  ai_ml:                 { label: 'AI / ML',                icon: Cpu,     color: 'text-pink-400'   },
  tools_technologies:    { label: 'Tools & Technologies',   icon: Wrench,  color: 'text-yellow-400' },
  soft_skills:           { label: 'Soft Skills',            icon: Users,   color: 'text-rose-400'   },
}

const SkillPill = ({ name, proficiency }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${PROFICIENCY_COLOR[proficiency] || PROFICIENCY_COLOR.Beginner}`}>
    {name}
    {proficiency && <span className="opacity-60">· {proficiency}</span>}
  </span>
)

const SkillGroup = ({ catKey, skills }) => {
  const meta = CATEGORY_META[catKey]
  if (!meta || !skills || skills.length === 0) return null
  const Icon = meta.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={13} className={meta.color} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{meta.label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s, i) => (
          typeof s === 'string'
            ? <SkillPill key={i} name={s} />
            : <SkillPill key={i} name={s.name} proficiency={s.proficiency} />
        ))}
      </div>
    </div>
  )
}

/* ── confidence ring ──────────────────────────────────────── */
const ConfidenceRing = ({ score }) => {
  const pct    = Math.round(score * 100)
  const radius = 28
  const circ   = 2 * Math.PI * radius
  const dash   = circ * score

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" width="80" height="80">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1E293B" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius} fill="none"
          stroke="url(#conf-grad)" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="conf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-base font-bold text-white">{pct}%</span>
    </div>
  )
}

/* ── main component ───────────────────────────────────────── */
const ResumeAnalysis = ({ data, loading, error, onAnalyze, hasResume }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Brain size={15} className="text-indigo-400" />
            <p className="text-sm font-medium text-gray-300">AI Resume Intelligence</p>
          </div>
          <p className="text-xs text-gray-600">
            Analyzes your resume to extract skills, proficiency levels, and role suitability.
          </p>
        </div>

        {data && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors shrink-0"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Analyze button */}
      {!data && (
        <button
          onClick={onAnalyze}
          disabled={loading || !hasResume}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            !hasResume
              ? 'bg-gray-800/40 border-gray-700/30 text-gray-600 cursor-not-allowed'
              : loading
              ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 cursor-wait'
              : 'btn-primary border-transparent'
          }`}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Analyzing Resume…</>
          ) : (
            <><Brain size={14} /> {hasResume ? 'Analyze Resume with AI' : 'Upload a resume first'}</>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {data && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Role + Confidence */}
            <div className="flex items-center gap-4 mt-1 mb-5 p-4 rounded-xl bg-indigo-600/5 border border-indigo-500/10">
              <ConfidenceRing score={data.confidence_score} />
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Primary Role</p>
                <p className="text-sm font-semibold text-gray-200">{data.primary_role}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      size={10}
                      className={i <= Math.round(data.confidence_score * 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
                    />
                  ))}
                  <span className="text-[10px] text-gray-600 ml-1">confidence</span>
                </div>
              </div>
            </div>

            {/* Skill categories */}
            <div className="space-y-4">
              {Object.entries(data.skills || {}).map(([cat, skills]) => (
                <SkillGroup key={cat} catKey={cat} skills={skills} />
              ))}
            </div>

            {/* Re-analyze */}
            <button
              onClick={onAnalyze}
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 border border-[#1E293B] hover:border-indigo-500/20 transition-colors"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
              Re-analyze
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ResumeAnalysis
