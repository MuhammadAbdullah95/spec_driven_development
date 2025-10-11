# Modern Expense Tracker - Redesigned

A beautifully redesigned expense tracking web application with modern UI/UX principles, glassmorphism effects, and fully responsive design that works seamlessly across mobile, tablet, and desktop devices.

## ✨ Features

### 🎨 Design System
- **Glassmorphism Effects**: Beautiful frosted glass aesthetics with backdrop blur
- **Modern Color Palette**: Sky blue primary (#0EA5E9), cyan secondary (#06B6D4), and carefully selected accent colors
- **Responsive Typography**: Inter font family with optimized sizing and spacing
- **Smooth Animations**: 60fps micro-interactions and page transitions

### 📱 Responsive Design
- **Mobile First**: Optimized for touch interactions with 44px minimum touch targets
- **Tablet Adaptive**: Two-column layouts with collapsible navigation
- **Desktop Enhanced**: Multi-column dashboard with persistent sidebar
- **Breakpoints**: 640px (mobile), 1024px (tablet), 1440px+ (desktop)

### 🧩 Component Architecture
- **Reusable UI Components**: Button, Card, Input, Modal with consistent styling
- **Feature Components**: StatCard, ExpenseForm, ExpenseList, Charts, AIAssistant
- **Layout System**: Responsive sidebar, mobile navigation, and main layout wrapper
- **TypeScript Ready**: JSDoc type definitions for better development experience

### 🤖 AI Assistant
- **Chat Interface**: Slide-in panel with natural language processing
- **Smart Suggestions**: Expense categorization and spending insights
- **Quick Actions**: Pre-defined commands for common tasks
- **Responsive Design**: Full-screen on mobile, sidebar on desktop

### 📊 Data Visualization
- **Interactive Charts**: Built with Recharts library
- **Spending Trends**: Area charts with gradient fills
- **Category Breakdown**: Animated pie charts with legends
- **Real-time Updates**: Charts update automatically with new data

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx   # Modern button with variants
│   │   ├── Card.jsx     # Glassmorphism card component
│   │   ├── Input.jsx    # Floating label input
│   │   └── Modal.jsx    # Responsive modal
│   ├── layout/          # Layout components
│   │   ├── Layout.jsx   # Main layout wrapper
│   │   ├── Sidebar.jsx  # Desktop navigation
│   │   └── MobileNav.jsx # Mobile bottom navigation
│   └── features/        # Feature-specific components
│       ├── StatCard.jsx      # Animated statistics cards
│       ├── ExpenseForm.jsx   # Add/edit expense form
│       ├── ExpenseList.jsx   # Swipeable expense list
│       ├── AIAssistant.jsx   # Chat-based AI helper
│       └── Charts.jsx        # Data visualization
├── pages/
│   ├── ModernDashboard.jsx   # Main dashboard page
│   ├── Categories.jsx        # Category management
│   └── Analytics.jsx         # Advanced analytics
├── hooks/
│   └── useMediaQuery.js      # Responsive breakpoint hooks
├── utils/
│   └── formatters.js         # Currency and date formatting
├── styles/
│   ├── tailwind.css          # Tailwind imports
│   └── modern.css            # Custom styles and animations
└── types/
    └── index.js              # Type definitions
```

## 🎨 Design System

### Colors
```css
Primary: #0EA5E9 (sky-500)
Primary Dark: #0284C7 (sky-600)
Secondary: #06B6D4 (cyan-500)
Accent: #F59E0B (amber-500)
Success: #10B981 (emerald-500)
Background: #F8FAFC (slate-50)
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: font-bold, text-3xl to text-5xl
- **Body**: font-normal, text-base to text-lg
- **Small**: text-sm, text-slate-500

### Spacing
- **Extra Small**: 8px (p-2, m-2)
- **Small**: 16px (p-4, m-4)
- **Medium**: 24px (p-6, m-6)
- **Large**: 32px (p-8, m-8)
- **Extra Large**: 48px (p-12, m-12)

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.7)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.2)
box-shadow: 0 20px 60px rgba(14, 165, 233, 0.15)
```

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Bottom navigation
- Full-width components
- Touch-optimized interactions

### Tablet (640px - 1024px)
- Two-column grid
- Collapsible sidebar
- Medium-sized components

### Desktop (> 1024px)
- Multi-column dashboard (3-4 columns)
- Persistent sidebar (20% width)
- Large data visualizations
- Side-by-side layouts

## 🎭 Animations

### Keyframes
- **fadeIn**: Fade in with slight upward movement
- **slideInRight/Left**: Slide animations for panels
- **scaleIn**: Scale up animation for modals
- **glow**: Pulsing glow effect
- **float**: Gentle floating animation

### Micro-interactions
- **Buttons**: Scale on hover (1.05x)
- **Cards**: Lift with shadow increase
- **Inputs**: Focus ring with scale
- **Loading**: Skeleton screens and spinners

## 🧩 Component Usage

### StatCard
```jsx
<StatCard
  title="Total Spending"
  amount={1250.50}
  icon={DollarSign}
  trend="up"
  changePercentage={12}
  delay={100}
