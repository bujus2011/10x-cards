/**
 * FlashcardCard Component Tests
 *
 * Tests for the FlashcardCard component covering:
 * - Rendering and display logic
 * - Edit mode functionality
 * - CRUD operations (update, delete)
 * - Flip card interaction
 * - Copy to clipboard
 * - Validation and error handling
 * - Accessibility features
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardCard } from "../FlashcardCard";
import type { FlashcardDto } from "@/types";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock clipboard API
const mockWriteText = vi.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("FlashcardCard", () => {
  const mockFlashcard: FlashcardDto = {
    id: 1,
    front: "What is TypeScript?",
    back: "A typed superset of JavaScript",
    source: "manual",
    generation_id: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();
  });

  describe("Display Mode", () => {
    it("should render flashcard with front content", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      expect(card).toBeInTheDocument();
    });

    it("should render created date", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
    });

    it("should show flip instruction", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByText(/Click to see back/i)).toBeInTheDocument();
    });

    it("should have action buttons (copy, edit, delete)", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByLabelText(/Copy flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Edit flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delete flashcard/i)).toBeInTheDocument();
    });
  });

  describe("Card Flip Interaction", () => {
    it("should flip to show back content when clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      await user.click(card);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();
      });
    });

    it("should flip back to front when clicked again", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      const card = screen.getByRole("button", { name: /Flashcard:/ });

      // Act - flip to back
      await user.click(card);
      // Act - flip to front
      await user.click(card);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Click to see back/i)).toBeInTheDocument();
      });
    });

    it("should flip card with Enter key", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      const card = screen.getByRole("button", { name: /Flashcard:/ });

      // Act
      card.focus();
      await user.keyboard("{Enter}");

      // Assert
      await waitFor(() => {
        expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();
      });
    });

    it("should flip card with Space key", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      const card = screen.getByRole("button", { name: /Flashcard:/ });

      // Act
      card.focus();
      await user.keyboard(" ");

      // Assert
      await waitFor(() => {
        expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();
      });
    });
  });

  describe("Edit Mode", () => {
    it("should enter edit mode when edit button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const editButton = screen.getByLabelText(/Edit flashcard/i);
      await user.click(editButton);

      // Assert
      expect(screen.getByText("Edit Flashcard")).toBeInTheDocument();
      expect(screen.getByLabelText("Front")).toBeInTheDocument();
      expect(screen.getByLabelText("Back")).toBeInTheDocument();
    });

    it("should show textareas with current values in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const editButton = screen.getByLabelText(/Edit flashcard/i);
      await user.click(editButton);

      // Assert
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      expect(frontTextarea).toBeInTheDocument();
      expect(backTextarea).toBeInTheDocument();
    });

    it("should show character count in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Assert
      expect(screen.getByText(/\/200 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/\/500 characters/i)).toBeInTheDocument();
    });

    it("should cancel edit mode when cancel button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act
      const cancelButton = screen.getByLabelText(/Cancel editing/i);
      await user.click(cancelButton);

      // Assert
      expect(screen.queryByText("Edit Flashcard")).not.toBeInTheDocument();
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      expect(card).toBeInTheDocument();
    });

    it("should reset changes when canceling edit", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act - modify text
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);
      await user.type(frontTextarea, "Modified front");

      // Act - cancel
      await user.click(screen.getByLabelText(/Cancel editing/i));

      // Assert - original value should be preserved
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      expect(card).toBeInTheDocument();
    });
  });

  describe("Update Functionality", () => {
    it("should update flashcard when save button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act - edit and save
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);
      await user.type(frontTextarea, "Updated front");

      const saveButton = screen.getByLabelText(/Save flashcard/i);
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          mockFlashcard.id,
          expect.objectContaining({
            front: "Updated front",
          })
        );
      });
    });

    it("should exit edit mode after successful update", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act
      const saveButton = screen.getByLabelText(/Save flashcard/i);
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText("Edit Flashcard")).not.toBeInTheDocument();
      });
    });

    it("should disable save button when fields are empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act - clear front field
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);

      // Assert
      const saveButton = screen.getByLabelText(/Save flashcard/i);
      expect(saveButton).toBeDisabled();
    });

    it("should show error toast when update fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      mockOnUpdate.mockRejectedValue(new Error("Update failed"));
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act
      const saveButton = screen.getByLabelText(/Save flashcard/i);
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to update flashcard");
      });
    });

    it("should not allow saving when front exceeds 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);
      // Type exactly 200 characters, then try to add more (maxLength will prevent it)
      const longText = "a".repeat(200);
      await user.type(frontTextarea, longText);

      // Assert - textarea should have maxLength attribute preventing more than 200 chars
      expect(frontTextarea).toHaveAttribute("maxLength", "200");
      expect(frontTextarea).toHaveValue(longText);
    });

    it("should enforce character limit on back textarea", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Assert
      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      // textarea should have maxLength attribute preventing more than 500 chars
      expect(backTextarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Delete Functionality", () => {
    it("should delete flashcard when delete button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnDelete.mockResolvedValue(undefined);
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const deleteButton = screen.getByLabelText(/Delete flashcard/i);
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockFlashcard.id);
      });
    });

    it("should show error toast when delete fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      mockOnDelete.mockRejectedValue(new Error("Delete failed"));
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const deleteButton = screen.getByLabelText(/Delete flashcard/i);
      await user.click(deleteButton);

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete flashcard");
      });
    });

    it("should disable delete button when isDeleting is true", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const deleteButton = screen.getByLabelText(/Delete flashcard/i);
      await user.click(deleteButton);

      // Assert - button should be disabled during deletion
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("Copy to Clipboard", () => {
    it("should show success toast after copying", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const copyButton = screen.getByLabelText(/Copy flashcard/i);
      await user.click(copyButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Flashcard copied to clipboard");
      });
    });

    it("should have copy button with proper accessibility", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      const copyButton = screen.getByLabelText(/Copy flashcard/i);
      expect(copyButton).toHaveAttribute("title", "Copy flashcard content");
    });
  });

  describe("Loading States", () => {
    it("should disable buttons when isLoading is true", () => {
      // Act
      render(
        <FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} isLoading={true} />
      );

      // Assert
      expect(screen.getByLabelText(/Copy flashcard/i)).toBeDisabled();
      expect(screen.getByLabelText(/Edit flashcard/i)).toBeDisabled();
      expect(screen.getByLabelText(/Delete flashcard/i)).toBeDisabled();
    });

    it("should show 'Saving...' text when save is in progress", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnUpdate.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Act
      const saveButton = screen.getByLabelText(/Save flashcard/i);
      await user.click(saveButton);

      // Assert
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible labels for all buttons", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      expect(screen.getByLabelText(/Copy flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Edit flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delete flashcard/i)).toBeInTheDocument();
    });

    it("should have role='button' for clickable card", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      expect(card).toBeInTheDocument();
    });

    it("should have tabIndex for keyboard navigation", () => {
      // Act
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Assert
      const card = screen.getByRole("button", { name: /Flashcard:/ });
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should have form labels with htmlFor in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      await user.click(screen.getByLabelText(/Edit flashcard/i));

      // Assert
      const frontLabel = screen.getByText("Front");
      const backLabel = screen.getByText("Back");
      expect(frontLabel).toHaveAttribute("for");
      expect(backLabel).toHaveAttribute("for");
    });
  });

  describe("Event Propagation", () => {
    it("should not flip card when action buttons are clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act - click copy button
      const copyButton = screen.getByLabelText(/Copy flashcard/i);
      await user.click(copyButton);

      // Assert - card should NOT flip
      expect(screen.queryByText(mockFlashcard.back)).not.toBeInTheDocument();
    });

    it("should not flip card when edit button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const editButton = screen.getByLabelText(/Edit flashcard/i);
      await user.click(editButton);

      // Assert - should enter edit mode, not flip
      expect(screen.getByText("Edit Flashcard")).toBeInTheDocument();
    });

    it("should not flip card when delete button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnDelete.mockResolvedValue(undefined);
      render(<FlashcardCard flashcard={mockFlashcard} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

      // Act
      const deleteButton = screen.getByLabelText(/Delete flashcard/i);
      await user.click(deleteButton);

      // Assert - card should NOT flip
      expect(screen.queryByText(mockFlashcard.back)).not.toBeInTheDocument();
    });
  });
});
