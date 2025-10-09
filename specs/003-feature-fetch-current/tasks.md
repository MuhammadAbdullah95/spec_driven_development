# Tasks: Weather Display Application

**Input**: Design documents from `/specs/003-feature-fetch-current/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included - no explicit test request in feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Frontend paths: `frontend/src/components/`, `frontend/src/services/`, `frontend/src/logic/`
- Backend paths: `backend/src/services/`, `backend/src/logic/`, `backend/src/api/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create monorepo structure with `frontend/` and `backend/` directories at repository root
- [x] T002 [P] Initialize frontend project with Vite + React + TypeScript in `frontend/` (vite@5.x, react@18.x, typescript@5.x)
- [x] T003 [P] Initialize backend project with Node.js + Express + TypeScript in `backend/` (express@4.x, typescript@5.x)
- [x] T004 [P] Configure root-level `package.json` with npm workspaces for monorepo management
- [x] T005 [P] Create `.env.example` file at root with required environment variables (OPENWEATHER_API_KEY, PORT, NODE_ENV, VITE_API_BASE_URL)
- [x] T006 [P] Configure ESLint and Prettier for both frontend and backend (shared config at root)
- [x] T007 [P] Add `.gitignore` with node_modules, dist, .env.local, build artifacts
- [x] T008 [P] Install testing dependencies: Vitest, React Testing Library, MSW, Supertest
- [x] T009 [P] Configure Vitest for frontend in `frontend/vitest.config.ts`
- [x] T010 [P] Configure Vitest for backend in `backend/vitest.config.ts`

**Checkpoint**: Project structure complete - dependencies installed, configuration files in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 [P] Create TypeScript interfaces for Location in `frontend/src/types/Location.ts` (name, latitude, longitude, country)
- [x] T012 [P] Create TypeScript interfaces for WeatherData in `frontend/src/types/WeatherData.ts` (all weather fields per data-model.md)
- [x] T013 [P] Create TypeScript interfaces for ForecastDay in `frontend/src/types/ForecastDay.ts` (date, dayOfWeek, temps, condition, icon)
- [x] T014 [P] Create TypeScript interfaces for SearchQuery in `frontend/src/types/SearchQuery.ts` (rawInput, queryType, validation fields)
- [x] T015 [P] Create TypeScript interfaces for UserPreferences in `frontend/src/types/UserPreferences.ts` (temperatureUnit)
- [x] T016 [P] Create TypeScript interfaces for ApiResponse in `frontend/src/types/ApiResponse.ts` (statusCode, data, error, cached, timestamp)
- [x] T017 Create React Context for UserPreferences in `frontend/src/contexts/PreferencesContext.tsx` with temperatureUnit state and setter
- [x] T018 [P] Create axios client configuration in `backend/src/config/axios.ts` with 10s timeout, base URL for OpenWeather
- [x] T019 [P] Create environment config loader in `backend/src/config/env.ts` (validates OPENWEATHER_API_KEY presence)
- [x] T020 [P] Create error handler utility in `backend/src/utils/errorHandler.ts` (maps API errors to user-friendly messages per contracts)
- [x] T021 [P] Create cache utility setup in `backend/src/logic/caching.ts` using node-cache (10-15 min TTL configuration)
- [x] T022 [P] Create rate limiter middleware in `backend/src/logic/rateLimit.ts` using express-rate-limit (100 req/15min weather, 50 req/15min geocode)
- [x] T023 Create Express server setup in `backend/src/server.ts` (CORS, JSON parsing, rate limiters, error handling middleware)

**Checkpoint**: Foundation ready - types defined, contexts created, backend infrastructure configured

---

## Phase 3: User Story 1 - Check Current Weather for a City (Priority: P1) 🎯 MVP

**Goal**: Users can search for a city or coordinates and see current weather (temperature, condition, humidity, wind speed, icon) within 2 seconds

**Independent Test**: Enter "London" → verify current weather data displays with temp, condition, humidity, wind, and icon within 2s

### Implementation for User Story 1

