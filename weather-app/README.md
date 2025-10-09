# Weather App

A modern, full-stack weather application built with React and Express.js, following constitutional principles for reliable weather data delivery.

## 🌟 Features

### ✅ Constitutional Compliance
This application strictly adheres to 5 core constitutional principles:

1. **External API Integration** - Uses OpenWeather API as the sole data source
2. **Dual-Mode Weather Retrieval** - Provides both current weather and 3-day forecasts
3. **Input Validation** - Validates all inputs before API calls
4. **Layered Architecture** - Clean separation between API, Logic, and UI layers
5. **Graceful Degradation** - User-friendly error messages for all failure scenarios

### 🚀 Core Functionality
- **Current Weather**: Real-time weather conditions for any location
- **3-Day Forecast**: Detailed weather predictions with min/max temperatures
- **Location Search**: Search by city name or GPS coordinates
- **Unit Conversion**: Toggle between Celsius and Fahrenheit
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Comprehensive error handling with helpful messages
- **Caching**: Intelligent caching to reduce API calls and improve performance
- **Rate Limiting**: Built-in rate limiting to respect API quotas

## 🏗️ Architecture

```
weather-app/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Environment and API configuration
│   │   ├── services/       # OpenWeather API integration
│   │   ├── routes/         # API endpoints
│   │   ├── logic/          # Business logic, validation, caching
│   │   └── utils/          # Error handling utilities
│   └── tests/              # Backend tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context providers
│   │   ├── api/           # API client functions
│   │   └── types/         # TypeScript type definitions
│   └── tests/             # Frontend tests
└── .specify/              # Spec-driven development templates
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm 9+
- OpenWeather API key (free at https://openweathermap.org/api)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/MuhammadAbdullah95/spec_driven_development.git
cd spec_driven_development
cd weather-app

# Install all dependencies (root, backend, and frontend)
npm install
```

### 2. Environment Configuration

Create your environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API key:
```env
# OpenWeather API Configuration
OPENWEATHER_API_KEY=your_actual_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org

# Backend Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration (for Vite)
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Run the Application

#### Option A: Run Both Services Together (Recommended)
```bash
npm run dev
```

#### Option B: Run Services Separately
```bash
# Terminal 1 - Backend
npm run dev --workspace=backend

# Terminal 2 - Frontend
npm run dev --workspace=frontend
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Testing

### Manual Testing Checklist

#### Current Weather Testing
1. **City Search**: Search for "London" - should show current weather
2. **Coordinates**: Enter "40.7128, -74.0060" (NYC) - should show weather
3. **Unit Toggle**: Switch between Celsius/Fahrenheit - temperatures should convert
4. **Current Location**: Click "Use Current Location" - should get your weather
5. **Invalid Input**: Try empty search, invalid coordinates - should show validation errors

#### 3-Day Forecast Testing
1. **Forecast Display**: After searching, forecast should appear below current weather
2. **Forecast Data**: Should show 3 days with min/max temperatures, conditions, icons
3. **Date Labels**: Should show "Today", "Tomorrow", then date format
4. **Error Handling**: If forecast fails, should show user-friendly error message

#### Error Handling Testing
1. **Network Issues**: Disconnect internet - should show network error
2. **Invalid API Key**: Use wrong API key - should show service error
3. **Rate Limiting**: Make many rapid requests - should handle rate limits gracefully
4. **Invalid Location**: Search for "asdfghijk" - should show location not found

### Automated Testing
```bash
# Run all tests
npm test

# Run backend tests only
npm run test --workspace=backend

# Run frontend tests only
npm run test --workspace=frontend

# Run with coverage
npm run test:coverage
```

## 📡 API Endpoints

### Weather Endpoints

#### Get Current Weather
```http
GET /api/weather/current?lat={latitude}&lon={longitude}&units={celsius|fahrenheit}
```

#### Get 3-Day Forecast
```http
GET /api/weather/forecast?lat={latitude}&lon={longitude}&units={celsius|fahrenheit}
```

#### Geocode City to Coordinates
```http
GET /api/weather/geocode?city={city_name}
```

#### Health Check
```http
GET /health
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Run both backend and frontend
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only

# Building
npm run build            # Build both for production
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Testing
npm test                 # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint all code
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🚨 Troubleshooting

### Common Issues

#### "Cannot find module 'react'" or TypeScript errors
**Solution**: Run `npm install` to install all dependencies

#### "API key not found" or 401 errors
**Solution**: 
1. Verify your OpenWeather API key is correct in `.env.local`
2. Ensure the API key is active (can take a few minutes after signup)
3. Check you haven't exceeded the free tier limits

#### Port conflicts (EADDRINUSE)
**Solution**: Change the `PORT` in `.env.local` to an available port

#### CORS errors in browser
**Solution**: Ensure backend is running on port 3001 and frontend on 5173

#### Forecast not loading
**Solution**: 
1. Check browser console for errors
2. Verify `/api/weather/forecast` endpoint is accessible
3. Ensure current weather loaded successfully first

### Performance Tips
- The app uses intelligent caching (5 min for weather, 15 min for forecasts)
- Rate limiting prevents API quota exhaustion
- Use the same location searches to benefit from caching

## 🏛️ Constitutional Compliance Report

✅ **Principle I: External API Integration**
- Uses OpenWeather API exclusively
- No local weather data or scraping

✅ **Principle II: Dual-Mode Weather Retrieval**
- Current weather: Real-time conditions
- 3-day forecast: Minimum constitutional requirement met

✅ **Principle III: Input Validation**
- City names: Non-empty, sanitized strings
- Coordinates: Valid lat/lon ranges (-90 to 90, -180 to 180)
- All validation occurs before API calls

✅ **Principle IV: Layered Architecture**
- API Layer: OpenWeather service integration
- Logic Layer: Validation, caching, business rules
- UI Layer: React components, user interaction

✅ **Principle V: Graceful Degradation**
- Network errors: "Check your connection"
- Invalid locations: "Location not found"
- Rate limits: "Please wait and try again"
- Service errors: "Service temporarily unavailable"

## 📄 License

This project is built following spec-driven development principles and constitutional guidelines for reliable weather applications.

---

**Weather data provided by [OpenWeather API](https://openweathermap.org/)**
