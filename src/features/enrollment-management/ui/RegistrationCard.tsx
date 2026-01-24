import React from 'react';
import type { PreMatricula } from '@/shared/model/database';

const formatLocalDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

interface RegistrationCardProps {
  data: PreMatricula;
  photoUrl?: string | null;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ data, photoUrl }) => {
  return (
    <div className="registration-card p-8 bg-white text-black max-w-[210mm] mx-auto border shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center text-white font-bold text-2xl">
            IBUC
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase">Instituto Bíblico do Único Caminho</h1>
            <p className="text-sm">Ficha de Matrícula - Educação Cristã</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold">PROTOCOLO:</p>
          <p className="text-lg font-mono font-bold">{data.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Foto e Dados Principais */}
        <div className="col-span-1">
          <div className="w-32 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden bg-gray-50 mb-2">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto 3x4" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-gray-400 text-center px-1">FOTO 3x4</span>
            )}
          </div>
          <p className="text-[10px] text-center text-gray-500 uppercase">Espaço para Foto</p>
        </div>

        <div className="col-span-3 space-y-4">
          <section>
            <h2 className="text-xs font-bold bg-gray-100 px-2 py-1 mb-2 uppercase border-l-4 border-gray-800">Dados do Aluno</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-2">
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Nome Completo</span>
                <span className="font-medium">{data.nome_completo}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">CPF</span>
                <span>{data.cpf}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">RG / Órgão</span>
                <span>{data.rg || 'N/A'} {data.rg_orgao ? `- ${data.rg_orgao}` : ''}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Data de Nascimento</span>
                <span>{formatLocalDate(data.data_nascimento)}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Sexo</span>
                <span>{data.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Nacionalidade</span>
                <span>{data.nacionalidade || 'Brasileira'}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Naturalidade</span>
                <span>{data.naturalidade || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold bg-gray-100 px-2 py-1 mb-2 uppercase border-l-4 border-gray-800">Endereço Residencial</h2>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-2">
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Logradouro</span>
                <span>{data.endereco.rua}, {data.endereco.numero}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Bairro</span>
                <span>{data.endereco.bairro}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">Cidade/UF</span>
                <span>{data.endereco.city || data.endereco.cidade} - {data.endereco.state || data.endereco.estado}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 block uppercase">CEP</span>
                <span>{data.endereco.cep}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <section>
          <h2 className="text-xs font-bold bg-gray-100 px-2 py-1 mb-2 uppercase border-l-4 border-gray-800">Responsáveis Legais</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div className="border border-gray-200 p-2 rounded">
              <span className="text-[10px] font-bold text-gray-600 block uppercase border-b mb-1">Responsável 1 ({data.tipo_parentesco || 'Principal'})</span>
              <p className="font-medium">{data.nome_responsavel || 'N/A'}</p>
              <p className="text-[10px]">CPF: {data.cpf_responsavel || 'N/A'}</p>
              <p className="text-[10px]">TEL: {data.telefone_responsavel}</p>
              <p className="text-[10px]">EMAIL: {data.email_responsavel}</p>
            </div>
            {data.nome_responsavel_2 && (
              <div className="border border-gray-200 p-2 rounded">
                <span className="text-[10px] font-bold text-gray-600 block uppercase border-b mb-1">Responsável 2 ({data.tipo_parentesco_2 || 'Secundário'})</span>
                <p className="font-medium">{data.nome_responsavel_2}</p>
                <p className="text-[10px]">CPF: {data.cpf_responsavel_2 || 'N/A'}</p>
                <p className="text-[10px]">TEL: {data.telefone_responsavel_2 || 'N/A'}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold bg-red-50 text-red-900 px-2 py-1 mb-2 uppercase border-l-4 border-red-800">Saúde e Segurança (Ficha Médica)</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm p-2 border border-red-100 rounded bg-red-50/10">
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Alergias</span>
              <span className="font-medium">{data.alergias || 'Nenhuma'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Restrição Alimentar</span>
              <span className="font-medium">{data.restricao_alimentar || 'Nenhuma'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Medicação Contínua</span>
              <span className="font-medium">{data.medicacao_continua || 'Nenhuma'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Doenças Crônicas</span>
              <span className="font-medium">{data.doencas_cronicas || 'Nenhuma'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Emergência</span>
              <span className="font-bold">{data.contato_emergencia_nome}</span>
              <span className="block text-[10px]">{data.contato_emergencia_telefone}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-red-700 block uppercase">Autorização Médica</span>
              <span className="font-bold">{data.autorizacao_medica ? '✓ SIM (CONCEDIDA)' : '✗ NÃO'}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold bg-gray-100 px-2 py-1 mb-2 uppercase border-l-4 border-gray-800">Informações Institucionais</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Escola de Origem</span>
              <span>{data.escola_origem || 'Não informada'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Observações</span>
              <span className="text-[10px]">{data.observacoes || 'Sem observações'}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-8 text-center">
        <div className="border-t border-black pt-2">
          <p className="text-xs">Assinatura do Responsável</p>
        </div>
        <div className="border-t border-black pt-2">
          <p className="text-xs">Assinatura da Secretaria / Polo</p>
        </div>
      </div>

      <div className="mt-8 text-[9px] text-gray-400 text-center border-t pt-4">
        Este documento é uma ficha de pré-matrícula sujeita a validação oficial pela diretoria do IBUC.
        Gerado automaticamente em {new Date().toLocaleString('pt-BR')}.
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .registration-card, .registration-card * {
            visibility: visible;
          }
          .registration-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
