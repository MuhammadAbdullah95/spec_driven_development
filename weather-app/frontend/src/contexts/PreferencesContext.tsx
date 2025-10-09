import { createContext, useContext, useState, ReactNode } from 'react'
import { UserPreferences } from '../types'

interface PreferencesContextType {
  preferences: UserPreferences
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    temperatureUnit: 'celsius', // Default to Celsius
  })

  const setTemperatureUnit = (unit: 'celsius' | 'fahrenheit') => {
    setPreferences((prev) => ({
      ...prev,
      temperatureUnit: unit,
    }))
  }

  return (
    <PreferencesContext.Provider value={{ preferences, setTemperatureUnit }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
