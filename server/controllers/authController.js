const User = require('../models/User')
const generateToken = require('../utils/generateToken')

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'User already exists' })
    const user = await User.create({ name, email, password, role })
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, xp: user.xp, level: user.level,
      tasksCompleted: user.tasksCompleted, githubUsername: user.githubUsername,
      token: generateToken(user._id),
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, xp: user.xp, level: user.level,
      tasksCompleted: user.tasksCompleted, githubUsername: user.githubUsername,
      token: generateToken(user._id),
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.json(user)
}
