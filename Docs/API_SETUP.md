# API Layer Setup - n8n Webhook Integration

This document provides setup instructions for the API layer configured for n8n webhook integration.

## Quick Start

### 1. Environment Configuration

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5678/api/v1
NEXT_PUBLIC_N8N_API_KEY=your-api-key-if-needed
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. API Client

The API client is automatically configured using:
- **Location**: `src/lib/api/client.ts`
- **Configuration**: `src/lib/api/config.ts`
- **Base URL**: From `NEXT_PUBLIC_API_BASE_URL` environment variable

### 3. Available API Services

All API services are located in `src/lib/api/`:

- `auth.ts` - Authentication endpoints
- `persons.ts` - Person CRUD operations
- `companies.ts` - Company CRUD operations
- `users.ts` - User management
- `addresses.ts` - Address operations
- `contacts.ts` - Contact operations
- `identifications.ts` - Identification operations
- `invoices.ts` - Invoice operations
- `transactions.ts` - Transaction operations
- `lookups.ts` - Reference/lookup data
- `objectRelations.ts` - Object relationship operations

### 4. Usage Example

```typescript
import { personApi } from '@/lib/api';

// Get all persons
const persons = await personApi.getAll({ page: 1, per_page: 20 });

// Get single person
const person = await personApi.getById(1);

// Create person
const newPerson = await personApi.create({
  first_name: 'John',
  last_name: 'Doe',
  // ... other fields
});

// Update person
const updated = await personApi.update(1, {
  first_name: 'Jane',
});

// Delete person
await personApi.delete(1);
```

## API Endpoints

All endpoints follow the pattern: `{baseURL}/{resource}`

### Base URL
- Development: `http://localhost:5678/api/v1`
- Production: Set via `NEXT_PUBLIC_API_BASE_URL`

### Endpoints

See `src/lib/api/config.ts` for all available endpoints.

## Response Format

All API responses follow this format:

**Success (Single Item)**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (List)**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## Authentication

The API client automatically:
1. Reads token from `localStorage.getItem('auth_token')`
2. Adds `Authorization: Bearer {token}` header to requests
3. Redirects to `/login` on 401 errors

## Error Handling

Errors are automatically transformed to a consistent format:

```typescript
try {
  const data = await personApi.getById(1);
} catch (error) {
  console.error(error.error.code); // Error code
  console.error(error.error.message); // Error message
  console.error(error.error.details); // Additional details
}
```

## n8n Webhook Setup

For detailed n8n webhook setup instructions, see:
- `src/lib/api/n8n-guide.md` - Complete integration guide

## Configuration Files

- `src/lib/api/config.ts` - API configuration and endpoints
- `src/lib/api/client.ts` - Axios client with interceptors
- `src/lib/api/webhook.ts` - Webhook utility functions

## Testing

### Test API Connection

```typescript
import { lookupApi } from '@/lib/api';

// Test connection by fetching languages
const languages = await lookupApi.getLanguages();
console.log('API connected:', languages.success);
```

### Test with curl

```bash
# Test GET request
curl http://localhost:5678/api/v1/languages

# Test POST request
curl -X POST http://localhost:5678/api/v1/persons \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe"}'
```

## Troubleshooting

### Connection Issues

1. Verify n8n is running: `http://localhost:5678`
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Verify webhook nodes are active in n8n

### Authentication Issues

1. Check token is stored: `localStorage.getItem('auth_token')`
2. Verify token format in n8n workflow
3. Check token expiration

### Response Format Issues

1. Verify n8n returns responses in expected format
2. Check webhook response structure matches API contract
3. Review error logs in n8n execution history

## Next Steps

1. Set up n8n workflows for each endpoint
2. Configure authentication in n8n
3. Test API endpoints
4. Integrate with frontend components

For more details, see the [n8n Integration Guide](./src/lib/api/n8n-guide.md).

