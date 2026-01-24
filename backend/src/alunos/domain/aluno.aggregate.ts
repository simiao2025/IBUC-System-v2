import { BadRequestException } from '@nestjs/common';

/**
 * AlunoAggregate
 * 
 * Centraliza as regras de domínio da entidade Aluno.
 * Responsável por garantir que os dados pessoais, saúde e endereço
 * mantenham a integridade idependente do formato de persistência.
 */
export class AlunoAggregate {
  private constructor(private readonly props: any) {}

  static fromCreateDto(dto: any): AlunoAggregate {
    const cleanCpf = AlunoAggregate.normalizeCpf(dto.cpf);
    
    return new AlunoAggregate({
      ...dto,
      cpf: cleanCpf,
      status: dto.status || 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  static fromUpdateDto(dto: any): AlunoAggregate {
    const cleanCpf = dto.cpf ? AlunoAggregate.normalizeCpf(dto.cpf) : undefined;
    
    return new AlunoAggregate({
      ...dto,
      cpf: cleanCpf,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Converte o Aggregate para o formato JSON bruto esperado pelo Supabase
   * suportando a transição híbrida (Campos Planos + JSONB).
   */
  toDatabasePersistence() {
    const persistenceData = { ...this.props };

    // Regra: Se houver campos de endereço embutidos no objeto 'endereco', 
    // nós os preservamos para manter compatibilidade com o schema JSONB atual.
    // Futuramente esta lógica migrará para colunas puramente planas.
    if (persistenceData.endereco && typeof persistenceData.endereco !== 'object') {
      try {
        persistenceData.endereco = JSON.parse(persistenceData.endereco);
      } catch (e) {
        // Se falhar no parse, mantém como está ou inicializa vazio
        persistenceData.endereco = persistenceData.endereco || {};
      }
    }

    return persistenceData;
  }

  /**
   * Lógica centralizada de normalização de CPF (Remover pontuação)
   */
  static normalizeCpf(cpf: string | undefined): string | null {
    if (!cpf) return null;
    const clean = String(cpf).replace(/\D/g, '');
    return clean || null;
  }

  /**
   * Lógica de fallback para e-mail do usuário
   */
  generateUserEmail(): string {
    const cpf = AlunoAggregate.normalizeCpf(this.props.cpf);
    if (this.props.email_responsavel) return this.props.email_responsavel;
    if (cpf) return `${cpf}@aluno.ibuc.sistema`;
    
    throw new BadRequestException('E-mail do responsável ou CPF é necessário para gerar identificação do aluno');
  }

  get id() { return this.props.id; }
  get cpf() { return this.props.cpf; }
  get nome() { return this.props.nome; }
  get polo_id() { return this.props.polo_id; }
}
