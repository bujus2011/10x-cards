import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextInputAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export const TextInputArea = forwardRef<HTMLTextAreaElement, TextInputAreaProps>(
  ({ value = "", onChange, disabled, name, onBlur }, ref) => {
    const charCount = value.length;
    const isValid = charCount >= 1000 && charCount <= 10000;
    const showError = charCount > 0 && !isValid;

    return (
      <div className="space-y-2">
        <Label htmlFor="source-text">Source Text</Label>

        <Textarea
          ref={ref}
          id="source-text"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="Paste your text here (1000-10000 characters)"
          className={cn(
            "min-h-[200px] max-h-[200px] resize-y",
            showError && "border-red-500 focus-visible:ring-red-500"
          )}
          data-testid="source-text-textarea"
        />

        <div className={cn("text-sm", showError ? "text-red-500" : "text-muted-foreground")}>
          {charCount} / 10000 characters
          {showError && (
            <span className="ml-2">
              {charCount < 1000 ? "(Minimum 1000 characters required)" : "(Maximum 10000 characters exceeded)"}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextInputArea.displayName = "TextInputArea";
