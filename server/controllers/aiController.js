const Task    = require('../models/Task')
const axios   = require('axios')
const path    = require('path')
const OpenAI  = require('openai')
const extractResumeText = require('../utils/extractResumeText')

exports.getRecommendation = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
    const todo = tasks.filter(t => t.status === 'To Do')
    const inProgress = tasks.filter(t => t.status === 'In Progress')
    const completed = tasks.filter(t => t.status === 'Completed')

    let recommendation = ''
    let tip = ''

    if (inProgress.length > 3) {
      recommendation = `You have ${inProgress.length} tasks in progress. Consider focusing on completing existing tasks before starting new ones.`
      tip = 'Limit WIP (Work In Progress) to 2-3 tasks for better focus.'
    } else if (todo.length === 0 && inProgress.length === 0) {
      recommendation = 'Great job! Your board is clear. Consider planning your next sprint or adding new goals.'
      tip = 'Regular planning sessions help maintain momentum.'
    } else {
      const highPriority = todo.filter(t => t.priority === 'High')
      if (highPriority.length > 0) {
        recommendation = `You have ${highPriority.length} high-priority task(s) pending. Start with "${highPriority[0].title}" to maximize impact.`
        tip = 'Tackle high-priority tasks during your peak energy hours.'
      } else if (todo.length > 0) {
        recommendation = `You have ${todo.length} task(s) to do and ${inProgress.length} in progress. Keep pushing forward!`
        tip = 'Breaking large tasks into smaller steps improves completion rates.'
      }
    }

    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

    res.json({
      recommendation,
      tip,
      completionRate,
      stats: { total: tasks.length, completed: completed.length, inProgress: inProgress.length, todo: todo.length }
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

exports.getGithubCommits = async (req, res) => {
  try {
    const { username } = req.params
    const { data } = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=10`, {
      headers: { 'User-Agent': 'SyncSpace-AI' }
    })
    const pushEvents = data
      .filter(e => e.type === 'PushEvent')
      .flatMap(e => e.payload.commits || [])
      .slice(0, 5)
      .map(c => ({ message: c.message, sha: c.sha.slice(0, 7) }))
    res.json(pushEvents)
  } catch (err) { res.status(500).json({ message: 'Could not fetch GitHub data' }) }
}

// ─────────────────────────────────────────────────────────────
// AI Resume Intelligence Engine
// ─────────────────────────────────────────────────────────────
const RESUME_PROMPT = `You are an AI Resume Intelligence Engine for an AI-driven team collaboration platform called SyncSpace AI.

Your task is to analyze the resume text provided below and extract structured skill intelligence for task allocation and skill modeling.

INSTRUCTIONS:
1. Extract only professional and technical information.
2. Ignore personal details (phone number, address, etc.).
3. Normalize skill names (e.g., "ReactJS" → "React", "Node js" → "Node.js").
4. Categorize skills into: programming_languages, frontend, backend, databases, devops_cloud, ai_ml, tools_technologies, soft_skills.
5. Estimate proficiency level for each technical skill (Beginner / Intermediate / Advanced) based on years of experience, number of projects, role, and context depth.
6. Identify primary role suitability: Frontend Developer, Backend Developer, Full Stack Developer, AI/ML Engineer, DevOps Engineer, UI/UX Designer, Data Analyst, or Other (specify).
7. Assign a confidence score (0–1) for overall expertise strength.

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown, no comments.

JSON FORMAT:
{
  "primary_role": "",
  "confidence_score": 0.0,
  "skills": {
    "programming_languages": [{"name": "", "proficiency": ""}],
    "frontend":              [{"name": "", "proficiency": ""}],
    "backend":               [{"name": "", "proficiency": ""}],
    "databases":             [{"name": "", "proficiency": ""}],
    "devops_cloud":          [{"name": "", "proficiency": ""}],
    "ai_ml":                 [{"name": "", "proficiency": ""}],
    "tools_technologies":    [{"name": "", "proficiency": ""}],
    "soft_skills":           []
  }
}

RESUME TEXT:
--------------------
`

exports.analyzeResume = async (req, res) => {
  try {
    const user = req.user

    if (!user.resumeUrl) {
      return res.status(400).json({ message: 'No resume uploaded. Please upload your resume first.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.status(503).json({ message: 'Groq API key not configured. Add GROQ_API_KEY to server/.env' })
    }

    // Extract text from saved file
    const filePath = path.join(__dirname, '..', user.resumeUrl)
    const resumeText = await extractResumeText(filePath)

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({ message: 'Could not extract meaningful text from the resume file.' })
    }

    // Call Groq via OpenAI-compatible SDK
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a structured JSON output engine. Return only raw JSON, no markdown.' },
        { role: 'user',   content: RESUME_PROMPT + resumeText },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    })

    const raw = completion.choices[0].message.content.trim()
    const analysis = JSON.parse(raw)
    res.json(analysis)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned invalid JSON. Please try again.' })
    }
    res.status(500).json({ message: err.message })
  }
}
