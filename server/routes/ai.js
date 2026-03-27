const router = require('express').Router()
const { getRecommendation, getGithubCommits, analyzeResume, generateProjectPlan, chatWithAI } = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.post('/recommend',       getRecommendation)
router.get('/github/:username', getGithubCommits)
router.post('/analyze-resume',  analyzeResume)
router.post('/planner',         generateProjectPlan)
router.post('/chat',            chatWithAI)

module.exports = router
