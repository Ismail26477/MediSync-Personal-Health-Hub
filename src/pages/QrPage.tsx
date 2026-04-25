import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useStore, enableShare, disableShare, rotateShareToken, isShareLive } from "@/lib/store";
import { Lock, Copy, Check, Share2, Printer, Download, RotateCw, ExternalLink, Shield, Key, QrCode as QrIcon, Eye, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";

const presets = [
  { label: "15 min", ms: 15 * 60 * 1000 },
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { label: "Until I turn it off", ms: null as number | null },
];

const QrPage = () => {
  const share = useStore(s => s.share);
  const [duration, setDuration] = useState<number | null>(60 * 60 * 1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, force] = useState(0);

  const live = isShareLive(share);
  const url = useMemo(() => `${window.location.origin}/emergency/${share.token}`, [share.token]);

  useEffect(() => {
    const render = () => {
      if (!canvasRef.current || !qrWrapRef.current) return;
      const avail = qrWrapRef.current.clientWidth;
      const size = Math.max(160, Math.min(280, Math.floor(avail)));
      canvasRef.current.width = size;
      canvasRef.current.height = size;
      QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 2, color: { dark: "#0c2340", light: "#ffffff" }, errorCorrectionLevel: "H" });
    };
    render();
    const ro = new ResizeObserver(render);
    if (qrWrapRef.current) ro.observe(qrWrapRef.current);
    return () => ro.disconnect();
  }, [url, live]);

  // tick countdown
  useEffect(() => {
    if (!share.expiresAt || !live) return;
    const id = setInterval(() => force(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [share.expiresAt, live]);

  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 1500); };
  const shareLink = async () => {
    if (navigator.share) { try { await navigator.share({ title: "MediSync emergency info", url }); } catch {} }
    else copy();
  };

  const downloadPng = async () => {
    const data = await QRCode.toDataURL(url, { width: 720, margin: 2, color: { dark: "#0c2340", light: "#ffffff" }, errorCorrectionLevel: "H" });
    const a = document.createElement("a"); a.href = data; a.download = "medisync-qr.png"; a.click();
  };

  const print = async () => {
    const data = await QRCode.toDataURL(url, { width: 720, margin: 2, color: { dark: "#0c2340", light: "#ffffff" }, errorCorrectionLevel: "H" });
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<html><head><title>MediSync emergency QR</title><style>body{font-family:system-ui;text-align:center;padding:40px}img{max-width:340px}h1{font-size:22px}p{color:#555;font-size:12px;word-break:break-all}</style></head><body><h1>MediSync · Emergency QR</h1><img src="${data}" /><p>${url}</p><p>Scan to view emergency medical info</p></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  };

  return (
    <AppShell>
      <PageHeader title="Emergency QR" description="Share your essentials — only when you choose." />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="overflow-hidden rounded-3xl bg-gradient-card p-4 shadow-elegant sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Badge className={live ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
              <span className={`mr-2 h-2 w-2 rounded-full ${live ? "bg-success-foreground animate-pulse" : "bg-muted-foreground"}`} />
              {live ? "Live · Sharing on" : "Sealed · Sharing off"}
            </Badge>
            {live && share.expiresAt && <span className="text-xs text-muted-foreground">expires in {formatDistanceToNowStrict(share.expiresAt)}</span>}
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 sm:p-6">
            <div ref={qrWrapRef} className="mx-auto aspect-square w-full max-w-[280px]">
              <canvas ref={canvasRef} className={`block h-full w-full ${live ? "" : "blur-md grayscale"}`} />
            </div>
            {!live && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/40 backdrop-blur-sm">
                <div className="rounded-xl bg-card px-4 py-3 text-center shadow-elegant">
                  <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 text-sm font-medium">QR is sealed</p>
                  <p className="text-xs text-muted-foreground">Enable sharing to activate</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Token preview <span className="ml-1 font-mono text-foreground">{share.token.slice(0, 6)}…</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" asChild><Link to="/summary"><Eye className="mr-2 h-4 w-4" />Health summary</Link></Button>
            <Button onClick={shareLink} disabled={!live}><Share2 className="mr-2 h-4 w-4" />Share link</Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" onClick={downloadPng} disabled={!live}><Download className="mr-2 h-4 w-4" />PNG</Button>
            <Button variant="ghost" size="sm" onClick={print} disabled={!live}><Printer className="mr-2 h-4 w-4" />Print</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-card p-6 shadow-soft">
            <h2 className="text-xl">Sharing duration</h2>
            <p className="text-sm text-muted-foreground">Pick how long this QR remains active.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {presets.map(p => {
                const selected = duration === p.ms;
                return (
                  <button key={p.label} onClick={() => setDuration(p.ms)} className={`rounded-lg border px-4 py-3 text-sm transition ${selected ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:bg-muted"}`}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!live ? (
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90 sm:w-auto">Enable sharing</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[92vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Turn on emergency sharing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Anyone who scans your QR will be able to see your emergency essentials for{" "}
                        <span className="font-medium text-foreground">{presets.find(p => p.ms === duration)?.label ?? "the chosen duration"}</span>. You can disable it any time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel disabled={enabling} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={enabling}
                        onClick={async (e) => {
                          e.preventDefault();
                          setEnabling(true);
                          try { await enableShare(duration); toast.success("Sharing is live"); setConfirmOpen(false); }
                          catch (err: any) { toast.error(err?.message ?? "Could not enable sharing"); }
                          finally { setEnabling(false); }
                        }}
                        className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90 sm:w-auto"
                      >
                        {enabling ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enabling…</>) : "Yes, enable sharing"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button variant="outline" onClick={() => { disableShare(); toast.success("Sharing disabled"); }}>Disable now</Button>
              )}
              <Button variant="ghost" onClick={() => { rotateShareToken(); toast.success("Token rotated — old link revoked"); }}><RotateCw className="mr-2 h-4 w-4" />Rotate token</Button>
            </div>
          </Card>

          {live && (
            <Card className="bg-gradient-card p-6 shadow-soft">
              <h2 className="text-xl">Direct link</h2>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">{url}</code>
                <Button size="icon" variant="outline" onClick={copy}>{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
              <Button asChild variant="link" className="mt-2 px-0"><a href={url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3 w-3" />Preview emergency view</a></Button>
            </Card>
          )}

          <Card className="bg-gradient-soft p-6 shadow-soft">
            <h2 className="text-xl">Security & privacy</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Shield, title: "Encrypted at rest", desc: "Stored only in your browser hub." },
                { icon: Key, title: "You hold the key", desc: "No admins, no third parties." },
                { icon: QrIcon, title: "QR-based sharing", desc: "One-tap, time-limited access." },
                { icon: Lock, title: "Revoke anytime", desc: "Disable or rotate in one click." },
              ].map(p => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};
export default QrPage;
