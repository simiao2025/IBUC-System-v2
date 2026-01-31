-- Migration: update_eventos_table_for_gallery_and_banners
-- Adds status, category, highlight flag, media JSONB, and CTA link.

DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'status') THEN
        ALTER TABLE eventos ADD COLUMN status TEXT DEFAULT 'agendado';
    END IF;

    -- Add categoria column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'categoria') THEN
        ALTER TABLE eventos ADD COLUMN categoria TEXT DEFAULT 'geral';
    END IF;

    -- Add is_destaque column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'is_destaque') THEN
        ALTER TABLE eventos ADD COLUMN is_destaque BOOLEAN DEFAULT false;
    END IF;

    -- Add midia column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'midia') THEN
        ALTER TABLE eventos ADD COLUMN midia JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add link_cta column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eventos' AND column_name = 'link_cta') THEN
        ALTER TABLE eventos ADD COLUMN link_cta TEXT;
    END IF;
END $$;
