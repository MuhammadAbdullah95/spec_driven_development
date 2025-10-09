import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getWeatherForecast } from '../api/weatherApi'
import { usePreferences } from '../contexts/PreferencesContext'
import { ForecastDisplay } from './ForecastDisplay'
import type { WeatherData, ForecastDay } from '../types'
import './WeatherDisplay.css'

interface WeatherDisplayProps {
  weatherData: WeatherData
}

export function WeatherDisplay({ weatherData }: WeatherDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [forecastData, setForecastData] = useState<ForecastDay[] | null>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)
  const { preferences } = usePreferences()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch forecast data when weather data changes
  useEffect(() => {
    const fetchForecast = async () => {
      if (!weatherData?.location) return

      try {
        setForecastLoading(true)
        setForecastError(null)

        const forecast = await getWeatherForecast(
          weatherData.location.latitude,
          weatherData.location.longitude,
          preferences.temperatureUnit
        )

        setForecastData(forecast.data)
      } catch (error: any) {
        console.error('Forecast fetch error:', error)
        
        // Graceful degradation with user-friendly messages
        let userMessage = 'Unable to load forecast data. Please try again later.'
        
        if (error.response?.status === 404) {
          userMessage = 'Forecast data not available for this location.'
        } else if (error.response?.status === 429) {
          userMessage = 'Too many requests. Forecast will be available shortly.'
        } else if (error.response?.status >= 500) {
          userMessage = 'Forecast service is temporarily unavailable.'
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          userMessage = 'Network connection issue. Check your internet connection.'
        }
        
        setForecastError(userMessage)
      } finally {
        setForecastLoading(false)
      }
    }

    fetchForecast()
  }, [weatherData?.location, preferences.temperatureUnit])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icon codes to emoji or you could use actual icons
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="weather-display"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Current Weather Card */}
      <motion.div className="current-weather-card" variants={itemVariants}>
        <div className="weather-header">
          <div className="location-info">
            <h2>{weatherData.location.name}</h2>
            {weatherData.location.country && (
              <span className="country">{weatherData.location.country}</span>
            )}
          </div>
          <div className="weather-icon">
            {getWeatherIcon(weatherData.iconCode)}
          </div>
        </div>

        <div className="temperature-section">
          <div 
            className="temperature"
            style={{ color: getTemperatureColor(weatherData.temperature, weatherData.temperatureUnit) }}
          >
            {Math.round(weatherData.temperature)}°
            <span className="unit">
              {weatherData.temperatureUnit === 'celsius' ? 'C' : 'F'}
            </span>
          </div>
          
          {weatherData.feelsLike && (
            <div className="feels-like">
              Feels like {Math.round(weatherData.feelsLike)}°
              {weatherData.temperatureUnit === 'celsius' ? 'C' : 'F'}
            </div>
          )}
        </div>

        <div className="weather-condition">
          <div className="condition-main">{weatherData.condition}</div>
          <div className="condition-description">{weatherData.conditionDescription}</div>
        </div>

        <div className="weather-details">
          <motion.div className="detail-item" variants={itemVariants}>
            <div className="detail-icon">💧</div>
            <div className="detail-content">
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{weatherData.humidity}%</div>
            </div>
          </motion.div>

          <motion.div className="detail-item" variants={itemVariants}>
            <div className="detail-icon">💨</div>
            <div className="detail-content">
              <div className="detail-label">Wind Speed</div>
              <div className="detail-value">
                {weatherData.windSpeed} {weatherData.windSpeedUnit}
              </div>
            </div>
          </motion.div>

          <motion.div className="detail-item" variants={itemVariants}>
            <div className="detail-icon">📍</div>
            <div className="detail-content">
              <div className="detail-label">Coordinates</div>
              <div className="detail-value">
                {weatherData.location.latitude.toFixed(2)}, {weatherData.location.longitude.toFixed(2)}
              </div>
            </div>
          </motion.div>

          <motion.div className="detail-item" variants={itemVariants}>
            <div className="detail-icon">🕒</div>
            <div className="detail-content">
              <div className="detail-label">Last Updated</div>
              <div className="detail-value">
                {formatTime(weatherData.timestamp)}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 3-Day Forecast - Constitutional Requirement */}
      <motion.div variants={itemVariants}>
        <ForecastDisplay 
          forecastData={forecastData || []}
          loading={forecastLoading}
          error={forecastError}
        />
      </motion.div>

      {/* Data Source Attribution */}
      <motion.div className="data-attribution" variants={itemVariants}>
        <p>
          Weather data provided by{' '}
          <a 
            href="https://openweathermap.org/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            OpenWeather API
          </a>
        </p>
        <p className="update-time">
          Current time: {currentTime.toLocaleTimeString()}
        </p>
      </motion.div>
    </motion.div>
  )
}
