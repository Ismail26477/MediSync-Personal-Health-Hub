-- ============= helper: updated_at trigger =============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============= profiles =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  dob DATE,
  blood_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER profiles_set_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= allergies =============
CREATE TYPE public.allergy_severity AS ENUM ('low','moderate','high','severe');
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  severity public.allergy_severity NOT NULL DEFAULT 'moderate',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own allergies select" ON public.allergies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own allergies insert" ON public.allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own allergies update" ON public.allergies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own allergies delete" ON public.allergies FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX allergies_user_idx ON public.allergies(user_id, created_at DESC);

-- ============= medications =============
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT,
  prescriber TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own medications select" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own medications insert" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own medications update" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own medications delete" ON public.medications FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX medications_user_idx ON public.medications(user_id, created_at DESC);

-- ============= conditions =============
CREATE TABLE public.conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conditions select" ON public.conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own conditions insert" ON public.conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own conditions update" ON public.conditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own conditions delete" ON public.conditions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX conditions_user_idx ON public.conditions(user_id, created_at DESC);

-- ============= emergency contacts =============
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts select" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own contacts insert" ON public.emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own contacts update" ON public.emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own contacts delete" ON public.emergency_contacts FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX contacts_user_idx ON public.emergency_contacts(user_id, created_at DESC);

-- ============= medical files (metadata; binary in storage) =============
CREATE TYPE public.file_kind AS ENUM ('prescription','report','scan');
CREATE TABLE public.medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.file_kind NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  doc_date DATE,
  notes TEXT,
  mime TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own files select" ON public.medical_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own files insert" ON public.medical_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own files update" ON public.medical_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own files delete" ON public.medical_files FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX files_user_idx ON public.medical_files(user_id, kind, created_at DESC);

-- ============= share settings =============
CREATE TABLE public.share_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.share_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own share select" ON public.share_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own share insert" ON public.share_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own share update" ON public.share_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own share delete" ON public.share_settings FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER share_set_updated BEFORE UPDATE ON public.share_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= secure RPC: emergency public lookup by token =============
-- Returns minimal aggregated data only when share is enabled and not expired.
CREATE OR REPLACE FUNCTION public.get_emergency_by_token(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  _share share_settings%ROWTYPE;
  _result JSONB;
BEGIN
  SELECT * INTO _share FROM public.share_settings WHERE token = _token;
  IF _share IS NULL OR _share.enabled = false OR (_share.expires_at IS NOT NULL AND _share.expires_at < now()) THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'profile', (SELECT to_jsonb(p) - 'id' - 'user_id' FROM public.profiles p WHERE p.user_id = _share.user_id),
    'allergies', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'severity',severity,'notes',notes) ORDER BY created_at DESC) FROM public.allergies WHERE user_id = _share.user_id), '[]'::jsonb),
    'medications', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'dose',dose,'frequency',frequency,'prescriber',prescriber) ORDER BY created_at DESC) FROM public.medications WHERE user_id = _share.user_id), '[]'::jsonb),
    'conditions', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'notes',notes) ORDER BY created_at DESC) FROM public.conditions WHERE user_id = _share.user_id), '[]'::jsonb),
    'contacts', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'relation',relation,'phone',phone) ORDER BY created_at DESC) FROM public.emergency_contacts WHERE user_id = _share.user_id), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_emergency_by_token(TEXT) TO anon, authenticated;

-- ============= signup trigger: create profile + sealed share token =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.share_settings (user_id, enabled, token, expires_at)
  VALUES (NEW.id, false, encode(gen_random_bytes(16), 'hex'), NULL);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= storage bucket =============
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "own medical files select" ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own medical files insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own medical files update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own medical files delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);