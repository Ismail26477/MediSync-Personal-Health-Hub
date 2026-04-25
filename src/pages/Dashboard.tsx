import { Link } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { UploadModal } from "@/components/app/UploadModal";
import { EditProfileDialog } from "@/components/app/EditProfileDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import {
  ScanLine, Pill, FileText, HeartPulse, QrCode, ClipboardList, Upload, ArrowRight, Pencil,
  Activity, Droplet, User, Ruler, Scale, Stethoscope, Calendar, ShieldCheck, Lock, KeyRound,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const files = useStore(s => s.files);
  const meds = useStore(s => s.medications);
  const recentScans = files.filter(f => f.kind === "scan").slice(0, 3);

  const counts = {
    scans: files.filter(f => f.kind === "scan").length,
    prescriptions: files.filter(f => f.kind === "prescription").length,
    reports: files.filter(f => f.kind === "report").length,
    medications: meds.length,
  };

  const stats = [
    { label: "Scans",         value: counts.scans,         icon: ScanLine, bg: "bg-primary/10", fg: "text-primary" },
    { label: "Prescriptions", value: counts.prescriptions, icon: Pill,     bg: "bg-success/15", fg: "text-success" },
    { label: "Reports",       value: counts.reports,       icon: FileText, bg: "bg-teal/15",    fg: "text-teal" },
    { label: "Medications",   value: counts.medications,   icon: HeartPulse, bg: "bg-warning/15", fg: "text-warning" },
  ];

  const summary = [
    { label: "Blood",  value: user?.bloodType ?? "—", icon: Droplet, fg: "text-primary" },
    { label: "Age",    value: user?.age ? `${user.age} yrs` : "—", icon: User, fg: "text-success" },
    { label: "Height", value: user?.heightCm ? `${user.heightCm} cm` : "—", icon: Ruler, fg: "text-teal" },
    { label: "Weight", value: user?.weightKg ? `${user.weightKg} kg` : "—", icon: Scale, fg: "text-warning" },
  ];

  const quickActions = [
    { label: "Add scan",         icon: ScanLine, kind: "scan" as const,         bg: "bg-primary/10", fg: "text-primary" },
    { label: "Add prescription", icon: Pill,     kind: "prescription" as const, bg: "bg-success/15", fg: "text-success" },
    { label: "Add lab report",   icon: FileText, kind: "report" as const,       bg: "bg-teal/15",    fg: "text-teal" },
  ];

  const activity = [
    { label: "Updated health profile", icon: Pencil,    when: user ? "just now" : "—" },
    { label: "Health hub created",     icon: KeyRound,  when: "just now" },
  ];

  return (
    <AppShell>
      <h1 className="mb-6 font-serif-display text-4xl">Dashboard</h1>

      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-hero p-8 text-primary-foreground shadow-elegant md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/85">Welcome back</div>
            <h2 className="mt-2 font-serif-display text-5xl text-primary-foreground md:text-6xl">Hello, {user?.name?.split(" ")[0] ?? "there"}.</h2>
            <p className="mt-3 text-primary-foreground/90">Your full medical history, one tap away. Manage records, share your QR in emergencies, and keep your vitals in check.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="rounded-full"><Link to="/qr"><QrCode className="mr-2 h-4 w-4" />My QR</Link></Button>
            <Button asChild variant="secondary" className="rounded-full"><Link to="/summary"><ClipboardList className="mr-2 h-4 w-4" />Health Summary</Link></Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-gradient-card p-5 shadow-soft">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.fg}`} /></div>
              <div className="mt-4 font-serif-display text-4xl">{s.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Quick actions + Health summary */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="bg-gradient-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-2xl">Quick actions</h3>
            <span className="text-xs text-muted-foreground">One tap, fewer steps.</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {quickActions.map(a => {
              const Icon = a.icon;
              return (
                <UploadModal key={a.label} kind={a.kind} trigger={
                  <button className="rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/40 hover:shadow-soft">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg}`}><Icon className={`h-5 w-5 ${a.fg}`} /></span>
                    <div className="mt-4 font-medium">{a.label}</div>
                  </button>
                } />
              );
            })}
            <Link to="/medications" className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15"><HeartPulse className="h-5 w-5 text-warning" /></span>
              <div className="mt-4 font-medium">Add medication</div>
            </Link>
            <Link to="/summary" className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15"><ClipboardList className="h-5 w-5 text-teal" /></span>
              <div className="mt-4 font-medium">Health summary</div>
            </Link>
            <EditProfileDialog trigger={
              <button className="rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/40 hover:shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Pencil className="h-5 w-5 text-primary" /></span>
                <div className="mt-4 font-medium">Edit profile</div>
              </button>
            } />
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-2xl">Health summary</h3>
            <EditProfileDialog trigger={<Button variant="ghost" size="icon" aria-label="Edit profile"><Pencil className="h-4 w-4" /></Button>} />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            {summary.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3">
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Icon className={`h-3.5 w-3.5 ${s.fg}`} />{s.label}</dt>
                  <dd className="mt-1.5 text-lg font-medium">{s.value}</dd>
                </div>
              );
            })}
          </dl>
        </Card>
      </div>

      {/* Recent scans + activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="min-w-0 overflow-hidden bg-gradient-card p-5 shadow-soft sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-display text-2xl">Recent scans</h3>
              <p className="text-xs text-muted-foreground">Your latest uploads</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0"><Link to="/scans">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          {recentScans.length === 0 ? (
            <div className="mt-5 grid place-items-center rounded-2xl border-2 border-dashed border-border bg-accent/30 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Upload className="h-5 w-5 text-primary" /></div>
              <p className="mt-3 font-serif-display text-xl">No uploads yet</p>
              <p className="text-sm text-muted-foreground">Add a scan, prescription, or report.</p>
              <UploadModal kind="scan" trigger={<Button className="mt-4 rounded-full bg-gradient-hero text-primary-foreground hover:opacity-90"><Upload className="mr-2 h-4 w-4" />Upload Scans &amp; Documents</Button>} />
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {recentScans.map(f => (
                <li key={f.id} className="flex min-w-0 items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ScanLine className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium" title={f.title}>{f.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-serif-display text-2xl"><Activity className="h-5 w-5 text-primary" />Recent activity</h3>
          <ul className="mt-5 space-y-4">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                  <div><div className="font-medium">{a.label}</div><div className="text-xs text-muted-foreground">{a.when}</div></div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* QR + Security */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><QrCode className="h-5 w-5 text-primary" /></div>
            <h3 className="font-serif-display text-2xl">My QR Code</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Your private medical key. Sealed by default — share only when you choose.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-gradient-hero text-primary-foreground hover:opacity-90"><Link to="/qr"><QrCode className="mr-2 h-4 w-4" />Open QR</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/summary"><ClipboardList className="mr-2 h-4 w-4" />Health Summary</Link></Button>
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15"><ShieldCheck className="h-5 w-5 text-success" /></div>
            <h3 className="font-serif-display text-2xl">Security &amp; privacy</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Lock className="h-4 w-4 text-success" />Data is encrypted on your device</li>
            <li className="flex items-center gap-3"><KeyRound className="h-4 w-4 text-success" />Only you can access this health hub</li>
            <li className="flex items-center gap-3"><QrCode className="h-4 w-4 text-success" />Sharing only via your private QR</li>
            <li className="flex items-center gap-3"><Activity className="h-4 w-4 text-success" />Revoke access anytime, instantly</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
};
export default Dashboard;
