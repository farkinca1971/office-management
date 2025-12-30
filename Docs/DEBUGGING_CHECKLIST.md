# Debugging Checklist - Why Can't I See API Calls?

## Step-by-Step Debugging Guide

### 1. Is the Dev Server Running?

```bash
cd frontend
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**If NOT running:** Start it first!

---

### 2. Navigate to the Page

Open browser and go to:
```
http://localhost:3000/employees
```

**What you should see:**
- Page title: "Employees"
- Two tabs: "Employee List" and "Contacts"
- "Add Employee" button in top right

**If you DON'T see this:** Check that the dev server started successfully

---

### 3. Open DevTools BEFORE Clicking Tab

**Important:** Open DevTools FIRST, then click the tab

1. Press **F12** (or Cmd+Option+I on Mac)
2. Click **Network** tab in DevTools
3. Make sure "Preserve log" is checked
4. Clear the network log (trash can icon)

---

### 4. Click the "Contacts" Tab

Click on the **"Contacts"** tab button.

**What should happen immediately:**

✅ **Tab switches to "Contacts"**
✅ **You see "Loading contacts..."** (briefly)
✅ **In DevTools Network tab, you should see TWO requests:**

```
GET  .../objects/1/contacts
GET  .../lookups/contact-types
```

---

### 5. Check What You Actually See

#### Scenario A: I See the Network Requests ✅

Great! The API calls ARE being made. Check the response:

**For contacts request:**
- Status 200 → Endpoint is working!
- Status 404 → Endpoint not configured in n8n
- Status 500 → Server error, check n8n logs
- Failed → Network/CORS issue

**For contact-types request:**
- Status 200 → Should always work (uses main webhook)

#### Scenario B: I DON'T See Any Network Requests ❌

This means the component isn't loading. Check:

1. **Is the Contacts tab actually selected?**
   - The tab button should be blue/highlighted
   - URL might change to `#contacts` or similar

2. **Check Browser Console for errors:**
   - Press F12 → Console tab
   - Look for red errors
   - Common issues:
     - `Cannot find module...` → Import error
     - `Unexpected token...` → Syntax error
     - `Hook error...` → React hook issue

3. **Check if component is rendering:**
   - Right-click on the page → Inspect
   - Look for `<div>` with ContactsTab content
   - If not present → Component isn't mounting

#### Scenario C: I See an Error Message on Screen ⚠️

If you see an error alert box, read the message:

- **"Failed to load contacts"** → API call failed (check Network tab for why)
- **"Network Error"** → Can't reach the n8n server
- **"404 Not Found"** → Endpoint doesn't exist in n8n
- **Other error** → Copy the exact message and check n8n logs

#### Scenario D: I See "No contacts found" ✅

This is GOOD! It means:
- ✅ API call succeeded
- ✅ Endpoint is working
- ℹ️  There's just no data in the database

To add test data, click **"Add New Contact"** button

---

### 6. Force the API Call (Debugging Method)

Add this to help debug. Open DevTools Console and type:

```javascript
// Check if contactApi is available
console.log(window.location.pathname);

// If you're on /employees, open the console and type:
fetch('https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/1/contacts')
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));
```

This will make a direct API call and show you the result.

**Expected responses:**

✅ **Success (200):**
```json
{
  "success": true,
  "data": [...]
}
```

❌ **Not Found (404):**
```
404 Not Found
```

❌ **CORS Error:**
```
Access to fetch... has been blocked by CORS policy
```

---

### 7. Check Component Mount

Add temporary logging to verify component is mounting:

In `ContactsTab.tsx`, the `useEffect` at line 48 should trigger.

**To verify**, open DevTools Console when you click the tab. You should see:
```
Error loading contacts: <error details>
```

Even if there's an error, this proves the component mounted and tried to call the API.

**If you DON'T see this log:**
- Component isn't mounting
- Check if `activeTab === 'contacts'` in employees/page.tsx
- Check browser console for React errors

---

### 8. Verify the Correct Webhook URL

The contacts API should be calling:
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/1/contacts
```

**To verify**, in DevTools Network tab:
1. Click on the request
2. Look at "Request URL"
3. It should match the URL above

**If it's calling a DIFFERENT URL:**
- Check `frontend/src/lib/api/contacts.ts` line 26
- The `baseURL` should be the contacts webhook, not the main webhook

---

### 9. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| No network requests at all | Component not rendering - check console for errors |
| Network requests to wrong URL | Check contacts.ts baseURL configuration |
| 404 Not Found | Configure the endpoint in n8n webhook |
| CORS error | Add CORS headers in n8n webhook response |
| "Failed to load contacts" error | Check Network tab for actual HTTP error |
| Component shows loading forever | API call is hanging - check network timeout |
| Console shows "contactApi is not defined" | Import error - check imports in ContactsTab.tsx |

---

### 10. What to Tell Me

If you still can't see API calls, please tell me:

1. **What do you see on screen** when you click Contacts tab?
   - Loading spinner?
   - Error message?
   - Blank screen?
   - "No contacts found"?

2. **What's in the Network tab?**
   - No requests at all?
   - Requests to different URL?
   - Failed requests?

3. **What's in the Console tab?**
   - Any red errors?
   - Any console.log output?

4. **Did you:**
   - ✅ Run `npm run dev`?
   - ✅ Navigate to `http://localhost:3000/employees`?
   - ✅ Click the "Contacts" tab?
   - ✅ Have DevTools open with Network tab visible?

This information will help me figure out exactly what's happening!

---

## Quick Test Command

Run this from your terminal to test if the endpoint is reachable:

```bash
curl -v https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/1/contacts 2>&1 | grep "HTTP"
```

**Expected:**
- `HTTP/2 200` → Endpoint works!
- `HTTP/2 404` → Endpoint not configured
- `Connection refused` → n8n not reachable
