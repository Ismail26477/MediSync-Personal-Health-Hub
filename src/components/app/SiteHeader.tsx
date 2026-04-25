import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const SiteHeader = () => {
  const { isAuthed } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
              <Lock className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-background bg-success" />
          </div>
          <div className="leading-tight">
            <div className="font-serif-display text-2xl">MediSync</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal Health Hub</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 text-base md:flex">
          <Link to="/emergency" className="text-foreground/80 hover:text-foreground">Emergency View</Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <Button asChild className="rounded-full bg-gradient-hero px-6 text-primary-foreground shadow-elegant hover:opacity-90"><Link to="/dashboard">Open hub</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-base"><Link to="/login">Sign in</Link></Button>
              <Button asChild className="rounded-full bg-gradient-hero px-6 text-primary-foreground shadow-elegant hover:opacity-90"><Link to="/signup">Create hub</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
