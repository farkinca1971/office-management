# Phase 2: Frontend Implementation Plan

## Executive Summary

This document outlines the frontend architecture, technology choices, and implementation strategy for the Office Application. The frontend will be a Node.js-based web application with responsive design, communicating exclusively with n8n webhook endpoints. No direct database access will be implemented.

---

## 1. Frontend Architecture Overview

### 1.1 Architecture Pattern: Layered Client-Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Node.js)                    │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer  │  State Management  │  API Layer  │
│  (UI Components)     │  (Application State)│  (HTTP Client)│
└─────────────────────────────────────────────────────────┘
                          │ HTTPS │ JSON
                          ▼
┌─────────────────────────────────────────────────────────┐
│              n8n Webhook Endpoints                       │
│  (Backend Logic, Validation, Database Operations)        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  MySQL Database                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

1. **Separation of Concerns**: Clear boundaries between UI, state, and API layers
2. **No Direct Database Access**: All data operations via n8n webhooks
3. **Responsive Design**: Mobile-first approach, works on desktop and mobile
4. **Internationalization**: Multi-language support using translations API
5. **Error Handling**: Consistent error handling across all API calls
6. **Type Safety**: TypeScript for better code quality and maintainability

---

## 2. Technology Stack Proposal

### 2.1 Recommended Stack: Next.js with TypeScript

**Primary Choice: Next.js 14+ (App Router) with TypeScript**

**Rationale:**
- ✅ **Server-Side Rendering (SSR)**: Better SEO and initial load performance
- ✅ **API Routes**: Can proxy requests to n8n (if needed) or handle client-side calls
- ✅ **Built-in Routing**: File-based routing simplifies navigation
- ✅ **TypeScript Support**: First-class TypeScript support
- ✅ **Responsive Design**: Easy integration with Tailwind CSS
- ✅ **Modern React**: Uses latest React features (Server Components, etc.)
- ✅ **Production Ready**: Optimized builds, code splitting, image optimization
- ✅ **Node.js Based**: Meets requirement for Node.js-based application

**Alternative Options Considered:**

1. **Express.js + EJS/Handlebars** (Server-Side Rendering)
   - ✅ Simple, traditional approach
   - ❌ Less modern, more boilerplate
   - ❌ Client-side interactivity requires more setup

2. **React + Vite** (Client-Side SPA)
   - ✅ Fast development, modern tooling
   - ❌ Requires separate backend for SSR/SEO
   - ❌ More complex deployment

3. **Vue.js + Nuxt.js**
   - ✅ Good alternative to Next.js
   - ❌ Less common in Node.js ecosystems
   - ❌ Team familiarity may vary

**Final Recommendation: Next.js 14+ with TypeScript**

---

### 2.2 Supporting Technologies

| Category | Technology | Purpose | Version |
|----------|-----------|---------|---------|
| **Framework** | Next.js | React framework with SSR | 14+ |
| **Language** | TypeScript | Type safety | 5+ |
| **Styling** | Tailwind CSS | Utility-first CSS | 3+ |
| **HTTP Client** | Axios | API requests | 1.6+ |
| **State Management** | Zustand / React Query | Client state / Server state | Latest |
| **Form Handling** | React Hook Form | Form validation | 7+ |
| **Validation** | Zod | Schema validation | 3+ |
| **UI Components** | shadcn/ui or Headless UI | Accessible components | Latest |
| **Icons** | Lucide React | Icon library | Latest |
| **Date Handling** | date-fns | Date manipulation | 3+ |
| **Internationalization** | next-intl | i18n support | Latest |

---

## 3. Project Structure

### 3.1 Folder Structure

