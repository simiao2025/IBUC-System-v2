-- Migration: eventos_rls_public
-- Allows public access to view events.

-- Enable RLS if not already enabled
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'eventos' 
        AND policyname = 'Allow public read access to eventos'
    ) THEN
        CREATE POLICY "Allow public read access to eventos" 
        ON eventos FOR SELECT 
        USING (true);
    END IF;
END $$;
