# API Contracts: Weather Display Application

**Feature**: Weather Display Application
**Branch**: 003-feature-fetch-current
**Date**: 2025-10-09

## Overview

This document defines the API contracts for the weather display application, including internal backend endpoints and external OpenWeather API integration patterns.

---

## Internal API Endpoints (Backend → Frontend)

### 1. GET /api/weather/current

Fetch current weather conditions for a location.

**Request**:
```http
GET /api/weather/current?lat={latitude}&lon={longitude}&units={metric|imperial}
```

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `lat` | number | Yes | Latitude (-90 to 90) | `51.5074` |
| `lon` | number | Yes | Longitude (-180 to 180) | `-0.1278` |
| `units` | string | Yes | Temperature unit system | `metric` or `imperial` |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "London",
      "latitude": 51.5074,
      "longitude": -0.1278,
      "country": "GB"
    },
    "temperature": 15.5,
    "temperatureUnit": "celsius",
    "condition": "Clear",
    "conditionDescription": "clear sky",
    "humidity": 72,
    "windSpeed": 3.5,
    "windSpeedUnit": "m/s",
    "iconCode": "01d",
    "timestamp": 1696876800,
    "feelsLike": 14.2
  },
  "cached": false,
  "timestamp": 1696876800
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid coordinates. Latitude must be between -90 and 90",
  "code": "INVALID_COORDINATES"
}
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Location not found. Please check your coordinates and try again",
  "code": "LOCATION_NOT_FOUND"
}
```

**Response (429 Too Many Requests)**:
```json
{
  "success": false,
  "error": "Too many requests. Please wait a moment and try again",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 600
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Weather service temporarily unavailable. Please try again in a moment",
  "code": "SERVICE_UNAVAILABLE"
}
```

**Response (504 Gateway Timeout)**:
```json
{
  "success": false,
  "error": "Request timed out. Please check your internet connection",
  "code": "TIMEOUT"
}
```

---

### 2. GET /api/weather/forecast

Fetch 3-day weather forecast for a location.

**Request**:
```http
GET /api/weather/forecast?lat={latitude}&lon={longitude}&units={metric|imperial}&days=3
```

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `lat` | number | Yes | Latitude (-90 to 90) | `40.7128` |
| `lon` | number | Yes | Longitude (-180 to 180) | `-74.0060` |
| `units` | string | Yes | Temperature unit system | `metric` or `imperial` |
| `days` | number | Yes | Number of forecast days (fixed at 3) | `3` |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "country": "US"
    },
    "forecast": [
      {
        "date": "2025-10-10",
        "dayOfWeek": "Thursday",
        "condition": "Rain",
        "conditionDescription": "light rain",
        "iconCode": "10d",
        "temperatureMin": 12.3,
        "temperatureMax": 18.7,
        "temperatureUnit": "celsius",
        "timestamp": 1696963200
      },
      {
        "date": "2025-10-11",
        "dayOfWeek": "Friday",
        "condition": "Clouds",
        "conditionDescription": "few clouds",
        "iconCode": "02d",
        "temperatureMin": 10.1,
        "temperatureMax": 16.4,
        "temperatureUnit": "celsius",
        "timestamp": 1697049600
      },
      {
        "date": "2025-10-12",
        "dayOfWeek": "Saturday",
        "condition": "Clear",
        "conditionDescription": "clear sky",
        "iconCode": "01d",
        "temperatureMin": 8.9,
        "temperatureMax": 15.2,
        "temperatureUnit": "celsius",
        "timestamp": 1697136000
      }
    ]
  },
  "cached": false,
  "timestamp": 1696876800
}
```

**Response (400 Bad Request)**: Same structure as `/api/weather/current`

**Response (404/429/500/504)**: Same structure as `/api/weather/current`

---

### 3. GET /api/geocode

Convert city name to coordinates using OpenWeather Geocoding API.

**Request**:
```http
GET /api/geocode?city={cityName}&limit=5
```

**Query Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `city` | string | Yes | City name to geocode | `London` |
| `limit` | number | No | Max results (default: 5) | `5` |

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "name": "London",
      "latitude": 51.5074,
      "longitude": -0.1278,
      "country": "GB",
      "state": "England"
    },
    {
      "name": "London",
      "latitude": 42.9834,
      "longitude": -81.2331,
      "country": "CA",
      "state": "Ontario"
    }
  ]
}
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "City not found. Please check the spelling and try again",
  "code": "CITY_NOT_FOUND"
}
```

---

## External API Integration (Backend → OpenWeather)

### 1. OpenWeather Current Weather API

**Endpoint**: `https://api.openweathermap.org/data/2.5/weather`

**Request**:
```http
GET https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid={API_KEY}&units=metric
```

**Headers**:
- None required (API key in query parameter)

