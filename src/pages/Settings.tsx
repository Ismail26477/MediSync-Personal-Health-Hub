import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { updateUser, addContact, removeContact, exportData, importData, wipeAll, useStore, setTheme } from "@/lib/store";
import { toast } from "sonner";
import { Plus, Trash2, Download, Upload, AlertOctagon } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const theme = useStore(s => s.theme);
  const [profile, setProfile] = useState({ name: user!.name, dob: user!.dob ?? "", bloodType: user!.bloodType ?? "" });
  const [contact, setContact] = useState({ name: "", relation: "", phone: "" });

  const saveProfile = () => { updateUser(profile); toast.success("Profile updated"); };
  const onExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "medisync-export.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { importData(r.result as string); toast.success("Data imported"); } catch { toast.error("Invalid file"); } };
    r.readAsText(f);
  };

  return (
    <AppShell>
      <PageHeader title="Settings" description="Profile, appearance and your data." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card p-6 shadow-soft">
          <h2 className="text-xl">Profile</h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Date of birth</Label><Input type="date" value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Blood type</Label><Input placeholder="e.g. O+" value={profile.bloodType} onChange={e => setProfile({ ...profile, bloodType: e.target.value })} /></div>
            </div>
            <Button onClick={saveProfile} className="bg-gradient-hero text-primary-foreground hover:opacity-90">Save profile</Button>
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft">
          <h2 className="text-xl">Appearance</h2>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
            <div><div className="font-medium">Dark mode</div><div className="text-xs text-muted-foreground">Calmer for night-time viewing.</div></div>
            <Switch checked={theme === "dark"} onCheckedChange={v => setTheme(v ? "dark" : "light")} />
          </div>
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft lg:col-span-2">
          <h2 className="text-xl">Emergency contacts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
            <Input placeholder="Relation" value={contact.relation} onChange={e => setContact({ ...contact, relation: e.target.value })} />
            <Input placeholder="Phone" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
            <Button onClick={() => { if (!contact.name || !contact.phone) return; addContact(contact); setContact({ name: "", relation: "", phone: "" }); toast.success("Contact added"); }}><Plus className="h-4 w-4" /></Button>
          </div>
          {user!.emergencyContacts.length > 0 && (
            <ul className="mt-4 divide-y divide-border">
              {user!.emergencyContacts.map(c => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <div><span className="font-medium">{c.name}</span> · {c.relation} · {c.phone}</div>
                  <Button variant="ghost" size="icon" onClick={() => removeContact(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="bg-gradient-card p-6 shadow-soft lg:col-span-2">
          <h2 className="text-xl">Your data</h2>
          <p className="mt-1 text-sm text-muted-foreground">Export keeps you in control. Import restores from a JSON file.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export JSON</Button>
            <Button asChild variant="outline"><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4 inline" />Import JSON<input type="file" accept="application/json" hidden onChange={onImport} /></label></Button>
            <Button variant="destructive" onClick={() => { if (confirm("Delete all data? This cannot be undone.")) { wipeAll(); toast.success("All data wiped"); } }}><AlertOctagon className="mr-2 h-4 w-4" />Delete everything</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};
export default Settings;
