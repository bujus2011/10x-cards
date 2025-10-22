# E2E Testing Environment Setup

## 📋 Required Environment Variables

Create a `.env.test` file in the `10x-cards/` directory with the following content:

```env
# Supabase Configuration (use your test/local instance OR cloud instance)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# E2E Test User Credentials
# IMPORTANT: Create this user in your Supabase database before running tests
E2E_USERNAME=test@example.com
E2E_PASSWORD=TestPassword123!

# Base URL for testing (optional)
# Default: http://localhost:4321
# For cloud testing: https://your-app.vercel.app
BASE_URL=http://localhost:4321

# Optional: OpenRouter API for AI features testing
# OPENROUTER_API_KEY=your-api-key
```

## 🔧 Setup Steps

### 1. Create .env.test File

Create a `.env.test` file in the `10x-cards/` directory:

**For Local Testing:**

```env
# Supabase Configuration (local)
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=your-local-anon-key

# E2E Test User
E2E_USERNAME=test@example.com
E2E_PASSWORD=TestPassword123!

# Base URL (default for local)
BASE_URL=http://localhost:4321
```

**For Cloud Testing:**

```env
# Supabase Configuration (cloud)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-cloud-anon-key

# E2E Test User (must exist in cloud database)
E2E_USERNAME=your-test-user@example.com
E2E_PASSWORD=YourSecurePassword123!

# Base URL (your deployed app)
BASE_URL=https://your-app.vercel.app
```

**Quick Copy from Existing .env:**

```bash
# Windows PowerShell
cd 10x-cards
Copy-Item .env .env.test

# Then edit .env.test and add:
# - E2E_USERNAME
# - E2E_PASSWORD
# - BASE_URL (if testing cloud)
```

### 2. Create Test User

**Option A: Using the helper script (recommended)**

```bash
npm run test:e2e:create-user
```

This script will:

- Read credentials from `.env.test`
- Create a user in your Supabase database
- Show confirmation message

**Option B: Manual creation via Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter the email and password from your `.env.test`
5. Click **Create User**
6. If required, confirm the email (click on user → Confirm email)

**Option C: Using Supabase CLI**

```bash
# Using local Supabase
supabase db reset  # This will reset to migrations

# Then create user via Auth API or dashboard
```

### 3. Verify Setup

Test that your credentials work:

```bash
# Start dev server
npm run dev

# In another terminal, run a simple test
npx playwright test e2e/auth/login.spec.ts -g "should display login form"
```

## 🔐 Security Best Practices

### DO:

- ✅ Use a dedicated test database (not production!)
- ✅ Use unique password for test user
- ✅ Add `.env.test` to `.gitignore` (already done)
- ✅ Rotate test credentials regularly
- ✅ Use separate Supabase project for testing

### DON'T:

- ❌ Use production database for E2E tests
- ❌ Commit `.env.test` to git
- ❌ Use real user passwords
- ❌ Share test credentials publicly

## 🧪 Testing the Setup

### Local Testing

After creating `.env.test` and test user, verify everything works:

```bash
# 1. Check if environment variables load correctly
cd 10x-cards
npx playwright test --list

# You should see: [dotenv@...] injecting env (6) from .env.test

# 2. Start dev server first
npm run dev

# 3. In a new terminal, run login tests
npm run test:e2e:ui

# 4. Or run a quick test
npx playwright test e2e/auth/login-with-helpers.spec.ts
```

### Cloud Testing

To run tests against your deployed cloud application:

```bash
# 1. Update .env.test with cloud credentials
# Set BASE_URL to your deployed app URL (e.g., https://your-app.vercel.app)
# Set SUPABASE_URL and SUPABASE_KEY to your cloud Supabase instance
# Set E2E_USERNAME and E2E_PASSWORD to a user that exists in your cloud database

# 2. Run tests (no need to start dev server)
npm run test:e2e

# 3. Or run with UI mode
npm run test:e2e:ui

# 4. Or run specific test
npx playwright test e2e/auth/login-with-helpers.spec.ts --headed
```

**Note:** When testing against cloud, make sure:

- ✅ BASE_URL points to your deployed application
- ✅ SUPABASE_URL and SUPABASE_KEY match your cloud Supabase project
- ✅ Test user exists in the cloud database
- ✅ You're not running local dev server (tests will use BASE_URL from .env.test)

## 🐛 Troubleshooting

### Error: "Invalid login credentials"

**Problem:** The test user doesn't exist in the database or credentials are wrong.

**Solution:**

1. Check `.env.test` has correct `E2E_USERNAME` and `E2E_PASSWORD`
2. Run `npm run test:e2e:create-user` to create the user
3. Verify user exists in Supabase Dashboard → Authentication → Users
4. Confirm the email if required

### Error: "SUPABASE_URL is not defined"

**Problem:** `.env.test` file is missing or not in the correct location.

**Solution:**

1. Create `.env.test` in `10x-cards/` directory (NOT in root)
2. Add required variables (see template above)
3. Restart your terminal/IDE

### Error: "Failed to read localStorage"

**Problem:** Tests trying to access localStorage before page loads.

**Solution:**
This should be fixed in the latest version. If you still see it:

1. Make sure you're using `context.clearCookies()` in `beforeEach`
2. Don't use `clearAuthData()` in `beforeEach` (call it manually if needed)

### Tests timeout waiting for server

**Problem:** Dev server not running or not accessible.

**Solution:**

1. Manually start dev server: `npm run dev`
2. Wait for "Local: http://localhost:4321/"
3. Run tests in new terminal: `npm run test:e2e:ui`

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [E2E Testing Guide](./README.md)
- [Page Object Models](./pages/README.md)
