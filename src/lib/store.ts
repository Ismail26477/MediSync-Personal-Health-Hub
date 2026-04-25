// Cloud-backed store for MediSync. Same exports as before; pages are unchanged.
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Session, User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Severity = "low" | "moderate" | "high" | "severe";
export type FileKind = "prescription" | "report" | "scan";

export interface EmergencyContact { id: string; name: string; relation: string; phone: string; }
export interface User {
  id: string;
  name: string;
  email: string;
  dob?: string | null;
  bloodType?: string | null;
  age?: number | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  phone?: string | null;
  address?: string | null;
  lastCheckup?: string | null;
  emergencyContact?: string | null;
  allergiesText?: string | null;
  conditionsText?: string | null;
  medicationsText?: string | null;
  emergencyContacts: EmergencyContact[];
}
export interface Allergy { id: string; name: string; severity: Severity; notes?: string | null; createdAt: number; }
export interface Medication { id: string; name: string; dose: string; frequency: string; prescriber?: string | null; createdAt: number; }
export interface Condition { id: string; name: string; notes?: string | null; createdAt: number; }
export interface FileRecord { id: string; kind: FileKind; title: string; category?: string | null; date: string; notes?: string | null; mime: string; storagePath: string; signedUrl?: string; createdAt: number; }
export interface ShareState { enabled: boolean; token: string; expiresAt: number | null; }

export interface AppState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  files: FileRecord[];
  share: ShareState;
  theme: "light" | "dark";
}

const initial: AppState = {
  loading: true,
  session: null,
  user: null,
  allergies: [],
  medications: [],
  conditions: [],
  files: [],
  share: { enabled: false, token: "", expiresAt: null },
  theme: (typeof localStorage !== "undefined" && localStorage.getItem("medisync-theme") === "dark") ? "dark" : "light",
};

let state: AppState = initial;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const set = (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
};
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export const getState = () => state;
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// ---------- helpers ----------
const refreshSignedUrl = async (path: string) => {
  const { data } = await supabase.storage.from("medical-files").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
};

const mapAllergy = (r: any): Allergy => ({ id: r.id, name: r.name, severity: r.severity, notes: r.notes, createdAt: new Date(r.created_at).getTime() });
const mapMed = (r: any): Medication => ({ id: r.id, name: r.name, dose: r.dose ?? "", frequency: r.frequency ?? "", prescriber: r.prescriber, createdAt: new Date(r.created_at).getTime() });
const mapCond = (r: any): Condition => ({ id: r.id, name: r.name, notes: r.notes, createdAt: new Date(r.created_at).getTime() });
const mapFileRow = async (r: any): Promise<FileRecord> => ({
  id: r.id, kind: r.kind, title: r.title, category: r.category, date: r.doc_date ?? new Date(r.created_at).toISOString().slice(0, 10),
  notes: r.notes, mime: r.mime, storagePath: r.storage_path, signedUrl: await refreshSignedUrl(r.storage_path), createdAt: new Date(r.created_at).getTime(),
});

// ---------- load all data ----------
const loadAll = async (uid: string, authUser: AuthUser) => {
  const [profile, contacts, allergies, meds, conds, files, share] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("emergency_contacts").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("allergies").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("medications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("conditions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("medical_files").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("share_settings").select("*").eq("user_id", uid).maybeSingle(),
  ]);

  const fileRecords = await Promise.all((files.data ?? []).map(mapFileRow));
  const ec: EmergencyContact[] = (contacts.data ?? []).map(c => ({ id: c.id, name: c.name, relation: c.relation ?? "", phone: c.phone }));

  set({
    user: {
      id: uid,
      name: profile.data?.name || authUser.email?.split("@")[0] || "User",
      email: authUser.email ?? "",
      dob: profile.data?.dob,
      bloodType: profile.data?.blood_type,
      age: (profile.data as any)?.age ?? null,
      gender: (profile.data as any)?.gender ?? null,
      heightCm: (profile.data as any)?.height_cm ?? null,
      weightKg: (profile.data as any)?.weight_kg ?? null,
      phone: (profile.data as any)?.phone ?? null,
      address: (profile.data as any)?.address ?? null,
      lastCheckup: (profile.data as any)?.last_checkup ?? null,
      emergencyContact: (profile.data as any)?.emergency_contact ?? null,
      allergiesText: (profile.data as any)?.allergies_text ?? null,
      conditionsText: (profile.data as any)?.conditions_text ?? null,
      medicationsText: (profile.data as any)?.medications_text ?? null,
      emergencyContacts: ec,
    },
    allergies: (allergies.data ?? []).map(mapAllergy),
    medications: (meds.data ?? []).map(mapMed),
    conditions: (conds.data ?? []).map(mapCond),
    files: fileRecords,
    share: share.data ? { enabled: share.data.enabled, token: share.data.token, expiresAt: share.data.expires_at ? new Date(share.data.expires_at).getTime() : null } : initial.share,
    loading: false,
  });
};

