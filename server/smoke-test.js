const axios = require('axios')
;(async () => {
  const base = 'http://localhost:5000/api'
  const email = 'test+syncspace@example.com'
  try {
    console.log('REGISTER:')
    let res
    try {
      res = await axios.post(`${base}/auth/register`, { name: 'Smoke Tester', email, password: 'password123' })
      console.log(JSON.stringify(res.data))
    } catch (err) {
      if (err.response) console.log('Register error:', err.response.data)
      else console.log('Register error:', err.message)
    }

    console.log('\nLOGIN:')
    const login = await axios.post(`${base}/auth/login`, { email, password: 'password123' })
    console.log(JSON.stringify(login.data))
    const token = login.data.token
    const headers = { Authorization: `Bearer ${token}` }

    console.log('\nCREATE WORKSPACE:')
    const ws = await axios.post(`${base}/workspaces`, { name: 'Smoke Workspace', description: 'Temp' }, { headers })
    console.log(JSON.stringify(ws.data))

    console.log('\nCREATE TASK:')
    const task = await axios.post(`${base}/tasks/${ws.data._id}`, { title: 'Smoke Task', description: 'Test', priority: 'High' }, { headers })
    console.log(JSON.stringify(task.data))

    console.log('\nGET TASKS:')
    const tasks = await axios.get(`${base}/tasks/${ws.data._id}`, { headers })
    console.log(JSON.stringify(tasks.data))

    console.log('\nAI RECOMMENDATION:')
    const rec = await axios.post(`${base}/ai/recommend`, {}, { headers })
    console.log(JSON.stringify(rec.data))

    console.log('\nSMOKE TEST COMPLETED')
  } catch (err) {
    console.error('Smoke test failed:', err.response ? err.response.data : err.message)
    process.exit(1)
  }
})()
