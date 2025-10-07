# Contributing to To-Do List App

Thank you for your interest in contributing to the To-Do List App! This document outlines the guidelines for contributing.

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/todo-list-app.git
   cd todo-list-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Follow the ESLint and Prettier configurations provided in the project
- Use TypeScript for type safety
- Write clear, descriptive variable and function names
- Follow the existing project structure and component architecture

### Running Linters and Formatters

Before submitting a PR, make sure to run:
```bash
npm run lint    # Check for linting errors
npm run format  # Format code with Prettier
```

## Testing

- Write unit tests for new business logic
- Write component tests for UI changes
- Make sure all tests pass before submitting a PR:
  ```bash
  npm run test
  ```

## Pull Request Process

1. Create a feature branch from `main`
2. Add your changes with clear commit messages
3. Make sure all tests pass
4. Update documentation if needed
5. Submit a pull request with a clear description of your changes

### PR Guidelines

- Keep PRs under 200 changed lines when practical
- One PR should address one specific issue or feature
- Include tests for your changes
- Update any relevant documentation

## How to Run Tests Locally

- Unit tests: `npm run test`
- Unit tests (watch mode): `npm run test:ui`
- Coverage report: `npm run coverage`

## Architecture Notes

The project follows a clean architecture pattern:

- **Models** (`src/models/`): Define data structures
- **Services** (`src/services/`): Handle business logic and persistence
- **Components** (`src/components/`): UI components with specific responsibilities
- **Utils** (`src/utils/`): Shared utility functions
- **Styles** (`src/styles/`): CSS files

When adding new features, try to follow this structure and keep components focused on single responsibilities.