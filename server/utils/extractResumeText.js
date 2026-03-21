const fs      = require('fs')
const path    = require('path')
const _pdf    = require('pdf-parse')
const pdfParse = _pdf.default || _pdf
const mammoth  = require('mammoth')

/**
 * Extracts plain text from a resume file (PDF or Word).
 * @param {string} filePath  Absolute path to the file.
 * @returns {Promise<string>} Extracted text.
 */
async function extractResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const buffer = fs.readFileSync(filePath)

  if (ext === '.pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === '.doc' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

module.exports = extractResumeText
