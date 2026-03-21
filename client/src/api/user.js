import api from './axios'

export const getProfile    = ()     => api.get('/users/profile')
export const updateProfile = (data) => api.put('/users/profile', data)
export const getTeamMembers = ()    => api.get('/users/team')
export const getAnalytics  = ()     => api.get('/users/analytics')

export const uploadResume = (file) => {
  const form = new FormData()
  form.append('resume', file)
  return api.post('/users/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const deleteResume = () => api.delete('/users/resume')
