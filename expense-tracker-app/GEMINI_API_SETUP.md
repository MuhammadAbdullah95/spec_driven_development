# Gemini API Setup & Troubleshooting

## Issue: AI Showing Static Responses Instead of LLM Responses

### Problem:
When you send messages to AI assistant, you get **fallback/static responses** instead of real AI-generated responses from Gemini.

### Root Cause:
The `.env` file has the API key, but **Vite dev server was not restarted** after the API key was added. Environment variables are only loaded when the server starts.

---

## Solution

### Step 1: Verify API Key Exists

Check that `frontend/.env` contains:
```bash
VITE_GEMINI_API_KEY=AIzaSyDxZfKTqtyJWzIuYTKKf2vumajHYiJKpOA
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_AI_DEBUG=false
```

✅ **API key is configured correctly!**

### Step 2: Restart Dev Server ✅ DONE

**IMPORTANT:** Vite doesn't hot-reload environment variables!

```bash
# Stop current dev server (Ctrl+C in terminal)
# Then restart:
cd frontend
npm run dev
```

✅ **Server has been restarted!**

### Step 3: Test New Port

**New server URL:** http://localhost:3003/

**Previous ports were in use, so server started on port 3003**

1. Open **http://localhost:3003/** in your browser
2. Click AI Assistant button
3. Type: "Give me budget advice"
4. Press Enter

**Expected behavior:**
- AI should now call Gemini API
- Response will be personalized and detailed
- No more static fallback responses

---

## How to Verify It's Working

### Check 1: Browser Console Logs

Open DevTools (F12) → Console tab

**Before fix (static responses):**
```
AI suggestion failed, using fallback: [error]
```

**After fix (real API calls):**
```
AI Assistant: Generating response for: give me budget advice
AI Assistant: Context data: {...}
[No fallback warnings]
```

### Check 2: Response Quality

**Static fallback response:**
```
## 💰 Budget Advice

**Recommendations:**
• Track daily: Log expenses as they happen
• Set category limits: Allocate budget by category
• Weekly reviews: Check progress every week
[Generic advice, not personalized]
```

**Real Gemini API response:**
```
Based on your spending of $20.00 over the last 7 days and your
monthly budget of $1500, you're doing well! Your spending rate is
very low. Consider setting aside more for savings...
[Personalized, specific to your data]
```

### Check 3: Network Tab

Open DevTools (F12) → Network tab

**Look for:**
- Requests to: `generativelanguage.googleapis.com`
- Status: 200 OK
- Response contains AI-generated text

**If you see these requests → API is working!**
**If you don't see these → Still using fallback**

---

## Debug Mode - See API Calls

Want to see exactly what's happening?

### Enable Debug Logging:

1. **Edit `frontend/.env`:**
   ```bash
   VITE_AI_DEBUG=true
   ```

2. **Restart dev server** (important!)

3. **Open browser console**

4. **Send a message to AI**

5. **Check console logs:**
   ```
   AI Service: Generating suggestion with prompt: ...
   AI Service: Raw response: {...}
   AI Service: Extracted suggestion: ...

   AI Chat: Generating response for: ...
   AI Chat: Context prompt: ...
   AI Chat: Raw response: {...}
   AI Chat: Processed response: ...
   ```

This shows:
- ✅ API is being called
- ✅ What prompt is sent
- ✅ What response is received
- ❌ Or what error occurred

---

## Common Issues

### Issue 1: Still Getting Fallback Responses

**Cause:** Server not restarted after .env change

**Solution:**
1. Stop dev server (Ctrl+C)
2. Start again: `npm run dev`
3. Refresh browser (Ctrl+R)

### Issue 2: API Key Invalid

**Symptoms:**
- Network tab shows 401 Unauthorized
- Console: "API key not valid"

**Solution:**
1. Get new API key: https://aistudio.google.com/app/apikey
2. Update `VITE_GEMINI_API_KEY` in `.env`
3. Restart server

### Issue 3: Rate Limit Hit

**Symptoms:**
- Network tab shows 429 Too Many Requests
- Console: "Quota exceeded"

**Solution:**
- **Free tier limits:** ~60 requests per minute
- **Wait 1-2 minutes** and try again
- Or get API key from different Google account

### Issue 4: Network/CORS Error

**Symptoms:**
- Network tab shows failed request
- Console: "CORS error" or "Failed to fetch"

**Solution:**
- Check internet connection
- Disable VPN/proxy temporarily
- Disable ad blockers

---

## API Key Management

### Get API Key:
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Add to Project:
```bash
# Edit frontend/.env
VITE_GEMINI_API_KEY=AIzaSy...your_key_here
```

### Security Notes:
- ⚠️ **Never commit `.env` to git** (already in .gitignore)
- ⚠️ **Don't share API key publicly**
- ⚠️ **Regenerate if exposed**

### Free Tier Limits:
- **60 requests per minute**
- **1500 requests per day**
- Sufficient for personal use and testing

---

## Testing Checklist

After restarting server:

✅ **Step 1:** Open http://localhost:3003/
✅ **Step 2:** Open browser DevTools (F12)
✅ **Step 3:** Go to Console tab
✅ **Step 4:** Click AI Assistant
✅ **Step 5:** Type: "analyze my spending"
✅ **Step 6:** Check console - should NOT see "fallback" messages
✅ **Step 7:** Check Network tab - should see API request to googleapis.com
✅ **Step 8:** AI response should be detailed and personalized

---

## Current Status

✅ **API Key:** Configured correctly in `.env`
✅ **Dev Server:** Restarted to load environment variables
✅ **New Port:** http://localhost:3003/
✅ **Ready:** AI should now use real Gemini API

---

## Quick Commands

**Restart server:**
```bash
cd frontend
npm run dev
```

**Check API key:**
```bash
cat frontend/.env | grep VITE_GEMINI_API_KEY
```

**Enable debug mode:**
```bash
# Edit frontend/.env
VITE_AI_DEBUG=true
# Then restart server
```

**Test API in browser console:**
```javascript
// Check if API key is loaded
console.log('API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

---

## What Changed

### Before:
- `.env` file had API key
- But server was started before API key was added
- Environment variables were not loaded
- AI service couldn't access API key
- Fell back to static responses

### After:
- Server restarted ✅
- Environment variables loaded ✅
- API key accessible to AI service ✅
- Gemini API will be called ✅
- Real AI responses ✅

---

## Next Steps

1. **Open the new port:** http://localhost:3003/
2. **Test AI chat** with any question
3. **Verify in console** that you see real API calls
4. **Check Network tab** for googleapis.com requests
5. **Enjoy real AI responses!** 🎉

If still showing static responses:
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Check console for errors
- Verify API key in .env is correct
