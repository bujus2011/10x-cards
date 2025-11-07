# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10xCards is a web application for automatically generating flashcards using LLMs. Users can generate flashcards from text input via AI (OpenRouter.ai API) or create them manually. The project is in MVP stage, targeting 100 active users within the first three months.

**Tech Stack:**
- Astro 5 (SSR mode with Node adapter)
- React 19 (for interactive components only)
- TypeScript 5
- Tailwind CSS 4 + Shadcn/ui
- Supabase (PostgreSQL + Auth)
- OpenRouter.ai API (for AI flashcard generation)
- ts-fsrs (FSRS spaced repetition algorithm)
- Vitest + Playwright for testing

**Node Version:** 22.14.0 (specified in `.nvmrc`)

## Development Commands

### Running the Application
```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run dev:e2e          # Start dev server in test mode
npm run build            # Build for production
npm run preview          # Preview production build
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
```

### Testing

**Unit/Integration Tests (Vitest):**
```bash
npm run test             # Run tests in watch mode
npm run test:run         # Run all tests once
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

**E2E Tests (Playwright):**
```bash
npm run test:e2e         # Run E2E tests (requires dev server running separately)
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:debug   # Debug mode
npm run test:e2e:codegen # Record new tests
npm run test:all         # Run both unit and E2E tests
```

**Important:** E2E tests require the dev server to be running separately with `npm run dev:e2e`, and use `.env.test` for configuration.

### Database (Supabase)
```bash
npm run supabase:link    # Link to Supabase project
npm run supabase:push    # Push migrations
npm run supabase:reset   # Reset linked database
npm run supabase:status  # Check migration status
```

### Environment Validation
```bash
npm run check:env        # Validate dev environment variables
npm run check:env:test   # Validate test environment variables
```

## Architecture

### Project Structure

```
src/
├── layouts/             # Astro layouts
├── pages/              # Astro pages (routes)
│   ├── api/           # API endpoints (POST, GET handlers)
│   └── auth/          # Auth-related pages
├── middleware/         # Request/response middleware (auth protection)
│   └── index.ts       # Main auth middleware
├── components/         # UI components (Astro static, React dynamic)
│   ├── ui/            # Shadcn/ui components
│   └── auth/          # Auth-related components
├── hooks/             # Custom React hooks
│   ├── api/           # API-related hooks (useAuth, useFlashcards, etc.)
│   ├── useFlashcardSearch.ts
│   ├── useFlashcardManagement.ts
│   ├── useFlashcardGeneration.ts
│   └── index.ts       # Hook exports
├── lib/               # Services and utilities
│   ├── validations/   # Zod validation schemas
│   └── __tests__/     # Service unit tests
├── db/                # Supabase clients and types
│   ├── supabase.client.ts
│   └── database.types.ts
├── types.ts           # Shared types (DTOs, entities)
└── tests/             # Test utilities and setup
```

### Authentication Architecture

**Security Model:**
- JWT-based authentication via Supabase Auth
- Centralized middleware-based route protection (runs on every request)
- HTTP-only, secure cookies for session storage
- Whitelisting approach: all routes protected by default unless in PUBLIC_PATHS

**Key Files:**
- `src/middleware/index.ts` - Route protection middleware with ROUTE_CONFIG
- `src/db/supabase.client.ts` - Supabase client factory (server + client instances)
- `src/pages/api/auth/*.ts` - Auth API endpoints (login, register, logout, reset-password)

**Adding Protected Routes:**
1. Create page/endpoint as normal
2. Access user via `Astro.locals.user` (set by middleware)
3. Middleware automatically protects unless path is in ROUTE_CONFIG.public

**Cookie Configuration:**
- Cookies are configured in `src/db/supabase.client.ts` with `cookieOptions`
- Security settings automatically adjust based on environment:
  - Production (`import.meta.env.PROD`): `secure: true` (HTTPS only)
  - Development/test: `secure: false` (allows HTTP for localhost)

### API Design Patterns

**Astro API Routes:**
- Use uppercase HTTP method exports: `export const POST`, `export const GET`
- Add `export const prerender = false` for dynamic routes
- Validate input with Zod schemas from `src/lib/validations/`
- Extract business logic to services in `src/lib/`
- Access Supabase via `Astro.locals.supabase`
- Access authenticated user via `Astro.locals.user`

**Services Pattern:**
- Services in `src/lib/` handle business logic
- Available services:
  - `FlashcardService` - CRUD operations for flashcards
  - `GenerationService` - AI flashcard generation via OpenRouter
  - `StudySessionService` - Spaced repetition logic using FSRS algorithm
  - `OpenRouterService` - Integration with OpenRouter.ai API
- Services receive Supabase client via dependency injection
- Custom error types (e.g., DatabaseError) for proper error handling
- Example instantiation: `new FlashcardService(locals.supabase)`

### Data Layer

**Type System:**
- `src/db/database.types.ts` - Auto-generated Supabase types (Database schema)
- `src/types.ts` - Application DTOs and domain models
- Type aliases map database types to domain entities (e.g., `Flashcard`, `Generation`)

**Key Entities:**
- `Flashcard` - User flashcards (front, back, source, generation_id)
- `Generation` - AI generation requests
- `GenerationErrorLog` - Error tracking for failed generations
- `ReviewLog` - Spaced repetition tracking (FSRS algorithm state, due dates, review history)

### Frontend Patterns

**Astro Components (.astro):**
- Use for static content and layouts
- Leverage View Transitions API for smooth navigation
- Use `Astro.cookies` for server-side cookie management
- Access env vars via `import.meta.env`

**React Components (.tsx):**
- Use ONLY for interactive UI elements
- Never use "use client" directive (Next.js-specific, not needed in Astro)
- Extract logic to custom hooks in `src/hooks/` (NOT `src/components/hooks`)
- Use React.memo() for expensive components
- Use useCallback/useMemo for optimization

**Styling:**
- Tailwind CSS 4 with @layer directive
- Use arbitrary values with brackets for one-offs: `w-[123px]`
- Implement dark mode with `dark:` variant
- Use responsive variants: `sm:`, `md:`, `lg:`

**Accessibility:**
- Use ARIA landmarks for page regions
- Implement `aria-live` for dynamic content
- Use `aria-label`/`aria-labelledby` for non-visible labels
- Avoid redundant ARIA that duplicates native HTML semantics

### Custom React Hooks

The project follows a two-tier hook architecture:

**API Hooks** (`src/hooks/api/`):
- Low-level hooks for direct API communication
- Handle HTTP requests, loading states, and error handling
- Return raw data and status information
- Available hooks:
  - `useAuth` - Authentication operations (login, register, logout, reset password)
  - `useFlashcards` - CRUD operations for flashcards (fetch, create, update, delete)
  - `useGeneration` - AI flashcard generation and saving proposals
  - `useStudySession` - Study session management with FSRS spaced repetition

**Composite Hooks** (`src/hooks/`):
- High-level hooks that combine API hooks with state management
- Provide business logic and UI-ready state
- Handle side effects (e.g., auto-loading data on mount)
- Available hooks:
  - `useFlashcardManagement` - Combines `useFlashcards` with state management for flashcard list (auto-loads on mount, provides handlers for CRUD operations)
  - `useFlashcardGeneration` - Combines `useGeneration` with proposal state management (accept, reject, edit flashcard proposals before saving)
  - `useFlashcardSearch` - Client-side search and filtering of flashcards (filters by front/back content, provides search stats)

**Usage Pattern:**
- Use **API hooks** when you need fine-grained control over API calls and state
- Use **composite hooks** for common UI patterns and automatic state management
- Import hooks from `@/hooks` (barrel export from `index.ts`)

**Example:**
```typescript
// Using composite hook (recommended for most cases)
import { useFlashcardManagement } from '@/hooks';

function MyFlashcardsPage() {
  const { flashcards, isLoading, handleCreateFlashcard } = useFlashcardManagement();
  // flashcards are automatically loaded on mount
}

// Using API hook (for custom control)
import { useFlashcards } from '@/hooks/api';

function CustomFlashcardsComponent() {
  const { fetchFlashcards, isLoading } = useFlashcards();
  // Manual control over when to fetch
}
```

## Coding Standards

### Error Handling
- Handle errors and edge cases at the beginning of functions
- Use early returns to avoid deep nesting
- Place happy path last for readability
- Avoid unnecessary else statements (if-return pattern)
- Use guard clauses for preconditions
- Implement proper error logging with user-friendly messages

### Path Aliasing
- Use `@/*` imports for src directory: `import { foo } from '@/lib/utils'`
- Configured in `tsconfig.json` and `vitest.config.ts`

## Testing Guidelines

### Unit Tests (Vitest)

**Configuration:**
- Test files: `**/*.{test,spec}.{ts,tsx}`
- Setup file: `src/tests/setup.ts`
- Use jsdom environment for React component tests
- Test utilities: `src/tests/test-utils.tsx`

**Commands:**
```bash
npm run test             # Run in watch mode
npm run test:run         # Run once
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