```
office-frontend/
├── .env.local                 # Environment variables (API URLs, etc.)
├── .env.example              # Example environment file
├── .gitignore
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json
├── README.md
│
├── public/                   # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                  # Next.js App Router (pages)
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── (auth)/           # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/      # Protected routes group
│   │   │   ├── layout.tsx    # Dashboard layout
│   │   │   ├── persons/
│   │   │   │   ├── page.tsx  # List persons
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx      # View person
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx  # Edit person
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # Create person
│   │   │   ├── companies/
│   │   │   ├── users/
│   │   │   ├── invoices/
│   │   │   ├── transactions/
│   │   │   └── documents/
│   │   └── api/              # API proxy routes (if needed)
│   │
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   │   ├── forms/           # Form components
│   │   ├── tables/          # Table/list components
│   │   ├── modals/          # Modal/dialog components
│   │   ├── layout/          # Layout components (header, sidebar, etc.)
│   │   └── common/          # Common components (loading, error, etc.)
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── api/             # API client functions
│   │   │   ├── client.ts    # Axios instance & interceptors
│   │   │   ├── persons.ts   # Person API calls
│   │   │   ├── companies.ts # Company API calls
│   │   │   ├── users.ts     # User API calls
│   │   │   ├── invoices.ts  # Invoice API calls
│   │   │   ├── lookups.ts   # Lookup data API calls
│   │   │   └── types.ts     # API response types
│   │   ├── utils/           # Utility functions
│   │   │   ├── format.ts    # Formatting utilities
│   │   │   ├── validation.ts # Validation helpers
│   │   │   └── constants.ts  # Constants
│   │   └── hooks/           # Custom React hooks
│   │       ├── useApi.ts    # API call hook
│   │       ├── usePagination.ts
│   │       └── useDebounce.ts
│   │
│   ├── store/               # State management (Zustand stores)
│   │   ├── authStore.ts     # Authentication state
│   │   ├── uiStore.ts       # UI state (modals, sidebar, etc.)
│   │   └── lookupStore.ts   # Lookup data cache
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── entities.ts      # Entity types (Person, Company, etc.)
│   │   ├── api.ts           # API request/response types
│   │   └── common.ts        # Common types
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css      # Global CSS + Tailwind imports
│   │
│   └── locales/             # Translation files (if using next-intl)
│       ├── en/
│       ├── de/
│       └── hu/
│
└── tests/                   # Tests (optional)
    ├── __mocks__/
    ├── components/
    └── lib/
```

---

## 4. Key Architecture Components

### 4.1 API Service Layer

**Purpose**: Centralized HTTP client with error handling, authentication, and request/response transformation.

**File**: `src/lib/api/client.ts`

```typescript
// Example structure (pseudo-code)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401, 403, 500, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Individual API Modules**: Each entity has its own API module (`persons.ts`, `companies.ts`, etc.) that uses the shared client.

---

### 4.2 State Management Strategy

**Client State**: Zustand for UI state (modals, sidebar, filters)
**Server State**: React Query (TanStack Query) for API data caching and synchronization

**Example Store** (`src/store/authStore.ts`):
```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (token, user) => set({ token, user, isAuthenticated: true }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
```

---

### 4.3 Component Architecture

**Component Hierarchy:**
```
Page Component
  └── Layout Component (Header, Sidebar)
      └── Feature Component (PersonList, PersonForm)
          └── UI Components (Button, Input, Table)
              └── Base Components (shadcn/ui)
```

**Component Principles:**
- **Composition over Inheritance**: Build complex components from simple ones
- **Props Interface**: All components have TypeScript interfaces
- **Accessibility**: Use semantic HTML and ARIA attributes
- **Responsive**: Mobile-first CSS approach

---

### 4.4 Form Handling

**Library**: React Hook Form + Zod

**Benefits:**
- Performance: Minimal re-renders
- Validation: Schema-based with Zod
- Type Safety: TypeScript integration
- Error Handling: Built-in error states

**Example Form Structure:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  // ... other fields
});

type PersonFormData = z.infer<typeof personSchema>;

function PersonForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
  });
  
  // ... form implementation
}
```

---

## 5. Responsive Design Strategy

### 5.1 Breakpoints (Tailwind CSS)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'sm': '640px',   // Mobile landscape
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large desktop
      },
    },
  },
}
```

### 5.2 Mobile-First Approach

1. **Base Styles**: Mobile styles (default)
2. **Progressive Enhancement**: Add desktop styles with `md:`, `lg:` prefixes
3. **Touch-Friendly**: Minimum 44x44px touch targets
4. **Navigation**: Hamburger menu on mobile, sidebar on desktop
5. **Tables**: Horizontal scroll or card view on mobile

### 5.3 Layout Patterns

- **Dashboard**: Sidebar navigation (desktop) → Bottom nav (mobile)
- **Forms**: Single column (mobile) → Multi-column (desktop)
- **Tables**: Cards (mobile) → Table view (desktop)
- **Modals**: Full-screen (mobile) → Centered modal (desktop)

---

## 6. Internationalization (i18n)

### 6.1 Strategy

**Library**: `next-intl` or `next-i18next`

**Approach:**
1. Fetch translations from API (`/api/v1/translations?code={code}&language_id={id}`)
2. Cache translations in client state
3. Use translation hook: `t('person.active')` → "Active" / "Aktiv" / "Aktív"

**Implementation:**
```typescript
// Custom hook for translations
function useTranslation() {
  const { language } = useLanguageStore();
  const translations = useLookupStore((state) => state.translations);
  
  const t = (code: string): string => {
    return translations[code]?.[language] || code;
  };
  
  return { t };
}
```

---

## 7. Error Handling Strategy

### 7.1 API Error Handling

**Standard Error Response Format:**
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

**Error Handling Levels:**
1. **API Client Level**: Transform errors, add context
2. **Component Level**: Display user-friendly messages
3. **Global Level**: Toast notifications, error boundaries

### 7.2 Error Display

- **Form Errors**: Inline validation messages
- **API Errors**: Toast notifications + form field errors
- **Network Errors**: Retry mechanism with exponential backoff
- **404/500 Errors**: Error pages with recovery options

---

## 8. Loading States

### 8.1 Loading Indicators

- **Page Load**: Skeleton screens or loading spinner
- **Button Actions**: Disabled state + spinner
- **Table/List**: Skeleton rows
- **Form Submission**: Loading overlay

### 8.2 Optimistic Updates

- Update UI immediately on user action
- Revert on API error
- Show loading state during API call

---

## 9. Authentication & Authorization

### 9.1 Authentication Flow

1. **Login**: POST `/api/v1/auth/login` → Receive token
2. **Token Storage**: localStorage or httpOnly cookie
3. **Token Refresh**: Automatic refresh before expiry
4. **Logout**: Clear token, redirect to login

### 9.2 Protected Routes

- **Middleware**: Check authentication on route change
- **Route Guards**: Redirect unauthenticated users
- **API Interceptor**: Add token to all requests

### 9.3 Authorization

- **Role-Based**: Check user roles/permissions
- **Feature Flags**: Enable/disable features per user
- **UI Hiding**: Hide actions user can't perform

---

## 10. Performance Optimization

### 10.1 Code Splitting

- **Route-Based**: Automatic with Next.js App Router
- **Component-Based**: Dynamic imports for heavy components
- **Library Splitting**: Separate vendor bundles

### 10.2 Data Fetching

- **Server Components**: Fetch data on server when possible
- **Client Components**: Use React Query for caching
- **Pagination**: Load data incrementally
- **Debouncing**: Debounce search inputs

### 10.3 Asset Optimization

- **Images**: Next.js Image component (automatic optimization)
- **Fonts**: Next.js Font optimization
- **CSS**: Tailwind CSS purging (remove unused styles)

---

## 11. Development Workflow

### 11.1 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your n8n webhook URL

# 3. Run development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

### 11.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://your-n8n-instance.com/api/v1
NEXT_PUBLIC_APP_NAME=Office Application
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
```

