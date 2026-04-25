import { AppShell } from "@/components/app/AppShell";
import { EditProfileDialog } from "@/components/app/EditProfileDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import {
  ClipboardList, Pencil, Droplet, User, Ruler, Scale, Stethoscope, Calendar,
  AlertTriangle, Phone, Mail, MapPin, AlertCircle, Pill, HeartPulse, FileText, ScanLine,
} from "lucide-react";
import { format } from "date-fns";

const Summary = () => {
  const { user } = useAuth();
  const files = useStore(s => s.files);
  const meds = useStore(s => s.medications);
  const allergies = useStore(s => s.allergies);
  const conditions = useStore(s => s.conditions);

  const bmi = user?.heightCm && user?.weightKg
    ? (Number(user.weightKg) / Math.pow(Number(user.heightCm) / 100, 2)).toFixed(1)
    : null;

  const stats = [
    { label: "Blood",        value: user?.bloodType ?? "—", icon: Droplet,    fg: "text-primary" },
    { label: "Age",          value: user?.age ? String(user.age) : "—", icon: User, fg: "text-success" },
    { label: "Height",       value: user?.heightCm ? `${user.heightCm} cm` : "—", icon: Ruler, fg: "text-teal" },
    { label: "Weight",       value: user?.weightKg ? `${user.weightKg} kg` : "—", icon: Scale, fg: "text-warning" },
    { label: "BMI",          value: bmi ?? "—", icon: Stethoscope, fg: "text-primary" },
    { label: "Last Checkup", value: user?.lastCheckup ? format(new Date(user.lastCheckup), "PP") : "—", icon: Calendar, fg: "text-teal" },
  ];

  const allergyText = user?.allergiesText || (allergies.length ? allergies.map(a => a.name).join(", ") : "");
  const conditionText = user?.conditionsText || (conditions.length ? conditions.map(c => c.name).join(", ") : "");
  const medText = user?.medicationsText || (meds.length ? meds.map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ") : "");
  const ec = user?.emergencyContact || user?.emergencyContacts?.[0]
    ? user?.emergencyContact || `${user!.emergencyContacts[0].name} · ${user!.emergencyContacts[0].phone}`
    : "";

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-serif-display text-4xl">Health Summary</h1>
        <p className="text-sm text-muted-foreground">The full picture of your profile</p>
      </div>

      {/* Profile + vitals */}
      <Card className="bg-gradient-card p-6 shadow-soft md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><ClipboardList className="h-7 w-7 text-primary" /></div>
            <div>
              <h2 className="font-serif-display text-3xl leading-tight">{user?.name}</h2>
              {user?.age && <p className="text-sm text-muted-foreground">{user.age} yrs</p>}
            </div>
          </div>
          <EditProfileDialog trigger={<Button variant="outline" className="rounded-full"><Pencil className="mr-2 h-4 w-4" />Edit profile</Button>} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Icon className={`h-3.5 w-3.5 ${s.fg}`} />{s.label}</div>
                <div className="mt-2 text-lg font-medium">{s.value}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Critical info + Contact */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-serif-display text-2xl"><AlertTriangle className="h-5 w-5 text-destructive" />Critical info</h3>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Allergies</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{allergyText || <span className="text-muted-foreground">None recorded</span>}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Conditions</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{conditionText || <span className="text-muted-foreground">None recorded</span>}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current medications</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{medText || <span className="text-muted-foreground">None recorded</span>}</dd>
            </div>
          </dl>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-serif-display text-2xl"><Phone className="h-5 w-5 text-primary" />Contact</h3>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Phone className="h-3 w-3" />Phone</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{user?.phone || <span className="text-muted-foreground">—</span>}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Mail className="h-3 w-3" />Email</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{user?.email}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><AlertCircle className="h-3 w-3" />Emergency contact</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{ec || <span className="text-muted-foreground">—</span>}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><MapPin className="h-3 w-3" />Address</dt>
              <dd className="mt-1 border-b border-border pb-2 text-base">{user?.address || <span className="text-muted-foreground">—</span>}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Records counts */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Scans", value: files.filter(f => f.kind === "scan").length, icon: ScanLine, bg: "bg-primary/10", fg: "text-primary" },
          { label: "Prescriptions", value: files.filter(f => f.kind === "prescription").length, icon: Pill, bg: "bg-success/15", fg: "text-success" },
          { label: "Reports", value: files.filter(f => f.kind === "report").length, icon: FileText, bg: "bg-teal/15", fg: "text-teal" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-gradient-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.fg}`} /></div>
                <div><div className="font-serif-display text-2xl">{s.value}</div><div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div></div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
};
export default Summary;