### E2E Tests (Playwright)

**Prerequisites:**

1. **`.env.test` file is required** with the following variables:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   OPENROUTER_API_KEY=your-openrouter-key
   E2E_USERNAME=test-user@example.com
   E2E_PASSWORD=test-password
   E2E_USERNAME_ID=user-uuid-from-database
   BASE_URL=http://localhost:3000
   ```

2. **Test user must exist in database**
   - Email and password must match `.env.test`
   - Create test user with: `npm run test:e2e:create-user`

**Running E2E Tests:**

**IMPORTANT:** E2E tests require TWO separate terminals:

1. **Terminal 1 - Start dev server:**
   ```bash
   npm run dev:e2e
   ```
   Wait for server to start at `http://localhost:3000`

2. **Terminal 2 - Run tests:**
   ```bash
   npm run test:e2e         # Run all E2E tests
   npm run test:e2e:ui      # Playwright UI mode
   npm run test:e2e:headed  # Run with visible browser
   npm run test:e2e:debug   # Debug mode
   npm run test:e2e:codegen # Record new tests
   ```

**Test Structure:**

- Test directory: `e2e/`
- Uses Page Object Model pattern (e.g., `e2e/pages/LoginPage.ts`)
- Auth helpers in `e2e/helpers/auth.helpers.ts`
- Runs in Chromium only (as per guidelines)
- **Uses 1 worker** (configured in `playwright.config.ts`) to prevent tests from interfering with each other by running sequentially

