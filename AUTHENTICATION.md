# Authentication & Authorization Guide

## Overview

This document describes the authentication and authorization system for 10xCards. The system uses **Supabase Auth** with JWT tokens and provides **centralized, configuration-driven route protection**.

## Security Architecture

### Layers of Defense

The application implements **defense-in-depth** with multiple security layers:

1. **Middleware Layer** - Primary defense

   - Validates JWT tokens on every request
   - Redirects unauthenticated users to login
   - Stores user session in `Astro.locals`

2. **Page/Route Layer** - Secondary defense

   - Defensive checks in individual routes
   - Validates user data existence and integrity
   - Provides graceful error handling

3. **API Layer** - Data access control
   - Server-side validation before database operations
   - Never trusts client-side authentication
   - Uses `Astro.locals.supabase` for authenticated requests

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Browser Request (any route)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ MIDDLEWARE: src/middleware/index.ts                          │
│ - Extracts JWT from HTTP-only cookie                        │
│ - Validates JWT with Supabase                               │
│ - Sets Astro.locals.user if authenticated                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    ✅ Public Route          ❌ Protected Route
    (no auth needed)         (auth required)
        │                             │
        ▼                             ▼
    ┌────────┐              ┌──────────────────┐
    │ Allow  │              │ Is User Logged?  │
    └────────┘              └────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                        │
                  ✅ Yes                   ❌ No
                    │                        │
                    ▼                        ▼
              ┌──────────┐           ┌─────────────┐
              │ Continue │           │ Redirect to │
              │ to Route │           │ /auth/login │
              └──────────┘           └─────────────┘
```

## Route Protection

### Public Routes (No Authentication Required)

Public routes are **explicitly whitelisted** in the middleware configuration:

```typescript
// src/middleware/index.ts
const ROUTE_CONFIG = {
  public: [
    "/", // Landing page
    "/auth/login", // Login page
    "/auth/register", // Registration page
    "/auth/reset-password", // Password reset
    "/api/auth/login", // Auth API endpoints
    "/api/auth/register",
    "/api/auth/reset-password",
  ],
};
```

### Protected Routes

**Any route NOT in the public list is automatically protected.** This includes:

- **Pages**: `/generate`, `/flashcards`, etc.
- **API Endpoints**: `/api/flashcards`, `/api/generations`, etc.

This whitelist approach is secure because:

- ✅ Default-deny: New routes are protected automatically
- ✅ Explicit: Easy to see all public routes in one place
- ✅ Centralized: Single source of truth for access control

## Implementation Guide

### 1. Creating a Protected Page

Simply create a new page in `/src/pages/` and add defensive checks:

```astro
---
// src/pages/my-feature.astro

// Guard clause: Check user exists
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/auth/login");
}

// Optional: Validate user data
if (!user.id || !user.email) {
  return Astro.redirect("/auth/login");
}
---

<Layout>
  <h1>Welcome {user.email}!</h1>
</Layout>
```

**That's it!** The middleware automatically protects this route.

### 2. Creating a Protected API Endpoint

Create an endpoint in `/src/pages/api/` with server-side validation:

```typescript
// src/pages/api/my-endpoint.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Guard clause: Verify user is authenticated
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Your business logic here
  const supabase = locals.supabase;
  // ...

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
```

### 3. Accessing User Data in Components

In Astro components:

```astro
---
const user = Astro.locals.user;
console.log(user.id, user.email);
---
```

In React components (client-side), use the user data passed from Astro:

```tsx
// This data is passed from the Astro page
interface ComponentProps {
  user: { id: string; email: string };
}

export function MyComponent({ user }: ComponentProps) {
  // Use user data
  return <div>Hello {user.email}</div>;
}
```

## Authentication Flow

### Login Flow

```
1. User visits /auth/login
2. User submits email & password
3. POST /api/auth/login with credentials
4. Supabase validates credentials & returns JWT
5. JWT stored in HTTP-only cookie (secure, sameSite=lax)
6. Redirect to /generate
7. Middleware validates JWT on next request
8. User can access protected routes
```

### Logout Flow

```
1. User clicks logout button
2. POST /api/auth/logout
3. Supabase clears session
4. HTTP-only cookie removed
5. Redirect to /auth/login
6. Next request: Middleware detects no JWT → redirect to login
```

## Environment Variables

The application requires Supabase credentials in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

These are used to:

- Initialize Supabase client
- Validate JWT tokens
- Manage user sessions

**Never commit `.env` to git** - use `.env.example` for documentation.

## Security Best Practices

### ✅ DO

- Always verify `Astro.locals.user` exists before using it
- Validate user input server-side (never trust client)
- Use `locals.supabase` for authenticated database operations
- Log security events for monitoring
- Implement rate limiting on auth endpoints
- Use strong password requirements

### ❌ DON'T

- Don't trust client-side authentication checks
- Don't expose JWT tokens in URLs or logs
- Don't skip middleware checks
- Don't hardcode user IDs in the frontend
- Don't cache sensitive user data on the client
- Don't expose error messages that reveal system details

## Troubleshooting

### User Keeps Getting Redirected to Login

**Problem**: User logs in but keeps seeing the login page.

**Causes**:

1. JWT cookie not being set properly
2. Cookie domain/path mismatch
3. Browser cookie settings

**Solution**:

- Clear browser cookies and try again
- Check browser DevTools → Application → Cookies
- Verify `cookieOptions` in `src/db/supabase.client.ts`

### Protected Route Is Accessible Without Login

**Problem**: User can access a protected route without authentication.

**Causes**:

1. Route is in `PUBLIC_PATHS` when it shouldn't be
2. Route has `export const prerender = true` (disables SSR)
3. Middleware is disabled

**Solution**:

- Remove route from `PUBLIC_PATHS`
- Ensure `astro.config.mjs` has `output: "server"`
- Verify middleware is running

### Stale User Data in Locals

**Problem**: `Astro.locals.user` shows old data.

**Causes**:

1. Token not refreshed
2. User data not updated in database
3. Stale cache

**Solution**:

- Clear cookies in browser
- Restart development server
- Check Supabase dashboard for user data

## File Structure

```
src/
├── middleware/
│   └── index.ts              ← Route protection logic
├── db/
│   └── supabase.client.ts    ← Supabase client & JWT handling
├── pages/
│   ├── index.astro           ← Public landing page
│   ├── generate.astro        ← Protected: Generate flashcards
│   └── api/
│       └── auth/
│           ├── login.ts      ← Auth endpoint
│           ├── register.ts   ← Auth endpoint
│           └── logout.ts     ← Auth endpoint
└── env.d.ts                  ← Type definitions for Astro.locals
```

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Astro Middleware Guide](https://docs.astro.build/en/guides/middleware/)
- [Astro Security Best Practices](https://docs.astro.build/en/guides/security/)
