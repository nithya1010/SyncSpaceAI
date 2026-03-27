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

// ─────────────────────────────────────────────────────────────
// AI Project Planner Engine
// ─────────────────────────────────────────────────────────────
const PROJECT_PLANNER_PROMPT = `You are an AI-powered intelligent collaboration assistant inside a platform called SyncSpace AI.
Your goal is to help teams plan, organize, and execute projects efficiently with smart role assignment, task distribution, and time-based planning.

FEATURE REQUIREMENTS:
1. MULTI-PROJECT CONTEXT: Each project is independent. Roles, tasks, and timelines must be scoped to the given project only.
2. TIME ANALYSIS: Calculate total available time from current date to deadline. Divide into phases: Planning, Development, Testing, Deployment. Adjust based on available time.
3. ROLE ASSIGNMENT: Assign roles based on Skills (primary) and Preferences (override if specified). Example roles: Frontend Developer, Backend Developer, UI/UX Designer, AI Engineer, Tester, Project Manager.
4. TASK GENERATION: Break the project into clear modules: UI Design, API Development, Database Design, Authentication, Integration, Testing, Deployment.
5. TIME ESTIMATION: For each task, estimate duration. Ensure total workload fits within deadline. Parallelize tasks or reduce scope if time is limited.
6. TASK DISTRIBUTION: Assign tasks to members based on Skills, Preferences, and Workload balance.
7. SCHEDULING: Assign start and end time (day number) for each task. Maintain logical dependencies.
8. USER OVERRIDE & FLEXIBILITY: Respect user decisions over AI logic if provided in preferences.
9. TEAM COLLABORATION VISIBILITY: Output clear ownership of tasks.
10. PROGRESS TRACKING STRUCTURE: Each task must include status: "todo" | "in-progress" | "done".

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "project": "Project Name",
  "timeline": {
    "totalDays": 0,
    "phases": [
      { "phase": "Planning", "days": 0 },
      { "phase": "Development", "days": 0 },
      { "phase": "Testing", "days": 0 },
      { "phase": "Deployment", "days": 0 }
    ]
  },
  "roles": [
    { "name": "Member Name", "role": "Assigned Role" }
  ],
  "tasks": [
    {
      "task": "Task name",
      "assignedTo": "Member Name",
      "estimatedTime": "X days or hours",
      "startDay": 0,
      "endDay": 0,
      "status": "todo"
    }
  ],
  "message": "Is this plan okay or would you like to modify roles, tasks, or timeline?"
}

IMPORTANT RULES: 
- ALWAYS consider time constraints
- ALWAYS balance workload
- ALWAYS return structured JSON only (No markdown wrap, NO code blocks, raw JSON ONLY).
`

exports.generateProjectPlan = async (req, res) => {
  try {
    const { projectName, projectDescription, deadline, currentDate, teamMembers } = req.body

    if (!projectName || !deadline || !teamMembers) {
      return res.status(400).json({ message: 'Project name, deadline, and team members are required.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.status(503).json({ message: 'Groq API key not configured. Add GROQ_API_KEY to server/.env' })
    }

    const inputData = `
INPUT DETAILS:
Project Name: ${projectName}
Project Description: ${projectDescription || 'N/A'}
Deadline: ${deadline}
Current Date: ${currentDate || new Date().toISOString().split('T')[0]}

TEAM MEMBERS:
${JSON.stringify(teamMembers, null, 2)}
`

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a structured JSON output engine. Return only raw JSON, no markdown formatting blocks.' },
        { role: 'user',   content: PROJECT_PLANNER_PROMPT + '\\n' + inputData },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    })

    const raw = completion.choices[0].message.content.trim()
    const cleanOutput = raw.replace(/^\`\`\`json/m, '').replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim()
    
    let plan = JSON.parse(cleanOutput)
    res.json(plan)
  } catch (err) {
    console.error('Planner Error:', err)
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned invalid JSON plan. Please try again.' })
    }
    res.status(500).json({ message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────
// Interactive AI Chat Assistant
// ─────────────────────────────────────────────────────────────
exports.chatWithAI = async (req, res) => {
  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ message: 'Query is required.' })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return res.status(503).json({ message: 'Groq API key not configured.' })

    // Fetch user tasks for context
    const tasks = await Task.find({ $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] })
    const taskContext = tasks.map(t => `- [${t.status}] ${t.title} (Priority: ${t.priority})`).join('\n')

    const prompt = `You are a helpful AI productivity assistant for SyncSpace AI.
The user is asking you a question about their tasks, productivity, or collaboration.
Here is the user's current task list:\n${taskContext || 'No tasks yet.'}

User Question: ${query}

Keep your answer concise, helpful, and formatted simply. Limit to 2-3 paragraphs max. Do not use complex markdown that requires rendering, just plain text with simple bullet points if needed.`

    const openai = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an AI productivity assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    res.json({ reply: completion.choices[0].message.content.trim() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
