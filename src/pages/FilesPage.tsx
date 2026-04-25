import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { UploadModal } from "@/components/app/UploadModal";
import { FileCard } from "@/components/app/FileCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileKind, useStore } from "@/lib/store";
import { Search, Upload, ScanLine, Pill, FileText } from "lucide-react";

const meta: Record<FileKind, { title: string; subtitle: string; description: string; emptyTitle: string; emptyHelp: string; icon: any; bg: string; fg: string; placeholder: string; }> = {
  scan: {
    title: "My Scans", subtitle: "X-rays, MRIs and imaging studies",
    description: "records stored privately on your device.",
    emptyTitle: "No scans yet",
    emptyHelp: "Upload an X-ray, MRI, CT or ultrasound to keep a copy with you.",
    icon: ScanLine, bg: "bg-primary/10", fg: "text-primary",
    placeholder: "Search scans…",
  },
  prescription: {
    title: "Prescriptions", subtitle: "Scripts and Rx documents",
    description: "records stored privately on your device.",
    emptyTitle: "No prescriptions yet",
    emptyHelp: "Upload a prescription so you always have it with you at the pharmacy.",
    icon: Pill, bg: "bg-success/15", fg: "text-success",
    placeholder: "Search prescriptions…",
  },
  report: {
    title: "Lab Reports", subtitle: "Bloodwork, pathology and diagnostics",
    description: "records stored privately on your device.",
    emptyTitle: "No reports yet",
    emptyHelp: "Add lab results and diagnostic reports to track them over time.",
    icon: FileText, bg: "bg-teal/15", fg: "text-teal",
    placeholder: "Search lab reports…",
  },
};

export const FilesPage = ({ kind }: { kind: FileKind }) => {
  const files = useStore(s => s.files);
  const all = useMemo(() => files.filter(f => f.kind === kind), [files, kind]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const m = meta[kind];

  const filtered = all
    .filter(f => f.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const Icon = m.icon;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif-display text-4xl">{m.title}</h1>
          <p className="text-sm text-muted-foreground">{m.subtitle}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={m.placeholder} className="pl-9" />
        </div>
      </div>

      {/* Category banner */}
      <Card className="mb-6 flex items-center justify-between gap-4 bg-gradient-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${m.bg}`}><Icon className={`h-6 w-6 ${m.fg}`} /></div>
          <div>
            <h2 className="font-serif-display text-2xl">{m.title.endsWith("s") ? m.title : m.title + "s"}</h2>
            <p className="text-sm text-muted-foreground">{all.length} {m.description}</p>
          </div>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
        </select>
      </Card>

      {filtered.length === 0 ? (
        <Card className="grid place-items-center bg-accent/30 p-16 text-center shadow-soft">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${m.bg}`}><Icon className={`h-8 w-8 ${m.fg}`} /></div>
          <h3 className="mt-5 font-serif-display text-3xl">{m.emptyTitle}</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{m.emptyHelp}</p>
          <UploadModal kind={kind} trigger={<Button className="mt-5 rounded-full bg-gradient-hero px-6 text-primary-foreground shadow-elegant hover:opacity-90"><Upload className="mr-2 h-4 w-4" />Upload Scans &amp; Documents</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(f => <FileCard key={f.id} file={f} />)}
        </div>
      )}
    </AppShell>
  );
};

export const PrescriptionsPage = () => <FilesPage kind="prescription" />;
export const ReportsPage = () => <FilesPage kind="report" />;
export const ScansPage = () => <FilesPage kind="scan" />;
export default FilesPage;
