import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, RotateCw, Save } from "lucide-react";
import { addFile } from "@/lib/store";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileKind } from "@/lib/store";

const ScanPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<FileKind>("prescription");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch { setError("Camera unavailable on this device."); }
    };
    start();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    setSnapshot(canvas.toDataURL("image/jpeg", 0.85));
  };

  const save = () => {
    if (!snapshot || !title) { toast.error("Add a title first"); return; }
    addFile({ kind, title, mime: "image/jpeg", data: snapshot, date: new Date().toISOString().slice(0, 10) });
    toast.success("Saved to your hub");
    setSnapshot(null); setTitle("");
  };

  return (
    <AppShell>
      <PageHeader title="Quick capture" description="Snap a document with your camera and store it instantly." />
      <Card className="overflow-hidden bg-gradient-card p-6 shadow-soft">
        {error ? (
          <div className="grid place-items-center py-16 text-center text-muted-foreground">{error}</div>
        ) : snapshot ? (
          <div className="space-y-4">
            <img src={snapshot} alt="captured" className="w-full rounded-xl" />
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <Select value={kind} onValueChange={v => setKind(v as FileKind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="report">Lab report</SelectItem>
                  <SelectItem value="scan">Imaging scan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSnapshot(null)}><RotateCw className="mr-2 h-4 w-4" />Retake</Button>
              <Button onClick={save} className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Save className="mr-2 h-4 w-4" />Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black aspect-video" />
            <Button size="lg" onClick={capture} className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"><Camera className="mr-2 h-4 w-4" />Capture</Button>
          </div>
        )}
      </Card>
    </AppShell>
  );
};
export default ScanPage;
