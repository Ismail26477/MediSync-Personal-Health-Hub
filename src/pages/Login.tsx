import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAuth } from "@/lib/store";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginAuth(email.trim().toLowerCase(), password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        toast.error("Email or password doesn't match. Check for typos in your email.");
      } else {
        toast.error(err.message ?? "Sign-in failed");
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: gradient panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-hero p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Lock className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-serif-display text-2xl">MediSync</span>
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/80">Your records. Your rules.</p>
          <blockquote className="mt-4 font-serif-display text-3xl leading-snug">
            "I finally know where every report is — and I'm the only one who can share it."
          </blockquote>
          <p className="mt-4 text-sm text-primary-foreground/80">— A MediSync user</p>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex items-center justify-center bg-gradient-soft p-8">
        <div className="w-full max-w-md">
          <h1 className="font-serif-display text-5xl">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Open your private health hub.</p>
          <form onSubmit={submit} className="mt-10 space-y-5">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant hover:opacity-90">
              {busy ? "Opening…" : "Open my health hub"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create your health hub</Link>
          </p>
        </div>
      </main>
    </div>
  );
};
export default Login;
