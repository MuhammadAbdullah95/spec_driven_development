# Quickstart Guide: To-Do List App Development

**Feature**: A Modern, Minimal To-Do List App  
**Date**: 2025-10-07  
**Branch**: `002-a-modern-minimal`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

### Setup Instructions

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd <project-root>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

### Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier

### Project Structure Overview

```
src/
├── models/          # Data type definitions
├── services/        # Business logic and persistence
├── components/      # UI components
├── utils/           # Utility functions
├── styles/          # CSS files
└── index.ts         # Application entry point

tests/
├── unit/            # Unit tests
├── component/       # Component tests  
├── e2e/             # End-to-end tests
```

### Key Technologies

- **Build Tool**: Vite (fast development server)
- **Language**: TypeScript (with type safety)
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Styling**: CSS Modules or utility classes
- **Package Manager**: npm or yarn

### First Steps for New Developers

1. Run `npm install` to set up the project
2. Review the `src/models/Task.ts` to understand the data structure
3. Look at `src/services/Store.ts` to understand state management
4. Check `src/components/App.ts` for the main application flow
5. Run `npm run dev` to see the app running
6. Run `npm test` to ensure all tests pass

### Contributing Guidelines

- Follow the single-responsibility principle for modules
- Write unit tests for all business logic
- Use clear, descriptive variable names
- Add component-level tests for UI elements
- Ensure all PRs pass linting, tests, and build checks
- Keep PRs under 200 lines when practical