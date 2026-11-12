-- Delivery receipts only. Registration/contact data remains in the existing table.
CREATE TABLE IF NOT EXISTS paddle_pint_confirmation_emails (
  submission_id INTEGER PRIMARY KEY REFERENCES paddle_pint_submissions(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'failed')),
  provider_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
