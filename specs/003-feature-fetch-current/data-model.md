# Data Model: Weather Display Application

**Feature**: Weather Display Application
**Branch**: 003-feature-fetch-current
**Date**: 2025-10-09

## Overview

This document defines the data entities, their attributes, relationships, and validation rules for the weather display application. All entities are derived from functional requirements and designed to support the three-layer architecture (API/Logic/UI).

---

## Entities

### 1. Location

Represents a geographic location for weather queries.

**Attributes**:
- `name`: string - Human-readable location name (e.g., "London", "New York City")
- `latitude`: number - Latitude in decimal degrees (-90 to 90)
- `longitude`: number - Longitude in decimal degrees (-180 to 180)
- `country`: string (optional) - ISO 3166-1 alpha-2 country code (e.g., "GB", "US")

**Validation Rules**:
- `latitude`: Must be a number between -90 and 90 (inclusive)
- `longitude`: Must be a number between -180 and 180 (inclusive)
- `name`: Non-empty string, 1-100 characters, sanitized for special characters
- `country`: If provided, must be 2-character uppercase string

**Relationships**:
- One Location has one WeatherData (current conditions)
- One Location has many ForecastDay entries (forecast data)

**Source**: Derived from FR-001 (city names), FR-002 (coordinates), Key Entities

---

### 2. WeatherData

Represents current weather conditions for a specific location.

**Attributes**:
- `location`: Location - Reference to location entity
- `temperature`: number - Current temperature (value depends on unit)
- `temperatureUnit`: "celsius" | "fahrenheit" - Unit for temperature display
- `condition`: string - Weather condition description (e.g., "Clear", "Rainy", "Cloudy")
- `conditionDescription`: string - Detailed condition (e.g., "clear sky", "light rain")
- `humidity`: number - Humidity percentage (0-100)
- `windSpeed`: number - Wind speed (value depends on unit)
- `windSpeedUnit`: "m/s" | "mph" - Unit for wind speed
- `iconCode`: string - Weather icon identifier (e.g., "01d", "10n")
- `timestamp`: number - Unix timestamp (UTC) when data was fetched
- `feelsLike`: number (optional) - Perceived temperature

**Validation Rules**:
- `temperature`: Must be a number (range: -100 to 60 for Celsius, -148 to 140 for Fahrenheit)
- `humidity`: Must be a number between 0 and 100
- `windSpeed`: Must be a non-negative number
- `condition`: Non-empty string, max 50 characters
- `conditionDescription`: Non-empty string, max 200 characters
- `iconCode`: Non-empty string matching pattern `\d{2}[dn]` (e.g., "01d", "10n")
- `timestamp`: Must be a positive integer

**Derived Fields**:
- Temperature can be converted between Celsius and Fahrenheit using: `F = (C × 9/5) + 32` or `C = (F - 32) × 5/9`
- Wind speed conversion: 1 m/s = 2.237 mph

**Relationships**:
- Many-to-one with Location (multiple weather snapshots can exist for same location over time)

**Source**: Derived from FR-004 (display requirements), FR-005 (icon), Key Entities

---

### 3. ForecastDay

Represents a single day in the weather forecast.

**Attributes**:
- `location`: Location - Reference to location entity
- `date`: string - ISO 8601 date string (YYYY-MM-DD)
- `dayOfWeek`: string - Day name (e.g., "Monday", "Tuesday")
- `condition`: string - Weather condition description
- `conditionDescription`: string - Detailed condition description
- `iconCode`: string - Weather icon identifier
- `temperatureMin`: number - Minimum temperature for the day
- `temperatureMax`: number - Maximum temperature for the day
- `temperatureUnit`: "celsius" | "fahrenheit" - Unit for temperature display
- `timestamp`: number - Unix timestamp (UTC) for the forecast date

**Validation Rules**:
- `date`: Must be valid ISO 8601 date string, not in the past
- `dayOfWeek`: Must be one of: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
- `condition`: Non-empty string, max 50 characters
- `conditionDescription`: Non-empty string, max 200 characters
- `iconCode`: Non-empty string matching pattern `\d{2}[dn]`
- `temperatureMin`: Must be a number
- `temperatureMax`: Must be a number >= temperatureMin
- `timestamp`: Must be a positive integer

**Business Rules**:
- Forecast must include exactly 3 days (FR-006, FR-007)
- Days must be sequential starting from tomorrow
- `temperatureMax` must always be >= `temperatureMin`

