# AI Assistant Not Responding - Troubleshooting Guide

## Issue: "AI Assistant is not calling/responding"

### Quick Checks:

#### 1. Is the AI Chat Panel Opening?

**Test:**
- Click the chat icon (bottom right corner) OR
- Click "Ask AI Assistant" button in dashboard

**Expected:** Panel slides in from the right side

**If it doesn't open:**
- Check browser console (F12) for JavaScript errors
- Try refreshing the page (Ctrl+R or F5)

---

#### 2. Is the AI Responding to Messages?

**Test:**
- Open AI chat
- Type: "hello" or "give me budget advice"
- Press Enter or click Send button

**Expected:**
- You see your message appear
- "Typing..." indicator shows (3 dots bouncing)
- AI response appears within 2-5 seconds

**If no response:**
- Check if you see typing indicator
- Check browser console for errors
- Check network tab for failed requests

---

### Common Issues & Solutions:

## Issue 1: No API Key Configured ⚠️

**Symptoms:**
- AI responds but with generic fallback messages
- No personalized advice based on your data
- Console shows: "AI suggestion failed, using fallback"

**Solution:**

1. **Check if .env file has API key:**
   ```bash
   # Open terminal in project root
   cat frontend/.env
   ```

2. **Should show:**
   ```
   VITE_GEMINI_API_KEY=AIza...your_actual_key_here
   VITE_GEMINI_MODEL=gemini-2.0-flash-exp
   VITE_AI_DEBUG=false
   ```

3. **If API key missing, get one:**
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

4. **Add to .env file:**
   ```bash
   # Edit frontend/.env
   VITE_GEMINI_API_KEY=AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   cd frontend
   npm run dev
   ```

**Verification:**
- Open browser console
- Look for: "AI Service Test - Success"
- AI responses should be detailed and personalized

---

## Issue 2: API Rate Limit Hit 🚫

**Symptoms:**
- AI was working but suddenly stopped
- Console shows: "429 Too Many Requests"
- Error: "Quota exceeded"

**Solution:**

**Option A: Wait and retry**
- Gemini free tier has limits: ~60 requests/minute
- Wait 1-2 minutes and try again

**Option B: Use fallback mode**
- AI will work without API using static responses
- Still provides helpful advice
- Set `VITE_GEMINI_API_KEY=` (empty) in .env

**Option C: Get different API key**
- Create new Google account
- Generate new API key
- Use that key in .env

---

## Issue 3: Network Error 🌐

**Symptoms:**
- Console shows: "Failed to fetch"
- Error: "Network request failed"
- No response from AI

**Solution:**

1. **Check internet connection**
   - Verify you're online
   - Try opening google.com

2. **Check firewall/antivirus**
   - May be blocking API requests
   - Temporarily disable to test

3. **Check VPN/Proxy**
   - Some VPNs block AI API endpoints
   - Try disabling VPN

4. **Check browser extensions**
   - Ad blockers may block requests
   - Try disabling extensions

---

## Issue 4: Settings Not Loading ⚙️

**Symptoms:**
- AI says: "monthly income and budget are both $0.00"
- But you set them in Settings page

**Solution:**

See detailed guide: `AI_BUDGET_SETTINGS_FIX.md`

**Quick fix:**
1. Go to Settings page
2. Enter your budget info
3. **Click "Save Changes"** (critical!)
4. Verify in DevTools → Application → Local Storage
5. Key `expenseTrackerSettings` should exist

---

## Issue 5: JavaScript Error 🐛

**Symptoms:**
- Chat opens but crashes when sending message
- Blank screen or frozen UI
- Console shows error messages

**Solution:**

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Refresh page (F5)

2. **Hard reload:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Or Cmd+Shift+R (Mac)

3. **Check console for specific error:**
   - Press F12
   - Go to Console tab
   - Copy error message
   - Look for line numbers to identify issue

---

## Debug Mode - Enable Detailed Logging 🔍

**To see what's happening behind the scenes:**

1. **Enable debug mode:**
   ```bash
   # Edit frontend/.env
   VITE_AI_DEBUG=true
   ```

2. **Restart dev server**

3. **Open browser console (F12)**

4. **Send a message to AI**

5. **Check console logs:**
   - `AI Chat: Generating response for:` - Your question
   - `AI Chat: Context prompt:` - Full prompt sent to AI
   - `AI Chat: Raw response:` - Raw AI response
   - `AI Chat: Processed response:` - Cleaned response