/>
```

### ExpenseForm
```jsx
<ExpenseForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleAddExpense}
  initialData={editingExpense}
/>
```

### AIAssistant
```jsx
<AIAssistant
  isOpen={showAI}
  onClose={() => setShowAI(false)}
  onSendMessage={handleAIMessage}
/>
```

## 🔧 Customization

### Adding New Colors
Update `tailwind.config.js`:
```javascript
colors: {
  brand: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7'
  }
}
```

### Custom Animations
Add to `tailwind.config.js`:
```javascript
animation: {
  'custom-bounce': 'bounce 1s infinite'
}
```

### Glassmorphism Variants
Modify opacity and blur values:
```css
.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}
```

## 🌐 Browser Support

- **Chrome**: 88+
- **Firefox**: 84+
- **Safari**: 14+
- **Edge**: 88+

### Required Features
- CSS Grid
- Flexbox
- CSS Custom Properties
- backdrop-filter (for glassmorphism)

## 📊 Performance

### Optimization Techniques
- **Lazy Loading**: Charts and heavy components
- **Debounced Inputs**: Search and filter inputs
- **Memoization**: React.memo for expensive components
- **CSS Transforms**: Hardware-accelerated animations
- **Tree Shaking**: Unused code elimination

### Bundle Size
- **Gzipped**: ~45KB (excluding charts)
- **With Recharts**: ~120KB
- **Runtime**: ~15KB

## 🎯 Accessibility

### Features
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliance
- **Reduced Motion**: Respects user preferences

### Testing
```bash
# Run accessibility tests
npm run test:a11y
```

## 🚀 Deployment

### Build Optimization
```bash
# Production build
npm run build

# Analyze bundle
npm run analyze
```

### Environment Variables
```bash
VITE_API_URL=https://api.example.com
VITE_AI_API_KEY=your_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write JSDoc comments
- Test responsive behavior

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Recharts**: Composable charting library
- **Inter Font**: Modern typeface by Rasmus Andersson

---

**Built with ❤️ for modern expense tracking**
# AI-Enhanced Expense Tracker

This expense tracker has been enhanced with powerful AI features using **Gemini 2.5 Flash** model to provide intelligent expense management capabilities.

## 🚀 AI Features Overview

### 1. **Natural Language Expense Entry**
- **What it does**: Convert natural language descriptions into structured expense data
- **Example**: Type "spent $50 on pizza yesterday" → automatically extracts amount ($50), category (Food), date (yesterday), and description (pizza)
- **Benefits**: Faster expense entry, reduced manual form filling

### 2. **Receipt Image Scanning (OCR)**
- **What it does**: Upload receipt photos to automatically extract merchant, amount, date, and category
- **Supported**: English-language receipts, JPEG/PNG/WebP formats, max 10MB
- **Benefits**: Eliminates manual transcription, reduces data entry errors

### 3. **Conversational Spending Insights**
- **What it does**: Ask questions about your spending in natural language
- **Examples**: 
  - "How much did I spend on food this week?"
  - "What's my biggest expense category?"
  - "Am I spending more this month than last?"
- **Benefits**: Instant insights without navigating through charts

### 4. **AI Budget Suggestions** *(Coming Soon)*
- **What it does**: Analyze spending patterns to suggest realistic budgets
- **Requirements**: Minimum 30 days of expense data
- **Benefits**: Data-driven budget recommendations, spending optimization tips

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (keep it secure!)

### Step 2: Configure API Key
When you first open the app, you'll see an API key setup screen:
1. Paste your Gemini API key
2. Click "Initialize AI Features"
3. The key is stored locally in your browser (never shared)

### Step 3: Start Using AI Features
Once configured, you'll see:
- ✅ "AI features active • Using Gemini 2.5 Flash" indicator
- Smart Entry tab with natural language input and receipt upload
- AI Chat interface for spending insights

## 📱 How to Use Each Feature

### Natural Language Entry
1. Click the "Smart Entry" tab
2. Type your expense in natural language in the text box
3. Examples to try:
   - "spent 50 on pizza yesterday"
   - "paid 120 for electricity bill"
   - "coffee 4.50 this morning"
   - "gas station 45 on Tuesday"
4. Click "Parse Expense" or press Enter
5. Review the extracted fields and edit if needed
6. Click "Add Expense" to save

### Receipt Scanning
1. Click the "Smart Entry" tab
2. In the Receipt Scanner section:
   - Drag & drop a receipt image, or
   - Click to select from files, or
   - Use camera on mobile devices
