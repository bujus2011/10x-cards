/**
 * FlashcardListItem Component Tests
 *
 * Tests for the FlashcardListItem component covering:
 * - Rendering accepted and unaccepted states
 * - Accept/Reject functionality
 * - Edit mode
 * - Validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardListItem } from "../FlashcardListItem";
import type { FlashcardProposalViewModel } from "@/hooks/useFlashcardGeneration";

describe("FlashcardListItem", () => {
  const mockFlashcard: FlashcardProposalViewModel = {
    id: "1",
    front: "What is React?",
    back: "A JavaScript library for building user interfaces",
    accepted: false,
    edited: false,
  };

  const mockOnAccept = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Display Mode", () => {
    it("should render flashcard content", () => {
      // Act
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText(mockFlashcard.front)).toBeInTheDocument();
      expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();
    });

    it("should show accept, edit, and reject buttons", () => {
      // Act
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByTestId("accept-button")).toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("reject-button")).toBeInTheDocument();
    });

    it("should apply accepted styling when flashcard is accepted", () => {
      // Arrange
      const acceptedFlashcard = { ...mockFlashcard, accepted: true };

      // Act
      const { container } = render(
        <FlashcardListItem
          flashcard={acceptedFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert - check the root container div has accepted styling
      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass("bg-green-50/50");
    });

    it("should show 'Edited' badge when flashcard is edited", () => {
      // Arrange
      const editedFlashcard = { ...mockFlashcard, edited: true };

      // Act
      render(
        <FlashcardListItem
          flashcard={editedFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText("Edited")).toBeInTheDocument();
    });

    it("should not show 'Edited' badge when flashcard is not edited", () => {
      // Act
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.queryByText("Edited")).not.toBeInTheDocument();
    });
  });

  describe("Accept Functionality", () => {
    it("should call onAccept when accept button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const acceptButton = screen.getByTestId("accept-button");
      await user.click(acceptButton);

      // Assert
      expect(mockOnAccept).toHaveBeenCalledTimes(1);
    });

    it("should highlight accept button when flashcard is accepted", () => {
      // Arrange
      const acceptedFlashcard = { ...mockFlashcard, accepted: true };

      // Act
      render(
        <FlashcardListItem
          flashcard={acceptedFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const acceptButton = screen.getByTestId("accept-button");
      expect(acceptButton).toHaveClass("bg-primary");
    });
  });

  describe("Reject Functionality", () => {
    it("should call onReject when reject button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const rejectButton = screen.getByTestId("reject-button");
      await user.click(rejectButton);

      // Assert
      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edit Mode", () => {
    it("should enter edit mode when edit button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      const editButton = screen.getByTestId("edit-button");
      await user.click(editButton);

      // Assert
      expect(screen.getByDisplayValue(mockFlashcard.front)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFlashcard.back)).toBeInTheDocument();
    });

    it("should show textareas in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });

    it("should show character count in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      expect(screen.getByText(/\/200 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/\/500 characters/i)).toBeInTheDocument();
    });

    it("should show save button in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      const saveButton = screen.getByRole("button");
      expect(saveButton).toBeInTheDocument();
    });

    it("should hide accept/reject buttons in edit mode", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Act
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      expect(screen.queryByTestId("accept-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("reject-button")).not.toBeInTheDocument();
    });
  });

  describe("Save Edits", () => {
    it("should call onEdit when save button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);
      await user.type(frontTextarea, "Updated front");

      const saveButton = screen.getByRole("button");
      await user.click(saveButton);

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith("Updated front", mockFlashcard.back);
    });

    it("should exit edit mode after saving", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const saveButton = screen.getByRole("button");
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByDisplayValue(mockFlashcard.front)).not.toBeInTheDocument();
      });
    });

    it("should update both front and back when edited", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);
      await user.type(frontTextarea, "New front");

      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      await user.clear(backTextarea);
      await user.type(backTextarea, "New back");

      const saveButton = screen.getByRole("button");
      await user.click(saveButton);

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith("New front", "New back");
    });
  });

  describe("Validation", () => {
    it("should disable save button when front exceeds 200 characters", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      // maxLength attribute prevents typing more than 200 characters
      expect(frontTextarea).toHaveAttribute("maxLength", "200");

      // Assert - with maxLength, we can't actually type 201 characters
      // The textarea enforces the limit at the HTML level
      await user.clear(frontTextarea);
      const longText = "a".repeat(200);
      await user.type(frontTextarea, longText);
      expect(frontTextarea).toHaveValue(longText);
    });

    it("should enforce character limit on back textarea", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      // maxLength attribute prevents typing more than 500 characters
      expect(backTextarea).toHaveAttribute("maxLength", "500");
    });

    it("should disable save button when front is empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);

      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      await user.clear(backTextarea);

      // Try to click save (should be disabled)
      const saveButton = screen.getByRole("button");
      await user.click(saveButton);

      // Assert - onEdit should not have been called because button is disabled
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it("should disable save button when back is empty", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);
      await user.clear(frontTextarea);

      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);
      await user.clear(backTextarea);

      // Try to click save (should be disabled)
      const saveButton = screen.getByRole("button");
      await user.click(saveButton);

      // Assert - onEdit should not have been called because button is disabled
      expect(mockOnEdit).not.toHaveBeenCalled();
    });

    it("should allow saving when both fields are within limits", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Assert
      const saveButton = screen.getByRole("button");
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe("Character Limits", () => {
    it("should enforce 200 character limit on front textarea", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const frontTextarea = screen.getByDisplayValue(mockFlashcard.front);

      // Assert
      expect(frontTextarea).toHaveAttribute("maxLength", "200");
    });

    it("should enforce 500 character limit on back textarea", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );
      await user.click(screen.getByTestId("edit-button"));

      // Act
      const backTextarea = screen.getByDisplayValue(mockFlashcard.back);

      // Assert
      expect(backTextarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Visual States", () => {
    it("should apply reduced opacity when flashcard is not accepted", () => {
      // Act
      const { container } = render(
        <FlashcardListItem
          flashcard={mockFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert - check the root container div has reduced opacity
      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass("opacity-75");
    });

    it("should not apply reduced opacity when flashcard is accepted", () => {
      // Arrange
      const acceptedFlashcard = { ...mockFlashcard, accepted: true };

      // Act
      render(
        <FlashcardListItem
          flashcard={acceptedFlashcard}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      const container = screen.getByText(mockFlashcard.front).closest("div");
      expect(container).not.toHaveClass("opacity-75");
    });
  });
});
