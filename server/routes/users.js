const path    = require('path')
const fs      = require('fs')
const router  = require('express').Router()
const multer  = require('multer')
const { getProfile, updateProfile, getTeamMembers, getAnalytics, uploadResume, deleteResume } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

// ─── Multer config ────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  },
})

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PDF and Word documents are allowed'))
  },
})
// ──────────────────────────────────────────────────────────────────

router.use(protect)
router.get('/profile',     getProfile)
router.put('/profile',     updateProfile)
router.get('/team',        getTeamMembers)
router.get('/analytics',   getAnalytics)
router.post('/resume',     upload.single('resume'), uploadResume)
router.delete('/resume',   deleteResume)

module.exports = router
