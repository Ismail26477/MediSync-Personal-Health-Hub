import { SiteHeader } from "@/components/app/SiteHeader";
import { Card } from "@/components/ui/card";

const About = () => (
  <div className="min-h-screen bg-gradient-soft">
    <SiteHeader />
    <div className="container max-w-3xl py-16">
      <h1 className="text-5xl">About <span className="text-gradient">MediSync</span></h1>
      <p className="mt-4 text-lg text-muted-foreground">MediSync is a local-first personal health hub. Your records, allergies, prescriptions and emergency information stay in your browser — never on our servers.</p>
      <Card className="mt-8 bg-gradient-card p-6 shadow-soft">
        <h2 className="text-2xl">Why local-first?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Health data is the most sensitive data you own. By keeping everything on your device, you remove an entire category of risk: data breaches, unauthorised access and silent third-party use. You stay in control.</p>
      </Card>
      <Card className="mt-4 bg-gradient-card p-6 shadow-soft">
        <h2 className="text-2xl">Emergency QR</h2>
        <p className="mt-2 text-sm text-muted-foreground">When you choose, MediSync exposes a single time-limited URL behind a QR code. First responders or family can scan it for the essentials — and you can revoke access in one tap.</p>
      </Card>
    </div>
  </div>
);
export default About;
