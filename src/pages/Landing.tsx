import { Link } from "react-router-dom";
import { ScanLine, FileImage, QrCode, Lock, ArrowRight, FileText, Paperclip, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/app/SiteHeader";

const Landing = () => (
  <div className="min-h-screen bg-gradient-soft">
    <SiteHeader />

    {/* HERO */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative grid items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-success" />
            Private by default · You hold the key
          </div>
          <h1 className="font-serif-display text-[64px] leading-[1.02] tracking-tight md:text-[88px]">
            Your health, <em className="text-gradient italic">in your<br />pocket</em><span className="text-foreground">.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            MediSync is your personal health hub for X-rays, prescriptions and reports. Generate a private QR you control — keep it sealed, or flip it on for an ER visit. Nobody sees your records unless you say so.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-gradient-hero px-7 text-base text-primary-foreground shadow-elegant hover:opacity-90">
              <Link to="/signup">Create my health hub <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-border bg-background px-7 text-base">
              <Link to="/emergency"><ScanLine className="mr-2 h-4 w-4" />Emergency view</Link>
            </Button>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-8 border-t border-border/60 pt-8 text-sm">
            <div><div className="font-serif-display text-2xl">You</div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">One owner</div></div>
            <div><div className="font-serif-display text-2xl">Scans · PDF · Rx</div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Files</div></div>
            <div><div className="font-serif-display text-2xl">QR-based</div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Access</div></div>
          </div>
        </div>

        {/* hero card */}
        <div className="relative">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
          <Card className="relative rounded-3xl border border-border/60 bg-card p-7 shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Lock className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Health Hub</div>
                  <div className="font-medium">Aarav · <span className="text-muted-foreground">Private</span></div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <EyeOff className="h-3 w-3" /> Sharing off
              </div>
            </div>

            <div className="mt-6 grid aspect-square place-items-center rounded-2xl bg-muted/60">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-soft">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-3 font-medium">QR is sealed</div>
                <div className="text-xs text-muted-foreground">Tap "Share" to enable</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><FileImage className="h-3.5 w-3.5 text-primary" />12 scans</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><FileText className="h-3.5 w-3.5 text-primary" />8 reports</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><Paperclip className="h-3.5 w-3.5 text-primary" />3 Rx</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">A+ · Blood</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">170 cm · 65 kg</span>
            </div>
          </Card>
        </div>
      </div>
    </section>

    {/* THREE SIMPLE SECTIONS */}
    <section className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Three simple sections</div>
        <h2 className="mt-4 font-serif-display text-5xl leading-[1.05] md:text-6xl">A hub, a key, an <em className="text-gradient italic">emergency<br />door</em><span>.</span></h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {[
          { icon: FileImage, title: "My Records", desc: "Every X-ray, lab report and prescription — organized, searchable, always with you.", to: "/dashboard", cta: "Open hub" },
          { icon: QrCode, title: "My QR Code", desc: "Your private key. Sealed by default. Toggle on to share critical info instantly.", to: "/qr", cta: "View my QR" },
          { icon: ScanLine, title: "Emergency View", desc: "Anyone scanning your QR sees only what you've authorized — nothing more.", to: "/emergency", cta: "Try the scanner" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition hover:shadow-elegant">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-8 font-serif-display text-3xl">{s.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.desc}</p>
              <Link to={s.to} className="mt-6 inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline">
                {s.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          );
        })}
      </div>
    </section>

    {/* CTA banner */}
    <section className="container pb-24">
      <Card className="overflow-hidden rounded-[2rem] bg-gradient-hero p-10 text-primary-foreground shadow-elegant md:p-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif-display text-5xl text-primary-foreground md:text-6xl">Take your records back.<br /><em className="italic">Carry them. Control them.</em></h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/85">Free to start. Your data is end-to-end encrypted in Lovable Cloud — only you and the people you authorize can read it.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-7 text-base"><Link to="/signup">Create my health hub</Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary-foreground/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/help">How it works</Link></Button>
          </div>
        </div>
      </Card>
    </section>

    <footer className="border-t border-border/50">
      <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero"><Lock className="h-3.5 w-3.5 text-primary-foreground" /></div>
          <span><span className="font-medium text-foreground">MediSync</span> · Your health, in your pocket.</span>
        </div>
        <div>© {new Date().getFullYear()} MediSync · End-to-end your data, your control.</div>
      </div>
    </footer>
  </div>
);

export default Landing;
