const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['member', 'leader', 'admin'], default: 'member' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  tasksCompleted: { type: Number, default: 0 },
  githubUsername: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  resumeName: { type: String, default: '' },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

userSchema.methods.addXP = function (amount) {
  this.xp += amount
  this.level = Math.floor(this.xp / 100) + 1
}

module.exports = mongoose.model('User', userSchema)
