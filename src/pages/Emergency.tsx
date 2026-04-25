import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEmergencyByToken } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Pill, Heart, Phone, User, ShieldAlert, Activity } from "lucide-react";

type Data = Awaited<ReturnType<typeof fetchEmergencyByToken>>;

const Emergency = () => {
  const { token } = useParams();
  const [data, setData] = useState<Data | undefined>(undefined);

  useEffect(() => {
    if (!token) { setData(null); return; }
    fetchEmergencyByToken(token).then(setData).catch(() => setData(null));
  }, [token]);

  if (data === undefined) {
    return <div className="grid min-h-screen place-items-center bg-gradient-soft text-sm text-muted-foreground">Verifying link…</div>;
  }

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-soft px-4">
        <Card className="max-w-md bg-gradient-card p-10 text-center shadow-elegant">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-3xl">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">This emergency link is invalid, sealed, or has expired. Please ask the holder to re-enable sharing.</p>
        </Card>
      </div>
    );
  }

  const profile = data.profile ?? {};
  const allergies = data.allergies ?? [];
  const meds = data.medications ?? [];
  const conditions = data.conditions ?? [];
  const contacts = data.contacts ?? [];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="bg-destructive py-3 text-center text-sm font-semibold uppercase tracking-wider text-destructive-foreground">
        ⚠ Emergency Medical Info
      </div>
      <div className="container max-w-4xl py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" /> MediSync · read-only emergency view
        </div>

        <Card className="bg-gradient-card p-6 shadow-elegant">
          <h1 className="flex items-center gap-2 text-3xl"><User className="h-6 w-6 text-primary" />{profile.name || "Patient"}</h1>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            {profile.dob && <div><div className="text-muted-foreground">DOB</div><div className="font-medium">{profile.dob}</div></div>}
            {profile.blood_type && <div><div className="text-muted-foreground">Blood type</div><div className="font-medium text-destructive">{profile.blood_type}</div></div>}
          </div>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl"><AlertTriangle className="h-5 w-5 text-warning" />Allergies</h2>
            {allergies.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None recorded.</p> : (
              <ul className="mt-3 space-y-2 text-sm">{allergies.map((a: any) => <li key={a.id} className="flex items-center justify-between"><span>{a.name}</span><Badge variant={a.severity === "severe" || a.severity === "high" ? "destructive" : "secondary"}>{a.severity}</Badge></li>)}</ul>
            )}
          </Card>
          <Card className="bg-gradient-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl"><Pill className="h-5 w-5 text-primary" />Medications</h2>
            {meds.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None recorded.</p> : (
              <ul className="mt-3 space-y-2 text-sm">{meds.map((m: any) => <li key={m.id}><span className="font-medium">{m.name}</span>{m.dose ? ` · ${m.dose}` : ""}{m.frequency ? ` · ${m.frequency}` : ""}</li>)}</ul>
            )}
          </Card>
          <Card className="bg-gradient-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl"><Heart className="h-5 w-5 text-destructive" />Conditions</h2>
            {conditions.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None recorded.</p> : <ul className="mt-3 list-disc pl-5 text-sm">{conditions.map((c: any) => <li key={c.id}>{c.name}</li>)}</ul>}
          </Card>
          <Card className="bg-gradient-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl"><Phone className="h-5 w-5 text-teal" />Emergency contacts</h2>
            {contacts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">None recorded.</p> : (
              <ul className="mt-3 space-y-2 text-sm">{contacts.map((c: any) => <li key={c.id}><div className="font-medium">{c.name}{c.relation ? <span className="text-muted-foreground"> · {c.relation}</span> : null}</div><a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a></li>)}</ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Emergency;
