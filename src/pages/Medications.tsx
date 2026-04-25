import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addMedication, removeMedication, useStore } from "@/lib/store";
import { Plus, Trash2, Pill } from "lucide-react";
import { toast } from "sonner";

const Medications = () => {
  const meds = useStore(s => s.medications);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dose: "", frequency: "", prescriber: "" });

  const submit = () => {
    if (!form.name) return;
    addMedication(form);
    toast.success("Medication added");
    setOpen(false); setForm({ name: "", dose: "", frequency: "", prescriber: "" });
  };

  return (
    <AppShell>
      <PageHeader title="Medications" description="Active prescriptions and ongoing treatments." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Add medication</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New medication</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Dose</Label><Input value={form.dose} onChange={e => setForm({ ...form, dose: e.target.value })} placeholder="e.g. 500mg" /></div>
                <div className="grid gap-2"><Label>Frequency</Label><Input value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. 2x daily" /></div>
              </div>
              <div className="grid gap-2"><Label>Prescriber</Label><Input value={form.prescriber} onChange={e => setForm({ ...form, prescriber: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gradient-hero text-primary-foreground hover:opacity-90">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      {meds.length === 0 ? (
        <Card className="bg-gradient-card p-12 text-center shadow-soft"><Pill className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No medications yet.</p></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {meds.map(m => (
            <Card key={m.id} className="flex items-start gap-4 bg-gradient-card p-4 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Pill className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.dose} · {m.frequency}</div>
                {m.prescriber && <div className="text-xs text-muted-foreground">Dr. {m.prescriber}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => { removeMedication(m.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};
export default Medications;
