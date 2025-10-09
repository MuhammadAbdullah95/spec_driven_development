import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import weatherRoutes from './routes/weather.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: Date.now(),
  })
})

// API routes
app.use('/api/weather', weatherRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
  })
})

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err)
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again',
    code: 'INTERNAL_ERROR',
  })
})

// Start server
const PORT = env.PORT
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`)
  console.log(`[Server] Environment: ${env.NODE_ENV}`)
})

export default app
