import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ScanLine, Pill, FileText, File as FileIcon, X } from "lucide-react";
import { addFile, FileKind } from "@/lib/store";
import { toast } from "sonner";

type Category = FileKind | "other";
const categories: { id: Category; label: string; icon: any; bg: string; fg: string }[] = [
  { id: "scan",         label: "Scans",          icon: ScanLine, bg: "bg-primary/10",  fg: "text-primary" },
  { id: "report",       label: "Lab Reports",    icon: FileText, bg: "bg-teal/15",     fg: "text-teal" },
  { id: "prescription", label: "Prescriptions",  icon: Pill,     bg: "bg-success/15",  fg: "text-success" },
  { id: "other",        label: "Other Documents",icon: FileIcon, bg: "bg-muted",       fg: "text-muted-foreground" },
];

const MAX_BYTES = 25 * 1024 * 1024;

export const UploadModal = ({ kind, trigger }: { kind?: FileKind; trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>(kind ?? "scan");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFiles([]); setCategory(kind ?? "scan"); };

  const accept = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const ok = arr.filter(f => f.size <= MAX_BYTES);
    if (ok.length !== arr.length) toast.error("Some files exceed 25 MB and were skipped");
    setFiles(prev => [...prev, ...ok]);
  };

  const start = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const targetKind: FileKind = category === "other" ? "report" : category;
      for (const f of files) {
        const data = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
        await addFile({
          kind: targetKind,
          title: f.name.replace(/\.[^.]+$/, ""),
          category: category === "other" ? "Other" : undefined,
          date: new Date().toISOString().slice(0, 10),
          mime: f.type || "application/octet-stream",
          data,
        });
      }
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      setOpen(false); reset();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{trigger ?? <Button><Upload className="mr-2 h-4 w-4" />Upload</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-2xl">Upload Scans &amp; Documents</DialogTitle>
          <DialogDescription>Scans, prescriptions, lab reports — up to 25 MB each.</DialogDescription>
        </DialogHeader>

        {/* Category tiles */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Category</div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(c => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.fg}`}><Icon className="h-5 w-5" /></span>
                  <span className="font-medium">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.length) accept(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`mt-2 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? "border-primary bg-primary/5" : "border-border bg-accent/30"}`}>
          <Upload className="h-7 w-7 text-primary" />
          <p className="mt-3 font-medium">Drag &amp; drop or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, PDF, DICOM</p>
          <input ref={inputRef} type="file" multiple hidden accept="image/*,application/pdf,.dcm,.dicom" onChange={(e) => e.target.files && accept(e.target.files)} />
        </div>

        {files.length > 0 && (
          <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border p-2 text-sm">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-muted">
                <span className="truncate">{f.name} <span className="text-xs text-muted-foreground">· {(f.size / 1024 / 1024).toFixed(2)} MB</span></span>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, j) => j !== i)); }}><X className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} ready` : "Add files to begin"}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={start} disabled={!files.length || busy} className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Upload className="mr-2 h-4 w-4" />{busy ? "Uploading…" : "Start upload"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