### 11.3 Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify/etc.
```

---

## 12. Testing Strategy (Optional)

### 12.1 Testing Levels

1. **Unit Tests**: Utility functions, hooks
2. **Component Tests**: React components (React Testing Library)
3. **Integration Tests**: API integration, form submissions
4. **E2E Tests**: Critical user flows (Playwright/Cypress)

### 12.2 Testing Tools

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: Mock Service Worker (API mocking)
- **Playwright**: E2E testing

---

## 13. UI/UX Guidelines

### 13.1 Design System

- **Color Palette**: Consistent brand colors
- **Typography**: Clear hierarchy (headings, body, captions)
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, etc.)
- **Components**: Reusable, accessible components

### 13.2 User Experience

- **Feedback**: Immediate feedback on user actions
- **Navigation**: Clear navigation structure
- **Search**: Global search functionality
- **Filters**: Advanced filtering on list pages
- **Breadcrumbs**: Show current location
- **Empty States**: Helpful empty state messages

### 13.3 Accessibility

- **WCAG 2.1 AA Compliance**: Minimum standard
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Sufficient contrast ratios
- **Focus Indicators**: Visible focus states

---

## 14. API Integration Details

### 14.1 API Client Implementation

**Base URL Configuration:**
```typescript
// src/lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com/api/v1';
```

**Request/Response Transformation:**
- Transform API responses to match frontend needs
- Handle pagination metadata
- Normalize error responses

### 14.2 Example API Module

```typescript
// src/lib/api/persons.ts
import apiClient from './client';
import type { Person, PersonListResponse, CreatePersonRequest } from '@/types/entities';

export const personApi = {
  // Get all persons
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    object_status_id?: number;
  }): Promise<PersonListResponse> => {
    return apiClient.get('/persons', { params });
  },

  // Get single person
  getById: async (id: number): Promise<Person> => {
    return apiClient.get(`/persons/${id}`);
  },

  // Create person
  create: async (data: CreatePersonRequest): Promise<Person> => {
    return apiClient.post('/persons', data);
  },

  // Update person
  update: async (id: number, data: Partial<CreatePersonRequest>): Promise<Person> => {
    return apiClient.put(`/persons/${id}`, data);
  },

  // Delete person
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/persons/${id}`);
  },
};
```

