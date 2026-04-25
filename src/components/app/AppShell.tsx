import { ReactNode, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, ScanLine, ClipboardList, Pill, FileText, HeartPulse, AlertTriangle, QrCode, Settings, HelpCircle, LogOut, Lock, Bell, Plus, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UploadModal } from "@/components/app/UploadModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const groups: { label: string; items: { to: string; label: string; icon: any }[] }[] = [
  { label: "Records", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/scans", label: "My Scans", icon: ScanLine },
    { to: "/summary", label: "Health Summary", icon: ClipboardList },
    { to: "/prescriptions", label: "Prescriptions", icon: Pill },
    { to: "/reports", label: "Reports", icon: FileText },
  ]},
  { label: "Health", items: [
    { to: "/medications", label: "Medications", icon: HeartPulse },
    { to: "/allergies", label: "Allergies", icon: AlertTriangle },
  ]},
  { label: "Tools", items: [
    { to: "/qr", label: "QR Code", icon: QrCode },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/help", label: "Help & Support", icon: HelpCircle },
  ]},
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, isAuthed, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-gradient-soft text-sm text-muted-foreground">Loading your hub…</div>;
  if (!isAuthed || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();
  const handleLogout = async () => { await logout(); navigate("/"); };

  const SidebarBody = (
    <>
      <Link to="/dashboard" className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
            <Lock className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="absolute -right-0.5 -top-0.5 block h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
        </div>
        <div className="leading-tight">
          <div className="font-serif-display text-xl">MediSync</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal Health Hub</div>
        </div>
      </Link>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map(g => (
          <div key={g.label}>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{g.label}</div>
            <div className="space-y-1">
              {g.items.map(item => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 text-primary font-semibold" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                    <Icon className="h-4 w-4" />{item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 flex items-center gap-3 rounded-2xl border border-sidebar-border bg-card/50 p-3">
        <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-hero text-primary-foreground font-semibold">{initial}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate font-medium">{user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out"><LogOut className="h-4 w-4" /></Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-gradient-soft">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {SidebarBody}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile: menu / logo / avatar. desktop: actions on right */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur-lg md:h-20 md:px-8">
          {/* Mobile: hamburger (left) */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0 flex flex-col">
              {SidebarBody}
            </SheetContent>
          </Sheet>

          {/* Mobile: centered logo */}
          <Link to="/dashboard" className="flex flex-1 items-center justify-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
              <Lock className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-serif-display text-lg">MediSync</span>
          </Link>

          {/* Desktop actions pushed right */}
          <div className="hidden flex-1 md:block" />

          <div className="flex items-center gap-2 md:gap-3">
            <UploadModal kind="scan" trigger={
              <Button size="sm" className="rounded-xl bg-gradient-hero px-3 text-primary-foreground shadow-elegant hover:opacity-90 md:px-5"><Plus className="h-4 w-4 md:mr-2" /><span className="hidden sm:inline">Upload</span></Button>
            } />
            <Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex" aria-label="Notifications"><Bell className="h-5 w-5" /></Button>
            <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-hero text-primary-foreground text-sm font-semibold">{initial}</AvatarFallback></Avatar>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
};
