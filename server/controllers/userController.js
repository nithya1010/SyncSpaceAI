const User = require('../models/User')
const Task = require('../models/Task')
const path = require('path')
const fs   = require('fs')

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.json(user)
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, githubUsername, password } = req.body
    const user = await User.findById(req.user._id)
    if (name) user.name = name
    if (githubUsername !== undefined) user.githubUsername = githubUsername
    if (password) user.password = password
    await user.save()
    const u = user.toObject()
    delete u.password
    res.json(u)
  } catch (err) { res.status(400).json({ message: err.message }) }
}

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const user = await User.findById(req.user._id)
    // Delete previous resume file if it exists
    if (user.resumeUrl) {
      const oldPath = path.join(__dirname, '..', user.resumeUrl)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    user.resumeUrl  = `/uploads/resumes/${req.file.filename}`
    user.resumeName = req.file.originalname
    await user.save()
    const u = user.toObject(); delete u.password
    res.json(u)
  } catch (err) { res.status(400).json({ message: err.message }) }
}

exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (user.resumeUrl) {
      const filePath = path.join(__dirname, '..', user.resumeUrl)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    user.resumeUrl  = ''
    user.resumeName = ''
    await user.save()
    const u = user.toObject(); delete u.password
    res.json(u)
  } catch (err) { res.status(400).json({ message: err.message }) }
}

exports.getTeamMembers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ xp: -1 }).limit(10)
    res.json(users)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    const tasks = await Task.find({ createdBy: req.user._id })
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'Completed').length

    // Build 7-day weekly data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = new Date()
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      const dayName = days[d.getDay()]
      const completed = tasks.filter(t => {
        if (t.status !== 'Completed') return false
        const updated = new Date(t.updatedAt)
        return updated.toDateString() === d.toDateString()
      }).length
      return { day: dayName, completed }
    })

    res.json({
      totalTasks, completedTasks,
      totalXP: user.xp, level: user.level,
      weekly,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