**Relationships**:
- Many-to-one with Location (one location has multiple forecast days)

**Source**: Derived from FR-006, FR-007, Key Entities

---

### 4. SearchQuery

Represents a user's search input, subject to validation.

**Attributes**:
- `rawInput`: string - Unprocessed user input
- `queryType`: "city" | "coordinates" - Determined type of query
- `cityName`: string (optional) - Parsed city name (if queryType is "city")
- `latitude`: number (optional) - Parsed latitude (if queryType is "coordinates")
- `longitude`: number (optional) - Parsed longitude (if queryType is "coordinates")
- `isValid`: boolean - Validation result
- `errorMessage`: string | null - Error message if validation fails

**Validation Rules**:
- `rawInput`: Must be non-empty string after trimming whitespace
- If `queryType` is "city":
  - `cityName`: 1-100 characters, contains only letters, spaces, hyphens, apostrophes
- If `queryType` is "coordinates":
  - Must match pattern: `[-+]?\d+\.?\d*,\s*[-+]?\d+\.?\d*`
  - `latitude`: -90 to 90
  - `longitude`: -180 to 180

**Parsing Logic**:
1. Trim whitespace from `rawInput`
2. Check if input matches coordinate pattern (contains comma with numbers)
3. If matches: Parse as coordinates, validate ranges
4. If not: Treat as city name, sanitize special characters
5. Set `isValid` based on validation results
6. Populate `errorMessage` if validation fails

**Error Messages**:
- Empty input: "Please enter a city name or coordinates"
- Invalid city format: "Please enter a valid city name"
- Invalid coordinate format: "Invalid coordinates. Use format: latitude,longitude (e.g., 40.7128,-74.0060)"
- Latitude out of range: "Latitude must be between -90 and 90"
- Longitude out of range: "Longitude must be between -180 and 180"

**Relationships**:
- Independent entity (no direct relationships, used to create Location entities)

**Source**: Derived from FR-001, FR-002, FR-003, Edge Cases

---

### 5. UserPreferences

Represents user's session-based preferences.

**Attributes**:
- `temperatureUnit`: "celsius" | "fahrenheit" - Preferred temperature unit
- `defaultUnit`: "celsius" - Default unit on first load

**Validation Rules**:
- `temperatureUnit`: Must be either "celsius" or "fahrenheit"

**Business Rules**:
- Default to Celsius on first load (Assumption in spec)
- Persist within session (not across browser restarts)
- Apply to all displayed temperatures (current weather and forecast)

**State Management**:
- Stored in React Context for global access
- Updated via `setTemperatureUnit` function
- Triggers re-render of all temperature displays

**Relationships**:
- No direct relationships (global application state)

**Source**: Derived from FR-015, FR-017, FR-018, Assumptions

---

### 6. ApiResponse (Internal)

Represents the raw response from OpenWeather API (internal to API layer).

**Attributes**:
- `statusCode`: number - HTTP status code
- `data`: object | null - Parsed JSON response body
- `error`: string | null - Error message if request failed
- `headers`: object - Response headers
- `timestamp`: number - Unix timestamp when response was received
- `cached`: boolean - Whether data was served from cache

**Validation Rules**:
- `statusCode`: Must be a valid HTTP status code (100-599)
- If `statusCode` is 200-299: `data` must be non-null
- If `statusCode` is 400-599: `error` should be populated

**Error Mapping**:
- 401: "Unauthorized - API key invalid or missing"
- 403: "Forbidden - Access denied"
- 404: "Not Found - Invalid location"
- 429: "Too Many Requests - Rate limit exceeded"
- 500-599: "Server Error - Weather service temporarily unavailable"
- Timeout: "Request timeout - Please check your connection"

**Relationships**:
- Internal to API Layer (not exposed to UI Layer)
- Transformed into WeatherData or ForecastDay entities by Logic Layer

**Source**: Derived from FR-010, FR-016, Architecture Constraints

---

## Entity Relationships Diagram

```
┌─────────────────┐
│  SearchQuery    │──(validates)──┐
└─────────────────┘                │
                                   ▼
                            ┌─────────────┐
                            │  Location   │
                            └─────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                                 │
                  ▼                                 ▼
          ┌──────────────┐                ┌─────────────────┐
          │ WeatherData  │                │  ForecastDay    │
          └──────────────┘                │  (3 instances)  │
                  │                       └─────────────────┘
                  │
                  └──(temperature display controlled by)──┐
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ UserPreferences  │
                                                  └──────────────────┘
```

---

## Data Flow

