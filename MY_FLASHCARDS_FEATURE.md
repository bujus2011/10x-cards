# My Flashcards Feature Documentation

## Overview

The "My Flashcards" feature provides users with a comprehensive interface to manage their flashcard collection. Users can create, read, update, and delete flashcards with a beautiful, intuitive user interface.

## Features

### 1. **View Flashcards**

- Display all flashcards created by the authenticated user
- Flashcards are sorted by creation date (newest first)
- Interactive card flipping - click to toggle between front and back

### 2. **Create Flashcards**

- Manual flashcard creation through a user-friendly form
- Validation:
  - Front text: max 200 characters
  - Back text: max 500 characters
- Source automatically set to "manual"
- Real-time character count display

### 3. **Edit Flashcards**

- Inline editing for quick updates
- Full validation with character limits
- Preserves flashcard source and generation_id
- Cancel button to discard changes

### 4. **Delete Flashcards**

- One-click deletion with toast confirmation
- Immediate UI update without page reload

### 5. **Search & Filter**

- Real-time search across front and back text
- Case-insensitive matching
- Shows number of filtered results
- Display counter for flashcards

### 6. **User Experience**

- Beautiful card-based layout with responsive grid
- Toast notifications for all actions (success/error)
- Loading states with skeleton loaders
- Error handling with retry functionality
- Empty states with helpful messages

## File Structure

```
src/
├── pages/
│   ├── my-flashcards.astro           # Main page
│   └── api/
│       └── flashcards.ts             # API endpoints (CRUD operations)
├── components/
│   ├── MyFlashcardsView.tsx           # Main view component
│   ├── FlashcardCard.tsx              # Individual flashcard display/edit
│   └── CreateFlashcardForm.tsx        # Create form
├── lib/
│   └── flashcard.service.ts           # Service with CRUD methods
├── middleware/
│   └── index.ts                       # Route protection (updated)
└── types.ts                           # Type definitions (updated)
```

## API Endpoints

### GET /api/flashcards

Retrieves all flashcards for the authenticated user.

**Response:**

```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "What is React?",
      "back": "A JavaScript library...",
      "source": "manual",
      "generation_id": null,
      "created_at": "2025-10-20T10:30:00Z",
      "updated_at": "2025-10-20T10:30:00Z"
    }
  ]
}
```

### POST /api/flashcards

Creates one or more flashcards.

**Request:**

```json
{
  "flashcards": [
    {
      "front": "Question?",
      "back": "Answer",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

### PUT /api/flashcards

Updates a flashcard.

**Request:**

```json
{
  "id": 1,
  "front": "Updated question?",
  "back": "Updated answer",
  "source": "manual",
  "generation_id": null
}
```

### DELETE /api/flashcards

Deletes a flashcard.

**Request:**

```json
{
  "id": 1
}
```

## Component API

### MyFlashcardsView

Main component managing the flashcard list, creation, updates, and deletion.

- Fetches flashcards on mount
- Handles search/filter logic
- Manages loading and error states
- Integrates with API endpoints

### FlashcardCard

Displays a single flashcard with interactive features.

**Props:**

```typescript
{
  flashcard: FlashcardDto;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**

- Flip animation with click
- Inline edit mode
- Copy to clipboard
- Delete confirmation

### CreateFlashcardForm

Form for creating new flashcards.

**Props:**

```typescript
{
  onSubmit: (front: string, back: string) => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**

- Toggle form open/close
- Character count validation
- Cancel button
- Loading state

## Database

### Flashcards Table

The flashcards are stored in the Supabase `flashcards` table with the following structure:

```sql
id              INT PRIMARY KEY
front           VARCHAR(200)
back            VARCHAR(500)
source          VARCHAR (e.g., "manual", "ai-full", "ai-edited")
generation_id   INT NULLABLE (references generations table)
user_id         UUID (foreign key to auth.users)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## Security

- **Authentication**: All endpoints require user authentication (verified via middleware)
- **Authorization**: Users can only access their own flashcards (enforced via `user_id`)
- **Validation**: Input validation using Zod schemas
- **Error Handling**: Proper error messages without exposing database details

## Usage

1. **Access the feature**: Navigate to `/my-flashcards` (requires authentication)
2. **Create**: Click "Create New Flashcard" button to open the form
3. **View**: Click on cards to flip between front and back
4. **Edit**: Click the edit icon to modify the content
5. **Delete**: Click the trash icon to remove a flashcard
6. **Search**: Use the search box to filter flashcards

## Navigation

The feature is accessible from the main navigation bar with a "My Flashcards" link.

## Future Enhancements

Potential improvements for future iterations:

- Bulk operations (select multiple cards, bulk delete/export)
- Sort options (by date, alphabetical, etc.)
- Categories/tags for organization
- Batch import/export (CSV, JSON)
- Study mode with spaced repetition
- Sharing flashcard sets with other users
- Statistics and progress tracking

## Troubleshooting

### Flashcards not loading?

- Check authentication status
- Verify network connection
- Check browser console for errors
- Use the retry button in error notification

### Changes not saving?

- Ensure network connection is active
- Check character limits (Front: 200, Back: 500)
- Verify user is still authenticated
- Try again in a few moments

### Search not working?

- Ensure you've typed in the search box
- Try different keywords
- Reset search to view all cards