// ---------- auth bootstrap ----------
export const initAuth = () => {
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session });
    if (session?.user) {
      // defer to avoid deadlocks
      setTimeout(() => loadAll(session.user.id, session.user), 0);
    } else {
      set({ user: null, allergies: [], medications: [], conditions: [], files: [], share: initial.share, loading: false });
    }
  });
  supabase.auth.getSession().then(({ data: { session } }) => {
    set({ session });
    if (session?.user) loadAll(session.user.id, session.user);
    else set({ loading: false });
  });
};

// auth actions
export interface SignupExtras {
  age?: number | null;
  gender?: string | null;
  bloodType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
}
export const signupAuth = async (name: string, email: string, password: string, extras?: SignupExtras) => {
  const redirectUrl = `${window.location.origin}/dashboard`;
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl, data: { name } } });
  if (error) throw error;
  // After signup, the trigger creates the profile row. Patch it with extras if any.
  if (extras && data.user) {
    const patch: any = {};
    if (extras.age != null) patch.age = extras.age;
    if (extras.gender) patch.gender = extras.gender;
    if (extras.bloodType) patch.blood_type = extras.bloodType;
    if (extras.heightCm != null) patch.height_cm = extras.heightCm;
    if (extras.weightKg != null) patch.weight_kg = extras.weightKg;
    if (Object.keys(patch).length) {
      await supabase.from("profiles").update(patch).eq("user_id", data.user.id);
    }
  }
  return data;
};
export const loginAuth = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};
export const logout = async () => { await supabase.auth.signOut(); };

// profile
export const updateUser = async (patch: Partial<Omit<User, "id" | "email" | "emergencyContacts">>) => {
  const u = state.user; if (!u) return;
  const db: any = {};
  if (patch.name !== undefined) db.name = patch.name;
  if (patch.dob !== undefined) db.dob = patch.dob || null;
  if (patch.bloodType !== undefined) db.blood_type = patch.bloodType || null;
  if (patch.age !== undefined) db.age = patch.age;
  if (patch.gender !== undefined) db.gender = patch.gender;
  if (patch.heightCm !== undefined) db.height_cm = patch.heightCm;
  if (patch.weightKg !== undefined) db.weight_kg = patch.weightKg;
  if (patch.phone !== undefined) db.phone = patch.phone;
  if (patch.address !== undefined) db.address = patch.address;
  if (patch.lastCheckup !== undefined) db.last_checkup = patch.lastCheckup || null;
  if (patch.emergencyContact !== undefined) db.emergency_contact = patch.emergencyContact;
  if (patch.allergiesText !== undefined) db.allergies_text = patch.allergiesText;
  if (patch.conditionsText !== undefined) db.conditions_text = patch.conditionsText;
  if (patch.medicationsText !== undefined) db.medications_text = patch.medicationsText;
  const { error } = await supabase.from("profiles").update(db).eq("user_id", u.id);
  if (error) throw error;
  set(s => ({ user: s.user ? { ...s.user, ...patch } : s.user }));
};

// allergies
export const addAllergy = async (a: { name: string; severity: Severity; notes?: string }) => {
  const u = state.user!; const { data, error } = await supabase.from("allergies").insert({ user_id: u.id, ...a }).select().single();
  if (error) throw error;
  set(s => ({ allergies: [mapAllergy(data), ...s.allergies] }));
};
export const removeAllergy = async (id: string) => {
  const { error } = await supabase.from("allergies").delete().eq("id", id);
  if (error) throw error;
  set(s => ({ allergies: s.allergies.filter(x => x.id !== id) }));
};

// medications
export const addMedication = async (m: { name: string; dose: string; frequency: string; prescriber?: string }) => {
  const u = state.user!; const { data, error } = await supabase.from("medications").insert({ user_id: u.id, ...m }).select().single();
  if (error) throw error;
  set(s => ({ medications: [mapMed(data), ...s.medications] }));
};
export const removeMedication = async (id: string) => {
  const { error } = await supabase.from("medications").delete().eq("id", id);
  if (error) throw error;
  set(s => ({ medications: s.medications.filter(x => x.id !== id) }));
};

// conditions
export const addCondition = async (c: { name: string; notes?: string }) => {
  const u = state.user!; const { data, error } = await supabase.from("conditions").insert({ user_id: u.id, ...c }).select().single();
  if (error) throw error;
  set(s => ({ conditions: [mapCond(data), ...s.conditions] }));
};
export const removeCondition = async (id: string) => {
  const { error } = await supabase.from("conditions").delete().eq("id", id);
  if (error) throw error;
  set(s => ({ conditions: s.conditions.filter(x => x.id !== id) }));
};