**Backend: Logic Layer (US1)**

- [ ] T024 [P] [US1] Implement input validation functions in `backend/src/logic/validation.ts`:
  - validateCityName(name: string): boolean
  - validateCoordinates(lat: number, lon: number): boolean
  - sanitizeCityName(name: string): string
- [ ] T025 [P] [US1] Implement temperature unit conversion in `backend/src/logic/unitConversion.ts`:
  - celsiusToFahrenheit(temp: number): number
  - fahrenheitToCelsius(temp: number): number
  - getUnitParam(unit: string): 'metric' | 'imperial'

**Backend: API Layer (US1)**

- [ ] T026 [US1] Create OpenWeather service in `backend/src/services/openWeatherService.ts`:
  - getCurrentWeather(lat: number, lon: number, units: string): Promise<ApiResponse<WeatherData>>
  - Includes caching logic, timeout handling, error mapping
- [ ] T027 [US1] Create Geocoding service in `backend/src/services/geocodingService.ts`:
  - geocodeCity(cityName: string): Promise<Location[]>
  - Caches results for 24 hours

**Backend: API Routes (US1)**

- [ ] T028 [US1] Implement GET /api/weather/current route in `backend/src/api/weatherRoutes.ts`:
  - Validates lat/lon query params
  - Calls getCurrentWeather service
  - Returns formatted response per contracts
  - Handles errors with user-friendly messages
- [ ] T029 [US1] Implement GET /api/geocode route in `backend/src/api/weatherRoutes.ts`:
  - Validates city query param
  - Calls geocodeCity service
  - Returns location array
- [ ] T030 [US1] Register weatherRoutes in `backend/src/server.ts` under `/api` prefix

**Frontend: Logic Layer (US1)**

- [ ] T031 [P] [US1] Implement search query parser in `frontend/src/logic/searchParser.ts`:
  - parseSearchInput(input: string): SearchQuery
  - Determines if city name or coordinates
  - Validates format
- [ ] T032 [P] [US1] Implement validation functions in `frontend/src/logic/validation.ts`:
  - isValidCityName(name: string): boolean
  - isValidCoordinates(coordString: string): boolean
  - getValidationError(query: SearchQuery): string | null
- [ ] T033 [P] [US1] Implement data transformation in `frontend/src/logic/dataTransform.ts`:
  - transformWeatherResponse(apiResponse: any): WeatherData
  - getWeatherIconUrl(iconCode: string): string

**Frontend: API Layer (US1)**

- [ ] T034 [US1] Create weather API client in `frontend/src/services/weatherApi.ts`:
  - getCurrentWeather(lat: number, lon: number, unit: string): Promise<WeatherData>
  - geocodeCity(cityName: string): Promise<Location[]>
  - Uses axios with error handling

**Frontend: UI Components (US1)**

- [ ] T035 [P] [US1] Create SearchBar component in `frontend/src/components/SearchBar.tsx`:
  - Input field with placeholder "Enter city name or coordinates"
  - Submit button/Enter key handler
  - Real-time validation feedback
  - Loading state during API call
- [ ] T036 [P] [US1] Create WeatherCard component in `frontend/src/components/WeatherCard.tsx`:
  - Displays location name, temperature, condition, humidity, wind speed
  - Shows weather icon
  - Reads temperatureUnit from PreferencesContext
  - Handles loading and error states
- [ ] T037 [P] [US1] Create ErrorMessage component in `frontend/src/components/ErrorMessage.tsx`:
  - Displays user-friendly error messages
  - Different styles for different error types
- [ ] T038 [P] [US1] Create LoadingSpinner component in `frontend/src/components/LoadingSpinner.tsx`:
  - Animated loading indicator during API calls
- [ ] T039 [US1] Create WeatherView container in `frontend/src/views/WeatherView.tsx`:
  - Manages weather data state (current weather, loading, error)
  - Handles search submission flow:
    1. Parse and validate input
    2. If city name → geocode → get coordinates
    3. Fetch current weather with coordinates
    4. Update state with results or errors
  - Renders SearchBar, WeatherCard, ErrorMessage, LoadingSpinner
