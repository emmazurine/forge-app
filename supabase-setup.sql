-- Run this in your Supabase project: SQL Editor → New query → paste and run

-- 1. Verification records table
CREATE TABLE verifications (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT        NOT NULL UNIQUE,
  method       TEXT        NOT NULL CHECK (method IN ('email', 'id')),
  email        TEXT,
  file_name    TEXT,
  storage_key  TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON verifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Enable Row Level Security (open policies for prototype)
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all" ON verifications USING (true) WITH CHECK (true);

-- 4. Enable Realtime on this table
ALTER TABLE verifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE verifications;
-- (Dashboard equivalent: Database → Replication → enable this table for the
-- supabase_realtime publication — but the SQL above does the same thing and
-- doesn't depend on where that toggle lives in a given dashboard version.)

-- ─────────────────────────────────────────────────────────────
-- STORAGE: go to Storage in the dashboard and:
--   1. Create a new bucket called:  verification-docs  (set to PRIVATE)
--   2. Add storage policies (Storage → verification-docs → Policies):
--      Policy: "Allow upload"  |  INSERT  |  definition: true
--      Policy: "Allow read"    |  SELECT  |  definition: true
-- ─────────────────────────────────────────────────────────────

-- 5. Ambassador applications table
CREATE TABLE ambassador_applications (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       TEXT        NOT NULL UNIQUE,
  pitch         TEXT        NOT NULL,
  event_types   TEXT[]      NOT NULL DEFAULT '{}',
  reach         TEXT        NOT NULL,
  availability  TEXT[]      NOT NULL DEFAULT '{}',
  status        TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON ambassador_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all" ON ambassador_applications USING (true) WITH CHECK (true);

ALTER TABLE ambassador_applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE ambassador_applications;

-- ─────────────────────────────────────────────────────────────
-- REVIEWING APPLICATIONS (manual, no admin UI yet):
--   Go to: Table Editor → ambassador_applications
--   Change a row's `status` to 'approved' or 'rejected'.
--   The app picks up the change via Realtime within seconds —
--   same mechanism as student verification below.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- EDGE FUNCTION (automated AI verification):
--
-- 1. Install Supabase CLI:
--      npm install -g supabase
--
-- 2. From the project root, link your project:
--      npx supabase login
--      npx supabase link --project-ref YOUR_PROJECT_REF
--
-- 3. Set the Anthropic API key as a secret:
--      npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
--
-- 4. Deploy the function:
--      npx supabase functions deploy verify-document
--
-- 5. Set up the Database Webhook (triggers function on each upload):
--    Go to: Database → Webhooks → Create a new hook
--      Name:        verify-document
--      Table:       verifications
--      Events:      INSERT
--      Type:        Supabase Edge Functions
--      Function:    verify-document
--
-- That's it. When a user uploads a transcript, the function runs Claude
-- on the document and automatically sets status to 'verified' or 'rejected'.
-- The app picks up the change via Realtime within seconds.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- STORAGE: profile pictures
-- go to Storage in the dashboard and:
--   1. Create a new bucket called:  avatars  (set to PUBLIC)
--   2. Add storage policies (Storage → avatars → Policies):
--      Policy: "Public read"      | SELECT | definition: true
--      Policy: "Owner can upload" | INSERT | definition: (storage.foldername(name))[1] = auth.uid()::text
--      Policy: "Owner can update" | UPDATE | definition: (storage.foldername(name))[1] = auth.uid()::text
--      Policy: "Owner can delete" | DELETE | definition: (storage.foldername(name))[1] = auth.uid()::text
--
-- The app uploads to `avatars/{user_id}/avatar.jpg`, so the folder-name
-- check above ensures a user can only write their own avatar. Public read
-- means anyone can view the resulting image URL, which is fine for profile
-- pictures (same as any public avatar on the web).
-- ─────────────────────────────────────────────────────────────
