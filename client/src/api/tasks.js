import api from './axios'

export const getTasks = (workspaceId) => api.get(`/tasks/${workspaceId}`)
export const createTask = (workspaceId, data) => api.post(`/tasks/${workspaceId}`, data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const getTaskStats = () => api.get('/tasks/stats')
