# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Office Application is a full-stack web application featuring a modern Next.js 14 frontend with TypeScript, Tailwind CSS, and n8n webhook integration for backend operations. The application manages persons, companies, invoices, transactions, and reference data (lookups).

**Key Tech Stack:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand (state management)
- API Client: Axios with custom interceptors
- Form Validation: React Hook Form + Zod
- Data Fetching: TanStack React Query
- UI Framework: Material Tailwind + custom components
- Styling: Tailwind CSS with PostCSS

## Development Commands

Run these from the `frontend/` directory:

### Core Commands
```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checking (catch type errors)
```

### Common Development Tasks
```bash
# Type checking before committing
npm run type-check

# Fix linting issues
npm run lint --fix

# Build and verify production bundle
npm run build && npm run start
```

## Architecture & Key Concepts

### API Layer (`src/lib/api/`)
The API layer is centralized around an Axios instance with custom interceptors:

- **client.ts**: Core Axios instance with:
  - Automatic JWT token injection from localStorage
  - Automatic `language_id` addition to POST/PUT/PATCH requests (defaults to English ID 1)
  - 401 Unauthorized response handling (redirects to `/login`)
  - Standardized error formatting

- **Individual API modules** (auth.ts, persons.ts, lookups.ts, etc.): Thin wrappers around the client that define endpoint paths and request/response types

- **config.ts**: API configuration (base URL, timeout, webhook headers)

#### Critical Pattern: Language ID Handling
All POST/PUT/PATCH requests automatically include `language_id` via the request interceptor in client.ts. This is extracted from localStorage (languageStore with persist middleware key `'language-storage'`). When implementing features that mutate data, ensure language_id is not double-added to request bodies.

### State Management (`src/store/`)
Uses **Zustand** with persist middleware:

- **authStore.ts**: Authentication state (user, token, login/logout/checkAuth)
- **languageStore.ts**: Current language preference (persisted to localStorage)
- **lookupStore.ts**: Cache for reference data (populated from /lookups endpoints)
- **themeStore.ts**: Theme preference (light/dark mode)

All stores use persist middleware, so state survives page reloads.

### Master Data Structure (`src/app/master-data/`)
Reference data (lookups) are organized by type:
- `address-types`, `address-area-types`
- `contact-types`, `countries`, `currencies`, `languages`
- `object-statuses`, `object-types`, `object-relation-types`
- `product-categories`, `salutations`, `sexes`, `transaction-types`
- `translations` (for managing language-specific text)

Each lookup type endpoint follows pattern: `/api/v1/lookups/{lookup_type}`

**Exception - Translations**: Uses composite key (`code` + `language_id`):
- `PUT /api/v1/lookups/translations/:code/:language_id`
- `DELETE /api/v1/lookups/translations/:code/:language_id`

### Routing & Pages (`src/app/`)
Uses Next.js 14 App Router. Main routes:
- `/` - Dashboard (home)
- `/login` - Authentication page
- `/persons` - Person management (CRUD placeholder)
- `/companies` - Company management (CRUD placeholder)
- `/employees` - Employee management
- `/invoices` - Invoice management
- `/transactions` - Transaction management
- `/master-data/*` - Reference data management UI

### Layout & Components
- **MainLayout** (`src/components/layout/MainLayout.tsx`): Root wrapper with Header and Sidebar
- **ThemeProvider** (`src/components/ThemeProvider`): Handles light/dark mode via themeStore
- **UI Components** (`src/components/ui/`): Reusable buttons, inputs, cards, alerts, spinners
- **Language/Theme**: Both wrapped through providers in root layout.tsx

### Request/Response Flow
1. User action triggers component state update or API call
2. Component calls API function from `src/lib/api/{endpoint}.ts`
3. API function uses `apiClient` (Axios instance)
4. Request interceptor:
   - Adds `Authorization: Bearer {token}` header
   - For mutations: adds `language_id` to request body
5. Response interceptor:
   - Unwraps response data (axios wraps responses in `.data` property)
   - Handles 401 by clearing token and redirecting to login
   - Returns standardized error format on failures
