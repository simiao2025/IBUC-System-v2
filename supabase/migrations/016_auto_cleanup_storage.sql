-- ============================================
-- Auto-cleanup for temporary storage files
-- ============================================

-- 1. Create cleanup function
-- This function deletes objects from the 'documentos' bucket
-- that are in temporary folders and older than 24 hours.
CREATE OR REPLACE FUNCTION public.cleanup_temp_storage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete old batch bulletins
  DELETE FROM storage.objects
  WHERE bucket_id = 'documentos'
  AND name LIKE 'boletins-lote/%' 
  AND created_at < now() - interval '24 hours';
  
  -- Log cleanup (optional, useful for debugging)
  -- RAISE NOTICE 'Cleaned up old temporary files';
END;
$$;

-- 2. Schedule the job using pg_cron
-- We wrap this in a DO block to ensure it only runs if pg_cron is enabled
-- (Standard Supabase instances have it)
DO $$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule if exists to avoid duplicates/errors on re-run
    PERFORM cron.unschedule('cleanup-temp-files');
    
    -- Schedule daily at 03:00 AM UTC
    PERFORM cron.schedule(
      'cleanup-temp-files',
      '0 3 * * *', 
      'SELECT public.cleanup_temp_storage()'
    );
  END IF;
END
$$;
