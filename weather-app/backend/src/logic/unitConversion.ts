/**
 * Converts Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(temp: number): number {
  return (temp * 9) / 5 + 32
}

/**
 * Converts Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(temp: number): number {
  return ((temp - 32) * 5) / 9
}

/**
 * Maps user preference unit to OpenWeather API parameter
 * - 'celsius' -> 'metric'
 * - 'fahrenheit' -> 'imperial'
 */
export function getUnitParam(unit: string): 'metric' | 'imperial' {
  return unit === 'fahrenheit' ? 'imperial' : 'metric'
}
