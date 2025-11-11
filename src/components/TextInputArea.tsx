import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TextInputAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export const TextInputArea = forwardRef<HTMLTextAreaElement, TextInputAreaProps>(
  ({ value = "", onChange, disabled, name, onBlur }, ref) => {
    const { t } = useTranslation();
    const charCount = value.length;
    const isValid = charCount >= 1000 && charCount <= 10000;
    const showError = charCount > 0 && !isValid;

    return (
      <div className="space-y-2">
        <Label htmlFor="source-text">{t("pages.generate.sourceTextLabel")}</Label>

        <Textarea
          ref={ref}
          id="source-text"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={t("pages.generate.sourceTextPlaceholder")}
          className={cn(
            "min-h-[200px] max-h-[200px] resize-y",
            showError && "border-red-500 focus-visible:ring-red-500"
          )}
          data-testid="source-text-textarea"
        />

        <div className={cn("text-sm", showError ? "text-red-500" : "text-muted-foreground")}>
          {t("pages.generate.charCount", { count: charCount })}
          {showError && (
            <span className="ml-2">
              {charCount < 1000 ? t("pages.generate.minCharsRequired") : t("pages.generate.maxCharsExceeded")}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextInputArea.displayName = "TextInputArea";
