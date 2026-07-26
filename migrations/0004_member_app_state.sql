ALTER TABLE club_members ADD COLUMN sync_token TEXT;
ALTER TABLE club_members ADD COLUMN app_state_json TEXT;
ALTER TABLE club_members ADD COLUMN app_state_updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_club_members_sync_token
ON club_members (email, sync_token);
