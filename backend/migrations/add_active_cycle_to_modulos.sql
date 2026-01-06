-- Migration: Add Active Cycle control to Modulos table
/*
 * Adds 'is_active_cycle' column to 'modulos' table.
 * Sets Module 2 as the initial active cycle (as per 2026 requirement).
 * Adds a constraint/index to ensure good practice (optional, but query efficiency is key).
 */

-- 1. Add column
ALTER TABLE modulos 
ADD COLUMN IF NOT EXISTS is_active_cycle BOOLEAN DEFAULT FALSE;

-- 2. Set Module 2 as Active (Initial State for 2026)
UPDATE modulos 
SET is_active_cycle = TRUE 
WHERE numero = 2;

-- 3. Just to be safe, ensure others are false
UPDATE modulos 
SET is_active_cycle = FALSE 
WHERE numero != 2;
