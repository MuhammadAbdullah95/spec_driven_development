# Scientific Calculator App

A Next.js-based scientific calculator application designed for students to solve complex math problems including algebra, geometry, and other scientific operations.

## Features

- Advanced mathematical functions (trigonometric, logarithmic, exponential)
- Algebraic equation solving
- Geometric calculations
- Calculation history
- Responsive and accessible UI
- Student-friendly interface

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js 15 App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── calculator/     # Calculator feature
│       ├── page.tsx
│       ├── components/ # Calculator UI components
│       └── hooks/      # Calculator logic hooks
├── lib/               # Business logic
├── types/             # TypeScript types
├── components/        # Reusable UI components
└── tests/             # Test files
    ├── unit/          # Unit tests
    ├── integration/   # Integration tests
    └── e2e/          # End-to-end tests
```

## Learn More

This project uses the following technologies:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Math.js](https://mathjs.org/)