- [ ] T040 [US1] Update App.tsx in `frontend/src/App.tsx`:
  - Wrap with PreferencesContext Provider
  - Render WeatherView component
  - Basic app layout structure

**Checkpoint**: User Story 1 complete - users can search by city/coordinates and see current weather

---

## Phase 4: User Story 2 - View 3-Day Forecast (Priority: P2)

**Goal**: Users see 3-day forecast below current weather with min/max temps and conditions for each day

**Independent Test**: Search for "New York" → verify 3 forecast cards appear with dates, conditions, min/max temps

### Implementation for User Story 2

**Backend: API Layer (US2)**

- [ ] T041 [US2] Add get3DayForecast method to OpenWeather service in `backend/src/services/openWeatherService.ts`:
  - get3DayForecast(lat: number, lon: number, units: string): Promise<ApiResponse<ForecastDay[]>>
  - Uses One Call API 3.0
  - Extracts first 3 days from daily array
  - Transforms Unix timestamps to ISO dates and day names
  - Implements 15-minute caching

**Backend: API Routes (US2)**

- [ ] T042 [US2] Implement GET /api/weather/forecast route in `backend/src/api/weatherRoutes.ts`:
  - Validates lat/lon/units/days query params
  - Calls get3DayForecast service
  - Returns array of 3 ForecastDay objects
  - Handles errors

**Frontend: API Layer (US2)**

- [ ] T043 [US2] Add get3DayForecast method to weather API client in `frontend/src/services/weatherApi.ts`:
  - get3DayForecast(lat: number, lon: number, unit: string): Promise<ForecastDay[]>
  - Error handling for forecast unavailable scenarios

**Frontend: Logic Layer (US2)**

- [ ] T044 [P] [US2] Add forecast transformation in `frontend/src/logic/dataTransform.ts`:
  - transformForecastResponse(apiResponse: any): ForecastDay[]
  - Ensures 3 days exactly
  - Handles missing data gracefully

**Frontend: UI Components (US2)**

- [ ] T045 [P] [US2] Create ForecastCard component in `frontend/src/components/ForecastCard.tsx`:
  - Displays single day forecast: date, day of week, condition icon, min/max temps
  - Reads temperatureUnit from PreferencesContext
  - Responsive card layout
- [ ] T046 [P] [US2] Create ForecastList component in `frontend/src/components/ForecastList.tsx`:
  - Renders array of 3 ForecastCard components
  - Grid/flex layout with proper spacing
  - Loading state while fetching forecast
  - Error state if forecast unavailable
- [ ] T047 [US2] Update WeatherView in `frontend/src/views/WeatherView.tsx`:
  - Add forecast data state (forecastData, forecastLoading, forecastError)
  - Fetch forecast after successful current weather fetch
  - Pass forecast data to ForecastList component
  - Handle forecast-specific errors (show current weather even if forecast fails)

**Checkpoint**: User Story 2 complete - users see 3-day forecast alongside current weather

---

## Phase 5: User Story 3 - Experience Smooth Visual Interface (Priority: P3)

**Goal**: Polished UI with gradient background, smooth animations, temperature unit toggle, responsive design

**Independent Test**: Search multiple cities → observe smooth transitions, gradient background, centered layout on different screen sizes

### Implementation for User Story 3

**Frontend: Styling (US3)**

- [ ] T048 [P] [US3] Create gradient styles in `frontend/src/styles/gradients.css`:
  - Define multiple gradient backgrounds (sunny, cloudy, rainy themes)
  - Dynamic gradient based on weather condition
  - Full viewport coverage
- [ ] T049 [P] [US3] Create global styles in `frontend/src/styles/global.css`:
  - CSS reset/normalize
  - Font imports (system fonts or Google Fonts)
  - Base layout styles (centered card, responsive containers)
  - Color variables, spacing system
