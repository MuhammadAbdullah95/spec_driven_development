# Quickstart Guide: Weather Display Application

**Feature**: Weather Display Application
**Branch**: 003-feature-fetch-current
**Date**: 2025-10-09

## Overview

This guide provides step-by-step instructions to set up, run, and develop the weather display application locally.

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with ESLint and Prettier extensions)

### OpenWeather API Key

1. Sign up for a free account at [openweathermap.org](https://openweathermap.org/)
2. Navigate to API Keys section
3. Generate a new API key
4. **Wait 2 hours** for API key activation (OpenWeather requires this for new keys)

---

## Project Structure

```
weather-app/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── services/         # API layer
│   │   ├── logic/           # Business logic layer
│   │   ├── styles/          # CSS and styling
│   │   └── App.tsx          # Main app component
│   ├── tests/               # Frontend tests
│   ├── package.json
│   └── vite.config.ts       # Vite configuration
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── services/        # OpenWeather integration
│   │   ├── logic/          # Caching and rate limiting
│   │   ├── api/            # API routes
│   │   └── server.ts       # Express server entry
│   ├── tests/              # Backend tests
│   └── package.json
├── .env.example            # Environment variables template
├── .env.local              # Your local environment (gitignored)
├── package.json            # Root package.json (workspaces)
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weather-app
git checkout 003-feature-fetch-current
```

### 2. Install Dependencies

The project uses npm workspaces for monorepo management.

```bash
# Install all dependencies (frontend + backend)
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` and add your OpenWeather API key:

```env
# OpenWeather API Configuration
OPENWEATHER_API_KEY=your_api_key_here

# API Endpoints
OPENWEATHER_BASE_URL=https://api.openweathermap.org

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration (for Vite)
VITE_API_BASE_URL=http://localhost:3001
```

**⚠️ Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Running the Application

### Development Mode (Concurrent Frontend + Backend)

```bash
# Run both frontend and backend concurrently
npm run dev
```

This starts:
- **Frontend**: [http://localhost:5173](http://localhost:5173) (Vite dev server)
- **Backend**: [http://localhost:3001](http://localhost:3001) (Express API)

### Run Frontend Only

```bash
cd frontend
npm run dev
```

### Run Backend Only

```bash
cd backend
npm run dev
```

---

## Using the Application

### 1. Search by City Name

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Enter a city name in the search bar (e.g., "London", "New York", "Tokyo")
3. Press Enter or click Search
4. View current weather and 3-day forecast

### 2. Search by Coordinates

1. Enter coordinates in format: `latitude,longitude`
2. Example: `51.5074,-0.1278` (London)
3. Example: `40.7128,-74.0060` (New York)
4. Press Enter or click Search

### 3. Toggle Temperature Units

- Click the temperature unit toggle (°C/°F) in the top-right corner
- All temperatures update instantly (current weather + forecast)
- Preference persists within the session

---

## Testing

### Run All Tests

```bash
# Run frontend and backend tests
npm test
```

### Run Frontend Tests Only

```bash
cd frontend
npm test
```

### Run Frontend Tests in Watch Mode

```bash
cd frontend
npm run test:watch
```

### Run Frontend Tests with Coverage

```bash
cd frontend
npm run test:coverage
```

### Run Backend Tests Only

```bash
cd backend
npm test
```

### Run Specific Test File

```bash
cd frontend
npm test -- src/logic/validation.test.ts
```

---

## Building for Production

### Build Both Frontend and Backend

```bash
npm run build
```

### Build Frontend Only

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Build Backend Only

```bash
cd backend
npm run build
```

Output: `backend/dist/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

Serves production build at [http://localhost:4173](http://localhost:4173)

---

## Common Tasks

### Adding a New Component

```bash
cd frontend/src/components
touch MyComponent.tsx
```

Example component structure:

```typescript
import { FC } from 'react';

interface MyComponentProps {
  // Props definition
}

export const MyComponent: FC<MyComponentProps> = ({ /* props */ }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Adding a New API Endpoint

1. Create route handler in `backend/src/api/`
2. Add route to `backend/src/server.ts`
3. Update API contracts in `/specs/003-feature-fetch-current/contracts/weather-api.md`
4. Add tests in `backend/tests/`

### Updating Styles

- Global styles: `frontend/src/styles/global.css`
- Component styles: Use CSS modules (`.module.css`) or styled-components
- Gradients: Defined in `frontend/src/styles/gradients.css`

---

## Linting and Formatting

### Run ESLint

```bash
# Lint frontend
cd frontend
npm run lint

# Lint backend
cd backend
npm run lint
```

### Auto-fix ESLint Issues

```bash
npm run lint -- --fix
```

### Format with Prettier

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

---

## Debugging

### Frontend Debugging (Chrome DevTools)

1. Open [http://localhost:5173](http://localhost:5173)
2. Open Chrome DevTools (F12)
3. Navigate to Sources tab
4. Set breakpoints in your code
5. Vite provides source maps for easy debugging

### Backend Debugging (VS Code)

Add this configuration to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

### View API Logs

Backend logs requests and responses:

```bash
cd backend
npm run dev
# Logs appear in terminal
```

---

## Troubleshooting

### Port Already in Use

If port 5173 (frontend) or 3001 (backend) is already in use:

```bash
# Find process using port
netstat -ano | findstr :5173

# Kill process
taskkill /PID <process_id> /F
```

Or change port in config files:
- Frontend: `frontend/vite.config.ts` → `server.port`
- Backend: `.env.local` → `PORT`

### API Key Not Working

1. Ensure API key is activated (wait 2 hours after registration)
2. Check `.env.local` has correct key (no quotes, no spaces)
3. Restart backend server after updating `.env.local`
4. Test API key directly: `https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=YOUR_KEY`

### CORS Errors

If frontend can't connect to backend:

1. Ensure backend is running on `http://localhost:3001`
2. Check `VITE_API_BASE_URL` in `.env.local` matches backend URL
3. Backend should have CORS enabled (configured in `server.ts`)

### Tests Failing

```bash
# Clear test cache
cd frontend
npm run test -- --clearCache

# Update snapshots if needed
npm run test -- --updateSnapshot
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
```

---

## Performance Testing

### Measure API Response Time

```bash
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/weather/current?lat=51.5074&lon=-0.1278&units=metric"
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:       %{time_total}s\n
```

### Check Cache Performance

```bash
# First request (uncached) - should take ~350ms
curl "http://localhost:3001/api/weather/current?lat=51.5074&lon=-0.1278&units=metric"

# Second request (cached) - should take ~2ms
curl "http://localhost:3001/api/weather/current?lat=51.5074&lon=-0.1278&units=metric"
```

### Lighthouse Performance Audit

1. Open [http://localhost:5173](http://localhost:5173) in Chrome
2. Open DevTools → Lighthouse tab
3. Run audit (Performance, Accessibility, Best Practices)
4. Target scores: Performance > 90, Accessibility > 95

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables on Vercel**:
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add `OPENWEATHER_API_KEY`
3. Redeploy

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=frontend/dist
```

---

## API Rate Limits

### OpenWeather API (Free Tier)

- **60 calls per minute**
- **1,000 calls per day** (One Call API 3.0)
- **10-minute data update frequency**

**Strategy**: Backend caches responses for 10-15 minutes to stay within limits.

### Internal API Rate Limits

Backend implements rate limiting:
- **100 requests per 15 minutes** per IP for weather endpoints
- **50 requests per 15 minutes** per IP for geocoding

If exceeded, API returns 429 status with `retryAfter` value.

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

- Follow layered architecture (API/Logic/UI separation)
- Write tests alongside implementation
- Follow TypeScript best practices (strict mode)
- Use meaningful commit messages

### 3. Test Changes

```bash
npm test
npm run lint
npm run format:check
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 5. Create Pull Request

- Verify Constitution Check compliance
- Ensure all tests pass
- Add description of changes

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` (root) | Workspace configuration |
| `frontend/vite.config.ts` | Vite build configuration |
| `frontend/tsconfig.json` | TypeScript compiler config (frontend) |
| `backend/tsconfig.json` | TypeScript compiler config (backend) |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc` | Prettier formatting rules |
| `.env.example` | Environment variables template |
| `.gitignore` | Files to ignore in Git |

---

## Resources

### Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [Vitest Documentation](https://vitest.dev/)
- [OpenWeather API Docs](https://openweathermap.org/api)

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List npm scripts
npm run

# View package dependency tree
npm list --depth=0

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## Next Steps

1. **Complete setup** following installation steps above
2. **Familiarize yourself** with project structure and architecture
3. **Review** data model and API contracts in `/specs/003-feature-fetch-current/`
4. **Start development** with `/speckit.tasks` to generate implementation tasks
5. **Follow TDD approach** if tests are required (write tests first)

---

## Support

For questions or issues:
1. Review this quickstart guide
2. Check troubleshooting section
3. Review API contracts and data model documentation
4. Consult project constitution (`.specify/memory/constitution.md`)

---

**Happy Coding! 🌤️**
