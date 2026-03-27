import api from './axios'

export const getAIRecommendation = () => api.post('/ai/recommend')
export const getGithubCommits    = (username) => api.get(`/ai/github/${username}`)
export const analyzeResume       = () => api.post('/ai/analyze-resume')
export const chatWithAI          = (query) => api.post('/ai/chat', { query })
