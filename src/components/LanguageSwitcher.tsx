import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from "@/lib/i18n";

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  pl: "🇵🇱",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    // Reload the page to update all content
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Change language">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={language === lang ? "bg-accent" : ""}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{LANGUAGE_FLAGS[lang]}</span>
              {LANGUAGE_NAMES[lang]}
              {language === lang && <span className="ml-auto">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
