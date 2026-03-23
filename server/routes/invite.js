const router = require('express').Router()
const { sendInvite, acceptInvite, rejectInvite, getInviteInfo } = require('../controllers/inviteController')
const { protect } = require('../middleware/auth')

router.get('/info',    getInviteInfo)         // public — for the accept-invite page
router.post('/',       protect, sendInvite)    // protected — only logged-in users can invite
router.post('/accept', acceptInvite)           // public — token validates identity
router.post('/reject', rejectInvite)           // public

module.exports = router
