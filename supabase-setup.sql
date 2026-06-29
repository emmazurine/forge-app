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
-- Then go to: Database → Replication → enable verifications table

-- ─────────────────────────────────────────────────────────────
-- STORAGE: go to Storage in the dashboard and:
--   1. Create a new bucket called:  verification-docs  (set to PRIVATE)
--   2. Add storage policies (Storage → verification-docs → Policies):
--      Policy: "Allow upload"  |  INSERT  |  definition: true
--      Policy: "Allow read"    |  SELECT  |  definition: true
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
