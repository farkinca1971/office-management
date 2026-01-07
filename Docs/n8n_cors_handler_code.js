/**
 * n8n Code Node - CORS Preflight Handler
 * 
 * Place this node RIGHT AFTER your Webhook trigger node
 * This handles OPTIONS preflight requests before they reach your main workflow
 * 
 * Setup:
 * 1. Add a Code node after your Webhook node
 * 2. Set language to JavaScript
 * 3. Set Mode to "Run Once for All Items"
 * 4. Paste this code
 * 5. Connect this node to your authentication/validation nodes
 */

// Get the incoming request data
const requestData = $input.all()[0].json;

// Check if this is a preflight OPTIONS request
const isOptionsRequest = requestData.method === 'OPTIONS' || 
                         requestData.headers?.['access-control-request-method'];

if (isOptionsRequest) {
  // This is a CORS preflight request - return immediately with CORS headers
  // DO NOT process this request through your workflow
  
  // Get the origin from the request (for production, validate against whitelist)
  const origin = requestData.headers?.origin || 
                 requestData.headers?.Origin || 
                 '*';
  
  // For development: allow all origins
  // For production: validate against whitelist
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
  
  return {
    json: {
      success: true,
      message: 'CORS preflight successful'
    },
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Language-ID, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
      'Content-Type': 'application/json'
    },
    statusCode: 200
  };
}

// For non-OPTIONS requests, pass through to next node
// The request will continue through your workflow normally
return {
  json: requestData
};

