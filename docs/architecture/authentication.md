# 🔐 Dokumentacja Systemu Autentykacji 10xCards

## Spis Treści

1. [Przegląd](#przegląd)
2. [Architektura Bezpieczeństwa](#architektura-bezpieczeństwa)
3. [Struktura Interfejsu Użytkownika](#struktura-interfejsu-użytkownika)
4. [Logika Backendowa](#logika-backendowa)
5. [Implementacja Tras](#implementacja-tras)
6. [Przepływy Autentykacji](#przepływy-autentykacji)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Przegląd

System autentykacji 10xCards zapewnia bezpieczne zarządzanie sesjami użytkowników przy użyciu **Supabase Auth** z tokenami JWT. Implementacja opiera się na **centralizowanej, konfigurowalnej ochronie tras** z wielowarstwowym systemem bezpieczeństwa (defense-in-depth).

### Kluczowe Cechy

- ✅ **Centralna konfiguracja tras** - Single source of truth
- ✅ **Defence-in-depth** - 3 warstwy ochrony
- ✅ **JWT w HTTP-only cookies** - Bezpieczne przechowywanie
- ✅ **Automatyczna walidacja** - Na każde żądanie
- ✅ **Default-deny strategia** - Nowe trasy automatycznie chronione

### Stack Technologiczny

- **Frontend**: Astro 5, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Astro API Routes, Node.js
- **Autentykacja**: Supabase Auth
- **Baza Danych**: PostgreSQL (Supabase)
- **Walidacja**: Zod

---

## Architektura Bezpieczeństwa

### Model Wielowarstwowy (Defense-in-Depth)

```
┌─────────────────────────────────────────────────────────────┐
│ ŻĄDANIE HTTP (GET, POST, itp.)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ WARSTWA 1: MIDDLEWARE (src/middleware/index.ts)            │
│ ────────────────────────────────────────────────────────────│
│ • Walidacja JWT z cookies                                   │
│ • Sprawdzenie sesji użytkownika                             │
│ • Ustawienie Astro.locals.user                              │
│ • Redirect do /auth/login jeśli brak autentykacji          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   Trasa Publiczna         Trasa Chroniona
   (bez autentykacji)      (wymaga logowania)
        │                             │
        ▼                             ▼
   ┌─────────┐             ┌────────────────┐
   │ Dostęp  │             │ Użytkownik     │
   │ Zezwolony│            │ Zalogowany?    │
   └─────────┘             └────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                        │
                  TAK ✅                  NIE ❌
                    │                        │
                    ▼                        ▼
     ┌──────────────────────┐      ┌─────────────────┐
     │ WARSTWA 2: STRONA    │      │ Redirect:       │
     │ ──────────────────── │      │ /auth/login?    │
     │ • Guard clauses      │      │ redirect=...    │
     │ • Walidacja danych   │      └─────────────────┘
     │ • Defensywne czeki   │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │ WARSTWA 3: API       │
     │ ──────────────────── │
     │ • Weryfikacja user   │
     │ • Dostęp do DB       │
     │ • Logowanie          │
     └──────────────────────┘
```

### Warstwy Ochrony

#### **1. Warstwa Middleware (Główna Linia Obrony)**

Plik: `src/middleware/index.ts`

- **Uruchamiana na każde żądanie** - Bez wyjątków
- **Walidacja JWT** - Sprawdzenie tokenów w cookies
- **Zarządzanie sesją** - Odświeżanie JWTs
- **Routing autentykacji** - Redirect dla niezalogowanych

```typescript
// Przepływ
1. Ekstrahuj JWT z HTTP-only cookie
2. Waliduj JWT za pośrednictwem Supabase
3. Jeśli ważny → ustaw locals.user
4. Jeśli nie ważny lub brak → redirect /auth/login
```

#### **2. Warstwa Strony (Obrona Defensywna)**

Pliki: `src/pages/*.astro`

- **Guard clauses** - Sprawdzanie locals.user
- **Walidacja integralności** - Sprawdzenie id i email
- **Fallback redirect** - Backup dla pewności

```astro
---
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/auth/login");
}
if (!user.id || !user.email) {
  return Astro.redirect("/auth/login");
}
---
```

#### **3. Warstwa API (Kontrola Dostępu do Danych)**

Pliki: `src/pages/api/*.ts`

- **Weryfikacja locals.user** - Przed każdą operacją
- **Użycie locals.supabase** - Do operacji DB
- **Nigdy nie ufaj klientowi** - Walidacja server-side

```typescript
export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Bezpieczne użycie locals.supabase
  const supabase = locals.supabase;
  // ...
};
```

---

## Struktura Interfejsu Użytkownika

### Strony Publiczne

Dostępne dla wszystkich użytkowników bez logowania.

#### **1. Strona Logowania** (`/auth/login`)

```astro
---
// src/pages/auth/login.astro
---

<Layout>
  <LoginForm client:load />
</Layout>
```

**Komponenty React:**

- `LoginForm` - Formularz z polami email i hasło
- Walidacja email i hasła
- Obsługa błędów i stanu ładowania
- Linki do rejestracji i odzyskiwania hasła

**Funkcjonalność:**

```
1. Użytkownik wpisuje email i hasło
2. Formularz waliduje dane (client-side)
3. POST /api/auth/login z poświadczeniami
4. API zwraca JWT
5. Browser przechowuje JWT w cookie
6. Redirect do /generate
```

#### **2. Strona Rejestracji** (`/auth/register`)

```astro
---
// src/pages/auth/register.astro
---

<Layout>
  <RegisterForm client:load />
</Layout>
```

**Komponenty React:**

- `RegisterForm` - Formularz z email, hasło, potwierdzenie
- Walidacja siły hasła
- Sprawdzenie dopasowania haseł
- Komunikaty o błędach

**Przepływ:**

```
1. Użytkownik wypełnia formularz
2. Walidacja client-side
3. POST /api/auth/register
4. Supabase tworzy konto
5. Automatyczne zalogowanie
6. Redirect do /generate
```

#### **3. Strona Resetowania Hasła** (`/auth/reset-password`)

```astro
---
// src/pages/auth/reset-password.astro
---

<Layout>
  <ResetPasswordForm client:load />
</Layout>
```

**Komponenty React:**

- `ResetPasswordForm` - Formularz do wysłania emaila resetu
- Email input z ikoną
- Komunikat sukcesu z informacją o wysłaniu emaila
- Informacja, że użytkownik będzie musiał ustawić nowe hasło

**Przepływ:**

```
1. Użytkownik otwiera /auth/reset-password
2. Wpisuje email i kliknie "Reset password"
3. POST /api/auth/reset-password
4. Supabase wysyła email z linkiem resetowania
5. Pokaż komunikat: "Sprawdź email"
6. Użytkownik otwiera link z emaila
```

#### **4. Strona Potwierdzenia Resetowania** (`/auth/reset-password-confirm`) - ✨ NOWA

```astro
---
// src/pages/auth/reset-password-confirm.astro
---

<Layout>
  <ResetPasswordConfirmForm client:load />
</Layout>
```

#### **5. Strona Callback OAuth** (`/auth/callback`) - ✨ NOWA

```ts
// src/pages/auth/callback.ts
export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers, runtimeEnv: locals.runtime?.env });
  const { error } = await supabase.auth.exchangeCodeForSession(new URL(request.url).searchParams.get("code"));

  if (error) {
    return Response.redirect("/auth/login?authError=session_exchange_failed", 302);
  }

  return Response.redirect("/generate", 302);
};
```

- Obsługuje powrót z providerów (GitHub i Google)
- Wymienia `code` OAuth na sesję Supabase i zapisuje cookie
- Przekierowuje użytkownika do docelowej strony (`redirectTo`) lub z powrotem na ekran logowania z komunikatem błędu
- Wymaga skonfigurowania redirect URL `https://twoja-domena/auth/callback` w Supabase (Settings → Authentication → URL Configuration) oraz aktywacji providerów GitHub/Google

**Komponenty React:**

- `ResetPasswordConfirmForm` - Formularz do ustawienia nowego hasła
- Dwa pola: Nowe hasło + Potwierdzenie hasła
- Wyodrębnia token z URL (`?token=...` lub `?token_hash=...`)
- Walidacja czy hasła się zgadzają
- Komunikat sukcesu i automatyczny redirect na /auth/login

**Przepływ:**

```
1. Użytkownik klika link z emaila
   /auth/reset-password-confirm?token_hash=XXX&type=recovery
2. Strona wyodrębnia token z URL
3. Formularz pozwala wpisać nowe hasło 2x
4. Walidacja: hasła muszą się zgadzać
5. POST /api/auth/reset-password-confirm { password, token }
6. Supabase weryfikuje token i aktualizuje hasło
7. Sukces → Redirect na /auth/login (2 sekundy)
```

### Strony Chronione (Wymaga Logowania)

#### **Strona Generacji** (`/generate`)

```astro
---
// src/pages/generate.astro

// Guard clause - Warstwa defensywna
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/auth/login");
}

if (!user.id || !user.email) {
  return Astro.redirect("/auth/login");
}
---

<Layout>
  <FlashcardGenerationView client:load />
</Layout>
```

**Ochrona:**

- Middleware weryfikuje JWT
- Strona sprawdza locals.user
- Komponent React korzysta z API chronionych endpointów

---

## Logika Backendowa

### Endpointy API Autentykacji

Wszystkie endpointy znajdują się w `src/pages/api/auth/`

#### **POST `/api/auth/register`**

**Cel**: Rejestracja nowego użytkownika

**Żądanie:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Walidacja:**

- Email: Format poprawny (Zod)
- Hasło: Minimalna długość 8 znaków
- Hasło: Zawiera: wielkie litery, małe litery, cyfry, znaki specjalne

**Proces:**

```typescript
1. Waliduj dane wejściowe (Zod)
2. Sprawdź, czy email nie istnieje (Supabase)
3. Utwórz konto (supabase.auth.signUp)
4. Ustaw JWT w cookie
5. Zwróć { user: {...}, status: "success" }
```

**Odpowiedzi:**

- `200` - Sukces
- `400` - Błąd walidacji lub email już istnieje
- `500` - Błąd serwera

#### **POST `/api/auth/login`**

**Cel**: Logowanie użytkownika

**Żądanie:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Proces:**

```typescript
1. Waliduj dane
2. Wywołaj supabase.auth.signInWithPassword()
3. Supabase waliduje poświadczenia
4. Jeśli OK → ustaw JWT w cookie
5. Zwróć { user: {...}, status: "success" }
```

**Odpowiedzi:**

- `200` - Sukces, JWT w cookie
- `400` - Błędne poświadczenia
- `500` - Błąd serwera

#### **POST `/api/auth/logout`**

**Cel**: Wylogowanie użytkownika

**Proces:**

```typescript
1. Sprawdź locals.user
2. Wywołaj supabase.auth.signOut()
3. Supabase czyści sesję
4. Browser usuwa JWT cookie
5. Zwróć { status: "success" }
```

#### **POST `/api/auth/reset-password`**

**Cel**: Inicjowanie procesu resetowania hasła

**Żądanie:**

```json
{
  "email": "user@example.com"
}
```

**Proces:**

```typescript
1. Waliduj email
2. Supabase wysyła email z linkiem resetowania
3. Link zawiera token do weryfikacji
4. Zwróć { status: "success", message: "Email sent" }
```

**Odpowiedzi:**

- `200` - Email wysłany
- `400` - Email invalid lub nie znaleziony
- `500` - Błąd serwera

#### **POST `/api/auth/reset-password-confirm`** - ✨ NOWY

**Cel**: Potwierdzenie resetowania hasła i ustawienie nowego

**Żądanie:**

```json
{
  "password": "NewSecurePass456!",
  "token": "token_hash_from_email"
}
```

**Walidacja:**

- Hasło: Minimalna długość 8 znaków
- Token: Wymagane, od Supabase

**Proces:**

```typescript
1. Waliduj hasło i token (Zod)
2. Weryfikuj token używając supabase.auth.verifyOtp()
   - type: "recovery" (token resetu hasła)
3. Jeśli token ważny → aktualizuj hasło
   - supabase.auth.updateUser({ password })
4. Jeśli sukces → zwróć { status: "success" }
5. Jeśli token wygasł → zwróć błąd
```

**Odpowiedzi:**

- `200` - Hasło zmienione
- `400` - Token invalid/wygasł, hasło nie spełnia wymogów
- `500` - Błąd serwera

### Walidacja Danych

Używamy **Zod** do walidacji wejścia:

```typescript
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Niepoprawny format email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

const data = LoginSchema.parse(input);
```

### Obsługa Błędów

**Kodowanie Statusów HTTP:**

```
200 OK              - Operacja pomyślna
400 Bad Request     - Błąd walidacji, email istnieje, dane niepoprawne
401 Unauthorized    - Brak autoryzacji, token wygasł
403 Forbidden       - Brak uprawnień do zasobu
500 Server Error    - Błąd po stronie serwera
```

**Logowanie:**

```typescript
try {
  // operacja
} catch (error) {
  console.error("[AUTH_ERROR]", error);
  return new Response(JSON.stringify({ error: "User-friendly message" }), { status: 500 });
}
```

---

## Implementacja Tras

### Konfiguracja Centralna

Plik: `src/middleware/index.ts`

```typescript
const ROUTE_CONFIG = {
  public: [
    "/", // Strona główna
    "/auth/login", // Logowanie
    "/auth/register", // Rejestracja
    "/auth/reset-password", // Reset hasła
    "/auth/reset-password-confirm", // Potwierdzenie resetowania hasła ✨ NOWE
    "/auth/callback", // Supabase OAuth callback ✨ NOWE
    "/api/auth/login", // API endpoint
    "/api/auth/register", // API endpoint
    "/api/auth/reset-password", // API endpoint
    "/api/auth/reset-password-confirm", // API endpoint ✨ NOWE
  ],

  protected: [
    "/generate", // Generacja fiszek
    "/api/flashcards", // API fiszek
    "/api/generations", // API generacji
  ],
};
```

### Dodawanie Nowej Trasy Chronionej

**Scenariusz 1: Nowa Strona Astro**

```astro
---
// src/pages/my-new-page.astro

// Guard clause - obowiązkowe!
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/auth/login");
}
---

<Layout title="My Page">
  <h1>Welcome {user.email}</h1>
</Layout>
```

**Middleware automatycznie ją chroni!** Nie trzeba nic konfigurować.

**Scenariusz 2: Nowy Endpoint API**

```typescript
// src/pages/api/my-endpoint.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Walidacja autentykacji
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Logika biznesowa
  const supabase = locals.supabase;
  const { data, error } = await supabase.from("my_table").select("*").eq("user_id", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};
```

**Middleware automatycznie ją chroni!**

### Dodawanie Trasy Publicznej

Jeśli naprawdę potrzebujesz nowej publicznej trasy:

```typescript
// src/middleware/index.ts
const ROUTE_CONFIG = {
  public: [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/reset-password",
    "/about", // ← NOWA PUBLICZNA STRONA
    "/pricing", // ← NOWA PUBLICZNA STRONA
  ],
  // ...
};
```

---

## Przepływy Autentykacji

### Przepływ Rejestracji

```
UŻYTKOWNIK                              APLIKACJA
   │                                        │
   ├─ Otwiera /auth/register ─────────────>│
   │                                        │
   │<───── Ładuje formularz rejestracji ───┤
   │                                        │
   ├─ Wypełnia email & hasło ─────────────>│
   │                                        │
   │<────── Walidacja (client-side) ───────┤
   │        • Email format ✓                │
   │        • Hasło 8+ znaków ✓             │
   │        • Hasła się zgadzają ✓          │
   │                                        │
   ├─ Klika "Zarejestruj się" ────────────>│
   │                                        │
   │                        POST /api/auth/register
   │                        {
   │                          email: "user@example.com",
   │                          password: "SecurePass123!"
   │                        }
   │                                        │
   │                                  Supabase
   │                                 create account
   │                                        │
   │                                   JWT token
   │                                        │
   │<──── Set-Cookie: sb-auth-token ───────┤
   │<──── { user: {...}, success: true } ───┤
   │                                        │
   │<──── Redirect /generate ───────────────┤
   │                                        │
   │                                     Middleware
   │                                  validates JWT
   │                                   sets user
   │                                        │
   │<──── Strona generacji fiszek ──────────┤
   │
```

### Przepływ Logowania

```

### Przepływ Logowania Społecznościowego (GitHub / Google) - ✨ NOWY

```
UŻYTKOWNIK                              APLIKACJA
   │                                        │
   ├─ Klika "Continue with GitHub/Google" → │
   │                                        │
   │                      Supabase JS: signInWithOAuth()
   │                         redirectTo=/auth/callback
   │                                        │
   │───────────── Przekierowanie do providera (OAuth) ───────▶ GITHUB/GOOGLE
   │                                        │
   │ ◀─────────────── Po poprawnej autoryzacji ──────────────┘
   │                                        │
   │            GET /auth/callback?code=...&redirectTo=/generate
   │                                        │
   │                                  Supabase
   │                         exchangeCodeForSession(code)
   │                        ↳ ustawia cookie sb-auth-token
   │                                        │
   │<──── Redirect 302 na /generate (lub inną trasę) ────────┤
   │                                        │
   │<──── Middleware waliduje sesję i ustawia locals.user ──┤
   │                                        │
```

- W przypadku błędu (`error_description` od providera) `/auth/callback` przekierowuje użytkownika z powrotem na ekran logowania/rejestracji z czytelnym komunikatem (`authError`, `message`)
- Parametr `redirectTo` w callbacku zapewnia powrót na trasę żądaną przed logowaniem (np. `/study-session`)
UŻYTKOWNIK                              APLIKACJA
   │                                        │
   ├─ Otwiera /auth/login ────────────────>│
   │                                        │
   │<───── Ładuje formularz logowania ─────┤
   │                                        │
   ├─ Wpisuje email & hasło ──────────────>│
   │                                        │
   │<────── Walidacja (client-side) ───────┤
   │                                        │
   ├─ Klika "Zaloguj się" ────────────────>│
   │                                        │
   │                      POST /api/auth/login
   │                      {
   │                        email: "user@example.com",
   │                        password: "SecurePass123!"
   │                      }
   │                                        │
   │                                  Supabase
   │                                 validate
   │                              credentials
   │                                        │
   │                                   JWT token
   │                                        │
   │<──── Set-Cookie: sb-auth-token ───────┤
   │<──── { user: {...}, success: true } ───┤
   │                                        │
   │<──── Redirect /generate ───────────────┤
   │                                        │
```

### Przepływ Wylogowania

```
UŻYTKOWNIK                              APLIKACJA
   │                                        │
   ├─ Klika "Wyloguj się" ────────────────>│
   │                                        │
   │                      POST /api/auth/logout
   │                                        │
   │                                  Supabase
   │                                 sign out
   │                                        │
   │<──── Clear-Cookie ─────────────────────┤
   │<──── { status: "success" } ────────────┤
   │                                        │
   │<──── Redirect /auth/login ─────────────┤
   │                                        │
```

### Przepływ Resetowania Hasła

```
UŻYTKOWNIK                              APLIKACJA
   │                                        │
   ├─ Klika "Zapomniałem hasła" ──────────>│
   │                                        │
   │<───── Formularz email ─────────────────┤
   │                                        │
   ├─ Wpisuje email ───────────────────────>│
   │                                        │
   │<──── Walidacja email ──────────────────┤
   │                                        │
   ├─ Klika "Wyślij link" ─────────────────>│
   │                                        │
   │               POST /api/auth/reset-password
   │               { email: "..." }
   │                                        │
   │                                  Supabase
   │                              resetPasswordForEmail()
   │                                        │
   │                            📧 Email z linkiem
   │                    Link: /auth/reset-password-confirm
   │                           ?token_hash=XXX&type=recovery
   │                                        │
   │<──── "Sprawdź email" ──────────────────┤
   │                                        │
   │<──── Komunikat sukcesu ────────────────┤
   │      "Wysłaliśmy link resetowania     │
   │       będziesz musiał wybrać nowe     │
   │       hasło i potwierdzić"            │
   │                                        │
   ├─ Otwiera email ───────────────────────>│
   │                                        │
   ├─ Klika na link ───────────────────────>│
   │                                        │
   │  /auth/reset-password-confirm
   │  ?token_hash=XXX&type=recovery
   │                                        │
   │<─── Strona wyodrębnia token z URL ────┤
   │<─── Formularz nowego hasła ────────────┤
   │                                        │
   ├─ Wpisuje nowe hasło (Hasło) ──────────>│
   │                                        │
   ├─ Potwierdza hasło (Potwierdzenie) ────>│
   │                                        │
   │<────── Walidacja (client-side) ───────┤
   │        • Hasła się zgadzają ✓          │
   │        • Hasło 8+ znaków ✓             │
   │                                        │
   ├─ Klika "Resetuj hasło" ───────────────>│
   │                                        │
   │         POST /api/auth/reset-password-confirm
   │         {
   │           password: "...",
   │           token: "token_hash_XXX"
   │         }
   │                                        │
   │                                  Supabase
   │                              verifyOtp()
   │                      (type: "recovery")
   │                                        │
   │                              updateUser()
   │                          (password zmienione)
   │                                        │
   │<──── { status: "success" } ────────────┤
   │                                        │
   │<──── Komunikat: "Hasło zmienione" ────┤
   │                                        │
   │<──── Redirect /auth/login (2 sekundy)─┤
   │
```

**Kluczowe kroki:**

1. **Krok 1 - Wysłanie emaila** (publiczny)

   - Użytkownik wpisuje swój email
   - POST `/api/auth/reset-password`
   - Supabase wysyła email z linkiem resetowania
   - Link zawiera token jako parametr URL

2. **Krok 2 - Potwierdzenie hasła** (publiczny, ale z tokenem)
   - Użytkownik klika link z emaila
   - Strona wyodrębnia token z URL
   - Użytkownik wpisuje nowe hasło (2x dla potwierdzenia)
   - POST `/api/auth/reset-password-confirm` z tokenem
   - Hasło aktualizowane w Supabase
   - Redirect na `/auth/login` aby się zalogować

---

## Best Practices

### ✅ ZAWSZE

1. **Weryfikuj `Astro.locals.user`** przed każdym użyciem

   ```astro
   ---
   const user = Astro.locals.user;
   if (!user) return Astro.redirect("/auth/login");
   ---
   ```

2. **Waliduj dane server-side** - nigdy nie ufaj klientowi

   ```typescript
   const schema = z.object({ email: z.string().email() });
   const data = schema.parse(input); // Rzuci błąd jeśli invalid
   ```

3. **Używaj `locals.supabase`** do operacji DB

   ```typescript
   const supabase = locals.supabase;
   const { data } = await supabase.from("table").select();
   ```

4. **Loguj zdarzenia bezpieczeństwa**

   ```typescript
   console.warn("[SECURITY] Unauthorized access attempt to /generate");
   ```

5. **Obsługuj błędy gracefully**
   ```typescript
   try {
     // operacja
   } catch (error) {
     console.error("[ERROR]", error);
     // User-friendly response
   }
   ```

### 🔐 Best Practices dla Password Reset

**Przepływ Dwustopniowy - Dlaczego?**

```
❌ ZŁE - Jeden link z formularzem
  /auth/reset-password?email=user@example.com&token=XXX
  Ryzyko: token widoczny w history, może być przechwycony

✅ DOBRZE - Dwa kroki z tokenem w URL
  1. Email → POST /api/auth/reset-password
  2. Email link → /auth/reset-password-confirm?token=XXX
  Bezpieczeństwo: token tylko w emailu i URL, przechowywany w stanie komponentu
```

**Token Handling**

```typescript
// ✅ DOBRZE - Extract token once on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || params.get("token_hash");
  setToken(token);
}, []);

// ❌ ZŁE - Token w React state bez czyszczenia
// Może być logowany w error boundaries
```

**Walidacja Haseł**

```typescript
// ✅ DOBRZE - Porównaj na kliencie przed wysłaniem
if (password !== confirmPassword) {
  setError("Passwords do not match");
  return;
}

// Waliduj na backendzie też
const { error } = await supabase.auth.updateUser({ password });
```

**Error Messages**

```typescript
// ✅ DOBRZE - Informuj o wygaśniętym tokenie
if (error.includes("invalid")) {
  return "Invalid or expired reset link. Request a new one.";
}

// ❌ ZŁE - Zbyt szczegółowe
if (error) {
  return error.message; // Może leakować info
}
```

### ❌ NIGDY

1. **Nie ufaj client-side authentication checks**

   ```typescript
   // ❌ ZŁE
   if (localStorage.getItem("user")) {
     /* ... */
   }

   // ✅ DOBRZE
   if (Astro.locals.user) {
     /* ... */
   }
   ```

2. **Nie eksponuj JWT tokenów**

   ```typescript
   // ❌ ZŁE - nigdy w URL
   redirect(`/page?token=${jwt}`);

   // ✅ DOBRZE - tylko w HTTP-only cookie
   cookies.set("sb-auth-token", jwt, { httpOnly: true });
   ```

3. **Nie pomiń middleware checks**

   ```typescript
   // ❌ ZŁE - disabled middleware
   export const prerender = true; // w protected page!

   // ✅ DOBRZE
   export const prerender = false; // lub zostavit default
   ```

4. **Nie hardcoduj user IDs**

   ```typescript
   // ❌ ZŁE
   const userId = "123456"; // Hardcoded!

   // ✅ DOBRZE
   const userId = locals.user.id;
   ```

5. **Nie cachuj sensitive danych na klientcie**

   ```typescript
   // ❌ ZŁE
   localStorage.setItem("userEmail", user.email);

   // ✅ DOBRZE - Server-side only
   locals.user.email;
   ```

6. **Nie exponuj szczegółów błędów**

   ```typescript
   // ❌ ZŁE
   return new Response(error.message); // Leak info!

   // ✅ DOBRZE
   return new Response("An error occurred"); // Generic
   ```

---

## Zmienne Środowiskowe

### Wymagane w `.env`

```env
# Supabase (Server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Supabase (Client-side - Required for OAuth)
# IMPORTANT: Prefix PUBLIC_ makes these accessible in browser
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-key
```

**Dlaczego PUBLIC_?**
- Astro wymaga prefiksu `PUBLIC_` dla zmiennych dostępnych w przeglądarce
- OAuth Social Login (GitHub, Google) działa po stronie klienta i wymaga tych zmiennych
- Bez PUBLIC_ zmiennych OAuth wyrzuci błąd: "Supabase URL and Key are required"

### Dokumentacja w `.env.example`

```env
# Supabase Configuration
# Get these from https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Public variables for client-side (browser) - Required for OAuth
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### Jak Znaleźć Klucze

1. Zaloguj się na [supabase.com](https://supabase.com)
2. Otwórz projekt → Settings → API
3. Skopiuj `Project URL` i `anon public` key
4. Wklej do `.env`

**WAŻNE**: Nigdy nie commituj `.env` do git!

---

## Troubleshooting

### Problem: Użytkownik Zredirekcjonowany do Logowania po Zalogowaniu

**Objawy:**

- User loguje się pomyślnie
- Strona redirect do /generate
- Ale cały czas widzi login page

**Przyczyny:**

1. JWT cookie nie ustawiony prawidłowo
2. Cookie domain/path mismatch
3. Ustawienia cookie browsera

**Rozwiązanie:**

```
1. Wyczyść cookies w browser
   Chrome DevTools → Application → Cookies → Delete all
2. Zrestartuj dev server
3. Zaloguj się ponownie
4. Sprawdź cookies:
   Chrome DevTools → Application → Cookies
   Powinno być: sb-auth-token
```

### Problem: OAuth Social Login Nie Działa

**Objawy:**

- Przyciski "Continue with GitHub/Google" nie działają
- Błąd: "Supabase URL and Key are required"
- Błąd: "An unexpected error occurred"

**Przyczyny i Rozwiązania:**

1. **Brak zmiennych PUBLIC_ w `.env`**
   ```env
   # Dodaj do .env:
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_KEY=your-anon-key
   ```

2. **Nieprawidłowy Redirect URL w Supabase Dashboard**
   - Przejdź do: Authentication → URL Configuration
   - Dodaj: `http://localhost:3000/auth/callback`
   - Dodaj: `https://your-production-domain.com/auth/callback`

3. **OAuth Providers nie są włączone w Supabase**
   - Przejdź do: Authentication → Providers
   - Włącz GitHub i/lub Google
   - Dodaj Client ID i Client Secret

4. **Callback URL nie jest skonfigurowany u providera (GitHub/Google)**
   - GitHub: https://github.com/settings/developers
     - Authorization callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Google Cloud Console:
     - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

5. **Port aplikacji się zmienia (3000 → 3001 → 3002)**
   - Problem: Inne procesy zajmują port 3000
   - Rozwiązanie: Zamknij inne instancje dev servera
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill //PID <PID> //F

   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### Problem: Chroniona Trasa Dostępna Bez Logowania

**Objawy:**

- Użytkownik może wejść na /generate bez logowania
- Middleware nie pracuje

**Przyczyny:**

1. Trasa w `PUBLIC_PATHS`
