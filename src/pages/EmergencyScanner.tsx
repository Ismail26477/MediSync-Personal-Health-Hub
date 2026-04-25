import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { ScanLine, Camera, Link2, ShieldAlert, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/app/SiteHeader";
import { toast } from "sonner";

const extractToken = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/emergency\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  // bare token
  if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return trimmed;
  return null;
};

const EmergencyScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paste, setPaste] = useState("");

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      tick();
    } catch {
      setError("Camera access was denied. You can paste a link instead.");
    }
  };

  const tick = () => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c || !streamRef.current) return;
    if (v.readyState === v.HAVE_ENOUGH_DATA) {
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code?.data) {
        const token = extractToken(code.data);
        if (token) {
          stop();
          toast.success("QR detected");
          navigate(`/emergency/${token}`);
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => stop(), []);

  const submitPaste = (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractToken(paste);
    if (!token) { toast.error("That link doesn't look like a MediSync QR."); return; }
    navigate(`/emergency/${token}`);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <section className="container max-w-5xl py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">For clinicians & responders</div>
          <h1 className="mt-3 font-serif-display text-5xl leading-[1.05] md:text-6xl">Scan a patient's <em className="text-gradient italic">QR</em>.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Point the camera at a MediSync QR — or paste the link — to open the patient's authorized emergency dashboard. Read-only. No login required.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* SCANNER */}
          <Card className="rounded-3xl border border-border/60 bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium"><Camera className="h-4 w-4 text-primary" />Camera scanner</div>
              {scanning && <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />Looking for a QR…</span>}
            </div>

            <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-foreground/90">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              {!scanning && (
                <div className="absolute inset-0 grid place-items-center bg-foreground/80 text-primary-foreground">
                  <div className="text-center">
                    <ScanLine className="mx-auto h-10 w-10 opacity-80" />
                    <p className="mt-3 text-sm opacity-80">Camera is off</p>
                  </div>
                </div>
              )}
              {scanning && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="h-56 w-56 rounded-2xl border-2 border-primary-foreground/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-5 flex flex-wrap gap-2">
              {!scanning ? (
                <Button onClick={start} className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Camera className="mr-2 h-4 w-4" />Start camera</Button>
              ) : (
                <Button onClick={stop} variant="outline">Stop camera</Button>
              )}
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </Card>

          {/* PASTE + INFO */}
          <div className="space-y-6">
            <Card className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-medium"><Link2 className="h-4 w-4 text-primary" />Paste a link or token</div>
              <form onSubmit={submitPaste} className="mt-4 space-y-3">
                <Input value={paste} onChange={e => setPaste(e.target.value)} placeholder="https://medisync.app/emergency/xxxxxxxx…" className="h-11" />
                <Button type="submit" className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90">Open emergency view <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">Works with full URLs or just the token.</p>
            </Card>

            <Card className="rounded-3xl border border-border/60 bg-gradient-soft p-6 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-medium"><ShieldAlert className="h-4 w-4 text-destructive" />What you'll see</div>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Patient name, blood type & DOB</li>
                <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Active medications & allergies with severity</li>
                <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Known conditions & emergency contacts</li>
                <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Read-only — nothing can be edited or downloaded</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">Access auto-revokes when the patient toggles sharing off or rotates their token.</p>
            </Card>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          Are you the patient? <Link to="/qr" className="text-primary hover:underline">Open your QR page</Link>
        </div>
      </section>
    </div>
  );
};

export default EmergencyScanner;
