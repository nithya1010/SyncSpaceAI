const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
  email:      { type: String, required: true, lowercase: true, trim: true },
  projectId:  { type: String, default: null },
  role:       { type: String, enum: ['admin', 'member'], default: 'member' },
  status:     { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  token:      { type: String, required: true, unique: true },
  invitedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName:{ type: String, default: 'SyncSpace AI' },
}, { timestamps: true })

module.exports = mongoose.model('Invitation', invitationSchema)
