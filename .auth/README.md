# Katalog stanu uwierzytelniania

Ten katalog zawiera pliki stanu uwierzytelniania używane przez testy E2E Playwright.

## Pliki

### `user.json`

Ten plik przechowuje stan uwierzytelniania przeglądarki (ciasteczka, storage) podczas wykonywania testów E2E.

**Ważne:**
- Ten plik jest commitowany do repozytorium w **pustym stanie**
- Podczas wykonywania testów jest wypełniany danymi uwierzytelniającymi testowego użytkownika
- Zestaw testów `cleanup` (uruchamiany jako ostatni) czyści ten plik z powrotem do pustego stanu
- **Nigdy nie commituj tego pliku z rzeczywistymi danymi uwierzytelniającymi**

## Workflow testów

1. **Test setup** (`e2e/auth/00-setup-auth.spec.ts`) uruchamia się jako pierwszy (prefix `00-` zapewnia kolejność alfabetyczną) i zapisuje stan uwierzytelniania do `user.json`
2. **Pozostałe testy auth** testują funkcjonalność logowania używając zapisanego stanu
3. **Inne projekty testowe** (flashcard-generation, study-session) używają zapisanego stanu, aby uniknąć ponownego logowania
4. **Test cleanup** (`e2e/cleanup/cleanup-auth.spec.ts`) uruchamia się jako ostatni i czyści `user.json` z powrotem do pustego stanu

## Struktura pustego stanu

```json
{
  "cookies": [],
  "origins": []
}
```

To zapewnia, że żadne wrażliwe dane nie są commitowane do repozytorium.