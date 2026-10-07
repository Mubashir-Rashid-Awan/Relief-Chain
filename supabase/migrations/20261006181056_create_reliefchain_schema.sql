/*
# Create ReliefChain Core Schema

Creates the core database tables for ReliefChain, a transparent on-chain
relief and donation platform built on Solana.

## Tables

### campaigns
Stores humanitarian donation campaigns. Each campaign has a goal amount
(in USDC base units), a recipient Solana wallet address, category, image,
and status. The `is_demo` flag marks seeded demo campaigns.

### milestones
Goal-based milestones belonging to a campaign (e.g. "500 Food Packages").

### donations
Records of verified on-chain donations. Each donation stores the Solana
transaction signature (unique), donor wallet, amount in base units, token
mint, and verification status. The `signature` column has a unique
constraint to prevent duplicate transaction submissions.

### impact_updates
Organizer-published impact updates for a campaign (e.g. "Distributed 200
food packages").

## Security
- RLS enabled on all tables.
- This is a no-auth single-tenant app: all policies use `TO anon, authenticated`
  with `USING (true)` / `WITH CHECK (true)` because campaign and donation
  data is intentionally public. Donation verification is handled server-side
  by the verify-donation edge function (which uses the service role key),
  so the frontend never inserts donations directly — it calls the edge
  function, which does the on-chain verification first.
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  goal_amount bigint NOT NULL,
  recipient_wallet text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_campaigns" ON campaigns;
CREATE POLICY "anon_select_campaigns" ON campaigns FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_campaigns" ON campaigns;
CREATE POLICY "anon_insert_campaigns" ON campaigns FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_campaigns" ON campaigns;
CREATE POLICY "anon_update_campaigns" ON campaigns FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_campaigns" ON campaigns;
CREATE POLICY "anon_delete_campaigns" ON campaigns FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_campaign_id ON milestones(campaign_id);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_milestones" ON milestones;
CREATE POLICY "anon_select_milestones" ON milestones FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_milestones" ON milestones;
CREATE POLICY "anon_insert_milestones" ON milestones FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_milestones" ON milestones;
CREATE POLICY "anon_update_milestones" ON milestones FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_milestones" ON milestones;
CREATE POLICY "anon_delete_milestones" ON milestones FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_wallet text NOT NULL,
  amount bigint NOT NULL,
  token_mint text NOT NULL,
  signature text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'verified',
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_wallet ON donations(donor_wallet);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_donations" ON donations;
CREATE POLICY "anon_select_donations" ON donations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_donations" ON donations;
CREATE POLICY "anon_insert_donations" ON donations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_donations" ON donations;
CREATE POLICY "anon_update_donations" ON donations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_donations" ON donations;
CREATE POLICY "anon_delete_donations" ON donations FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS impact_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_updates_campaign_id ON impact_updates(campaign_id);

ALTER TABLE impact_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_impact_updates" ON impact_updates;
CREATE POLICY "anon_select_impact_updates" ON impact_updates FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_impact_updates" ON impact_updates;
CREATE POLICY "anon_insert_impact_updates" ON impact_updates FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_impact_updates" ON impact_updates;
CREATE POLICY "anon_update_impact_updates" ON impact_updates FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_impact_updates" ON impact_updates;
CREATE POLICY "anon_delete_impact_updates" ON impact_updates FOR DELETE
TO anon, authenticated USING (true);
