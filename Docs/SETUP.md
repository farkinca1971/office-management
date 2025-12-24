# Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-n8n-instance.com/api/v1
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js pages (App Router)
│   │   ├── layout.tsx          # Root layout with MainLayout wrapper
│   │   ├── page.tsx            # Dashboard/home page
│   │   ├── login/              # Login page
│   │   ├── persons/            # Person management
│   │   ├── companies/          # Company management
│   │   ├── invoices/          # Invoice management
│   │   └── transactions/       # Transaction management
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── lib/
│   │   ├── api/                # API client layer
│   │   │   ├── client.ts      # Axios instance with interceptors
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── lookups.ts     # Reference data endpoints
│   │   │   ├── persons.ts     # Person CRUD
│   │   │   ├── companies.ts   # Company CRUD
│   │   │   ├── users.ts       # User CRUD
│   │   │   ├── addresses.ts  # Address CRUD
│   │   │   ├── contacts.ts    # Contact CRUD
│   │   │   ├── identifications.ts # Identification CRUD
│   │   │   ├── invoices.ts    # Invoice CRUD
│   │   │   ├── transactions.ts # Transaction CRUD
│   │   │   ├── objectRelations.ts # Object relations CRUD
│   │   │   └── index.ts       # Centralized exports
│   │   └── utils.ts           # Utility functions
│   ├── store/                  # Zustand state stores
│   │   ├── authStore.ts       # Authentication state
│   │   └── lookupStore.ts     # Reference data cache
│   └── types/                  # TypeScript definitions
│       ├── common.ts          # Common types
│       ├── entities.ts        # Entity types
│       └── api.ts             # API request/response types
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Key Features Implemented

### ✅ Foundation (Phase 2.1)
- [x] Next.js 14 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] API client layer (Axios)
- [x] State management (Zustand)
- [x] Base UI components
- [x] Authentication flow
- [x] Layout components (Header, Sidebar)
- [x] Error handling
- [x] Loading states

### 📋 Pages Created
- [x] Dashboard (`/`)
- [x] Login (`/login`)
- [x] Persons (`/persons`) - Placeholder
- [x] Companies (`/companies`) - Placeholder
- [x] Invoices (`/invoices`) - Placeholder
- [x] Transactions (`/transactions`) - Placeholder

### 🔌 API Endpoints Ready
All API modules are created and ready to connect to n8n webhooks:
- Authentication (`/auth/login`, `/auth/me`)
- Persons (`/persons`)
- Companies (`/companies`)
- Users (`/users`)
- Addresses (`/objects/:id/addresses`)
- Contacts (`/objects/:id/contacts`)
- Identifications (`/objects/:id/identifications`)
- Invoices (`/invoices`)
- Transactions (`/transactions`)
- Object Relations (`/object-relations`)
- Lookups (all reference data endpoints)

## Next Steps

### Phase 2.2: Core Features Implementation
1. **Person Management**
   - List with pagination and search
   - Create/Edit form with validation
   - Detail view with addresses, contacts, identifications
   - Delete functionality

2. **Company Management**
   - List with pagination and search
   - Create/Edit form with validation
   - Detail view with addresses, contacts
   - Employee management (object relations)

3. **User Management**
   - List with pagination
   - Create/Edit form
   - Password change functionality

### Phase 2.3: Advanced Features
1. **Invoice Management**
   - List with filters (date range, partner, status)
   - Create/Edit form
   - Mark as paid / Void functionality
   - Invoice detail view

2. **Transaction Management**
   - List with filters
   - Create/Edit form
   - Transaction detail view

3. **Object Relations**
   - View relations for objects
   - Add/Edit/Delete relations
   - Filter by relation type

### Phase 2.4: Polish & Enhancement
1. **Forms**
   - Add React Hook Form + Zod validation
   - Form error handling
   - Field-level validation

2. **Data Tables**
   - Add pagination component
   - Add sorting functionality
   - Add filtering UI
   - Add bulk actions

3. **Search & Filtering**
   - Global search
   - Advanced filters
   - Saved filter presets

4. **Performance**
   - Add React Query for data fetching
   - Implement caching strategies
   - Optimize bundle size

5. **Internationalization**
   - Add i18n support
   - Language switcher
   - Translate UI components

## Troubleshooting

### Zustand Persist Middleware
If you encounter issues with `zustand/middleware`, ensure you're using Zustand v4+ which includes persist middleware by default.

### Environment Variables
Make sure all `NEXT_PUBLIC_*` variables are set before building. These are embedded at build time.

### API Connection Issues
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check CORS settings on n8n instance
- Verify webhook endpoints are accessible
- Check browser console for detailed error messages

## Development Tips

1. **Hot Reload**: Next.js automatically reloads on file changes
2. **Type Checking**: Run `npm run type-check` to verify types
3. **Linting**: Run `npm run lint` to check code quality
4. **API Testing**: Use browser DevTools Network tab to inspect API calls
5. **State Debugging**: Use Zustand DevTools (if installed) to inspect store state

## Production Build

```bash
npm run build
npm run start
```

The production build will be optimized and ready for deployment.

