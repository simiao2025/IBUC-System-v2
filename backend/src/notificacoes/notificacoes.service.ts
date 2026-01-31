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
        aluno:alunos(id, nome, cpf, data_nascimento),
        polo:polos(id, nome, codigo, email)
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
    // Buscar dados da matrícula, aluno e responsável
    const { data: matricula } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select(`
        *,
        aluno:alunos(id, nome, cpf, data_nascimento),
        polo:polos(id, nome, codigo, email)
      `)
      .eq('id', matriculaId)
      .single();

    if (!matricula || !matricula.aluno) return;

    // Buscar e-mail do responsável na pré-matrícula original ou no aluno
    // Nota: No nosso fluxo, o e-mail do responsável está na pre_matricula
    const { data: preMatricula } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .select('email_responsavel')
      .eq('cpf', matricula.aluno.cpf)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const emailDestino = preMatricula?.email_responsavel || matricula.polo?.email;

    if (!emailDestino) return;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emailDestino,
      subject: 'Matrícula Aprovada - IBUC System',
      html: `
        <h2>Boas-vindas ao IBUC!</h2>
        <p>Olá, temos o prazer de informar que a matrícula de <strong>${matricula.aluno.nome}</strong> foi aprovada.</p>
        <p>Para acessar a Área do Aluno, utilize as seguintes credenciais:</p>
        <ul>
          <li><strong>Link de Acesso:</strong> <a href="http://localhost:5173/acesso-aluno">Área do Aluno</a></li>
          <li><strong>Login (CPF):</strong> ${matricula.aluno.cpf}</li>
          <li><strong>Senha Padrão:</strong> senha123</li>
        </ul>
        <p>Recomendamos que a senha seja alterada no primeiro acesso.</p>
        <p>Polo: ${matricula.polo?.nome}</p>
      `,
    });
  }

  async enviarNotificacaoRecusa(matriculaId: string, motivo: string) {
    // Buscar dados da matrícula
    const { data: matricula } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select(`
        *,
        aluno:alunos(id, nome, cpf),
        polo:polos(id, nome)
      `)
      .eq('id', matriculaId)
      .single();

    if (!matricula || !matricula.aluno) return;

    const { data: preMatricula } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .select('email_responsavel')
      .eq('cpf', matricula.aluno.cpf)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const emailDestino = preMatricula?.email_responsavel;

    if (!emailDestino) return;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emailDestino,
      subject: 'Atualização sobre sua Pré-matrícula - IBUC System',
      html: `
        <h2>Informação sobre sua Pré-matrícula</h2>
        <p>Olá, informamos que a pré-matrícula de <strong>${matricula.aluno.nome}</strong> não pôde ser concluída neste momento.</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
        <p>Por favor, entre em contato com o polo <strong>${matricula.polo?.nome}</strong> para mais informações.</p>
      `,
    });
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

  async enviarNotificacaoListaEspera(email: string, nome: string, poloInfo?: { nome: string; endereco: string; contato: string }) {
    let poloHtml = '';
    if (poloInfo) {
      poloHtml = `
        <div style="background-color: #f3f4f6; border-left: 4px solid #b91c1c; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #b91c1c;">Polo sugerido para você:</h3>
          <p><strong>Nome:</strong> ${poloInfo.nome}</p>
          <p><strong>Endereço:</strong> ${poloInfo.endereco}</p>
          <p><strong>Contato do Coordenador:</strong> ${poloInfo.contato}</p>
        </div>
      `;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'As Matrículas do IBUC System estão ABERTAS! 🚀',
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Ótimas notícias! Acabamos de abrir um novo período de matrículas no IBUC.</p>
        ${poloHtml}
        <p>Como você estava na nossa lista de espera, estamos te avisando em primeira mão para garantir que você consiga realizar a inscrição.</p>
        <p>Acesse o link abaixo para fazer a pré-matrícula agora:</p>
        <p><a href="http://localhost:5173/" style="background-color: #b91c1c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Fazer Pré-matrícula Agora</a></p>
        <p>Se tiver qualquer dúvida, entre em contato conosco.</p>
        <p>Que Deus te abençoe!</p>
      `,
    });
  }

  async enviarNotificacaoEncerramentoModulo(poloId: string, moduloTitulo: string) {
    // 1. Buscar todos os secretários vinculados ao polo
    const { data: secretarios } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('email, nome_completo')
      .eq('polo_id', poloId)
      .in('role', ['secretario_polo', 'secretario_geral', 'diretor_polo']);

    if (!secretarios || secretarios.length === 0) return;

    const emails = secretarios.map(s => s.email);

    // 2. Enviar email coletivo ou individual
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emails,
      subject: `Notificação: Módulo ${moduloTitulo} Encerrado - IBUC System`,
      html: `
        <h2>Módulo Encerrado pela Diretoria Geral</h2>
        <p>Olá, informamos que o módulo <strong>${moduloTitulo}</strong> foi encerrado no seu polo.</p>
        <p><strong>Ação Necessária:</strong> Acesse o sistema para criar as novas turmas e realizar a migração dos alunos aprovados (Enturmação).</p>
        <p>Após a enturmação, lembre-se de configurar o Pedido de Material para gerar as cobranças.</p>
        <p>Atenciosamente,<br>Diretoria Geral - IBUC</p>
      `,
    });
  }
}






