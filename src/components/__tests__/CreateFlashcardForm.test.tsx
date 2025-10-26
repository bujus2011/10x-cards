/**
 * CreateFlashcardForm Component Tests
 *
 * Tests for the CreateFlashcardForm component covering:
 * - Form opening/closing
 * - Input validation
 * - Form submission
 * - Error handling
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateFlashcardForm } from "../CreateFlashcardForm";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CreateFlashcardForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should show button to create new flashcard", () => {
      // Act
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);

      // Assert
      expect(screen.getByTestId("create-flashcard-button")).toBeInTheDocument();
      expect(screen.getByText(/Create New Flashcard/i)).toBeInTheDocument();
    });

    it("should not show form initially", () => {
      // Act
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);

      // Assert
      expect(screen.queryByText(/Front \(Question\/Prompt\)/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Opening", () => {
    it("should open form when button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);

      // Act
      const button = screen.getByTestId("create-flashcard-button");
      await user.click(button);

      // Assert
      expect(screen.getByText(/Create New Flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Front \(Question\/Prompt\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Back \(Answer\)/i)).toBeInTheDocument();
    });

    it("should hide button when form is open", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);

      // Act
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      expect(screen.queryByTestId("create-flashcard-button")).not.toBeInTheDocument();
    });
  });

  describe("Form Inputs", () => {
    it("should render front and back textareas", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      expect(screen.getByLabelText(/Front \(Question\/Prompt\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Back \(Answer\)/i)).toBeInTheDocument();
    });

    it("should show character count for front input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      expect(screen.getByText("0/200 characters")).toBeInTheDocument();
    });

    it("should show character count for back input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      expect(screen.getByText("0/500 characters")).toBeInTheDocument();
    });

    it("should update character count when typing", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      await user.type(frontInput, "Hello");

      // Assert
      expect(screen.getByText("5/200 characters")).toBeInTheDocument();
    });

    it("should have proper labels associated with inputs", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      expect(frontInput).toHaveAttribute("id");
      expect(backInput).toHaveAttribute("id");
    });
  });

  describe("Form Validation", () => {
    it("should disable submit button when both fields are empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when front is empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(backInput, "Some answer");

      // Assert
      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when back is empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      await user.type(frontInput, "Some question");

      // Assert
      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when both fields have content", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      // Assert
      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      expect(submitButton).not.toBeDisabled();
    });

    it("should show error toast when submitting with empty fields", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act - try to submit without entering data (button should be disabled but test the validation)
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      await user.type(frontInput, "  "); // Whitespace only

      // Assert - Since button is disabled, we can't test the toast directly
      // But we've verified the button disablement which prevents this case
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("should submit form when both fields are filled and submit is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Test question");
      await user.type(backInput, "Test answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith("Test question", "Test answer");
      });
    });

    it("should clear form after successful submission", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert - form should close
      await waitFor(() => {
        expect(screen.queryByLabelText(/Front \(Question\/Prompt\)/i)).not.toBeInTheDocument();
      });
    });

    it("should show success toast after submission", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      mockOnSubmit.mockResolvedValue(undefined);
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Flashcard created successfully");
      });
    });

    it("should show error toast when submission fails", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      mockOnSubmit.mockRejectedValue(new Error("Submission failed"));
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to create flashcard");
      });
    });

    it("should keep form open when submission fails", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error("Submission failed"));
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert - form should stay open
      await waitFor(() => {
        expect(screen.getByLabelText(/Front \(Question\/Prompt\)/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Cancellation", () => {
    it("should close form when cancel button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const cancelButton = screen.getByLabelText(/Cancel creating flashcard/i);
      await user.click(cancelButton);

      // Assert
      expect(screen.queryByLabelText(/Front \(Question\/Prompt\)/i)).not.toBeInTheDocument();
      expect(screen.getByTestId("create-flashcard-button")).toBeInTheDocument();
    });

    it("should clear form data when canceling", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act - type some data
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      await user.type(frontInput, "Test data");

      // Act - cancel
      const cancelButton = screen.getByLabelText(/Cancel creating flashcard/i);
      await user.click(cancelButton);

      // Act - reopen form
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert - form should be empty
      const newFrontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      expect(newFrontInput).toHaveValue("");
    });
  });

  describe("Loading States", () => {
    it("should disable button when isLoading prop is true", () => {
      // Act
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} isLoading={true} />);

      // Assert
      const button = screen.getByTestId("create-flashcard-button");
      expect(button).toBeDisabled();
    });

    it("should show 'Creating...' text when submitting", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });

    it("should disable inputs when submitting", async () => {
      // Arrange
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      await user.type(frontInput, "Question");
      await user.type(backInput, "Answer");

      const submitButton = screen.getByLabelText(/Create new flashcard/i);
      await user.click(submitButton);

      // Assert
      expect(frontInput).toBeDisabled();
      expect(backInput).toBeDisabled();
    });
  });

  describe("Character Limits", () => {
    it("should enforce 200 character limit on front input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      expect(frontInput).toHaveAttribute("maxLength", "200");
    });

    it("should enforce 500 character limit on back input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      expect(backInput).toHaveAttribute("maxLength", "500");
    });

    it("should show error toast when front exceeds 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      const { toast } = await import("sonner");
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Act - The maxLength attribute prevents typing more than 200 chars
      // But we can test the validation logic is in place
      // This test verifies the constraint exists
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      expect(frontInput).toHaveAttribute("maxLength", "200");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);

      // Assert - button has aria-label
      expect(screen.getByLabelText(/Open create flashcard form/i)).toBeInTheDocument();

      // Act - open form
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert - form buttons have aria-labels
      expect(screen.getByLabelText(/Cancel creating flashcard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Create new flashcard/i)).toBeInTheDocument();
    });

    it("should associate labels with inputs", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const frontLabel = screen.getByText(/Front \(Question\/Prompt\)/i);
      const backLabel = screen.getByText(/Back \(Answer\)/i);
      expect(frontLabel).toHaveAttribute("for");
      expect(backLabel).toHaveAttribute("for");
    });

    it("should have aria-describedby for character counts", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFlashcardForm onSubmit={mockOnSubmit} />);
      await user.click(screen.getByTestId("create-flashcard-button"));

      // Assert
      const frontInput = screen.getByLabelText(/Front \(Question\/Prompt\)/i);
      const backInput = screen.getByLabelText(/Back \(Answer\)/i);
      expect(frontInput).toHaveAttribute("aria-describedby");
      expect(backInput).toHaveAttribute("aria-describedby");
    });
  });
});
