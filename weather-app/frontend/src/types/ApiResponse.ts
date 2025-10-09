export interface ApiResponse<T> {
  statusCode: number
  data: T | null
  error: string | null
  headers: Record<string, string>
  timestamp: number
  cached: boolean
}
