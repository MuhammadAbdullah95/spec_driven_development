import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local (priority) or .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

interface Env {
  OPENWEATHER_API_KEY: string
  OPENWEATHER_BASE_URL: string
  PORT: number
  NODE_ENV: string
}

function validateEnv(): Env {
  const requiredVars = ['OPENWEATHER_API_KEY']

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }

  return {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY!,
    OPENWEATHER_BASE_URL: process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org',
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
  }
}

export const env = validateEnv()
