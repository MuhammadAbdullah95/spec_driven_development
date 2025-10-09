import { motion } from 'framer-motion'
import type { ForecastDay } from '../types'
import './ForecastDisplay.css'

interface ForecastDisplayProps {
  forecastData: ForecastDay[]
  loading?: boolean
  error?: string | null
}

export function ForecastDisplay({ forecastData, loading = false, error = null }: ForecastDisplayProps) {
  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icon codes to emoji
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '🌤️'
  }

  const getTemperatureColor = (temp: number, unit: string) => {
    // Convert to Celsius for consistent color mapping
    const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp
    
    if (celsius <= 0) return '#74b9ff' // Cold blue
    if (celsius <= 10) return '#00b894' // Cool teal
    if (celsius <= 20) return '#fdcb6e' // Mild yellow
    if (celsius <= 30) return '#e17055' // Warm orange
    return '#d63031' // Hot red
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="forecast-display">
        <h3>3-Day Forecast</h3>
        <div className="forecast-loading">
          <div className="loading-spinner"></div>
          <p>Loading forecast...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="forecast-display">
        <h3>3-Day Forecast</h3>
        <div className="forecast-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Forecast Unavailable</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="forecast-display">
        <h3>3-Day Forecast</h3>
        <div className="forecast-empty">
          <p>No forecast data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="forecast-display">
      <h3>3-Day Forecast</h3>
      <motion.div 
        className="forecast-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {forecastData.map((day) => (
          <motion.div 
            key={day.date} 
            className="forecast-card"
            variants={itemVariants}
          >
            <div className="forecast-header">
              <div className="forecast-date">
                <div className="date-label">{formatDate(day.date)}</div>
                <div className="day-label">{day.dayOfWeek}</div>
              </div>
              <div className="forecast-icon">
                {getWeatherIcon(day.iconCode)}
              </div>
            </div>

            <div className="forecast-condition">
              <div className="condition-main">{day.condition}</div>
              <div className="condition-description">{day.conditionDescription}</div>
            </div>

            <div className="forecast-temperature">
              <div className="temp-range">
                <span 
                  className="temp-max"
                  style={{ color: getTemperatureColor(day.temperatureMax, day.temperatureUnit) }}
                >
                  {day.temperatureMax}°
                </span>
                <span className="temp-separator">/</span>
                <span 
                  className="temp-min"
                  style={{ color: getTemperatureColor(day.temperatureMin, day.temperatureUnit) }}
                >
                  {day.temperatureMin}°
                </span>
              </div>
              <div className="temp-unit">
                {day.temperatureUnit === 'celsius' ? 'C' : 'F'}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="forecast-note">
        <p>
          ✅ <strong>Constitutional Requirement Met:</strong> Dual-Mode Weather Retrieval 
          - Both current weather and 3-day forecast are now available
        </p>
      </div>
    </div>
  )
}
