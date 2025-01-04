-- Create race_status enum if it doesn't exist (in case it wasn't created with races table)
DO $$ BEGIN
    CREATE TYPE race_status AS ENUM ('in_progress', 'upcoming', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create race_history table
CREATE TABLE IF NOT EXISTS race_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    -- Timeline events stored as JSONB array
    timeline JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Record breakers stored as JSONB array
    record_breakers JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Memorable moments stored as JSONB array
    memorable_moments JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Full history content in Markdown
    full_history TEXT NOT NULL,
    -- SEO fields
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE race_history ENABLE ROW LEVEL SECURITY;

-- Everyone can read race history
CREATE POLICY "Everyone can read race history"
    ON race_history
    FOR SELECT
    USING (true);

-- Only authenticated users with admin role can insert/update/delete
CREATE POLICY "Only admins can insert race history"
    ON race_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()::uuid
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Only admins can update race history"
    ON race_history
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()::uuid
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()::uuid
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Only admins can delete race history"
    ON race_history
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()::uuid
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_race_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_race_history_updated_at
    BEFORE UPDATE ON race_history
    FOR EACH ROW
    EXECUTE FUNCTION update_race_history_updated_at();

-- Add indexes
CREATE INDEX idx_race_history_race_id ON race_history(race_id);
CREATE INDEX idx_race_history_updated_at ON race_history(updated_at);

-- Add comments
COMMENT ON TABLE race_history IS 'Stores historical information and notable moments for F1 races';
COMMENT ON COLUMN race_history.timeline IS 'Array of timeline events with year, title, and optional description';
COMMENT ON COLUMN race_history.record_breakers IS 'Array of record-breaking achievements with title and description';
COMMENT ON COLUMN race_history.memorable_moments IS 'Array of memorable moments with year, title, and description';
COMMENT ON COLUMN race_history.full_history IS 'Complete markdown-formatted history of the race';
COMMENT ON COLUMN race_history.meta_title IS 'SEO meta title for the race history page';
COMMENT ON COLUMN race_history.meta_description IS 'SEO meta description for the race history page';
