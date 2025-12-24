# API Layer Documentation

This directory contains all API service modules for communicating with n8n webhooks.

## Structure

```
api/
├── client.ts          # Axios client with interceptors
├── config.ts          # API configuration and endpoints
├── webhook.ts         # n8n webhook utilities
├── index.ts           # Centralized exports
│
├── auth.ts            # Authentication endpoints
├── lookups.ts         # Reference/lookup data
│
├── persons.ts         # Person CRUD operations
├── companies.ts       # Company CRUD operations
├── users.ts           # User management
│
├── addresses.ts       # Address operations
├── contacts.ts        # Contact operations
├── identifications.ts # Identification operations
├── objectRelations.ts # Object relationship operations
│
├── invoices.ts        # Invoice operations
├── transactions.ts    # Transaction operations
│
└── n8n-guide.md       # n8n integration guide
```

## Core Modules

### `client.ts`
Centralized Axios instance with:
- Request interceptors (authentication)
- Response interceptors (error handling)
- Automatic token management
- Standardized error format

### `config.ts`
API configuration:
- Environment-based configuration
- Webhook endpoint definitions
- Header management
- URL building utilities

### `webhook.ts`
n8n webhook utilities:
- Response transformation
- Payload formatting
- Query string building
- Error extraction

## API Services

All services follow the same pattern:

```typescript
export const resourceApi = {
  getAll: async (params?): Promise<ListResponse>,
  getById: async (id: number): Promise<Response>,
  create: async (data: CreateRequest): Promise<Response>,
  update: async (id: number, data: UpdateRequest): Promise<Response>,
  delete: async (id: number): Promise<{ success: true }>,
};
```

### Available Services

- **authApi** - Login, logout, token refresh
- **lookupApi** - All reference data (languages, types, statuses, etc.)
- **personApi** - Person CRUD operations
- **companyApi** - Company CRUD operations
- **userApi** - User management
- **addressApi** - Address operations (by object)
- **contactApi** - Contact operations (by object)
- **identificationApi** - Identification operations (by object)
- **objectRelationApi** - Object relationship operations
- **invoiceApi** - Invoice CRUD + payment/void operations
- **transactionApi** - Transaction CRUD operations

## Usage

### Basic Usage

```typescript
import { personApi } from '@/lib/api';

// Get all persons
const response = await personApi.getAll({ page: 1, per_page: 20 });
console.log(response.data); // Array of persons
console.log(response.pagination); // Pagination info

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

### Error Handling

```typescript
import { personApi } from '@/lib/api';

try {
  const person = await personApi.getById(1);
} catch (error) {
  if (error.error) {
    console.error('Error Code:', error.error.code);
    console.error('Error Message:', error.error.message);
    console.error('Details:', error.error.details);
  }
}
```

### Using Lookup Data

```typescript
import { lookupApi } from '@/lib/api';

// Get all languages
const languages = await lookupApi.getLanguages();

// Get object statuses for a specific type
const statuses = await lookupApi.getObjectStatuses(1); // object_type_id = 1

// Get currencies
const currencies = await lookupApi.getCurrencies();
```

## Configuration

See `API_SETUP.md` in the frontend root for configuration instructions.

## n8n Integration

See `n8n-guide.md` for detailed n8n webhook setup instructions.

## Type Safety

All API services are fully typed:
- Request types: `CreateRequest`, `UpdateRequest`
- Response types: `Response`, `ListResponse`
- Parameter types: `ListParams`

Types are defined in:
- `src/types/api.ts` - API-specific types
- `src/types/entities.ts` - Entity types
- `src/types/common.ts` - Common types

## Testing

### Test API Connection

```typescript
import { lookupApi } from '@/lib/api';

// Simple connection test
try {
  const languages = await lookupApi.getLanguages();
  console.log('API connected successfully');
} catch (error) {
  console.error('API connection failed:', error);
}
```

### Mock Data for Development

For development without n8n, you can create mock API responses:

```typescript
// In your component or test
const mockResponse = {
  success: true,
  data: { id: 1, first_name: 'John', last_name: 'Doe' },
};
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks
2. **Use TypeScript types**: Leverage type safety
3. **Check response.success**: Verify success before using data
4. **Handle pagination**: Use pagination info for lists
5. **Cache lookup data**: Store frequently used lookup data
6. **Validate input**: Validate data before sending requests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure CORS in n8n webhook settings
2. **401 Unauthorized**: Check token in localStorage
3. **Network Errors**: Verify n8n is running and accessible
4. **Timeout Errors**: Increase timeout in config

### Debug Tips

1. Check browser Network tab for request/response
2. Verify environment variables are set
3. Check n8n execution logs
4. Use console.log to inspect responses

## Next Steps

1. Set up n8n workflows for each endpoint
2. Configure authentication
3. Test all endpoints
4. Integrate with React components