---

## 15. Key Features Implementation

### 15.1 Person Management

**Pages:**
- List: `/persons` - Paginated table with search/filter
- View: `/persons/[id]` - Person details with addresses, contacts, identifications
- Create: `/persons/new` - Multi-step form
- Edit: `/persons/[id]/edit` - Pre-filled form

**Components:**
- `PersonList` - Table with pagination
- `PersonForm` - Create/Edit form
- `PersonView` - Detail view with tabs
- `AddressList` - List of addresses
- `ContactList` - List of contacts

### 15.2 Company Management

Similar structure to Person Management:
- List, View, Create, Edit pages
- Company-specific fields (company_id, company_name)
- Relationships to persons (employees)

### 15.3 Invoice Management

**Features:**
- List with filters (date range, partner, payment status)
- Invoice creation wizard
- Invoice detail view
- Payment tracking
- PDF generation (if needed)

### 15.4 Document & File Management

**Features:**
- Document list with version history
- File upload/download
- Version comparison
- Document relationships

---

## 16. Security Considerations

### 16.1 Client-Side Security

- **XSS Prevention**: React's built-in escaping, sanitize user input
- **CSRF Protection**: Use CSRF tokens if needed
- **Secure Storage**: Don't store sensitive data in localStorage
- **HTTPS Only**: Enforce HTTPS in production

### 16.2 API Security

- **Authentication**: Bearer tokens, API keys
- **Rate Limiting**: Handle rate limit errors gracefully
- **Input Validation**: Validate all user input
- **Error Messages**: Don't expose sensitive information

---

## 17. Deployment Considerations

### 17.1 Build Configuration

- **Environment Variables**: Separate dev/staging/prod
- **API URLs**: Different URLs per environment
- **Feature Flags**: Enable/disable features per environment

### 17.2 Hosting Options

1. **Vercel** (Recommended for Next.js)
   - Zero-config deployment
   - Automatic HTTPS
   - Edge functions support

2. **Netlify**
   - Similar to Vercel
   - Good CI/CD integration

3. **Self-Hosted**
   - Docker container
   - Node.js server (PM2, etc.)

---

## 18. Open Questions & Decisions Needed

### 18.1 Technical Decisions

1. **Authentication Method**: 
   - JWT tokens? Session-based? API keys?
   - Where to store tokens? (localStorage vs httpOnly cookies)

2. **n8n Webhook URLs**:
   - What is the base URL?
   - How are webhooks structured? (one endpoint per operation or RESTful?)

3. **File Upload**:
   - Direct upload to n8n? Or separate file storage service?
   - Maximum file size?

4. **Real-time Updates**:
   - Need WebSocket/SSE for real-time updates?
   - Or polling is sufficient?

### 18.2 Design Decisions

5. **UI Framework**:
   - Use shadcn/ui? Or custom components?
   - Design system reference?

6. **Color Scheme**:
   - Light/dark mode support?
   - Brand colors?

7. **Language Selection**:
   - How should users select language? (Dropdown, URL param, etc.)

---

## 19. Implementation Phases

### Phase 2.1: Foundation (Week 1-2)
- ✅ Project setup (Next.js, TypeScript, Tailwind)
- ✅ API client layer
- ✅ Authentication flow
- ✅ Basic layout (header, sidebar, navigation)
- ✅ Error handling & loading states

### Phase 2.2: Core Features (Week 3-4)
- ✅ Person management (CRUD)
- ✅ Company management (CRUD)
- ✅ User management (CRUD)
- ✅ Lookup data integration

### Phase 2.3: Advanced Features (Week 5-6)
- ✅ Invoice management
- ✅ Transaction management
- ✅ Document & File management
- ✅ Object relationships

### Phase 2.4: Polish & Optimization (Week 7-8)
- ✅ Responsive design refinement
- ✅ Performance optimization
- ✅ Accessibility improvements
- ✅ Testing & bug fixes

---

## 20. Next Steps

1. **Review this plan** and provide feedback
2. **Answer open questions** (Section 18)
3. **Provide n8n webhook URLs** and authentication details
4. **Approve technology choices** or suggest alternatives
5. **Provide design assets** (colors, logos, etc.) if available

Once approved, we will proceed with implementation starting with Phase 2.1.

---

**Document Version**: 1.0  
**Status**: ⏳ Awaiting Approval  
**Ready for**: Frontend Implementation

