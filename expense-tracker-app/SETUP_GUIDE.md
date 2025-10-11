# 🚀 Quick Setup Guide - AI Expense Tracker

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Gemini API Key (free)

## Step-by-Step Setup

### 1. Get Your Gemini API Key (2 minutes)

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key

**Free Tier includes:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for personal use!

### 2. Install the Application (3 minutes)

bash
Clone the repository
git clone <repository-url>
cd expense-tracker-app

Navigate to frontend
cd frontend

Install dependencies
npm install


### 3. Configure API Key (1 minute)

bash
Create environment file
cp .env.example .env

Open .env in your text editor and add your API key
nano .env  # or use any text editor


Edit the `.env` file:
env
VITE_GEMINI_API_KEY=paste_your_actual_api_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_AI_DEBUG=false


### 4. Start the Application

bash
npm run dev


The app will start at:
- **Local:** http://localhost:3001 (or 5173)
- Look for the URL in terminal output

### 5. Explore Features

#### Add Your First Expense
1. Click **"Add Expense"** button
2. Fill in the form or use AI features:
   - Click **"Get AI suggestion"** for smart descriptions
   - Type naturally: "coffee 5 dollars this morning"

#### Try Natural Language Entry
Type any of these in the description field:
- "spent $50 on pizza yesterday"
- "paid 120 for electricity bill"  
- "gas station 45 on Tuesday"

#### Chat with AI Assistant
1. Click **"Ask AI Assistant"**
2. Ask questions like:
   - "Analyze my spending patterns"
   - "Give me budget advice"
   - "Which category should I reduce?"

## Troubleshooting

### Issue: "Cannot find module"
**Solution:**
bash
cd frontend
rm -rf node_modules package-lock.json
npm install


### Issue: "AI service configuration error"
**Solution:** Check your `.env` file
bash
cat frontend/.env


Verify the API key is set correctly (no quotes, no spaces)

### Issue: "Port already in use"
**Solution:** The app will automatically try another port (3001, 3002, etc.)
Or kill the process using the port:
bash
On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

On Mac/Linux
lsof -ti:3000 | xargs kill -9


### Issue: Charts not displaying
**Solution:** Add some expenses first - charts need data to display!

## Testing AI Features

### 1. Test API Connection
Open browser console (F12) and run:
javascript
// In the browser console
localStorage.setItem('GEMINI_API_KEY', 'your_key_here');


### 2. Test Natural Language
1. Click "Add Expense"
2. Type: "lunch 15 bucks yesterday"
3. See AI extract: Amount=$15, Category=Food, Date=yesterday

### 3. Test AI Chat
1. Click "Ask AI Assistant"
2. Type: "How much did I spend this week?"
3. Get instant analysis

## Production Build

To build for production:
bash
npm run build
npm run preview


Build files will be in `frontend/dist/`

## Next Steps

1. **Add Sample Data**: Click "Load Sample Data" button on dashboard
2. **Set Budget**: Go to Settings → Set monthly budget
3. **Explore Analytics**: View spending trends and category breakdowns
4. **Try Receipt Scanning**: (Coming soon) Upload receipt photos

## Support

- **Documentation**: See `README.md` and `AI_FEATURES_README.md`
- **Issues**: Report on GitHub Issues
- **Questions**: Check browser console (F12) for errors

## Quick Commands

bash
Development
npm run dev

Build for production
npm run build

Preview production build
npm run preview

Run tests
npm test

Lint code
npm run lint


## Success Checklist

- [ ] Node.js 16+ installed
- [ ] Gemini API key obtained
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Dev server running
- [ ] App opened in browser
- [ ] First expense added
- [ ] AI features tested

**You're all set! 🎉**

Enjoy tracking your expenses with AI-powered insights!
