import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filename: string) {
  const migrationPath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log(`Running migration: ${filename}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error running migration ${filename}:`, error);
      throw error;
    }
    
    console.log(`✓ Migration ${filename} completed successfully`);
    return data;
  } catch (e) {
    console.error(`Failed to run migration ${filename}:`, e);
    throw e;
  }
}

async function main() {
  const migrationFile = process.argv[2] || 'update_materiais_schema.sql';
  
  try {
    await runMigration(migrationFile);
    console.log('\n✓ All migrations completed successfully');
    process.exit(0);
  } catch (e) {
    console.error('\n✗ Migration failed');
    process.exit(1);
  }
}

main();
