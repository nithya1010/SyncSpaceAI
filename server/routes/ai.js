const router = require('express').Router()
const { getRecommendation, getGithubCommits, analyzeResume } = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.post('/recommend',       getRecommendation)
router.get('/github/:username', getGithubCommits)
router.post('/analyze-resume',  analyzeResume)

module.exports = router
