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
