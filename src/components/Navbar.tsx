import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NavbarProps {
  user: {
    email: string;
  };
}

export function Navbar({ user }: NavbarProps) {
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
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="font-semibold text-xl" data-testid="navbar-logo">
            10xCards
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/generate"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-generate-link"
            >
              Generate
            </a>
            <a
              href="/my-flashcards"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-my-flashcards-link"
            >
              My Flashcards
            </a>
            <a
              href="/study-session"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="navbar-study-session-link"
            >
              Study Session
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