### Search Flow
1. User enters input → **SearchQuery** created
2. **SearchQuery** validated → determines `queryType`
3. If city name → Geocoding API converts to coordinates
4. Coordinates used to create **Location** entity
5. **Location** used to fetch **WeatherData** + **ForecastDay[]**
6. Temperature values converted based on **UserPreferences.temperatureUnit**
7. Data rendered in UI Layer

### Temperature Unit Toggle Flow
1. User clicks unit toggle → **UserPreferences.temperatureUnit** updated
2. Context triggers re-render of all components displaying temperatures
3. Logic Layer converts all temperature values (WeatherData + ForecastDay[])
4. UI Layer displays updated values (<100ms per FR-018, SC-011)

### Caching Flow
1. API request checks cache using Location coordinates as key
2. If cached (< 10-15 min old) → Return **ApiResponse** with `cached: true`
3. If not cached → Fetch from OpenWeather API → Store in cache → Return
4. Cached data displayed with timestamp indicator (optional)

---

## State Transitions

### WeatherData State Machine
```
[Initial] → [Loading] → [Success] or [Error]
                ↓              ↑
            [Refreshing] ──────┘
                ↑
                └──── (user searches new location)
```

**States**:
- **Initial**: No data loaded
- **Loading**: Fetching data from API (first search)
- **Success**: Data successfully loaded and displayed
- **Error**: API request failed, error message shown
- **Refreshing**: Loading new data (subsequent searches)

**Transitions**:
- User submits search → Initial → Loading
- API success → Loading → Success
- API failure → Loading → Error
- User submits new search while in Success → Success → Refreshing
- Refreshing completes → Refreshing → Success or Error

---

## Validation Summary

| Entity | Critical Validations | Error Handling |
|--------|---------------------|----------------|
| Location | Latitude (-90,90), Longitude (-180,180) | Reject before API call, show inline error |
| WeatherData | Temperature range, humidity (0-100), valid icon code | Default to "N/A" for missing fields |
| ForecastDay | Date not in past, min ≤ max temp, 3 days exactly | Show error if forecast incomplete |
| SearchQuery | Non-empty, valid format (city or coords) | Inline validation, prevent submit |
| UserPreferences | Valid unit (celsius/fahrenheit) | Fallback to default "celsius" |
| ApiResponse | Valid HTTP status, error mapping | Transform to user-friendly messages |

---

## Performance Considerations

**Caching Strategy**:
- Cache key: `${latitude},${longitude}` (rounded to 2 decimal places)
- Cache duration: 10-15 minutes (aligns with OpenWeather update frequency)
- Cache invalidation: Automatic expiry (TTL-based)
- Cache storage: In-memory (node-cache for backend)

**Data Transformation**:
- Temperature conversions computed in Logic Layer (not stored redundantly)
- Icon URLs constructed on-demand from `iconCode`
- Timestamp formatting performed in UI Layer (locale-aware)

**Memory Footprint**:
- WeatherData: ~500 bytes per entry
- ForecastDay: ~300 bytes per entry × 3 = 900 bytes
- Total per location: ~1.4KB
- Cache capacity: 100 locations = ~140KB (well within limits)

---

## Type Definitions (TypeScript)

```typescript
// Location
interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

// WeatherData
interface WeatherData {
  location: Location;
  temperature: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  condition: string;
  conditionDescription: string;
  humidity: number;
  windSpeed: number;
  windSpeedUnit: 'm/s' | 'mph';
  iconCode: string;
  timestamp: number;
  feelsLike?: number;
}

// ForecastDay
interface ForecastDay {
  location: Location;
  date: string; // ISO 8601
  dayOfWeek: string;
  condition: string;
  conditionDescription: string;
  iconCode: string;
  temperatureMin: number;
  temperatureMax: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  timestamp: number;
}

// SearchQuery
interface SearchQuery {
  rawInput: string;
  queryType: 'city' | 'coordinates';
  cityName?: string;
  latitude?: number;
  longitude?: number;
  isValid: boolean;
  errorMessage: string | null;
}

// UserPreferences
interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
}

// ApiResponse
interface ApiResponse<T> {
  statusCode: number;
  data: T | null;
  error: string | null;
  headers: Record<string, string>;
  timestamp: number;
  cached: boolean;
}
```

---

## Next Steps

With data model defined, proceed to:
1. Create API contracts (contracts/weather-api.md)
2. Write quickstart guide (quickstart.md)
3. Update agent context with technology stack
