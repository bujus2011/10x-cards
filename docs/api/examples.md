# 💡 API Examples - Praktyczne Przykłady

## Przegląd

Praktyczne przykłady użycia API 10xCards z różnymi narzędziami i językami programowania.

---

## 📑 Spis Treści

- [Wstęp](#wstęp)
- [Uwierzytelnianie](#uwierzytelnianie)
- [Zarządzanie Fiskami](#zarządzanie-fiskami)
- [Generowanie Fiszek](#generowanie-fiszek)
- [Sesje Nauki](#sesje-nauki)
- [SDK i Biblioteki](#sdk-i-biblioteki)

---

## 🎯 Wstęp

### Zakładamy Konfigurację

Wszystkie przykłady zakładają:

```bash
# Lokalne środowisko deweloperskie
BASE_URL="http://localhost:3000"

# JWT token po zalogowaniu
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Narzędzia

Przykłady obejmują:
- **curl** - wiersz poleceń
- **JavaScript/Node.js** - aplikacje webowe
- **Python** - skrypty i automatyzacja
- **Thunder Client** (VS Code) - GUI testing

---

## 🔐 Uwierzytelnianie

### Logowanie

#### curl
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

#### JavaScript
```javascript
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Zapisz token
    localStorage.setItem('authToken', data.user?.token);
    return data.user;
  } else {
    throw new Error(data.error);
  }
}
```

#### Python
```python
import requests

def login(email: str, password: str) -> dict:
    response = requests.post(
        "http://localhost:3000/api/auth/login",
        json={"email": email, "password": password}
    )

    if response.status_code == 200:
        data = response.json()
        return data["user"]
    else:
        raise Exception(response.json().get("error", "Login failed"))
```

### Rejestracja

#### curl
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }'
```

#### JavaScript (React Hook)
```javascript
import { useState } from 'react';

function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (email, password, confirmPassword) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
```

---

## 📚 Zarządzanie Fiskami

### Pobieranie Wszystkich Fiszek

#### curl
```bash
curl -X GET "http://localhost:3000/api/flashcards" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript (React Hook)
```javascript
import { useState, useEffect } from 'react';

function useFlashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/flashcards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);
      }
    } finally {
      setLoading(false);
    }
  };

  return { flashcards, loading, refetch: fetchFlashcards };
}
```

#### Python
```python
import requests

def get_flashcards(token: str) -> list:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        "http://localhost:3000/api/flashcards",
        headers=headers
    )

    if response.status_code == 200:
        return response.json()["flashcards"]
    else:
        raise Exception("Failed to fetch flashcards")
```

### Tworzenie Fiszek

#### curl - Pojedyncza Fiszk
```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [{
      "front": "Czym jest TypeScript?",
      "back": "TypeScript to nadzbiór JavaScript z typami statycznymi",
      "source": "manual",
      "generation_id": null
    }]
  }'
```

#### curl - Wielu Fiszek
```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [
      {
        "front": "Czym jest React?",
        "back": "React to biblioteka JavaScript do budowy interfejsów użytkownika",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Jakie są hooki w React?",
        "back": "useState, useEffect, useCallback, useMemo, useRef, useContext",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

#### JavaScript (Form Handler)
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFlashcardSchema } from '@/lib/validations';

function CreateFlashcardForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(createFlashcardSchema)
  });

  const onSubmit = async (data) => {
    const token = localStorage.getItem('authToken');

    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        flashcards: [data]
      })
    });

    if (response.ok) {
      reset();
      // Odśwież listę fiszek
      refetchFlashcards();
    } else {
      const error = await response.json();
      alert(error.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('front')} placeholder="Przód fiszki" />
      {errors.front && <span>{errors.front.message}</span>}

      <textarea {...register('back')} placeholder="Tył fiszki" />
      {errors.back && <span>{errors.back.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Tworzenie...' : 'Utwórz Fiszkę'}
      </button>
    </form>
  );
}
```

### Aktualizacja Fiszek

#### curl
```bash
curl -X PUT "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": 123,
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź"
  }'
```

#### JavaScript (Inline Edit)
```javascript
function FlashcardEdit({ flashcard, onSave, onCancel }) {
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/flashcards', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: flashcard.id,
        front,
        back
      })
    });

    setSaving(false);

    if (response.ok) {
      const data = await response.json();
      onSave(data.flashcard);
    } else {
      alert('Błąd podczas zapisywania');
    }
  };

  return (
    <div>
      <input value={front} onChange={e => setFront(e.target.value)} />
      <textarea value={back} onChange={e => setBack(e.target.value)} />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Zapisywanie...' : 'Zapisz'}
      </button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
```

### Usuwanie Fiszek

#### curl
```bash
curl -X DELETE "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"id": 123}'
```

#### JavaScript (Confirmation Dialog)
```javascript
function DeleteFlashcardButton({ flashcardId, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć tę fiszkę?')) {
      return;
    }

    setDeleting(true);

    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/flashcards', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: flashcardId })
    });

    setDeleting(false);

    if (response.ok) {
      onDelete(flashcardId);
    } else {
      alert('Błąd podczas usuwania fiszki');
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Usuwanie...' : 'Usuń'}
    </button>
  );
}
```

---

## 🤖 Generowanie Fiszek

### Generowanie z Tekstu

#### curl
```bash
curl -X POST "http://localhost:3000/api/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "source_text": "TypeScript to język programowania stworzony przez Microsoft. Jest nadzbiorem JavaScript, który dodaje typy statyczne. Pozwala na wczesne wykrywanie błędów i lepsze doświadczenie deweloperskie. TypeScript kompiluje się do czystego JavaScript, więc może działać w dowolnym środowisku JavaScript."
  }'