6. Component receives typed response and updates UI/store

## Type System

Key type files:
- **types/common.ts**: Shared types (LookupItem, Translation, ApiErrorResponse)
- **types/entities.ts**: Domain models (User, Person, Company, Invoice, etc.)
- **types/api.ts**: API request/response schemas

#### Important Type Patterns
- All API responses should match `ApiResponse<T>` or return the data directly (response interceptor unwraps it)
- Error responses must follow `{ success: false, error: { code, message, details? } }` format
- Lookup items include `id`, `code`, `is_active`, and translations array

## Environment Variables

Located in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=<n8n webhook base URL>
NEXT_PUBLIC_DEFAULT_LANGUAGE=en  # Optional, defaults to English
NEXT_PUBLIC_APP_NAME=Office      # Optional, defaults to "Office"
```

Environment variables prefixed with `NEXT_PUBLIC_` are embedded at build time and available client-side.

## Key Implementation Details

### Date & Time Formatting Standards
**CRITICAL**: All date and timestamp fields MUST be displayed using standardized formats:
- **Date fields**: `YYYY-MM-DD` format (e.g., `2025-02-25`)
- **Timestamp fields**: `YYYY-MM-DD HH:mm:ss` format (e.g., `2025-02-25 23:25:12`)

**Implementation**:
- Use `formatDate()` from `@/lib/utils` for date-only fields (birth_date, issue_date, due_date, etc.)
- Use `formatDateTime()` from `@/lib/utils` for timestamp fields (created_at, updated_at, transaction_date_start, etc.)
- NEVER use inline date formatting (`.toLocaleDateString()`, `.toLocaleString()`) - always use utility functions
- HTML5 date inputs (`type="date"`) naturally work with `YYYY-MM-DD` format
- Both functions handle null/undefined values by returning `-`
- Both functions validate dates and return `-` for invalid dates

### Language & Translation Management
- Current language stored in `languageStore` with persist middleware
- Language ID (1-based numeric) mapped from ISO codes via `getLanguageId()` utility
- All data mutations include language_id automatically
- Translations are language-specific; updating one language doesn't affect others unless `update_all_languages: 1` flag is set
- **Language IDs**: `1` = English (en), `2` = German (de), `3` = Hungarian (hu)

### Lookup Update Request Body (Critical Pattern)
When updating lookup items, these fields are **always included** in the request body:
- `object_type_id`: Always present (defaults to `0` if not set)
- `update_all_languages`: Always present (`0` or `1`)

Example request body:
```json
{
  "code": "active",
  "is_active": true,
  "object_type_id": 1,
  "update_all_languages": 0,
  "text": "Active",
  "language_id": 1
}
```

### Soft Deletes
`DELETE /api/v1/lookups/:lookup_type/:id` performs a **soft delete** by setting `is_active = false`. Records are not physically removed.

### Translation Updates with Checkbox
When "Translations" checkbox is checked in the UI:
1. Translations are updated for ALL languages (en, de, hu) with the same text
2. Then the lookup item is updated (without `text` field, since translations handled in step 1)

### Error Handling
The API client provides standardized error responses:
```typescript
{
  success: false,
  error: {
    code: string,        // Error code (e.g., 'UNKNOWN_ERROR', 'NETWORK_ERROR')
    message: string,     // Human-readable message
    details?: unknown    // Additional error context
  }
}
```

Always wrap API calls in try-catch and check the error structure.

### Authentication
- JWT token stored in localStorage as `auth_token`
- Token automatically attached to all requests via interceptor
- Logout clears token and redirects to `/login`
- 401 responses auto-redirect to `/login` (unless already on auth pages)

### Form Validation
Use **React Hook Form** + **Zod** for form validation:
- Define Zod schema for input validation
- Use `useForm` from react-hook-form with resolver
- Zod handles both client-side and server-side schema consistency

## Common Patterns

### Adding a New API Endpoint
1. Create function in appropriate file under `src/lib/api/` (or new file if novel entity type)
2. Use `apiClient` for HTTP operations
3. Define request/response types in `types/`
4. Export from `src/lib/api/index.ts`
5. Call from components, pass response to UI or store

### Adding a New Page/Route
1. Create directory under `src/app/{feature}/`
2. Create `page.tsx` (route component) and `layout.tsx` if needed
3. Use `MainLayout` wrapper automatically (inherited from root)
4. Import components and API functions
5. Call `useAuthStore()` to check authentication if needed

### Handling Lookups in Forms
1. Fetch lookup data via `lookupApi.getLookupItems(lookupType, languageId)`
2. Store in component state or via lookup store
3. Pass to Select component as options
4. On form submit, include selected lookup ID (not code) in data

### Inline Editing in Data Tables (CRITICAL PATTERN)
**All table components with inline editing MUST send both old and new values to the API.**

This pattern is used in:
- [AddressesTable](frontend/src/components/addresses/AddressesTable.tsx)
- [ContactsTable](frontend/src/components/contacts/ContactsTable.tsx)
- [IdentificationsTable](frontend/src/components/identifications/IdentificationsTable.tsx)
- [NotesTable](frontend/src/components/notes/NotesTable.tsx)

**Implementation Requirements:**
1. Define update payload interface with `_old` and `_new` suffixes for each editable field
2. Store both `editData` and `originalData` in component state
3. On edit start (`handleEdit`): capture original values in `originalData`
4. On save (`handleSave`): send payload with both old and new values
5. On cancel (`handleCancel`): clear both `editData` and `originalData`

**Example Pattern:**
```typescript
interface NoteUpdatePayload {
  note_type_id_old?: number;
  note_type_id_new?: number;
  subject_old?: string;
  subject_new?: string;
  note_text_old: string;
  note_text_new: string;
}

