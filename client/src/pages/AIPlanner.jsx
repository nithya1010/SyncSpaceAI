import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Target, Clock, Plus, Trash2, ArrowRight, Bot, Check, RotateCcw, User } from 'lucide-react';
import api from '../api/axios';

const AIPlanner = () => {
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Review
  
  const [project, setProject] = useState({
    projectName: '',
    projectDescription: '',
    deadline: '',
  });
  
  const [team, setTeam] = useState([{ name: '', skills: '', preferences: '' }]);
  const [revision, setRevision] = useState('');
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const addMember = () => setTeam([...team, { name: '', skills: '', preferences: '' }]);
  const removeMember = (idx) => setTeam(team.filter((_, i) => i !== idx));
  const updateMember = (idx, field, val) => {
    const newTeam = [...team];
    newTeam[idx][field] = val;
    setTeam(newTeam);
  };

  const handleGenerate = async () => {
    if (!project.projectName || !project.deadline || !team[0].name) {
      setError('Project name, deadline, and at least one team member are required.');
      return;
    }
    setError('');
    setLoading(true);
    setStep(2);
    
    try {
      const payload = {
        projectName: project.projectName,
        projectDescription: project.projectDescription + (revision ? `\n\nUSER REVISION FEEDBACK: ${revision}` : ''),
        deadline: project.deadline,
        teamMembers: team.filter(m => m.name.trim() !== '')
      };
      
      const res = await api.post('/planner', payload);
      setPlan(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F14] p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-100 mb-2">AI Project Planner</h1>
          <p className="text-gray-400 text-sm">Intelligently distribute tasks and timeline based on your team's skills.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col: Project Details */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5">
                    <h2 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400"/> Project Context</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Project Name</label>
                        <input type="text" value={project.projectName} onChange={e => setProject({...project, projectName: e.target.value})} className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none" placeholder="e.g. Website Redesign" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Deadline</label>
                        <input type="date" value={project.deadline} onChange={e => setProject({...project, deadline: e.target.value})} className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Description & Goals</label>
                        <textarea value={project.projectDescription} onChange={e => setProject({...project, projectDescription: e.target.value})} rows={4} className="w-full bg-[#1F2937]/50 border border-[#374151]/50 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none resize-none" placeholder="Describe the project scope..." />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Team Members */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-medium text-gray-200 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400"/> Team Configuration</h2>
                      <button onClick={addMember} className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                        <Plus className="w-3 h-3"/> Add Member
                      </button>
                    </div>

                    <div className="space-y-3">
                      {team.map((m, idx) => (
                        <div key={idx} className="bg-[#1F2937]/30 border border-[#374151]/50 rounded-xl p-4 relative group">
                          {team.length > 1 && (
                            <button onClick={() => removeMember(idx)} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 mb-1.5 block">Name</label>
                              <input type="text" value={m.name} onChange={e => updateMember(idx, 'name', e.target.value)} className="w-full bg-[#1F2937]/80 border border-[#374151]/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none" placeholder="Alice" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1.5 block">Skills / Resume keywords</label>
                              <input type="text" value={m.skills} onChange={e => updateMember(idx, 'skills', e.target.value)} className="w-full bg-[#1F2937]/80 border border-[#374151]/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none" placeholder="React, Node.js, UI/UX" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-gray-500 mb-1.5 block">Preferences (Optional)</label>
                              <input type="text" value={m.preferences} onChange={e => updateMember(idx, 'preferences', e.target.value)} className="w-full bg-[#1F2937]/80 border border-[#374151]/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none" placeholder="Prefers frontend tasks, unavailable on Fridays" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {revision && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                      <h2 className="text-sm font-medium text-amber-500 mb-2">Revision Instructions</h2>
                      <p className="text-xs text-amber-400/70 mb-3">You requested changes to the previous plan. The AI will incorporate these instructions.</p>
                      <textarea value={revision} onChange={e => setRevision(e.target.value)} rows={2} className="w-full bg-[#1F2937]/50 border border-amber-500/30 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-gray-200 outline-none resize-none" placeholder="e.g. Do not assign UI tasks to Bob..." />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-2.5 text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                      {revision ? 'Regenerate Plan' : 'Generate AI Plan'} <ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
              <h2 className="text-lg font-medium text-gray-200">AI is architecting your project...</h2>
              <p className="text-gray-500 text-sm mt-2">Analyzing skills, balancing workload, and estimating timelines.</p>
            </motion.div>
          )}

          {step === 3 && plan && (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{plan.project} Plan Generated</h2>
                    <p className="text-indigo-200/80 text-sm mb-4">{plan.message}</p>
                  </div>
                  <div className="bg-[#0B0F14]/50 backdrop-blur-md rounded-xl p-3 border border-white/5 text-center px-6">
                    <div className="text-2xl font-bold text-indigo-400">{plan.timeline?.totalDays || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Est. Days</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setPlan(null); setStep(1); setRevision(''); }} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Check className="w-4 h-4"/> Accept Plan
                  </button>
                  <button onClick={() => { setPlan(null); setStep(1); }} className="bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-gray-300 text-sm font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <RotateCcw className="w-4 h-4"/> Request Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline & Roles */}
                <div className="space-y-6">
                  {/* Phases */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5">
                    <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400"/> Delivery Phases</h3>
                    <div className="space-y-3">
                      {plan.timeline?.phases?.map(p => (
                        <div key={p.phase} className="flex items-center justify-between p-3 rounded-lg bg-[#1F2937]/30 border border-white/5">
                          <span className="text-sm text-gray-300">{p.phase}</span>
                          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{p.days} days</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5">
                    <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400"/> AI Role Assignments</h3>
                    <div className="space-y-3">
                      {plan.roles?.map(r => (
                        <div key={r.name} className="flex flex-col gap-1 p-3 rounded-lg bg-[#1F2937]/30 border border-white/5">
                          <span className="text-sm font-medium text-gray-200">{r.name}</span>
                          <span className="text-xs text-gray-500">{r.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-2">
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 h-full">
                    <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400"/> Auto-Generated Tasks</h3>
                    <div className="space-y-3">
                      {plan.tasks?.map((t, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#1F2937]/30 border border-[#374151]/50 hover:border-indigo-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-200">{t.task}</h4>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-[#0B0F14] px-2 py-1 rounded-md border border-white/5">{t.status}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#0B0F14]/50 px-2 py-1 rounded border border-white/5">
                              <User className="w-3 h-3"/> {t.assignedTo}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                              <Clock className="w-3 h-3"/> {t.estimatedTime} (Day {t.startDay}-{t.endDay})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIPlanner;
