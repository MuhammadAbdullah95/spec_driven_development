import { AxiosError } from 'axios'

export interface ErrorResponse {
  success: false
  error: string
  code: string
  retryAfter?: number
}

/**
 * Maps API errors to user-friendly messages per contracts
 */
export function mapApiError(error: unknown): ErrorResponse {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    switch (status) {
      case 400:
        return {
          success: false,
          error: 'Invalid request. Please check your input and try again',
          code: 'INVALID_REQUEST',
        }
      case 401:
        return {
          success: false,
          error: 'Unable to connect to weather service',
          code: 'UNAUTHORIZED',
        }
      case 403:
        return {
          success: false,
          error: 'Access denied to weather service',
          code: 'FORBIDDEN',
        }
      case 404:
        return {
          success: false,
          error: 'Location not found. Please check your input and try again',
          code: 'LOCATION_NOT_FOUND',
        }
      case 429:
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 600, // 10 minutes
        }
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          success: false,
          error: 'Weather service temporarily unavailable. Please try again in a moment',
          code: 'SERVICE_UNAVAILABLE',
        }
      default:
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return {
            success: false,
            error: 'Request timed out. Please check your internet connection',
            code: 'TIMEOUT',
          }
        }
        if (error.message.includes('Network Error')) {
          return {
            success: false,
            error: 'Network error. Please check your internet connection',
            code: 'NETWORK_ERROR',
          }
        }
    }
  }

  // Generic error
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again',
    code: 'INTERNAL_ERROR',
  }
}
