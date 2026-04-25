import { FileRecord, removeFile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const FileCard = ({ file }: { file: FileRecord }) => {
  const [open, setOpen] = useState(false);
  const isImage = file.mime.startsWith("image/");
  const url = file.signedUrl;
  return (
    <Card className="group overflow-hidden bg-gradient-card shadow-soft transition hover:shadow-elegant">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
        {isImage && url ? <img src={url} alt={file.title} className="h-full w-full object-cover" /> : <FileText className="h-16 w-16 text-muted-foreground" />}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{file.title}</h3>
          {file.category && <Badge variant="secondary" className="shrink-0">{file.category}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{format(new Date(file.date), "PPP")}</p>
        {file.notes && <p className="line-clamp-2 text-sm text-muted-foreground">{file.notes}</p>}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(true)} disabled={!url}><Eye className="mr-1 h-3.5 w-3.5" />View</Button>
          <Button size="sm" variant="ghost" onClick={async () => { try { await removeFile(file.id); toast.success("Removed"); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{file.title}</DialogTitle></DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {url && (isImage ? <img src={url} alt={file.title} className="w-full" /> : <iframe src={url} title={file.title} className="h-[70vh] w-full" />)}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
