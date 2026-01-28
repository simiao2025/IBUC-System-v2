-- MIGRATION: Add updated_at column to materiais table
-- Desc: Adds updated_at timestamp column to track material updates

DO $$
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'updated_at') THEN
        ALTER TABLE materiais ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