**Response (200 OK)**:
```json
{
  "coord": {
    "lon": -0.1278,
    "lat": 51.5074
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "temp_min": 13.0,
    "temp_max": 17.0,
    "pressure": 1013,
    "humidity": 72
  },
  "visibility": 10000,
  "wind": {
    "speed": 3.5,
    "deg": 180
  },
  "clouds": {
    "all": 20
  },
  "dt": 1696876800,
  "sys": {
    "type": 1,
    "id": 1414,
    "country": "GB",
    "sunrise": 1696834923,
    "sunset": 1696875456
  },
  "timezone": 0,
  "id": 2643743,
  "name": "London",
  "cod": 200
}
```

**Field Mapping to WeatherData**:
| OpenWeather Field | Internal Field | Transformation |
|-------------------|----------------|----------------|
| `name` | `location.name` | Direct |
| `coord.lat` | `location.latitude` | Direct |
| `coord.lon` | `location.longitude` | Direct |
| `sys.country` | `location.country` | Direct |
| `main.temp` | `temperature` | Direct (unit already specified in request) |
| `weather[0].main` | `condition` | Direct |
| `weather[0].description` | `conditionDescription` | Direct |
| `main.humidity` | `humidity` | Direct |
| `wind.speed` | `windSpeed` | Direct |
| `weather[0].icon` | `iconCode` | Direct |
| `dt` | `timestamp` | Direct (Unix timestamp) |
| `main.feels_like` | `feelsLike` | Direct |

---

### 2. OpenWeather One Call API 3.0 (Forecast)

**Endpoint**: `https://api.openweathermap.org/data/3.0/onecall`

**Request**:
```http
GET https://api.openweathermap.org/data/3.0/onecall?lat=40.7128&lon=-74.0060&appid={API_KEY}&units=metric&exclude=minutely,hourly,alerts
```

**Query Parameters**:
| Parameter | Value | Description |
|-----------|-------|-------------|
| `lat` | number | Latitude |
| `lon` | number | Longitude |
| `appid` | string | API key |
| `units` | metric/imperial | Temperature unit |
| `exclude` | minutely,hourly,alerts | Exclude unnecessary data |

**Response (200 OK)** (relevant fields only):
```json
{
  "lat": 40.7128,
  "lon": -74.0060,
  "timezone": "America/New_York",
  "timezone_offset": -14400,
  "daily": [
    {
      "dt": 1696963200,
      "temp": {
        "min": 12.3,
        "max": 18.7
      },
      "weather": [
        {
          "id": 500,
          "main": "Rain",
          "description": "light rain",
          "icon": "10d"
        }
      ]
    },
    {
      "dt": 1697049600,
      "temp": {
        "min": 10.1,
        "max": 16.4
      },
      "weather": [
        {
          "id": 801,
          "main": "Clouds",
          "description": "few clouds",
          "icon": "02d"
        }
      ]
    },
    {
      "dt": 1697136000,
      "temp": {
        "min": 8.9,
        "max": 15.2
      },
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ]
    }
  ]
}
```

**Field Mapping to ForecastDay**:
| OpenWeather Field | Internal Field | Transformation |
|-------------------|----------------|----------------|
| `daily[i].dt` | `timestamp` | Direct (Unix timestamp) |
| `daily[i].dt` | `date` | Convert Unix → ISO 8601 (YYYY-MM-DD) |
| `daily[i].dt` | `dayOfWeek` | Convert Unix → day name |
| `daily[i].weather[0].main` | `condition` | Direct |
| `daily[i].weather[0].description` | `conditionDescription` | Direct |
| `daily[i].weather[0].icon` | `iconCode` | Direct |
| `daily[i].temp.min` | `temperatureMin` | Direct |
| `daily[i].temp.max` | `temperatureMax` | Direct |

