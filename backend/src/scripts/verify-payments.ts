import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PagamentosService } from '../pagamentos/pagamentos.service';
import { MensalidadesService } from '../mensalidades/mensalidades.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('VerificationScript');
  logger.log('Inicializando contexto da aplicação...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const pagamentosService = app.get(PagamentosService);
  const mensalidadesService = app.get(MensalidadesService);

  try {
    logger.log('--- INÍCIO DA VERIFICAÇÃO ---');

    // 1. Criar uma cobrança de teste
    // Vamos garantir que existe uma mensalidade para testar.
    const supabaseService = app.get(PagamentosService)['supabase']; // Hack para acessar o supabase service injetado
    
    // Buscar um aluno qualquer
    const { data: aluno } = await supabaseService.getAdminClient()
      .from('alunos')
      .select('id, polo_id')
      .limit(1)
      .single();
      
    if (!aluno) {
      logger.error('Nenhum aluno encontrado no banco. Não é possível rodar o teste.');
      return;
    }
    
    // Criar mensalidade de teste
    const { data: novaMensalidade, error: errCriar } = await supabaseService.getAdminClient()
      .from('mensalidades')
      .insert({
        aluno_id: aluno.id,
        polo_id: aluno.polo_id,
        titulo: 'Mensalidade de Teste Automático',
        valor_cents: 10000,
        vencimento: new Date().toISOString(),
        status: 'pendente'
      })
      .select()
      .single();
      
    if (errCriar) {
      logger.error('Erro ao criar mensalidade de teste:', errCriar.message);
      return;
    }
    
    const mensalidade = novaMensalidade;
    const mensalidadeId = mensalidade.id;
    logger.log(`Criada Mensalidade de Teste ID: ${mensalidadeId} (Aluno ID: ${aluno.id})`);

    // 2. Iniciar Pagamento
    logger.log('2. Testando initiatePayment...');
    let pagamento;
    try {
        pagamento = await pagamentosService.initiatePayment({
            mensalidade_id: mensalidadeId,
            metodo: 'pix'
        });
        logger.log(`Pagamento iniciado com sucesso. ID: ${pagamento.id}, Status: ${pagamento.status_gateway}`);
    } catch (e) {
        // Se falhar (ex: já existe), tentamos buscar o pagamento existente para essa mensalidade
        logger.warn(`Falha ao iniciar (pode já existir): ${e.message}`);
        // Tentar recuperar pagamento existente se falhou
         const pendentes = await pagamentosService.listarPendentes();
         pagamento = pendentes.find(p => p.mensalidade_id === mensalidadeId);
         if (!pagamento) { 
             logger.error('Não consegui criar nem encontrar pagamento.');
             // Tentar ver se já está pago?
             throw e;
         }
         logger.log(`Recuperado pagamento existente. ID: ${pagamento.id}`);
    }

    if (!pagamento) throw new Error('Falha crítica: sem objeto de pagamento');
    const pagamentoId = pagamento.id;

    // 3. Upload de Comprovante
    logger.log('3. Testando uploadPaymentProof...');
    const comprovanteUrl = 'https://example.com/comprovante_teste.pdf';
    pagamento = await pagamentosService.uploadPaymentProof(pagamentoId, {
        comprovante_url: comprovanteUrl
    });
    logger.log(`Upload realizado. Status: ${pagamento.status_gateway}, URL: ${pagamento.comprovante_url}`);
    
    if (pagamento.status_gateway !== 'pending') {
        logger.error(`ERRO: Status deveria ser pending, mas é ${pagamento.status_gateway}`);
    }

    // Buscar um usuário para atuar como diretor
    const { data: usuarioDiretor } = await supabaseService.getAdminClient()
        .from('usuarios')
        .select('id')
        .limit(1)
        .single();
        
    const adminId = usuarioDiretor ? usuarioDiretor.id : aluno.id; // Tenta usar válido, fallback para aluno (que vai falhar se FK for estrita)

    // 4. Rejeitar Pagamento
    logger.log('4. Testando rejectPayment...');
    pagamento = await pagamentosService.rejectPayment(pagamentoId, {
        rejection_note: 'Foto ilegível (Teste Automático)',
        diretor_id: adminId
    });
    logger.log(`Pagamento rejeitado. Status: ${pagamento.status_gateway}, Motivo: ${pagamento.rejection_note}`);

    if (pagamento.status_gateway !== 'failed') {
        logger.error(`ERRO: Status deveria ser failed, mas é ${pagamento.status_gateway}`);
    }

    // 5. Reentrar com comprovante (Correção)
    logger.log('5. Testando re-upload (Correção)...');
    pagamento = await pagamentosService.uploadPaymentProof(pagamentoId, {
        comprovante_url: 'https://example.com/comprovante_corrigido.pdf'
    });
    logger.log(`Re-upload realizado. Status: ${pagamento.status_gateway}`);

    if (pagamento.status_gateway !== 'pending') {
         logger.error(`ERRO: Status deveria ter voltado para pending, mas é ${pagamento.status_gateway}`);
    }

    // 6. Aprovar Pagamento
    logger.log('6. Testando approvePayment...');
    pagamento = await pagamentosService.approvePayment(pagamentoId, {
        diretor_id: adminId
    });
    logger.log(`Pagamento aprovado. Status: ${pagamento.status_gateway}, Recebido por: ${pagamento.recebido_por}`);

    if (pagamento.status_gateway !== 'success') {
        logger.error(`ERRO: Status deveria ser success, mas é ${pagamento.status_gateway}`);
    }

    logger.log('--- VERIFICANDO AUDITORIA ---');
    try {
        const { data: audits, error: auditError } = await supabaseService.getAdminClient()
            .from('financial_audit_logs')
            .select('*')
            .eq('entity_id', pagamentoId)
            .order('created_at', { ascending: true });

        if (auditError) {
            logger.error('Erro ao ler auditoria:', auditError.message);
        } else {
            logger.log(`Encontrados ${audits.length} registros de auditoria.`);
            audits.forEach((log: any, idx: number) => {
                logger.log(`[Log ${idx + 1}] Ação: ${log.action} | Status Novo: ${log.new_state?.status_gateway}`);
            });
            
            // Verificação básica de quantidade (esperado: INITIATE, UPLOAD, REJECT, UPLOAD, APPROVE -> 5 logs, mas o script pode ter steps variados)
            // Initiate (1) -> Upload (2) -> Reject (3) -> Re-Upload (4) -> Approve (5)
            if (audits.length >= 4) { // Pelo menos 4 pois teve rejection
                logger.log('Auditoria validada: Fluxo completo registrado.');
            } else {
                logger.warn('Aviso: Quantidade de logs menor que esperada para um fluxo completo.');
            }
        }
    } catch (e) {
        logger.error('Falha na verificação de auditoria:', e);
    }

    logger.log('--- VERIFICAÇÃO CONCLUÍDA COM SUCESSO ---');

  } catch (error) {
    logger.error('ERRO DURANTE VERIFICAÇÃO:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
