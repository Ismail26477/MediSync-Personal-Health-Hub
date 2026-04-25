import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signupAuth } from "@/lib/store";
import { toast } from "sonner";
import { Lock, FileLock2, KeyRound, ShieldCheck } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) { toast.error("Please select a gender"); return; }
    setBusy(true);
    try {
      await signupAuth(name.trim(), email.trim().toLowerCase(), password, {
        age: age ? Number(age) : null,
        gender,
        bloodType: bloodType || null,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
      });
      toast.success("Hub created");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Could not create account");
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <main className="flex items-start justify-center overflow-y-auto bg-gradient-soft p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
              <Lock className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-serif-display text-2xl">MediSync</span>
          </Link>

          <h1 className="mt-10 font-serif-display text-5xl leading-tight">Create your private health hub</h1>
          <p className="mt-3 text-muted-foreground">Just you. Your records. Your QR. No hospitals, no admins.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-2">
              <Label>Full name <span className="text-destructive">*</span></Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Aarav Mehta" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Age <span className="text-destructive">*</span></Label>
                <Input type="number" min={0} max={130} required value={age} onChange={e => setAge(e.target.value)} placeholder="32" />
              </div>
              <div className="grid gap-2">
                <Label>Gender <span className="text-destructive">*</span></Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Blood group</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Height (cm)</Label>
                <Input type="number" min={0} value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="170" />
              </div>
              <div className="grid gap-2">
                <Label>Weight (kg)</Label>
                <Input type="number" min={0} value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="65" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant hover:opacity-90">
              {busy ? "Creating…" : "Create my health hub"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have one? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </main>

      {/* Right: gradient marketing panel */}
      <aside className="relative hidden flex-col justify-center overflow-hidden bg-gradient-hero p-12 text-primary-foreground lg:flex">
        <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/80">Built around you</p>
        <h2 className="mt-4 font-serif-display text-5xl leading-tight">A personal locker for everything that keeps you healthy.</h2>
        <ul className="mt-10 space-y-5 text-base">
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><FileLock2 className="h-5 w-5" /></span>
            Scans, prescriptions, lab reports — all in one place.
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><KeyRound className="h-5 w-5" /></span>
            A private QR you control. Share it only when you choose.
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><ShieldCheck className="h-5 w-5" /></span>
            No hospital admins. No external accounts. Just you.
          </li>
        </ul>
      </aside>
    </div>
  );
};
export default Signup;
