import { useState, useCallback, useId, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CreateFlashcardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateFlashcardFormComponent = memo(function CreateFlashcardForm({ 
  onSubmit, 
  isLoading = false 
}: CreateFlashcardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique IDs for accessibility
  const frontInputId = useId();
  const backInputId = useId();

  const handleSubmit = useCallback(async () => {
    if (!front.trim() || !back.trim()) {
      toast.error('Front and back content cannot be empty');
      return;
    }

    if (front.length > 200 || back.length > 500) {
      toast.error('Text exceeds maximum length');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(front, back);
      setFront('');
      setBack('');
      setIsOpen(false);
      toast.success('Flashcard created successfully');
    } catch (error) {
      toast.error('Failed to create flashcard');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [front, back, onSubmit]);

  const handleReset = useCallback(() => {
    setIsOpen(false);
    setFront('');
    setBack('');
  }, []);

  if (isOpen) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={frontInputId} className="text-sm font-medium">
              Front (Question/Prompt)
            </label>
            <Textarea
              id={frontInputId}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the front side of your flashcard"
              maxLength={200}
              className="resize-none"
              rows={3}
              disabled={isSubmitting}
              aria-describedby="front-char-count"
            />
            <div id="front-char-count" className="text-xs text-muted-foreground">
              {front.length}/200 characters
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={backInputId} className="text-sm font-medium">
              Back (Answer)
            </label>
            <Textarea
              id={backInputId}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the back side of your flashcard"
              maxLength={500}
              className="resize-none"
              rows={4}
              disabled={isSubmitting}
              aria-describedby="back-char-count"
            />
            <div id="back-char-count" className="text-xs text-muted-foreground">
              {back.length}/500 characters
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              aria-label="Cancel creating flashcard"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !front.trim() || !back.trim() || isLoading}
              aria-label="Create new flashcard"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Flashcard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button 
      onClick={() => setIsOpen(true)} 
      disabled={isLoading}
      className="mb-6"
      aria-label="Open create flashcard form"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create New Flashcard
    </Button>
  );
});

CreateFlashcardFormComponent.displayName = 'CreateFlashcardForm';

export const CreateFlashcardForm = CreateFlashcardFormComponent;
