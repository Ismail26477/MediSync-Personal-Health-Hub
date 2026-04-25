import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addAllergy, removeAllergy, Severity, useStore } from "@/lib/store";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const sevColor: Record<Severity, string> = {
  low: "bg-muted text-muted-foreground",
  moderate: "bg-warning/20 text-warning-foreground",
  high: "bg-destructive/15 text-destructive",
  severe: "bg-destructive text-destructive-foreground",
};

const Allergies = () => {
  const allergies = useStore(s => s.allergies);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!name) return;
    addAllergy({ name, severity, notes });
    toast.success("Allergy added");
    setOpen(false); setName(""); setNotes(""); setSeverity("moderate");
  };

  return (
    <AppShell>
      <PageHeader title="Allergies" description="Track substances and severity for safer care." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Add allergy</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New allergy</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2"><Label>Substance</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Penicillin" /></div>
              <div className="grid gap-2"><Label>Severity</Label>
                <Select value={severity} onValueChange={v => setSeverity(v as Severity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem><SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gradient-hero text-primary-foreground hover:opacity-90">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      {allergies.length === 0 ? (
        <Card className="bg-gradient-card p-12 text-center shadow-soft">
          <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No allergies recorded yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {allergies.map(a => (
            <Card key={a.id} className="flex items-center gap-4 bg-gradient-card p-4 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning"><AlertTriangle className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="font-medium">{a.name}</span><Badge className={sevColor[a.severity]}>{a.severity}</Badge></div>
                {a.notes && <p className="text-sm text-muted-foreground">{a.notes}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => { removeAllergy(a.id); toast.success("Removed"); }}><Trash2 className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};
export default Allergies;
