# AI Integration Setup Guide

## 🤖 Gemini AI Integration for Expense Suggestions

This guide will help you set up the real AI integration using Google's Gemini API for intelligent expense suggestions.

### 📋 Prerequisites

1. **Google AI Studio Account**: You need access to Google AI Studio
2. **Gemini API Key**: Generate an API key from Google AI Studio
3. **Environment Variables**: Configure your local environment

### 🔑 Getting Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Sign in**: Use your Google account to sign in
3. **Create API Key**: Click "Create API Key" button
4. **Copy the Key**: Save the generated API key securely

### ⚙️ Environment Setup

1. **Create/Update .env file** in the frontend directory:
```bash
# AI Services Configuration
VITE_GEMINI_API_KEY=your_actual_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_AI_DEBUG=true
```

2. **Replace `your_actual_api_key_here`** with your real Gemini API key

3. **Restart your development server** after adding the environment variables:
```bash
npm run dev
```

### 🎯 How AI Suggestions Work

The AI service provides intelligent, context-aware expense suggestions based on:

#### **Category-Specific Intelligence**
- **Food**: Suggests breakfast (morning), lunch (afternoon), dinner (evening)
- **Transport**: Differentiates between commute (weekday) vs leisure travel (weekend)
- **Entertainment**: Adapts to time of day and weekend vs weekday
- **Bills**: Recognizes utility bills, subscriptions, and recurring payments
- **Shopping**: Varies suggestions based on amount (small items vs major purchases)
- **Health**: Distinguishes between pharmacy items vs medical appointments

#### **Amount-Aware Suggestions**
- **Small amounts ($1-$20)**: Coffee, snacks, parking, small items
- **Medium amounts ($20-$100)**: Meals, transport, regular shopping
- **Large amounts ($100+)**: Major bills, big purchases, dining out

#### **Time & Context Awareness**
- **Morning (6-12 PM)**: Breakfast, coffee, commute expenses
- **Afternoon (12-5 PM)**: Lunch, work-related expenses
- **Evening (5-10 PM)**: Dinner, entertainment, evening activities
- **Weekend vs Weekday**: Different suggestion patterns
- **Recent Expenses**: Avoids repetition by considering your recent spending

### 🔍 Testing the AI Integration

#### **Visual Indicators**
- **Green dot + "AI Ready"**: API key configured and working
- **Yellow dot + "Fallback Mode"**: No API key, using smart fallbacks

#### **Testing Steps**
1. **Open Add Expense form**
2. **Select a category** (required for AI suggestions)
3. **Optionally enter an amount** for more specific suggestions
4. **Click "Get AI suggestion"**
5. **Watch for loading spinner** and generated suggestion

#### **Console Testing**
Open browser console and run:
```javascript
// Test AI service directly
aiService.testConnection();

// Check service status
aiService.getStatus();
```

### 📊 Example AI Suggestions

#### **Food Category Examples**
- Amount: $8, Time: 9 AM → "Coffee and croissant at local cafe"
- Amount: $25, Time: 1 PM → "Lunch at downtown restaurant"
- Amount: $60, Time: 7 PM → "Dinner for two at Italian restaurant"

#### **Transport Category Examples**
- Amount: $15, Weekday → "Metro card for daily commute"
- Amount: $45, Weekend → "Uber ride to shopping mall"
- Amount: $80, Any time → "Gas fill-up for weekly driving"

#### **Entertainment Category Examples**
- Amount: $12, Evening → "Movie theater tickets"
- Amount: $15, Any time → "Netflix monthly subscription"
- Amount: $75, Weekend → "Concert tickets downtown"

### 🛠️ Troubleshooting

#### **Common Issues**

1. **"Fallback Mode" showing**
   - Check if `VITE_GEMINI_API_KEY` is set in .env
   - Verify the API key is correct
   - Restart the development server

2. **API errors in console**
   - Check your API key validity
   - Verify you have Gemini API access
   - Check your Google Cloud billing (if required)

3. **Generic suggestions only**
   - Make sure to select a category first
   - Check if the API key has proper permissions
   - Enable debug mode: `VITE_AI_DEBUG=true`

#### **Debug Mode**
Enable debug logging to see detailed AI interactions:
```bash
VITE_AI_DEBUG=true
```

This will log:
- Prompts sent to Gemini
- Raw API responses
- Processed suggestions
- Error details

### 🔒 Security Notes

- **Never commit your API key** to version control
- **Keep your .env file** in .gitignore
- **Rotate your API key** periodically
- **Monitor your API usage** in Google AI Studio

### 🚀 Advanced Features

#### **Multiple Suggestions**
The service can generate multiple suggestions:
```javascript
const suggestions = await aiService.generateMultipleSuggestions('25', 'Food', {}, 3);
```

#### **Custom Context**
Pass recent expenses to avoid repetition:
```javascript
const suggestion = await aiService.generateExpenseSuggestion(
  '30', 
  'Food', 
  { recentExpenses: [{ description: 'Pizza delivery' }] }
);
```

### 📈 Fallback System

Even without an API key, the system provides intelligent fallbacks:
- **Category-specific suggestions** based on selected category
- **Amount-aware recommendations** 
- **Time-based variations**
- **Smart randomization** to avoid repetition

### 🎉 Success Indicators

You'll know the AI integration is working when:
- ✅ Status shows "AI Ready" with green dot
- ✅ Suggestions are specific and contextual
- ✅ Different suggestions for different categories/amounts
- ✅ No console errors when generating suggestions
- ✅ Loading spinner appears during generation

### 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key in Google AI Studio
3. Test with debug mode enabled
4. Check the fallback suggestions are working

The AI integration enhances user experience but the app works perfectly without it using intelligent fallbacks!
