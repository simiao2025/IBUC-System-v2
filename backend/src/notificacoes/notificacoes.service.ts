import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificacoesService {
  private transporter: nodemailer.Transporter;

  constructor(private supabase: SupabaseService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async enviarNotificacaoMatricula(matriculaId: string) {
    // Buscar dados da matrícula
    const { data: matricula } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select(`
        *,
        aluno:alunos!fk_aluno(id, nome, cpf, data_nascimento),
        polo:polos!fk_polo(id, nome, codigo, email)
      `)
      .eq('id', matriculaId)
      .single();

    if (!matricula) return;

    // Enviar email para o polo
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: matricula.polo?.email,
      subject: 'Nova Pré-matrícula Recebida',
      html: `
        <h2>Nova Pré-matrícula Recebida</h2>
        <p>Protocolo: ${matricula.protocolo}</p>
        <p>Aluno: ${matricula.aluno?.nome}</p>
        <p>Polo: ${matricula.polo?.nome}</p>
      `,
    });
  }

  async enviarNotificacaoAprovacao(matriculaId: string) {
    // Implementar notificação de aprovação
    console.log('Enviando notificação de aprovação...', matriculaId);
  }

  async enviarNotificacaoRecusa(matriculaId: string, motivo: string) {
    // Implementar notificação de recusa
    console.log('Enviando notificação de recusa...', matriculaId, motivo);
  }

  async enviarCodigoRecuperacaoSenha(email: string, codigo: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Código de recuperação de senha - IBUC System',
      html: `
        <h2>Recuperação de senha</h2>
        <p>Seu código de recuperação é:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${codigo}</p>
        <p>Se você não solicitou este código, ignore este e-mail.</p>
      `,
    });
  }
}






