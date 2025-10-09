import { useState, useCallback } from 'react'
import { getCurrentWeather, getCoordinatesFromCity } from '../api/weatherApi'
import { usePreferences } from '../contexts/PreferencesContext'
import type { WeatherData, Location } from '../types'
import './WeatherSearch.css'

interface WeatherSearchProps {
  onWeatherUpdate: (data: WeatherData) => void
  onLocationUpdate: (location: Location) => void
  onLoadingChange: (loading: boolean) => void
  onError: (error: string) => void
  currentLocation: Location | null
}

export function WeatherSearch({
  onWeatherUpdate,
  onLocationUpdate,
  onLoadingChange,
  onError,
  currentLocation
}: WeatherSearchProps) {
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState<'city' | 'coordinates'>('city')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { preferences, setTemperatureUnit } = usePreferences()

  // Input validation functions (Constitution Principle III)
  const validateCityName = (city: string): boolean => {
    if (!city || city.trim().length === 0) {
      setValidationError('City name cannot be empty')
      return false
    }
    
    if (city.trim().length < 2) {
      setValidationError('City name must be at least 2 characters long')
      return false
    }

    // Check for potentially harmful characters
    const sanitizedCity = city.replace(/[<>\"'&]/g, '')
    if (sanitizedCity !== city) {
      setValidationError('City name contains invalid characters')
      return false
    }

    setValidationError(null)
    return true
  }

  const validateCoordinates = (coordString: string): { lat: number; lon: number } | null => {
    const coords = coordString.split(',').map(s => s.trim())
    
    if (coords.length !== 2) {
      setValidationError('Coordinates must be in format: latitude, longitude')
      return null
    }

    const lat = parseFloat(coords[0])
    const lon = parseFloat(coords[1])

    if (isNaN(lat) || isNaN(lon)) {
      setValidationError('Coordinates must be valid numbers')
      return null
    }

    if (lat < -90 || lat > 90) {
      setValidationError('Latitude must be between -90 and 90 degrees')
      return null
    }

    if (lon < -180 || lon > 180) {
      setValidationError('Longitude must be between -180 and 180 degrees')
      return null
    }

    setValidationError(null)
    return { lat, lon }
  }

  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) {
      setValidationError('Please enter a search term')
      return
    }

    try {
      onLoadingChange(true)
      setValidationError(null)

      if (searchType === 'city') {
        // Validate city name before API call
        if (!validateCityName(searchInput.trim())) {
          onLoadingChange(false)
          return
        }

        // First get coordinates from city name
        const locationResult = await getCoordinatesFromCity(searchInput.trim())
        onLocationUpdate(locationResult.data)

        // Then get weather data
        const weatherResult = await getCurrentWeather(
          locationResult.data.latitude,
          locationResult.data.longitude,
          preferences.temperatureUnit
        )
        
        onWeatherUpdate(weatherResult.data)
      } else {
        // Validate coordinates before API call
        const coords = validateCoordinates(searchInput.trim())
        if (!coords) {
          onLoadingChange(false)
          return
        }

        // Get weather data directly from coordinates
        const weatherResult = await getCurrentWeather(
          coords.lat,
          coords.lon,
          preferences.temperatureUnit
        )
        
        onWeatherUpdate(weatherResult.data)
        onLocationUpdate(weatherResult.data.location)
      }
    } catch (error: any) {
      console.error('Weather search error:', error)
      
      // Graceful degradation with user-friendly messages (Constitution Principle V)
      let userMessage = 'Unable to fetch weather data. Please try again.'
      
      if (error.response?.status === 404) {
        userMessage = searchType === 'city' 
          ? 'Location not found. Please check the city name and try again.'
          : 'No weather data available for these coordinates.'
      } else if (error.response?.status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.response?.status >= 500) {
        userMessage = 'Weather service is temporarily unavailable. Please try again later.'
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        userMessage = 'Network connection issue. Please check your internet connection and try again.'
      }
      
      onError(userMessage)
    } finally {
      onLoadingChange(false)
    }
  }, [searchInput, searchType, preferences.temperatureUnit, onWeatherUpdate, onLocationUpdate, onLoadingChange, onError])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by your browser')
      return
    }

    onLoadingChange(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          const weatherResult = await getCurrentWeather(
            latitude,
            longitude,
            preferences.temperatureUnit
          )
          
          onWeatherUpdate(weatherResult.data)
          onLocationUpdate(weatherResult.data.location)
          setSearchInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          setSearchType('coordinates')
        } catch (error) {
          onError('Unable to fetch weather for your current location')
        } finally {
          onLoadingChange(false)
        }
      },
      (error) => {
        onLoadingChange(false)
        let message = 'Unable to get your current location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try searching by city name.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.'
            break
        }
        
        onError(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  return (
    <div className="weather-search">
      <div className="search-container">
        <div className="search-type-selector">
          <label className={`search-type-option ${searchType === 'city' ? 'active' : ''}`}>
            <input
              type="radio"
              value="city"
              checked={searchType === 'city'}
              onChange={(e) => setSearchType(e.target.value as 'city')}
            />
            <span>City Name</span>
          </label>
          <label className={`search-type-option ${searchType === 'coordinates' ? 'active' : ''}`}>
            <input
              type="radio"
              value="coordinates"
              checked={searchType === 'coordinates'}
              onChange={(e) => setSearchType(e.target.value as 'coordinates')}
            />
            <span>Coordinates</span>
          </label>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              searchType === 'city' 
                ? 'Enter city name (e.g., London, New York)' 
                : 'Enter coordinates (e.g., 40.7128, -74.0060)'
            }
            className={`search-input ${validationError ? 'error' : ''}`}
          />
          <button onClick={handleSearch} className="search-button">
            🔍 Search
          </button>
        </div>

        {validationError && (
          <div className="validation-error">
            {validationError}
          </div>
        )}

        <div className="search-actions">
          <button onClick={handleGetCurrentLocation} className="location-button">
            📍 Use Current Location
          </button>
          
          <div className="unit-selector">
            <label>Temperature Unit:</label>
            <select
              value={preferences.temperatureUnit}
              onChange={(e) => setTemperatureUnit(e.target.value as 'celsius' | 'fahrenheit')}
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>
        </div>

        {currentLocation && (
          <div className="current-location">
            <span>📍 {currentLocation.name}</span>
            {currentLocation.country && <span>, {currentLocation.country}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
