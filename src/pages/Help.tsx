import { SiteHeader } from "@/components/app/SiteHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Where is my data stored?", a: "All data lives in your browser's localStorage on this device. It never leaves unless you export it." },
  { q: "What happens if I clear my browser?", a: "Your hub will be empty. Use Settings → Export JSON to keep a backup file you control." },
  { q: "How do I share my emergency info?", a: "Open the Emergency QR page, choose a duration and tap Enable sharing. Show or print the QR." },
  { q: "Can I revoke access?", a: "Yes — Disable now stops sharing instantly, and Rotate token invalidates the old link forever." },
  { q: "Is MediSync a medical device?", a: "No. It's a personal organiser for your records. Always consult a clinician for medical decisions." },
];

const Help = () => (
  <div className="min-h-screen bg-gradient-soft">
    <SiteHeader />
    <div className="container max-w-3xl py-16">
      <h1 className="text-5xl">Help & FAQ</h1>
      <p className="mt-4 text-muted-foreground">Quick answers to common questions.</p>
      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);
export default Help;
