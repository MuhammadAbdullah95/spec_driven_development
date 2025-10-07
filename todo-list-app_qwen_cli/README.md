# TaskFlow - Modern To-Do List App

A beautifully designed, modern, minimal, and responsive To-Do List App that allows users to create, organize, and manage their daily tasks efficiently.

## Features

- ✅ Add, edit, complete, and delete tasks with intuitive UI
- 🔄 Drag and drop reordering of tasks with visual feedback
- 📋 Filter tasks (All, Active, Completed) with clear visual indication
- 🌗 Light/dark theme with system preference detection and manual override
- ⌨️ Keyboard shortcuts for power users (Enter to add, Esc to cancel, etc.)
- 💾 Local storage persistence for tasks and preferences
- 📱 Fully responsive design for all screen sizes
- 🎨 Enhanced visual design with improved spacing, colors, and animations
- ♿ Full accessibility support with proper ARIA labels

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository (or initialize this project):
   ```bash
   git clone <repository-url>
   cd todo-list-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

### Building

To build the app for production:

```bash
npm run build
# or
yarn build
```

The production-ready app will be in the `dist/` folder.

### Testing

To run unit tests:

```bash
npm run test
# or
yarn test
```

To run tests in UI mode:

```bash
npm run test:ui
# or
yarn test:ui
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI interface
- `npm run test:run` - Run tests in CLI mode
- `npm run coverage` - Generate test coverage report
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier

## UI Enhancements

The app features a modern, clean design with:

- **Improved spacing and alignment** using a consistent spacing system (xs, sm, md, lg, xl)
- **Attractive color scheme** with primary blues, accent purples, and appropriate contrast for accessibility
- **Enhanced typography** with appropriate font weights and sizes
- **Smooth animations and transitions** for a polished feel
- **Card-based layout** with subtle shadows for depth
- **Intuitive icons** replacing text buttons where appropriate
- **Visual feedback** for interactions including hover states and active states
- **Rounded corners** and soft shadows for a modern aesthetic
- **Responsive design** that works beautifully on all device sizes

## Architecture

The app follows a clean architecture with separation of concerns:

- `src/models/` - Data type definitions
- `src/services/` - Business logic and persistence
- `src/components/` - UI components
- `src/utils/` - Utility functions
- `src/styles/` - CSS files

### Key Components

- **Store**: Centralized state management
- **StorageService**: LocalStorage abstraction
- **TaskInput**: Component for adding new tasks
- **TaskItem**: Component for individual tasks
- **TaskList**: Component for the list of tasks
- **Filters**: Component for filtering tasks
- **ThemeToggle**: Component for theme switching

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the single-responsibility principle for modules
- Write unit tests for all business logic
- Use clear, descriptive variable names
- Add component-level tests for UI elements
- Ensure all PRs pass linting, tests, and build checks
- Keep PRs under 200 lines when practical