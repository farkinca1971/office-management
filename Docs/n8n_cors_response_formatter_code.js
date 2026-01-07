/**
 * n8n Code Node - Add CORS Headers to Response
 * 
 * Place this node at the END of your workflow (before the final response)
 * This adds CORS headers to all responses (not just OPTIONS)
 * 
 * Setup:
 * 1. Add a Code node at the end of your workflow
 * 2. Set language to JavaScript
 * 3. Set Mode to "Run Once for All Items"
 * 4. Paste this code
 * 5. This should be your last node before the response
 */

// Get the response data from previous node
const responseData = $input.all()[0].json;

// Get the original request to check origin
const originalRequest = $('Webhook').item.json; // Adjust node name if different
const origin = originalRequest?.headers?.origin || 
                originalRequest?.headers?.Origin || 
                '*';

// For production: validate origin against whitelist
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://your-production-domain.com',
  // Add your production domains here
];

// In production, validate origin
// const corsOrigin = allowedOrigins.includes(origin) ? origin : '';
// For now, allow all origins (development)
const corsOrigin = '*';

// Add CORS headers to the response
return {
  json: responseData,
  headers: {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Language-ID, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  }
};