3. Wait for AI to process the image (few seconds)
4. Review extracted merchant, amount, date, and category
5. Edit any fields if needed
6. Click "Add Expense" to save

### AI Chat for Insights
1. Use the chat interface on the right side
2. Ask questions about your spending:
   - "How much on food this week?"
   - "What's my average daily spending?"
   - "Show me my spending trend"
   - "Which category do I spend most on?"
3. Get instant, conversational responses with specific data

## 🛠️ Technical Architecture

### AI Services Layer
```
src/services/ai/
├── GeminiClient.js      # Core API client with rate limiting
├── NLPParser.js         # Natural language processing
├── ReceiptOCR.js        # Image OCR processing
├── ChatService.js       # Conversational insights
├── BudgetAdvisor.js     # Budget suggestions (future)
└── index.js             # Services manager
```

### React Components
```
src/components/ai/
├── NLExpenseInput.jsx   # Natural language input UI
├── ReceiptUpload.jsx    # Receipt upload and preview
├── ExpensePreview.jsx   # AI-parsed data review
├── ChatInterface.jsx    # Conversational chat UI
└── index.js             # Components export
```

### Key Features
- **Rate Limiting**: Respects Gemini API limits (60 requests/minute)
- **Error Handling**: Graceful degradation when AI services fail
- **Offline Support**: Core expense tracking works without AI
- **Privacy**: All data stays local, only anonymized data sent to AI
- **Confidence Scoring**: AI provides confidence levels for extractions

## 🔒 Privacy & Security

### Data Privacy
- ✅ All expense data stored locally in your browser
- ✅ Only anonymized data sent to Gemini (amounts, categories, dates)
- ✅ No personal information (names, addresses) sent to AI
- ✅ API key stored securely in browser localStorage
- ✅ No cloud sync or external data sharing

### What Gets Sent to AI
- **Natural Language**: Your expense descriptions for parsing
- **Receipt Images**: Photos for OCR processing (temporarily)
- **Spending Queries**: Anonymized expense data for insights
- **NOT Sent**: Personal details, full expense history, sensitive info

## 🚨 Troubleshooting

### Common Issues

**"AI service configuration error"**
- Check your API key is correct
- Ensure you have internet connection
- Verify API key has proper permissions

**"Rate limit exceeded"**
- Wait 1 minute before trying again
- Gemini free tier: 60 requests/minute, 1500/day
- Consider upgrading to paid tier for higher limits

**"Only English receipts supported"**
- Currently supports English-language receipts only
- Use manual entry for non-English receipts
- Multi-language support planned for future updates

**"Receipt scanning failed"**
- Ensure image is clear and well-lit
- Check file size is under 10MB
- Supported formats: JPEG, PNG, WebP
- Try taking a new photo with better lighting

**Natural language parsing errors**
- Try rephrasing your expense description
- Include amount, what you bought, and when
- Use examples provided in the interface
- Fall back to manual entry if needed

### Performance Tips
- Use clear, simple language for best parsing results
- Take well-lit, focused photos of receipts
- Ask specific questions in chat for better insights
- Keep expense descriptions concise but descriptive

## 🔄 Updates & Roadmap

### Current Version Features
- ✅ Natural language expense entry
- ✅ Receipt image OCR
- ✅ Conversational spending insights
- ✅ Gemini 2.5 Flash integration
- ✅ Rate limiting and error handling
- ✅ Dark mode support

### Coming Soon
- 🔄 AI budget suggestions and alerts
- 🔄 Multi-language receipt support
- 🔄 Voice input for expense entry
- 🔄 Advanced spending pattern analysis
- 🔄 Export insights to PDF/CSV
- 🔄 Recurring expense detection

## 💡 Tips for Best Results

### Natural Language Entry
- Be specific: "lunch at McDonald's 12.50" vs "food"
- Include timing: "yesterday", "this morning", "Tuesday"
- Mention amounts clearly: "$50", "50 dollars", "fifty bucks"

### Receipt Scanning
- Good lighting is crucial
- Keep receipt flat and unfolded
- Ensure text is readable in the photo
- Clean receipts scan better than crumpled ones

### Chat Insights
- Ask specific questions for better answers
- Use time ranges: "this week", "last month"
- Reference categories: "food spending", "transport costs"
- Follow up with related questions for deeper insights

## 🆘 Support

If you encounter issues:
1. Check this documentation first
2. Verify your API key configuration
3. Try refreshing the page
4. Check browser console for error details
5. Ensure you have a stable internet connection

For technical issues, the app includes detailed error messages and fallback options to ensure core functionality remains available even when AI features are unavailable.

---

**Note**: This AI-enhanced expense tracker follows spec-driven development principles with layered architecture, input validation, graceful degradation, and comprehensive error handling as outlined in the project specifications.