**This helps identify:**
- If AI is receiving your message
- What data is being sent
- What response AI is returning
- Where the process is failing

---

## Manual Testing Commands

**Open browser console (F12) and run these:**

### 1. Check if AI service is loaded:
```javascript
// Should show the aiService object
console.log(window);
```

### 2. Test AI service directly:
```javascript
// Import the service (only works if exposed)
// Check if API key is configured
console.log('Has API Key:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

### 3. Check localStorage for settings:
```javascript
const settings = localStorage.getItem('expenseTrackerSettings');
console.log('Settings:', JSON.parse(settings));
```

### 4. Check expenses data:
```javascript
const expenses = localStorage.getItem('expenseTrackerExpenses');
console.log('Expenses:', JSON.parse(expenses));
```

### 5. Watch for errors:
```javascript
// Enable all console messages
console.log('Monitoring for errors...');
// Then try using AI chat
```

---

## Still Not Working? 🆘

### Step 1: Collect Information

Open browser console and check:
1. **Any red errors?** (Copy the full error message)
2. **Network tab:** Any failed requests? (Status code: 400, 401, 429, 500?)
3. **Console tab:** What's the last log message before it stops?

### Step 2: Try Fallback Mode

```bash
# Edit frontend/.env
VITE_GEMINI_API_KEY=
```

**This makes AI work without API using static responses.**

If this works, the issue is with API key or API service.
If this doesn't work, the issue is in the code/browser.

### Step 3: Test in Incognito Mode

1. Open browser in incognito/private mode
2. Navigate to http://localhost:3002/
3. Try AI chat again

**If it works:** Issue is with browser cache/extensions/localStorage
**If it doesn't work:** Issue is with the code or API

### Step 4: Check Recent Changes

The app was just updated. If it was working before:

1. **Check git diff:**
   ```bash
   git diff HEAD~1 frontend/src/components/features/AIAssistant.jsx
   ```

2. **Revert to previous version:**
   ```bash
   git checkout HEAD~1 -- frontend/src/components/features/AIAssistant.jsx
   ```

3. **Test if that fixes it**

---

## What to Report if Still Broken

If you need help, provide:

1. **Exact error message** from console
2. **What you did** step-by-step
3. **What you expected** to happen
4. **What actually happened**
5. **Browser** and version (Chrome 120, Firefox 121, etc.)
6. **Console logs** (screenshot or copy-paste)
7. **Network errors** (from Network tab in DevTools)

---

## Most Likely Causes (Based on "Not Calling AI")

### Scenario A: No API Key
- **Symptom:** AI responds but generic messages only
- **Fix:** Add Gemini API key to `.env` file
- **Verify:** Check console for "AI Service Test - Success"

### Scenario B: Rate Limited
- **Symptom:** Worked before, stopped suddenly
- **Fix:** Wait 1-2 minutes, try again
- **Verify:** Check Network tab for 429 error

### Scenario C: Settings Not Saved
- **Symptom:** AI says $0.00 budget
- **Fix:** Go to Settings, click "Save Changes"
- **Verify:** Check localStorage has settings

### Scenario D: JavaScript Error
- **Symptom:** Chat crashes or freezes
- **Fix:** Check console for errors, hard refresh
- **Verify:** No red errors in console

---

## Quick Reset (Nuclear Option) 💥

If nothing works, reset everything:

```javascript
// Open browser console
// Clear ALL data
localStorage.clear();
sessionStorage.clear();
// Hard refresh
window.location.reload(true);

// Then set up from scratch:
// 1. Add expenses
// 2. Go to Settings, fill in budget, click Save
// 3. Try AI chat again
```

---

## Contact Info for Debugging

**Console logs to check:**
- `AI Assistant: Generating response for:` - Shows your message
- `AI Assistant: Context data:` - Shows what data is being sent
- Any errors in red

**Files involved:**
- `frontend/src/components/features/AIAssistant.jsx` - Main chat component
- `frontend/src/services/aiService.js` - API service
- `frontend/.env` - API key configuration

**Current behavior:** AI was working earlier (you got the $0.00 response), so it WAS calling the API. The issue might be:
1. Temporary API issue
2. Rate limit hit
3. Recent code change broke something

**Test right now:**
1. Open http://localhost:3002/
2. Click AI chat icon
3. Type "hello"
4. Press Enter
5. Check what happens - does it respond at all?
