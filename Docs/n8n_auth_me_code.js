/**
 * n8n Code Node - Get Current User (/auth/me)
 * 
 * This node extracts user_id from JWT token and prepares data for MySQL query
 * 
 * Setup:
 * 1. Add a Code node in n8n after Webhook node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect to MySQL node to fetch user data
 * 
 * Input: Webhook request with Authorization header
 * Output: user_id for MySQL query
 */

// Get input data from webhook
const inputData = $input.all()[0].json;

// Extract Authorization header
const authHeader = inputData.headers?.authorization || 
                   inputData.headers?.Authorization || 
                   inputData.query?.authorization ||
                   inputData.body?.authorization || '';

// Extract token from "Bearer {token}" format
let token = '';
if (authHeader.startsWith('Bearer ')) {
  token = authHeader.substring(7);
} else if (authHeader) {
  token = authHeader;
}

if (!token) {
  return {
    json: {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization token provided'
      }
    }
  };
}

// Decode JWT token (simple base64 decode - for production, use proper JWT library)
// JWT format: header.payload.signature
try {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  // Decode payload (second part)
  const payload = parts[1];
  // Add padding if needed for base64 decode
  const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
  const decodedPayload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf-8'));
  
  // Extract user_id from token payload
  // Adjust these field names based on your JWT token structure
  const userId = decodedPayload.user_id || 
                 decodedPayload.userId || 
                 decodedPayload.id || 
                 decodedPayload.sub || 
                 decodedPayload.user?.id;
  
  if (!userId) {
    return {
      json: {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token does not contain user_id'
        }
      }
    };
  }
  
  // Return user_id for MySQL query
  return {
    json: {
      user_id: userId,
      token: token, // Keep token for reference if needed
      decoded_payload: decodedPayload // For debugging (remove in production)
    }
  };
  
} catch (error) {
  return {
    json: {
      success: false,
      error: {
        code: 'TOKEN_DECODE_ERROR',
        message: 'Failed to decode token: ' + error.message
      }
    }
  };
}

