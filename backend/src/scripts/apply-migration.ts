import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SupabaseService } from '../supabase/supabase.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('MigrationRunner');
  const app = await NestFactory.createApplicationContext(AppModule);
  const supabase = app.get(SupabaseService);

  try {
    const migrationPath = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations', '028_financial_audit_logs.sql');
    logger.log(`Lendo migration de: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
        throw new Error('Arquivo de migration não encontrado');
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    logger.log('Executando SQL...');

    // Supabase JS client doesn't expose clean raw query interface easily for DDL in some versions without rpc
    // But we can try to use the .rpc() if we had a function, or ... 
    // Actually, SupabaseService might use a direct pool or we might need to rely on an existing 'exec_sql' RPC if it exists.
    // If not, this approach fails.
    // ALTERNATIVE: Use the `psql` command line if available in the environment.
    // Let's assume we can't run DDL via client easily unless we Have a specific RPC.
    // Let's try to see if there is an RPC for executing SQL or if we can use the `postgres` library if installed. 
    // Checking package.json... I remember `pg` or `typeorm` wasn't prominent, it uses `@supabase/supabase-js`.
    
    // Fallback: Since I am an agent with `run_command`, I should try to run the migration via CLI if I can find connection string.
    // Configuring this script to FAIL intentionally to prompt me to use CLI if DDL not supported.
    
    // Wait, if I cannot execute DDL via 'supabase-js', I should check if there is a 'test-connection' or similar.
    // Let's try to assume there is a `exec_sql` function in the DB (common in some setups)
    const { error } = await supabase.getAdminClient().rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        // If RPC missing, we might try to just log that we need manual migration run.
        // But wait, the previous verifying script was running against a real DB.
        // If I can't migrate, I can't verify.
        // I will soft-fail here and suggest manual migration if this RPC doesn't exist.
        logger.error(`Erro ao executar via RPC (pode não existir): ${error.message}`);
    } else {
        logger.log('Migration aplicada com sucesso via RPC!');
    }

  } catch (error) {
    logger.error('Erro no script:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
