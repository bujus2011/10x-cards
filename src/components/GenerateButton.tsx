import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface GenerateButtonProps {
  onClick?: () => void;
  disabled: boolean;
  isLoading: boolean;
  type?: "button" | "submit" | "reset";
  "data-testid"?: string;
}

export function GenerateButton({
  onClick,
  disabled,
  isLoading,
  type = "button",
  "data-testid": testId,
}: GenerateButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="w-full sm:w-auto"
      data-testid={testId || "generate-button"}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? t("pages.generate.generating") : t("pages.generate.generateButton")}
    </Button>
  );
}