**Processing Rules**:
- Extract first 3 entries from `daily` array (skip index 0 if it's current day)
- Convert Unix timestamps to human-readable dates
- Map day of week using locale-aware formatting

---

### 3. OpenWeather Geocoding API

**Endpoint**: `https://api.openweathermap.org/geo/1.0/direct`

**Request**:
```http
GET https://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API_KEY}
```

**Response (200 OK)**:
```json
[
  {
    "name": "London",
    "lat": 51.5074,
    "lon": -0.1278,
    "country": "GB",
    "state": "England"
  },
  {
    "name": "London",
    "lat": 42.9834,
    "lon": -81.2331,
    "country": "CA",
    "state": "Ontario"
  }
]
```

**Field Mapping to Location**:
| OpenWeather Field | Internal Field |
|-------------------|----------------|
| `name` | `name` |
| `lat` | `latitude` |
| `lon` | `longitude` |
| `country` | `country` |

---

## Error Handling Contracts

### Error Response Format

All API endpoints follow this error response structure:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {} // Optional, only in development mode
}
```

### Error Codes

| Code | HTTP Status | User Message | Cause |
|------|-------------|--------------|-------|
| `INVALID_COORDINATES` | 400 | "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180" | Validation failure |
| `INVALID_CITY_NAME` | 400 | "Please enter a valid city name" | Empty or invalid format |
| `MISSING_PARAMETERS` | 400 | "Missing required parameters" | Required query params not provided |
| `LOCATION_NOT_FOUND` | 404 | "Location not found. Please check your input and try again" | OpenWeather returns 404 |
| `CITY_NOT_FOUND` | 404 | "City not found. Please check the spelling and try again" | Geocoding returns empty results |
| `RATE_LIMIT_EXCEEDED` | 429 | "Too many requests. Please wait a moment and try again" | OpenWeather rate limit (60/min) |
| `SERVICE_UNAVAILABLE` | 500 | "Weather service temporarily unavailable. Please try again in a moment" | OpenWeather API error (5xx) |
| `TIMEOUT` | 504 | "Request timed out. Please check your internet connection" | Request exceeds 10s timeout |
| `UNAUTHORIZED` | 401 | "Unable to connect to weather service" | Invalid/missing API key (internal error, should not reach user) |

---

## Caching Contract

### Cache Headers

Responses include caching metadata:

```json
{
  "success": true,
  "data": { /* weather data */ },
  "cached": true,
  "cacheAge": 450,  // seconds since cached
  "timestamp": 1696876800
}
```

### Cache Strategy

| Endpoint | Cache Duration | Cache Key |
|----------|---------------|-----------|
| `/api/weather/current` | 10 minutes | `current:${lat},${lon}:${units}` |
| `/api/weather/forecast` | 15 minutes | `forecast:${lat},${lon}:${units}` |
| `/api/geocode` | 24 hours | `geocode:${cityName.toLowerCase()}` |

**Cache Invalidation**:
- Time-based expiry (TTL)
- No manual invalidation needed (weather data updates every 10 minutes)
- Cache miss → Fetch from OpenWeather → Store in cache → Return

---

## Rate Limiting Contract

### Internal API Rate Limits

Protect backend from abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/weather/current` | 100 requests | Per 15 minutes per IP |
| `/api/weather/forecast` | 100 requests | Per 15 minutes per IP |
| `/api/geocode` | 50 requests | Per 15 minutes per IP |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1696877700
```

**Rate Limit Exceeded Response**:
```json
{
  "success": false,
  "error": "Too many requests. Please wait a moment and try again",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 600  // seconds
}
```

---

## Testing Contracts

### Mock Responses for Testing

**Mock Current Weather** (London, Clear):
```json
{
  "success": true,
  "data": {
    "location": {"name": "London", "latitude": 51.5074, "longitude": -0.1278, "country": "GB"},
    "temperature": 15.5,
    "temperatureUnit": "celsius",
    "condition": "Clear",
    "conditionDescription": "clear sky",
    "humidity": 72,
    "windSpeed": 3.5,
    "windSpeedUnit": "m/s",
    "iconCode": "01d",
    "timestamp": 1696876800,
    "feelsLike": 14.2
  },
  "cached": false,
  "timestamp": 1696876800
}
```

**Mock Forecast** (New York, 3 days):
```json
{
  "success": true,
  "data": {
    "location": {"name": "New York", "latitude": 40.7128, "longitude": -74.0060, "country": "US"},
    "forecast": [
      {"date": "2025-10-10", "dayOfWeek": "Thursday", "condition": "Rain", "conditionDescription": "light rain", "iconCode": "10d", "temperatureMin": 12.3, "temperatureMax": 18.7, "temperatureUnit": "celsius", "timestamp": 1696963200},
      {"date": "2025-10-11", "dayOfWeek": "Friday", "condition": "Clouds", "conditionDescription": "few clouds", "iconCode": "02d", "temperatureMin": 10.1, "temperatureMax": 16.4, "temperatureUnit": "celsius", "timestamp": 1697049600},
      {"date": "2025-10-12", "dayOfWeek": "Saturday", "condition": "Clear", "conditionDescription": "clear sky", "iconCode": "01d", "temperatureMin": 8.9, "temperatureMax": 15.2, "temperatureUnit": "celsius", "timestamp": 1697136000}
    ]
  },
  "cached": false,
  "timestamp": 1696876800
}
```

**Mock Error** (Location Not Found):
```json
{
  "success": false,
  "error": "Location not found. Please check your input and try again",
  "code": "LOCATION_NOT_FOUND"
}
```

---

## Contract Testing

Use **Mock Service Worker (MSW)** to mock API responses during testing:

```typescript
// Example MSW handler
rest.get('/api/weather/current', (req, res, ctx) => {
  const lat = req.url.searchParams.get('lat');
  const lon = req.url.searchParams.get('lon');

  if (!lat || !lon) {
    return res(
      ctx.status(400),
      ctx.json({ success: false, error: 'Missing parameters', code: 'MISSING_PARAMETERS' })
    );
  }

  return res(
    ctx.status(200),
    ctx.json({ /* mock weather data */ })
  );
});
```

---

## Next Steps

With API contracts defined, proceed to:
1. Write quickstart.md for local development setup
2. Update agent context with technology stack
3. Begin implementation (Phase 2)
