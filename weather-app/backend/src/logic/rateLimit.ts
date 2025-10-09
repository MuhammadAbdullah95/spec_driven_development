import rateLimit from 'express-rate-limit'

/**
 * Rate limiter for weather endpoints
 * 100 requests per 15 minutes per IP
 */
export const weatherRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment and try again',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900, // 15 minutes in seconds
    })
  },
})

/**
 * Rate limiter for geocoding endpoint
 * 50 requests per 15 minutes per IP
 */
export const geocodeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many geocoding requests. Please wait a moment and try again',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many geocoding requests. Please wait a moment and try again',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900,
    })
  },
})
