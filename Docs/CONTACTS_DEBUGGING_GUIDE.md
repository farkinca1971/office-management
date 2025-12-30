# Contacts Tab Debugging Guide

## The Problem

The Contacts tab **IS calling the API endpoints**, but you're not seeing the requests or they're failing silently.

## What's Actually Happening

When you click the "Contacts" tab on `/employees` page:

### Step 1: Component Mounts
```typescript
// File: ContactsTab.tsx:48-50
useEffect(() => {
  loadData();  // ← This runs immediately
}, [objectId, language]);
```

### Step 2: loadData() Function Executes
```typescript
// File: ContactsTab.tsx:58-61
const [contactsResponse, typesResponse] = await Promise.all([
  contactApi.getByObjectId(objectId),     // ← Makes API call #1
  lookupApi.getContactTypes(language),    // ← Makes API call #2
]);
```

### Step 3: API Call #1 - Get Contacts
```
URL: https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/1/contacts

Method: GET

This call SHOULD happen when you click the Contacts tab!
```

### Step 4: API Call #2 - Get Contact Types (Lookup Data)
```
URL: https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/contact-types

Method: GET

This call uses the DIFFERENT webhook (from .env.local)!
```

## The Issue: Two Different Webhooks!

Your `.env.local` has:
```bash
NEXT_PUBLIC_API_BASE_URL=https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1
```

But the contacts endpoint comment says:
```bash
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:object_id/contacts
```

### Result:
- ✅ **Contact Types** will load (from webhook `d35779a0...`)
- ❌ **Contacts** will fail (wrong webhook URL)

## How to Verify This

### Option 1: Check Browser DevTools

1. Open `/employees` page
2. Open DevTools (F12) → Network tab
3. Click "Contacts" tab
4. Look for these requests:

```
GET .../objects/1/contacts
Status: Should be 200, probably 404 or failed

GET .../lookups/contact-types
Status: Probably 200 (success)
```

### Option 2: Check Console Errors

The error is being caught and logged:

```typescript
// File: ContactsTab.tsx:65-67
catch (err: any) {
  console.error('Error loading contacts:', err);
  setError(err?.error?.message || 'Failed to load contacts');
}
```

**Look in the browser console** for:
```
Error loading contacts: <error message>
```

### Option 3: Look at the UI

If the endpoint isn't working, you should see:
- ❌ Error alert at the top of the tab: "Failed to load contacts"
- ✅ Contact Types dropdown still works (because that uses the working webhook)

## The Solution

You have **3 options**:

### Option A: Update contacts.ts to Use Current Webhook (Quick Fix)

Change the base URL in the contacts API file:

```typescript
// File: frontend/src/lib/api/contacts.ts

// Currently using apiClient which points to d35779a0-d5b1-438f-be5e-52f7b29be868

// Need to create a separate client for contacts endpoint
// OR update the main webhook to handle contacts routes
```

### Option B: Configure Contacts Routes in Main Webhook (Recommended)

Add the contacts endpoint handling to your **existing webhook** `d35779a0-d5b1-438f-be5e-52f7b29be868`:

1. Open that workflow in n8n
2. Add routing for `/objects/:object_id/contacts` and `/contacts/:id`
3. Follow the activation guide

This way everything uses one webhook.

### Option C: Create a Separate API Client for Contacts

```typescript
// Create a new contacts-specific client
import axios from 'axios';

const contactsClient = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  timeout: 30000,
});

// Then update contacts.ts to use contactsClient instead of apiClient
```

## Recommended Approach

**Use Option B** - Configure the contacts routes in your main webhook `d35779a0-d5b1-438f-be5e-52f7b29be868`.

This keeps everything centralized and uses the universal scripts pattern you already have working.

## Testing After Fix

Once you configure the endpoint, you should see:

✅ **Contacts tab loads without error**
✅ **Empty table shows** (if no data): "No contacts found"
✅ **Add New Contact button appears**
✅ **Contact Type dropdown populates** with: Email, Phone, etc.

## Current API Client Configuration

```typescript
// File: frontend/src/lib/api/client.ts
const config = getApiConfig();

// Points to:
baseURL: https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1
```

All API calls use this base URL by default, which is why the contacts endpoint can't be reached at the different webhook ID.

## Quick Test Command

```bash
# Test current webhook (should work for lookups)
curl https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/contact-types

# Test contacts endpoint (probably fails)
curl https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/objects/1/contacts
```

If the second curl fails with 404, you need to add contacts routing to that webhook.

---

## Summary

**The tab DOES call the endpoint** - it's just calling the wrong webhook URL because:

1. The frontend uses `NEXT_PUBLIC_API_BASE_URL` from `.env.local`
2. That points to webhook `d35779a0...`
3. But contacts endpoint is (supposedly) at webhook `244d0b91...`
4. Result: API call fails, error is caught, error message displays

**Fix:** Configure contacts endpoints in your main webhook `d35779a0-d5b1-438f-be5e-52f7b29be868` using the universal scripts pattern.
