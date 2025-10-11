# 🚀 AI-Powered Expense Tracker

A modern, full-featured expense tracking application with AI-powered natural language processing, receipt scanning, and intelligent spending insights using Google Gemini API.

## ✨ Key Features

### 🤖 AI-Powered Capabilities
- **Natural Language Expense Entry** - Type "spent $50 on pizza yesterday" and AI extracts all details
- **Receipt Scanning (OCR)** - Upload receipt photos for automatic data extraction
- **AI Financial Assistant** - Chat-based spending insights and budget recommendations  
- **Smart Suggestions** - Context-aware expense descriptions based on your patterns

### 🎨 Modern UI/UX
- Glassmorphism design with backdrop blur effects
- Fully responsive (mobile, tablet, desktop)
- Interactive charts and data visualization
- Smooth 60fps animations
- Dark mode support

### 📊 Expense Management
- Quick expense entry with traditional forms
- Category management and budgeting
- Real-time spending statistics
- Weekly and monthly analytics
- Export capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Gemini API Key ([Get it free](https://aistudio.google.com/app/apikey))

### Installation

bash
Clone and install
git clone <repository-url>
cd expense-tracker-app/frontend
npm install

Configure API key
cp .env.example .env
Edit .env and add your VITE_GEMINI_API_KEY

Start development server
npm run dev

Open http://localhost:5173
