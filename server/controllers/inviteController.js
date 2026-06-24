const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')
const Invitation = require('../models/Invitation')
const User = require('../models/User')

// Helper: create transporter only when credentials present
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

// POST /api/invite — send invitation email
exports.sendInvite = async (req, res) => {
  try {
    const { email, role = 'member', projectName = 'SyncSpace AI', projectId = null } = req.body

    if (!email) return res.status(400).json({ message: 'Email is required.' })

    // Check for existing pending invite
    const existing = await Invitation.findOne({ email: email.toLowerCase(), status: 'pending' })
    if (existing) return res.status(409).json({ message: 'An invitation is already pending for this email.' })

    // Generate unique token
    const token = uuidv4()

    // Save to DB
    const invitation = await Invitation.create({
      email,
      role,
      projectName,
      projectId,
      token,
      invitedBy: req.user._id,
    })

    // Build the accept link
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const acceptLink = `${clientUrl}/accept-invite?token=${token}`

    // Try to send email if transporter is available
    const transporter = createTransporter()
    if (transporter) {
      await transporter.sendMail({
        from: `"SyncSpace AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You've been invited to join "${projectName}" on SyncSpace AI`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#0B0F14;color:#E2E8F0;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);padding:32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#fff;">⚡ SyncSpace AI</h1>
              <p style="color:#a5b4fc;margin:8px 0 0;">Your collaborative workspace</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:16px;color:#e2e8f0;">Hi there 👋,</p>
              <p style="color:#94a3b8;line-height:1.6;"><strong style="color:#fff">${req.user.name}</strong> has invited you to collaborate on <strong style="color:#818cf8">&quot;${projectName}&quot;</strong> with the role of <strong style="color:#fff">${role}</strong>.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${acceptLink}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
                  Accept Invitation →
                </a>
              </div>
              <p style="color:#475569;font-size:12px;text-align:center;">If you didn't expect this email, you can safely ignore it.</p>
            </div>
          </div>
        `,
      })

      return res.json({ message: 'Invitation sent successfully!', inviteId: invitation._id })
    }

    // If email credentials are missing, return accept link so user can share manually
    console.warn('Email credentials not configured — skipping SMTP send. Provide EMAIL_USER and EMAIL_PASS to enable automated invitations.')
    return res.status(202).json({
      message: 'Invitation saved. Email not sent because SMTP credentials are not configured.',
      inviteId: invitation._id,
      acceptLink,
    })
  } catch (err) {
    console.error('sendInvite error:', err)
    res.status(500).json({ message: err.message })
  }
}

// POST /api/invite/accept
exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Token is required.' })

    const invite = await Invitation.findOne({ token })
    if (!invite) return res.status(404).json({ message: 'Invitation not found.' })
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `This invitation has already been ${invite.status}.` })
    }

    invite.status = 'accepted'
    await invite.save()

    res.json({
      message: 'Invitation accepted! You can now log in to access the project.',
      projectName: invite.projectName,
      role: invite.role,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/invite/reject
exports.rejectInvite = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Token is required.' })

    const invite = await Invitation.findOne({ token })
    if (!invite) return res.status(404).json({ message: 'Invitation not found.' })
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `This invitation has already been ${invite.status}.` })
    }

    invite.status = 'rejected'
    await invite.save()

    res.json({ message: 'Invitation declined.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/invite/info?token= — public info about invite (for the accept-invite page)
exports.getInviteInfo = async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ message: 'Token is required.' })

    const invite = await Invitation.findOne({ token }).populate('invitedBy', 'name email')
    if (!invite) return res.status(404).json({ message: 'Invalid or expired invitation.' })

    res.json({
      email: invite.email,
      role: invite.role,
      projectName: invite.projectName,
      status: invite.status,
      invitedBy: invite.invitedBy?.name || 'A team member',
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
