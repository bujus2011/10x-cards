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
          <a href="/" className="font-semibold text-xl">
            10xCards
          </a>
          <div className="flex items-center gap-4">
            <a href="/generate" className="text-sm text-muted-foreground hover:text-foreground">
              Generate
            </a>
            <a href="/my-flashcards" className="text-sm text-muted-foreground hover:text-foreground">
              My Flashcards
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