const handleEdit = (note: ObjectNote) => {
  const initialData = {
    note_type_id: note.note_type_id,
    subject: note.subject || '',
    note_text: note.note_text,
  };
  setEditData(initialData);
  setOriginalData(initialData); // Store original values
};

const handleSave = async (id: number) => {
  if (!editData || !originalData) return;

  const updatePayload: NoteUpdatePayload = {
    note_type_id_old: originalData.note_type_id,
    note_type_id_new: editData.note_type_id,
    subject_old: originalData.subject,
    subject_new: editData.subject,
    note_text_old: originalData.note_text,
    note_text_new: editData.note_text,
  };

  await onUpdate(id, updatePayload);
};
```

**Why This Pattern?**
- Enables audit logging of what changed
- Allows backend validation of concurrent edits
- Supports optimistic concurrency control
- Provides data for database triggers and history tracking

## Project-Specific Notes

### Object Relations & Hierarchy
- Objects can have relations defined by `object_relation_types`
- Each relation type specifies parent and child object type IDs
- Object relations are stored separately from the objects themselves
- Relations are language-independent (but type names are translated)

### Master Data Cascades
Some lookups have cascading relationships:
- Object types → Object statuses
- Object types → Object relation types (parent/child relationships)
- Countries → Currencies, Languages

When updating lookups, verify foreign key constraints in the backend.

### N8n Webhook Integration
All backend operations happen through n8n webhooks. The frontend only provides HTTP calls; n8n workflows handle:
- Database operations
- Business logic
- Validation
- Audit logging

Ensure webhook endpoints match the expected request/response formats in the n8n workflow documentation.

#### Contacts API - Separate Webhook Endpoint
**IMPORTANT**: The contacts API uses a **dedicated webhook endpoint** separate from the main API:

**Main API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1
```
Used for: lookups, persons, companies, transactions, etc.

