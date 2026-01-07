# n8n CORS Configuration Fix

## Problem

When making DELETE requests (and other non-simple requests) from the frontend (`localhost:3000`) to the n8n webhook (`n8n.wolfitlab.duckdns.org`), the browser sends a **preflight OPTIONS request** first. The n8n webhook is currently:

1. **Returning 500 Internal Server Error** on OPTIONS requests
2. **Not returning CORS headers** (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.)
3. **Not configured to handle OPTIONS method**

## Error Details

```
Access to XMLHttpRequest at 'https://n8n.wolfitlab.duckdns.org/webhook/.../api/v1/documents/18' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Network Tab Shows:**
- Request Method: `OPTIONS`
- Status Code: `500 Internal Server Error`
- Missing CORS headers in response

## Solution: Configure n8n Webhook to Handle CORS

### Option 1: Add CORS Handling Node (Recommended)

Add a **Code Node** at the beginning of your workflow (right after the Webhook trigger) to handle OPTIONS requests:

```javascript
// Check if this is a preflight OPTIONS request
if ($input.item.json.method === 'OPTIONS') {
  return {
    json: {},
    headers: {
      'Access-Control-Allow-Origin': '*', // Or specific origin: 'http://localhost:3000'
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Language-ID',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Content-Length': '0'
    },
    statusCode: 200
  };
}

// For non-OPTIONS requests, pass through to next node
return $input.item;
```

**Important:** Make sure this Code node is set to:
- **Mode**: "Run Once for All Items"
- **Place it BEFORE** any authentication or validation nodes

### Option 2: Add CORS Headers to All Responses

Add a **Code Node** at the END of your workflow (before the response) to add CORS headers to all responses:

```javascript
// Get the response data from previous node
const responseData = $input.item.json;

// Add CORS headers to response
return {
  json: responseData,
  headers: {
    'Access-Control-Allow-Origin': '*', // Or specific: 'http://localhost:3000'
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Language-ID',
    'Access-Control-Allow-Credentials': 'true'
  }
};
```

### Option 3: Use n8n's Built-in CORS Settings (if available)

Some n8n versions have built-in CORS settings in the Webhook node:
1. Open your Webhook node
2. Look for **"CORS"** or **"Response Headers"** settings
3. Enable CORS and configure:
   - Allowed Origins: `http://localhost:3000` (or `*` for development)
   - Allowed Methods: `GET, POST, PUT, DELETE, OPTIONS`
   - Allowed Headers: `Authorization, Content-Type, X-Language-ID`

## Complete Workflow Structure

Your document DELETE workflow should look like this:

```
1. Webhook Trigger
   - Method: DELETE
   - Path: /api/v1/documents/:id
   
2. Code Node (CORS Handler) ⬅️ ADD THIS
   - Handle OPTIONS requests
   - Return CORS headers
   
3. Authentication Node (if needed)
   - Validate Bearer token
   
4. SQL Node (Delete Document)
   - UPDATE objects SET is_active = 0 WHERE id = :id
   
5. Response Formatter Node
   - Format success response
   
6. Code Node (Add CORS Headers) ⬅️ ADD THIS
   - Add CORS headers to response
```

## Testing

After implementing the fix:

1. **Test OPTIONS request**:
   ```bash
   curl -X OPTIONS \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: DELETE" \
     -H "Access-Control-Request-Headers: authorization,x-language-id" \
     https://n8n.wolfitlab.duckdns.org/webhook/.../api/v1/documents/18
   ```

   **Expected Response:**
   - Status: `200 OK`
   - Headers should include:
     - `Access-Control-Allow-Origin: *`
     - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
     - `Access-Control-Allow-Headers: Authorization, Content-Type, X-Language-ID`

2. **Test DELETE request**:
   ```bash
   curl -X DELETE \
     -H "Origin: http://localhost:3000" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Language-ID: 3" \
     https://n8n.wolfitlab.duckdns.org/webhook/.../api/v1/documents/18
   ```

## Production Considerations

For production, **DO NOT** use `Access-Control-Allow-Origin: *`. Instead:

1. **Whitelist specific origins**:
   ```javascript
   const allowedOrigins = [
     'https://your-production-domain.com',
     'https://www.your-production-domain.com'
   ];
   
   const origin = $input.item.json.headers?.origin || '';
   const corsOrigin = allowedOrigins.includes(origin) ? origin : '';
   
   return {
     headers: {
       'Access-Control-Allow-Origin': corsOrigin,
       // ... other headers
     }
   };
   ```

2. **Use environment variables** for allowed origins
3. **Enable credentials only when needed**:
   ```javascript
   'Access-Control-Allow-Credentials': 'true' // Only if using cookies/auth
   ```

## Additional Notes

- **All HTTP methods** (GET, POST, PUT, DELETE) may trigger preflight if they include custom headers like `Authorization` or `X-Language-ID`
- **OPTIONS requests should NOT** trigger your main workflow logic (database operations, etc.)
- **OPTIONS requests should return quickly** (just CORS headers, no processing)

## Related Endpoints

This fix should be applied to **ALL webhook endpoints** that:
- Accept DELETE requests
- Accept requests with custom headers (Authorization, X-Language-ID)
- Are called from a different origin (cross-origin requests)

Common endpoints that need this fix:
- `/api/v1/documents/:id` (DELETE)
- `/api/v1/persons/:id` (DELETE)
- `/api/v1/companies/:id` (DELETE)
- `/api/v1/files/:id` (DELETE)
- Any endpoint that uses custom headers

