import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

interface NavbarProps {
  user: {
    email: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Reload the page to update server-side session
      window.location.href = "/";
    } catch {
      toast.error(t("errors.auth.logoutFailed"));
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="font-semibold text-xl" data-testid="navbar-logo">
            {t("nav.logo")}
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/generate"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-generate-link"
            >
              {t("nav.generate")}
            </a>
            <a
              href="/my-flashcards"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-my-flashcards-link"
            >
              {t("nav.myFlashcards")}
            </a>
            <a
              href="/study-session"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-study-session-link"
            >
              {t("nav.studySession")}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" onClick={handleLogout}>
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </nav>
  );
}