```

#### JavaScript (Generation Component)
```javascript
import { useState } from 'react';
import { generateFlashcardsSchema } from '@/lib/validations';

function FlashcardGenerator() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);

  const handleGenerate = async () => {
    // Walidacja
    const validation = generateFlashcardsSchema.safeParse({ source_text: text });
    if (!validation.success) {
      alert('Tekst musi mieć 1000-10000 znaków');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ source_text: text })
    });

    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      setGeneratedCards(data.flashcards_proposals);
    } else {
      const error = await response.json();
      alert(`Błąd: ${error.error}`);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Wprowadź tekst do analizy (min 1000 znaków)"
        rows={10}
      />
      <p>{text.length}/10000 znaków</p>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generowanie...' : 'Generuj Fiszk'}
      </button>

      {generatedCards.map((card, index) => (
        <div key={index}>
          <strong>{card.front}</strong>
          <p>{card.back}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Python (Batch Generation)
```python
import requests

def generate_flashcards(token: str, text: str) -> list:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "http://localhost:3000/api/generations",
        headers=headers,
        json={"source_text": text}
    )

    if response.status_code == 201:
        data = response.json()
        return data["flashcards_proposals"]
    else:
        raise Exception(f"Generation failed: {response.json()}")

# Przykład użycia
text = """
Wprowadź długi tekst o minimum 1000 znaków...
"""

try:
    cards = generate_flashcards(token, text)
    for card in cards:
        print(f"Q: {card['front']}")
        print(f"A: {card['back']}")
        print("---")
except Exception as e:
    print(f"Błąd: {e}")
```

---

## 📖 Sesje Nauki

### Pobieranie Kart do Powtórki

#### curl
```bash
# Pobierz 10 kart do powtórki
curl -X GET "http://localhost:3000/api/study-session?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript (Study Session Hook)
```javascript
import { useState, useEffect } from 'react';

function useStudySession() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDueCards = async (limit = 20) => {
    setLoading(true);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/study-session?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      setCards(data.cards);
      return data;
    } else {
      throw new Error('Failed to fetch due cards');
    }
  };

  const submitReview = async (flashcardId, rating) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/study-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ flashcard_id: flashcardId, rating })
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    return await response.json();
  };

  return { cards, loading, fetchDueCards, submitReview };
}
```

### Kompletna Sesja Nauki

#### JavaScript (Full Study Component)
```javascript
function StudySession() {
  const { cards, loading, fetchDueCards, submitReview } = useStudySession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const handleRating = async (rating) => {
    if (!cards[currentIndex]) return;

    await submitReview(cards[currentIndex].flashcard.id, rating);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  if (loading) return <div>Ładowanie...</div>;
  if (sessionComplete) return <div>Sesja zakończona!</div>;
  if (!cards.length) return <div>Brak kart do powtórki</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="study-session">
      <div className="card-counter">
        Karta {currentIndex + 1} z {cards.length}
      </div>

      <div className="flashcard">
        <div className="front">
          {currentCard.flashcard.front}
        </div>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)}>
            Pokaż odpowiedź
          </button>
        ) : (
          <div>
            <div className="back">
              {currentCard.flashcard.back}
            </div>

            <div className="rating-buttons">
              <button onClick={() => handleRating(1)}>Again</button>
              <button onClick={() => handleRating(2)}>Hard</button>
              <button onClick={() => handleRating(3)}>Good</button>
              <button onClick={() => handleRating(4)}>Easy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Statystyki Sesji

#### curl
```bash
curl -X GET "http://localhost:3000/api/study-stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript (Stats Dashboard)
```javascript
function StudyStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/study-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  };

  if (!stats) return <div>Ładowanie statystyk...</div>;

  return (
    <div className="stats-dashboard">
      <h2>Statystyki Nauki</h2>

      <div className="stats-grid">
        <div className="stat">
          <span className="label">Łącznie powtórek</span>
          <span className="value">{stats.total_reviews}</span>
        </div>

        <div className="stat">
          <span className="label">Razem fiszek</span>
          <span className="value">{stats.total_flashcards}</span>
        </div>

        <div className="stat">
          <span className="label">Średnia ocena</span>
          <span className="value">{stats.average_rating.toFixed(1)}</span>
        </div>

        <div className="stat">
          <span className="label">Seria dni</span>
          <span className="value">{stats.study_streak}</span>
        </div>
      </div>

      <div className="state-breakdown">
        <h3>Fiszki według stanu</h3>
        {Object.entries(stats.cards_by_state).map(([state, count]) => (
          <div key={state}>
            {state}: {count}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📱 SDK i Biblioteki

### JavaScript SDK (Prosty)

```javascript
// 10x-cards-sdk.js
class CardsAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Flashcards
  async getFlashcards() {
    return this.request('/api/flashcards');
  }

  async createFlashcards(flashcards) {
    return this.request('/api/flashcards', {
      method: 'POST',
      body: JSON.stringify({ flashcards })
    });
  }

  // Study Session
  async getDueCards(limit = 20) {
    return this.request(`/api/study-session?limit=${limit}`);
  }

  async submitReview(flashcardId, rating) {
    return this.request('/api/study-session', {
      method: 'POST',
      body: JSON.stringify({ flashcard_id: flashcardId, rating })
    });
  }
}

// Użycie
const api = new CardsAPI('http://localhost:3000', token);
const cards = await api.getFlashcards();
```

### Python SDK

```python
# cards_sdk.py
import requests
from typing import List, Dict, Any

class CardsAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })

    def _request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, json=data)

        if not response.ok:
            error_data = response.json()
            raise Exception(error_data.get('error', f'HTTP {response.status_code}'))

        return response.json()

    # Auth methods
    def login(self, email: str, password: str) -> Dict:
        return self._request('/api/auth/login', 'POST', {
            'email': email, 'password': password
        })

    # Flashcard methods
    def get_flashcards(self) -> List[Dict]:
        return self._request('/api/flashcards')['flashcards']

    def create_flashcards(self, flashcards: List[Dict]) -> Dict:
        return self._request('/api/flashcards', 'POST', {'flashcards': flashcards})

    def update_flashcard(self, flashcard_id: int, data: Dict) -> Dict:
        update_data = {'id': flashcard_id, **data}
        return self._request('/api/flashcards', 'PUT', update_data)

    def delete_flashcard(self, flashcard_id: int) -> Dict:
        return self._request('/api/flashcards', 'DELETE', {'id': flashcard_id})

    # Generation methods
    def generate_flashcards(self, text: str) -> Dict:
        return self._request('/api/generations', 'POST', {'source_text': text})

    # Study methods
    def get_due_cards(self, limit: int = 20) -> List[Dict]:
        return self._request(f'/api/study-session?limit={limit}')['cards']

    def submit_review(self, flashcard_id: int, rating: int) -> Dict:
        return self._request('/api/study-session', 'POST', {
            'flashcard_id': flashcard_id,
            'rating': rating
        })

    def get_study_stats(self) -> Dict:
        return self._request('/api/study-stats')

# Przykład użycia
api = CardsAPI('http://localhost:3000', token)

# Pobierz fiszki
cards = api.get_flashcards()

# Utwórz nową fiszkę
new_cards = api.create_flashcards([{
    'front': 'Pytanie',
    'back': 'Odpowiedź',
    'source': 'manual',
    'generation_id': None
}])

# Sesja nauki
due_cards = api.get_due_cards(limit=10)
for card in due_cards:
    # Symuluj naukę - oceń jako "Good"
    api.submit_review(card['flashcard']['id'], 3)
```

---

## 🧪 Testowanie API

### Thunder Client (VS Code)

1. **Utwórz nową kolekcję**: "10xCards API"
2. **Dodaj zmienne środowiskowe**:
   - `base_url`: `http://localhost:3000`
   - `auth_token`: `YOUR_JWT_TOKEN`
3. **Utwórz requesty** dla każdego endpointu
4. **Użyj zmiennych**: `{{base_url}}/api/flashcards`

### Postman Collection

```json
{
  "info": {
    "name": "10xCards API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "auth_token",
      "value": "YOUR_JWT_TOKEN"
    }
  ]
}
```

### Automatyczne Testy

```javascript
// test-api.js
const api = new CardsAPI('http://localhost:3000', token);

describe('10xCards API', () => {
  test('should create and retrieve flashcard', async () => {
    // Utwórz fiszkę
    const createResult = await api.createFlashcards([{
      front: 'Test question',
      back: 'Test answer',
      source: 'manual',
      generation_id: null
    }]);

    const flashcardId = createResult.flashcards[0].id;

    // Pobierz wszystkie fiszki
    const allCards = await api.getFlashcards();

    // Sprawdź czy fiszka została utworzona
    const createdCard = allCards.find(card => card.id === flashcardId);
    expect(createdCard.front).toBe('Test question');
  });
});
```

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletne przykłady
**Narzędzia**: curl, JavaScript, Python, Thunder Client