- [ ] T050 [P] [US3] Create animation styles in `frontend/src/styles/animations.css`:
  - Fade-in animation for weather card appearance
  - Slide-out/slide-in transition for city changes
  - Loading spinner animation
  - Smooth transitions for all interactive elements

**Frontend: UI Components (US3)**

- [ ] T051 [P] [US3] Create UnitToggle component in `frontend/src/components/UnitToggle.tsx`:
  - Toggle switch for Celsius ↔ Fahrenheit
  - Reads/updates temperatureUnit in PreferencesContext
  - Smooth toggle animation
  - Positioned in top-right corner
- [ ] T052 [US3] Install and configure Framer Motion in `frontend/`:
  - Install framer-motion package
  - Configure types if needed
- [ ] T053 [US3] Add Framer Motion animations to WeatherCard in `frontend/src/components/WeatherCard.tsx`:
  - Wrap in motion.div with fade-in animation
  - Exit animation when data changes
  - AnimatePresence for smooth transitions
- [ ] T054 [US3] Add Framer Motion animations to ForecastCard in `frontend/src/components/ForecastCard.tsx`:
  - Stagger animation for forecast cards (animate in sequence)
  - Hover effects
- [ ] T055 [US3] Update WeatherView in `frontend/src/views/WeatherView.tsx`:
  - Add dynamic gradient background based on weather condition
  - Implement smooth transition between weather data updates
  - Use AnimatePresence for conditional rendering

**Frontend: Responsive Design (US3)**

- [ ] T056 [US3] Implement responsive layout in App.tsx and WeatherView:
  - Mobile-first CSS (320px base)
  - Breakpoints for tablet (768px) and desktop (1024px)
  - Ensure weather card remains centered across all screen sizes
  - Adjust forecast card grid (1 column mobile, 3 columns desktop)
  - Test and adjust font sizes for readability
- [ ] T057 [US3] Add viewport meta tag and responsive configuration in `frontend/index.html`:
  - <meta name="viewport" content="width=device-width, initial-scale=1.0">
  - Proper HTML structure

**Checkpoint**: User Story 3 complete - polished UI with animations, gradients, unit toggle, responsive design

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T058 [P] Create README.md at repository root with:
  - Project overview
  - Quick start instructions
  - Environment setup
  - Development commands (npm run dev, npm test, npm run build)
  - Link to quickstart.md
- [ ] T059 [P] Add loading states optimization:
  - Skeleton screens for weather card and forecast cards
  - Progressive loading (show current weather immediately, forecast loads after)
- [ ] T060 [P] Implement error recovery:
  - Retry button in ErrorMessage component
  - Automatic retry for transient errors (with exponential backoff)
- [ ] T061 [P] Add accessibility improvements:
  - ARIA labels for all interactive elements
  - Keyboard navigation support (Tab, Enter)
  - Focus indicators
  - Screen reader-friendly error messages
- [ ] T062 [P] Performance optimization:
  - Lazy load Framer Motion (code splitting)
  - Optimize weather icon loading (preload common icons)
  - Debounce search input to prevent excessive API calls
- [ ] T063 [P] Add console logging for debugging:
  - Log API calls with timing
  - Log cache hits/misses
  - Log validation failures (backend logs only)
  - Ensure no sensitive data (API keys) in logs
- [ ] T064 [P] Create deployment configuration:
  - vercel.json with build settings for both frontend and backend
  - Environment variable documentation in README
  - Build scripts in root package.json (build:frontend, build:backend, build:all)
- [ ] T065 Run end-to-end validation per quickstart.md:
  - Test all user flows: city search, coordinate search, unit toggle, error scenarios
  - Verify performance targets (< 2s response, < 500ms animations, < 100ms unit toggle)
  - Check responsive design on multiple screen sizes
  - Validate error messages are user-friendly
  - Confirm no API keys exposed in browser

**Checkpoint**: Application fully polished and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - May integrate with US1 but independently testable
  - User Story 3 (Phase 5): Can start after Foundational - Enhances US1 and US2 but independently deliverable
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - delivers MVP (current weather search)
- **User Story 2 (P2)**: Independent - adds forecast without breaking US1
- **User Story 3 (P3)**: Independent - adds visual polish without breaking US1/US2

