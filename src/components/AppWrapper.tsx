import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { FlashcardGenerationView } from "@/components/FlashcardGenerationView";
import { MyFlashcardsView } from "@/components/MyFlashcardsView";
import { StudySessionView } from "@/components/StudySessionView";
import type { SupportedLanguage } from "@/lib/i18n";

interface AppWrapperProps {
  initialLanguage: SupportedLanguage;
  user?: {
    email: string;
  };
  children?: React.ReactNode;
  page?: "generate" | "my-flashcards" | "study-session";
}

export function AppWrapper({ initialLanguage, user, children, page }: AppWrapperProps) {
  return (
    <I18nProvider initialLanguage={initialLanguage}>
      {user && <Navbar user={user} />}
      {page === "generate" && <FlashcardGenerationView />}
      {page === "my-flashcards" && <MyFlashcardsView />}
      {page === "study-session" && <StudySessionView />}
      {!page && children}
      <Toaster richColors closeButton />
    </I18nProvider>
  );
}