**Contacts API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
```
Used for: object contacts (email, phone, social media, etc.)

**Contacts Endpoints:**
- `GET /objects/:object_id/contacts` - List all contacts for an object
- `GET /contacts/:id` - Get single contact by ID
- `POST /objects/:object_id/contacts` - Create new contact for an object
- `PUT /contacts/:id` - Update existing contact
- `DELETE /contacts/:id` - Soft delete contact (sets is_active = false)

**Implementation Note:**
The contacts API requires a separate Axios client instance configured with the contacts webhook base URL. See `src/lib/api/contacts.ts` for the implementation pattern.

**Database Table:** `object_contacts`
- Links contacts to any object (person, company, employee, etc.)
- Foreign key: `object_id` → `objects.id`
- Foreign key: `contact_type_id` → `contact_types.id` (lookup table)
- Supports soft deletes via `is_active` flag

#### Identifications API - Separate Webhook Endpoint
**IMPORTANT**: The identifications API uses the **same dedicated webhook endpoint** as contacts:

**Identifications API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
```
Used for: object identifications (passport, ID card, driver's license, etc.)

**Identifications Endpoints:**
- `GET /objects/:object_id/identifications` - List all identifications for an object
- `GET /identifications/:id` - Get single identification by ID
- `POST /objects/:object_id/identifications` - Create new identification for an object
- `PUT /identifications/:id` - Update existing identification
- `DELETE /identifications/:id` - Soft delete identification (sets is_active = false)

**Implementation Note:**
The identifications API requires a separate Axios client instance configured with the identifications webhook base URL. See [src/lib/api/identifications.ts](src/lib/api/identifications.ts) for the implementation pattern.

**Database Table:** `object_identifications`
- Links identifications to any object (person, company, employee, etc.)
- Foreign key: `object_id` → `objects.id`
- Foreign key: `identification_type_id` → `identification_types.id` (lookup table)
- Supports soft deletes via `is_active` flag

#### Addresses API - Separate Webhook Endpoint
**IMPORTANT**: The addresses API uses the **same dedicated webhook endpoint** as contacts and identifications:

**Addresses API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
```
Used for: object addresses (home, work, billing, shipping, etc.)

**Addresses Endpoints:**
- `GET /objects/:object_id/addresses` - List all addresses for an object
- `GET /addresses/:id` - Get single address by ID
- `POST /objects/:object_id/addresses` - Create new address for an object
- `PUT /addresses/:id` - Update existing address
- `DELETE /addresses/:id` - Soft delete address (sets is_active = false)

**Implementation Note:**
The addresses API requires a separate Axios client instance configured with the addresses webhook base URL. See [src/lib/api/addresses.ts](src/lib/api/addresses.ts) for the implementation pattern.

**Database Table:** `object_addresses`
- Links addresses to any object (person, company, employee, etc.)
- Foreign key: `object_id` → `objects.id`
- Foreign key: `address_type_id` → `address_types.id` (lookup table)
- Foreign key: `address_area_type_id` → `address_area_types.id` (lookup table, optional)
- Foreign key: `country_id` → `countries.id` (lookup table)
- Supports soft deletes via `is_active` flag
- Fields: street_address_1, street_address_2, city, state_province, postal_code, latitude, longitude

#### Notes API - Separate Webhook Endpoint
**IMPORTANT**: The notes API uses the **same dedicated webhook endpoint** as contacts, identifications, and addresses:

**Notes API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
```
Used for: object notes (general, meeting, reminder, important, etc.)

**Notes Endpoints:**
- `GET /objects/:object_id/notes?language_id={id}` - List all notes for an object with translated content
- `GET /notes/:id?language_id={id}` - Get single note by ID with translated content
- `POST /objects/:object_id/notes` - Create new note for an object (with translations)
- `POST /notes/:id` - **Update existing note** (USE POST, not PUT - PUT method is not working)
- `DELETE /notes/:id` - Soft delete note (sets is_active = false)
- `PATCH /notes/:id/pin` - Toggle note pin status

**CRITICAL - Use POST for Updates:**
⚠️ **IMPORTANT**: For note updates, use **POST method** instead of PUT. The PUT method is not working on the n8n webhook endpoint. The POST method with the note ID in the URL path will handle updates correctly.

**IMPORTANT - Update Request Format:**
The notes update endpoint accepts old/new values (consistent with other tables):
```json
{
  "note_type_id_old": 1,
  "note_type_id_new": 2,
  "subject_old": "Original subject",
  "subject_new": "Updated subject",
  "note_text_old": "Original text",
  "note_text_new": "Updated text",
  "language_id": 1
}
```
The n8n workflow must be updated to handle this format.

**Implementation Note:**
The notes API requires a separate Axios client instance configured with the notes webhook base URL. See [src/lib/api/notes.ts](src/lib/api/notes.ts) for the implementation pattern.

**Database Tables:**
- `note_types` - Lookup table for note categories
  - Foreign key: `code` → `translations.code` (lookup table)
  - Codes: note_general, note_meeting, note_reminder, note_important, note_follow_up, note_internal, note_customer_facing
  - Supports soft deletes via `is_active` flag

- `object_notes` - Links notes to any object (person, company, employee, etc.)
  - Foreign key: `object_id` → `objects.id`
  - Foreign key: `note_type_id` → `note_types.id` (lookup table, optional)
  - Foreign key: `subject_code` → `translations.code` (translation code for subject)
  - Foreign key: `note_text_code` → `translations.code` (translation code for note content)
  - Foreign key: `created_by` → `objects.id` (user who created the note)
  - Supports soft deletes via `is_active` flag
  - Supports pinning via `is_pinned` flag (pinned notes appear first)
  - **Multi-language support**: subject and note_text are stored in translations table
  - Translation codes are generated as: `note_subject_{note_id}` and `note_text_{note_id}`
  - Sorted by: is_pinned DESC, created_at DESC (pinned notes first, then newest)

**Frontend Implementation:**
- **API Client**: [src/lib/api/notes.ts](src/lib/api/notes.ts) - Dedicated Axios instance with notes webhook URL
- **Component**: [src/components/notes/NotesTable.tsx](src/components/notes/NotesTable.tsx) - Display component with sorting and pin toggle
- **Types**: [src/types/entities.ts](src/types/entities.ts) - ObjectNote, CreateObjectNoteRequest, UpdateObjectNoteRequest
- **Integration**: Notes tab added to [src/app/persons/page.tsx](src/app/persons/page.tsx) (similar to audits tab)
- **Features**:
  - Sortable columns (ID, Type, Created At)
  - Pin/unpin functionality with visual indicator (yellow background for pinned notes)
  - Multi-language content retrieval based on current language setting
  - Automatic language_id injection in request body for ALL methods (GET, POST, PUT, PATCH, DELETE)
  - Loading states and error handling
  - Line-clamp (max 3 lines) for note text in table view

**CRITICAL - Language ID Handling:**
The `language_id` must NOT be sent in the query string for GET requests because n8n's Set node would incorrectly add it to the SQL WHERE clause (where `object_notes` table has no `language_id` column). Instead:

- For **POST/PUT/PATCH requests**: `language_id` is sent in the request body
- For **GET/DELETE requests**: `language_id` is sent in a custom HTTP header `X-Language-ID`
- The interceptor in [src/lib/api/notes.ts](src/lib/api/notes.ts) automatically handles this based on the HTTP method

**n8n Workflow Configuration:**
The n8n workflow must be configured to:
1. Read `language_id` from the `X-Language-ID` header for GET requests
2. Use it in the JOIN clause: `LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $headers['x-language-id'] }}`
3. NOT include it in the WHERE clause

Example GET request:
```
GET /objects/123/notes?is_active=true
X-Language-ID: 1
```

Example POST request (update):
```
POST /notes/123
Content-Type: application/json
X-Language-ID: 1

{
  "note_type_id_old": 1,
  "note_type_id_new": 2,
  "subject_old": "Original subject",
  "subject_new": "Updated subject",
  "note_text_old": "Original text",
  "note_text_new": "Updated text",
  "language_id": 1
}
```
⚠️ **Note**: Use POST method for updates, not PUT.

#### Documents API - Separate Webhook Endpoint
**IMPORTANT**: The documents API uses a **dedicated webhook endpoint**:

**Documents API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1
```
Used for: document management (list, get, create, update, delete) and document files

**Documents Endpoints:**
- `GET /documents` - List all documents with optional filtering
- `GET /documents/:id` - Get single document by ID
- `POST /documents` - Create new document
- `POST /documents/:id` - Update existing document (USE POST, not PUT)
- `DELETE /documents/:id` - Soft delete document (sets is_active = false)
- `GET /documents/:id/files` - Get all files linked to a document
- `POST /documents/:id/files` - Link an existing file to a document
- `DELETE /documents/:id/files/:file_id` - Unlink a file from a document
- `GET /documents/:id/relations` - Get all objects related to a document
- `POST /documents/:id/relations` - Add a relation between document and another object
- `DELETE /documents/:id/relations/:relation_id` - Remove a relation

**CRITICAL - Use POST for Updates:**
⚠️ **IMPORTANT**: For document updates, use **POST method** instead of PUT. The PUT method is not working on the n8n webhook endpoint. The POST method with the document ID in the URL path will handle updates correctly.

**Implementation Note:**
The documents API requires a separate Axios client instance configured with the documents webhook base URL. See [src/lib/api/documents.ts](src/lib/api/documents.ts) for the implementation pattern.

**Database Tables:**
- `objects` - Documents are stored as objects with `object_type_id` corresponding to document types
- `object_relations` - Links files and other objects to documents via relation types
- `files` - File metadata stored in files table, linked to documents via object_relations

**Frontend Implementation:**
- **API Client**: [src/lib/api/documents.ts](src/lib/api/documents.ts) - Dedicated Axios instance with documents webhook URL
- **Components**: Document management components in [src/components/documents/](src/components/documents/)
- **Types**: [src/types/entities.ts](src/types/entities.ts) - Document, CreateDocumentRequest, UpdateDocumentRequest, FileEntity
- **Features**:
  - Document CRUD operations
  - File linking/unlinking
  - Document relations management
  - Multi-language support via language_id header/body

#### Users API - Separate Webhook Endpoint
**IMPORTANT**: The users API uses the **same dedicated webhook endpoint** as contacts, identifications, addresses, and notes:

**Users API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
```
Used for: user management (list, get, create, update, delete)

**Users Endpoints:**
- `GET /users` - List all users
- `GET /users/:id` - Get single user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update existing user
- `DELETE /users/:id` - Soft delete user (sets is_active = false)

**Implementation Note:**
The users API uses the standard Axios client instance configured with the main API webhook base URL. See `src/lib/api/users.ts` for the implementation pattern.

**Database Table:** `users`
- Stores application users with authentication and metadata
- Fields: id, username, email, password_hash, is_active, created_at, updated_at, etc.
- Supports soft deletes via `is_active` flag

## Debugging Tips

1. **API Issues**: Check browser DevTools Network tab → inspect request/response payloads
2. **State Issues**: Zustand stores can be inspected in localStorage under store keys (e.g., `language-storage`)
3. **Type Errors**: Run `npm run type-check` to catch TypeScript issues before runtime
4. **Authorization**: Check if `auth_token` exists in localStorage; if not, user is logged out
5. **Language ID Mismatches**: Verify `language_id` in request bodies matches the system's language ID mapping (usually 1 for English)

## File Organization Quick Reference

```
frontend/
├── src/
│   ├── app/                           # Next.js pages & routes
│   │   ├── layout.tsx                 # Root wrapper with providers
│   │   ├── page.tsx                   # Dashboard
│   │   ├── login/                     # Auth page
│   │   ├── master-data/               # Reference data management UI
│   │   └── [feature]/page.tsx         # Feature pages
│   ├── components/
│   │   ├── layout/                    # Layout components (Header, Sidebar, MainLayout)
│   │   ├── ui/                        # Reusable UI primitives
│   │   └── [domain]/                  # Domain-specific components
│   ├── lib/
│   │   ├── api/                       # API client & endpoint modules
│   │   ├── i18n/                      # Internationalization helpers
│   │   └── utils.ts                   # Shared utilities
│   ├── store/                         # Zustand stores (authStore, languageStore, etc.)
│   ├── types/                         # TypeScript definitions
│   └── (other config files)
├── public/                            # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```
