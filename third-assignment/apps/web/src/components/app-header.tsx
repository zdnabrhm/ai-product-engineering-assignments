import { IconMap2, IconMessageCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@third-assignment/ui/components/button";

export function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Roadmap Lab
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/roadmaps" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <IconMap2 data-icon="inline-start" />
            Roadmaps
          </Link>
          <Link to="/chat" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <IconMessageCircle data-icon="inline-start" />
            Chat
          </Link>
        </nav>
      </div>
    </header>
  );
}