**Test Execution Order:**

Tests run in dependency order:

1. **auth-tests** - First runs `00-setup-auth.spec.ts` (alphabetically first) which saves auth state to `.auth/user.json`, then validates login functionality
2. **flashcard-generation** - Uses saved auth state, tests AI generation
3. **my-flashcards** - Uses saved auth state, tests flashcard management (editing, deleting)
4. **study-session** - Uses saved auth state, tests spaced repetition
   - `00-setup-study-data.spec.ts` removes review logs and seeds minimum 80 flashcards for test user, ensuring fresh data for all scenarios
5. **cleanup** - Clears authentication state and database (must run last)

**Timeouts:**
- Project-specific timeouts configured in `playwright.config.ts` (e.g., 180s for AI generation)

**Troubleshooting:**

**Issue: `ERR_CONNECTION_REFUSED`**
- **Cause:** Dev server not running
- **Fix:** Run `npm run dev:e2e` in separate terminal

**Issue: "Invalid login credentials"**
- **Cause:** Test user doesn't exist or credentials mismatch
- **Fix:**
  1. Verify user exists in database
  2. Check email/password in `.env.test`
  3. Create test user: `npm run test:e2e:create-user`

**Issue: Test timeout**
- **Cause:** API delays (OpenRouter, Supabase) or slow network
- **Fix:**
  1. Check OpenRouter API status (for generation tests)
  2. Increase timeout in `playwright.config.ts`
  3. Verify Supabase connection

**Important Notes:**
- Always run dev server before tests
- Never commit `.env.test` with real credentials
- Auth state saved in `.auth/user.json` is used by most tests
- Cleanup test removes auth state to avoid committing sensitive data

## Environment Variables

Required environment variables (see `.env.example`):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `OPENROUTER_API_KEY` - OpenRouter.ai API key

For E2E tests (`.env.test`):
- `BASE_URL` - Test server URL (default: http://localhost:3000)
- `E2E_USERNAME_ID` - Test user UUID
- `E2E_USERNAME` - Test user email
- `E2E_PASSWORD` - Test user password

## Database Migrations

Supabase migrations in `supabase/migrations/`:
- Migrations are timestamped SQL files
- Use `npm run supabase:push` to apply migrations
- Use `npm run supabase:reset` to reset and re-run all migrations
- Never modify existing migrations; create new ones instead

## Cloudflare Workers Constraints

The application is deployed to Cloudflare Pages (Workers runtime), which has specific limitations:

**Runtime Restrictions:**
- NO Node.js built-in modules (`crypto`, `fs`, `path`, `os`, etc.)
- Use Web Crypto API instead of Node.js crypto
- Use `crypto.subtle.digest()` instead of `crypto.createHash()`
- Prefer SHA-256 over MD5 for hashing (better security and Web Crypto support)
- Access runtime environment variables via `Astro.locals.runtime.env`

**Key Differences from Node.js:**
- Web standard APIs only (fetch, crypto.subtle, streams, etc.)
- No filesystem access
- No process.env (use runtime.env instead)
- Limited CPU time per request

**Example - Hashing:**
```typescript
// ❌ DON'T - Node.js crypto (not available in Workers)
import crypto from 'crypto';
const hash = crypto.createHash('md5').update(data).digest('hex');

// ✅ DO - Web Crypto API
const encoder = new TextEncoder();
const data = encoder.encode(text);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
```

## Important Constraints

1. **Never use "use client"** - This is Next.js-specific; not needed in Astro
2. **Cookie Management** - ONLY use `getAll` and `setAll` for Supabase auth cookies (not individual get/set/remove)
3. **Auth Middleware** - Always call `supabase.auth.getUser()` before other operations
4. **SSR Configuration** - Auth pages require SSR (either `export const prerender = false` or `output: "server"` in config)
5. **API Endpoints** - Always use uppercase method names: `POST`, `GET`, not `post`, `get`
6. **SupabaseClient Type** - Import `SupabaseClient` type from `src/db/supabase.client.ts`, NOT from `@supabase/supabase-js`
7. **Linter Feedback** - Use linter feedback to improve code when making changes
