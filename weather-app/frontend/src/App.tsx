import { useState } from 'react'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { WeatherSearch } from './components/WeatherSearch'
import { WeatherDisplay } from './components/WeatherDisplay'
import { ErrorBoundary } from './components/ErrorBoundary'
import type { WeatherData, Location } from './types'
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleWeatherUpdate = (data: WeatherData) => {
    setWeatherData(data)
    setCurrentLocation(data.location)
    setError(null)
  }

  const handleLocationUpdate = (location: Location) => {
    setCurrentLocation(location)
  }

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <PreferencesProvider>
      <ErrorBoundary>
        <div className="app">
          <header className="app-header">
            <h1>Weather App</h1>
            <p>Get current weather and forecasts for any location</p>
          </header>

          <main className="app-main">
            <WeatherSearch
              onWeatherUpdate={handleWeatherUpdate}
              onLocationUpdate={handleLocationUpdate}
              onLoadingChange={handleLoadingChange}
              onError={handleError}
              currentLocation={currentLocation}
            />

            {error && (
              <div className="error-container">
                <div className="error-message">
                  <h3>⚠️ Something went wrong</h3>
                  <p>{error}</p>
                  <button onClick={clearError} className="error-dismiss">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading weather data...</p>
              </div>
            )}

            {weatherData && !loading && !error && (
              <WeatherDisplay weatherData={weatherData} />
            )}

            {!weatherData && !loading && !error && (
              <div className="welcome-message">
                <h2>Welcome to Weather App</h2>
                <p>Search for a city above to get started with current weather and forecasts.</p>
              </div>
            )}
          </main>

          <footer className="app-footer">
            <p>Weather data provided by OpenWeather API</p>
          </footer>
        </div>
      </ErrorBoundary>
    </PreferencesProvider>
  )
}

export default App
