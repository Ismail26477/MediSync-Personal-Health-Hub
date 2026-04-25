import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/store";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const EditProfileDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: user?.name ?? "",
    age: user?.age?.toString() ?? "",
    gender: user?.gender ?? "",
    dob: user?.dob ?? "",
    bloodType: user?.bloodType ?? "",
    heightCm: user?.heightCm?.toString() ?? "",
    weightKg: user?.weightKg?.toString() ?? "",
    phone: user?.phone ?? "",
    lastCheckup: user?.lastCheckup ?? "",
    emergencyContact: user?.emergencyContact ?? "",
    allergiesText: user?.allergiesText ?? "",
    conditionsText: user?.conditionsText ?? "",
    medicationsText: user?.medicationsText ?? "",
    address: user?.address ?? "",
  });

  const save = async () => {
    setBusy(true);
    try {
      await updateUser({
        name: f.name,
        age: f.age ? Number(f.age) : null,
        gender: f.gender || null,
        dob: f.dob || null,
        bloodType: f.bloodType || null,
        heightCm: f.heightCm ? Number(f.heightCm) : null,
        weightKg: f.weightKg ? Number(f.weightKg) : null,
        phone: f.phone || null,
        lastCheckup: f.lastCheckup || null,
        emergencyContact: f.emergencyContact || null,
        allergiesText: f.allergiesText || null,
        conditionsText: f.conditionsText || null,
        medicationsText: f.medicationsText || null,
        address: f.address || null,
      });
      toast.success("Profile updated");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-2xl">Health profile</DialogTitle>
          <DialogDescription>These details power your dashboard, summary, and emergency card.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Full name <span className="text-destructive">*</span></Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Age <span className="text-destructive">*</span></Label><Input type="number" value={f.age} onChange={e => setF({ ...f, age: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Gender <span className="text-destructive">*</span></Label>
              <Select value={f.gender} onValueChange={v => setF({ ...f, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Date of birth</Label><Input type="date" value={f.dob} onChange={e => setF({ ...f, dob: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Blood group</Label>
              <Select value={f.bloodType} onValueChange={v => setF({ ...f, bloodType: v })}>
                <SelectTrigger><SelectValue placeholder="O+, A-…" /></SelectTrigger>
                <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Height (cm)</Label><Input type="number" value={f.heightCm} onChange={e => setF({ ...f, heightCm: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Weight (kg)</Label><Input type="number" value={f.weightKg} onChange={e => setF({ ...f, weightKg: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Phone</Label><Input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Last checkup</Label><Input type="date" value={f.lastCheckup} onChange={e => setF({ ...f, lastCheckup: e.target.value })} /></div>
          </div>
          <div className="grid gap-2"><Label>Emergency contact</Label><Input placeholder="Name · phone" value={f.emergencyContact} onChange={e => setF({ ...f, emergencyContact: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Allergies</Label><Input placeholder="Penicillin, peanuts…" value={f.allergiesText} onChange={e => setF({ ...f, allergiesText: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Conditions</Label><Input placeholder="Diabetes Type II…" value={f.conditionsText} onChange={e => setF({ ...f, conditionsText: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Current medications</Label><Input placeholder="Metformin 500mg, …" value={f.medicationsText} onChange={e => setF({ ...f, medicationsText: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Address</Label><Input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy} className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Save className="mr-2 h-4 w-4" />{busy ? "Saving…" : "Save profile"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