// files (with storage)
export const addFile = async (f: { kind: FileKind; title: string; category?: string; date: string; notes?: string; mime: string; data: string }) => {
  const u = state.user!;
  // data is dataURL — convert to Blob
  const blob = await (await fetch(f.data)).blob();
  const ext = (f.mime.split("/")[1] || "bin").split("+")[0];
  const path = `${u.id}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("medical-files").upload(path, blob, { contentType: f.mime, upsert: false });
  if (up.error) throw up.error;
  const { data, error } = await supabase.from("medical_files").insert({
    user_id: u.id, kind: f.kind, title: f.title, category: f.category || null, doc_date: f.date, notes: f.notes || null, mime: f.mime, storage_path: path,
  }).select().single();
  if (error) throw error;
  const rec = await mapFileRow(data);
  set(s => ({ files: [rec, ...s.files] }));
};
export const removeFile = async (id: string) => {
  const file = state.files.find(f => f.id === id);
  if (file) await supabase.storage.from("medical-files").remove([file.storagePath]);
  const { error } = await supabase.from("medical_files").delete().eq("id", id);
  if (error) throw error;
  set(s => ({ files: s.files.filter(x => x.id !== id) }));
};
export const updateFile = async (id: string, patch: { title?: string; category?: string | null; date?: string; notes?: string | null }) => {
  const dbPatch: any = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.date !== undefined) dbPatch.doc_date = patch.date;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  const { error } = await supabase.from("medical_files").update(dbPatch).eq("id", id);
  if (error) throw error;
  set(s => ({ files: s.files.map(f => f.id === id ? { ...f, ...patch, date: patch.date ?? f.date } : f) }));
};

// share
const writeShare = async (patch: { enabled?: boolean; token?: string; expires_at?: string | null }) => {
  const u = state.user!;
  const { data, error } = await supabase.from("share_settings").update(patch).eq("user_id", u.id).select().single();
  if (error) throw error;
  set({ share: { enabled: data.enabled, token: data.token, expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : null } });
};
export const enableShare = (durationMs: number | null) => writeShare({ enabled: true, expires_at: durationMs ? new Date(Date.now() + durationMs).toISOString() : null });
export const disableShare = () => writeShare({ enabled: false });
export const rotateShareToken = () => {
  const arr = new Uint8Array(16); crypto.getRandomValues(arr);
  const token = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
  return writeShare({ token });
};
export const isShareLive = (s: ShareState = state.share) => s.enabled && (s.expiresAt === null || s.expiresAt > Date.now());

// emergency contacts
export const addContact = async (c: { name: string; relation: string; phone: string }) => {
  const u = state.user!; const { data, error } = await supabase.from("emergency_contacts").insert({ user_id: u.id, ...c }).select().single();
  if (error) throw error;
  set(s => s.user ? { user: { ...s.user, emergencyContacts: [...s.user.emergencyContacts, { id: data.id, name: data.name, relation: data.relation ?? "", phone: data.phone }] } } : {});
};
export const removeContact = async (id: string) => {
  const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
  if (error) throw error;
  set(s => s.user ? { user: { ...s.user, emergencyContacts: s.user.emergencyContacts.filter(c => c.id !== id) } } : {});
};

// theme
export const setTheme = (t: "light" | "dark") => {
  set({ theme: t });
  document.documentElement.classList.toggle("dark", t === "dark");
  try { localStorage.setItem("medisync-theme", t); } catch {}
};
if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", initial.theme === "dark");

// data export — pulls current cached state
export const exportData = () => JSON.stringify({
  user: state.user, allergies: state.allergies, medications: state.medications, conditions: state.conditions, files: state.files.map(f => ({ ...f, signedUrl: undefined })),
}, null, 2);
export const importData = async (_json: string) => { throw new Error("Cloud import not supported in this version."); };
export const wipeAll = async () => {
  const u = state.user!;
  const paths = state.files.map(f => f.storagePath);
  if (paths.length) await supabase.storage.from("medical-files").remove(paths);
  await Promise.all([
    supabase.from("allergies").delete().eq("user_id", u.id),
    supabase.from("medications").delete().eq("user_id", u.id),
    supabase.from("conditions").delete().eq("user_id", u.id),
    supabase.from("emergency_contacts").delete().eq("user_id", u.id),
    supabase.from("medical_files").delete().eq("user_id", u.id),
  ]);
  set({ allergies: [], medications: [], conditions: [], files: [], user: state.user ? { ...state.user, emergencyContacts: [] } : null });
};

// Public emergency RPC
export const fetchEmergencyByToken = async (token: string) => {
  const { data, error } = await supabase.rpc("get_emergency_by_token", { _token: token });
  if (error) throw error;
  return data as null | { profile: any; allergies: any[]; medications: any[]; conditions: any[]; contacts: any[] };
};

// helper hook for components that need to wait for auth
export const useBootstrap = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => { initAuth(); setReady(true); }, []);
  return ready;
};