**Recommended Order**: US1 → US2 → US3 (sequential by priority) OR US1 → (US2 + US3 in parallel)

### Within Each User Story

**General Pattern**:
1. Backend Logic Layer (validation, conversion) - can run in parallel
2. Backend API Layer (services, routes) - sequential within layer
3. Frontend Logic Layer (parsing, transformation) - can run in parallel with backend API
4. Frontend API Layer (clients) - depends on backend routes existing
5. Frontend UI Components - can run in parallel once logic/API layers done
6. Frontend Views/Integration - depends on components existing

**Parallel Opportunities**:
- Phase 1 (Setup): T002-T010 all parallelizable (different projects/configs)
- Phase 2 (Foundational): T011-T016 (types), T018-T022 (utilities) parallelizable
- Within US1: T024-T025 (backend logic), T031-T033 (frontend logic), T035-T038 (UI components) can run in parallel
- Within US2: T044 and T045-T046 can run in parallel
- Within US3: T048-T050 (styles), T051 (component) parallelizable
- Phase 6 (Polish): T058-T064 all parallelizable (different concerns)

---

## Parallel Execution Examples

### Phase 1: Setup
```bash
# All setup tasks can run in parallel:
Task T002: "Initialize frontend project with Vite..."
Task T003: "Initialize backend project with Express..."
Task T004: "Configure root package.json..."
Task T005: "Create .env.example..."
Task T006: "Configure ESLint and Prettier..."
# ... etc
```

### Phase 2: Foundational
```bash
# Type definitions in parallel:
Task T011: "Create Location types"
Task T012: "Create WeatherData types"
Task T013: "Create ForecastDay types"
Task T014: "Create SearchQuery types"
Task T015: "Create UserPreferences types"
Task T016: "Create ApiResponse types"

# Backend utilities in parallel:
Task T018: "Create axios config"
Task T019: "Create env config"
Task T020: "Create error handler"
Task T021: "Create cache utility"
Task T022: "Create rate limiter"
```

### User Story 1: Current Weather
```bash
# Backend logic in parallel:
Task T024: "Implement validation functions"
Task T025: "Implement temperature conversion"

# Frontend logic in parallel:
Task T031: "Implement search parser"
Task T032: "Implement validation functions"
Task T033: "Implement data transformation"

# UI components in parallel:
Task T035: "Create SearchBar component"
Task T036: "Create WeatherCard component"
Task T037: "Create ErrorMessage component"
Task T038: "Create LoadingSpinner component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (MVP)
4. **STOP and VALIDATE**: Test current weather search independently
5. Deploy/demo if ready

**Outcome**: Functional MVP with current weather search by city/coordinates

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP + Forecast)
4. Add User Story 3 → Test independently → Deploy/Demo (Full Feature)
5. Polish phase → Final production release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T024-T040)
   - Developer B: User Story 2 (T041-T047) - can start in parallel with US1
   - Developer C: User Story 3 (T048-T057) - can start in parallel with US1/US2
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Notes

- **[P] tasks**: Different files, no dependencies - run in parallel for speed
- **[Story] labels**: Map tasks to user stories for traceability (US1, US2, US3)
- **No tests included**: Specification did not explicitly request TDD/testing approach
- **Tests can be added later**: If needed, add test tasks before implementation tasks in each user story phase
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 13 tasks
- **Phase 3 (User Story 1 - MVP)**: 17 tasks (T024-T040)
- **Phase 4 (User Story 2 - Forecast)**: 7 tasks (T041-T047)
- **Phase 5 (User Story 3 - Visual Polish)**: 10 tasks (T048-T057)
- **Phase 6 (Polish)**: 8 tasks (T058-T065)

**Total**: 65 tasks

**Parallel Opportunities**: ~35 tasks marked [P] can run in parallel (54% of tasks)

**MVP Scope**: Phases 1 + 2 + 3 = 40 tasks (delivers User Story 1 - current weather search)
