# Office Application Frontend

A modern, responsive web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 **Next.js 14** with App Router
- 📘 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔐 **Authentication** with JWT tokens
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **State Management** with Zustand
- 🔄 **API Integration** ready for n8n webhooks
- ♿ **Accessible** UI components

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- n8n instance with webhook endpoints configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your n8n webhook base URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-n8n-instance.com/api/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Dashboard/home page
│   │   ├── login/          # Login page
│   │   ├── persons/        # Person management pages
│   │   ├── companies/      # Company management pages
│   │   ├── invoices/       # Invoice management pages
│   │   └── transactions/   # Transaction management pages
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities and helpers
│   │   ├── api/          # API client and endpoints
│   │   └── utils.ts      # Utility functions
│   ├── store/            # Zustand state stores
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration

The application is configured to work with n8n webhooks. All API calls are centralized in `src/lib/api/`:

- `client.ts` - Axios instance with interceptors
- `auth.ts` - Authentication endpoints
- `persons.ts` - Person CRUD operations
- `companies.ts` - Company CRUD operations
- `invoices.ts` - Invoice CRUD operations
- `transactions.ts` - Transaction CRUD operations
- `lookups.ts` - Reference data endpoints

## Authentication

The app uses JWT tokens stored in localStorage. The authentication flow:

1. User logs in via `/login`
2. Token is stored in localStorage
3. Token is automatically added to API requests via axios interceptor
4. On 401 errors, user is redirected to login

## State Management

- **Zustand** stores in `src/store/`:
  - `authStore.ts` - Authentication state
  - `lookupStore.ts` - Reference/lookup data

## UI Components

Reusable components in `src/components/ui/`:
- `Button` - Button with variants and loading state
- `Input` - Text input with label and error handling
- `Select` - Dropdown select with options
- `Card` - Card container
- `Alert` - Alert messages (success, error, warning, info)
- `LoadingSpinner` - Loading indicator

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - n8n webhook base URL (required)
- `NEXT_PUBLIC_APP_NAME` - Application name (optional)
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default language code (optional)

## Next Steps

1. Configure n8n webhook endpoints
2. Implement CRUD operations for each entity
3. Add form validation with React Hook Form + Zod
4. Add data tables with pagination
5. Implement search and filtering
6. Add file upload functionality
7. Add internationalization (i18n)

## License

Private project - All rights reserved

