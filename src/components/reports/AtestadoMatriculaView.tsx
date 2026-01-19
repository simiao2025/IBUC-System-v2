import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { StudentReportsAPI } from '@/entities/student/api/student-reports.api';
import { AlunosAPI } from '@/features/student-management';
import { poloApi as PolosAPI } from '@/entities/polo';
import { Loader2, FileText, Download, FileCheck2, Search, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AtestadoMatriculaView: React.FC = () => {
  const { currentUser } = useApp();
  const isAdminGlobal = !currentUser?.adminUser?.poloId;

  const [alunoId, setAlunoId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);

  const [polos, setPolos] = useState<{ id: string, nome: string }[]>([]);
  const [selectedPolo, setSelectedPolo] = useState(currentUser?.adminUser?.poloId || '');

  // Carregar Polos
  useEffect(() => {
    if (isAdminGlobal) {
      PolosAPI.list().then((data: any) => {
        setPolos(Array.isArray(data) ? data : []);
      });
    }
  }, [isAdminGlobal]);

  // Carregar Alunos (agora dependendo do Polo)
  useEffect(() => {
    if (isAdminGlobal && !selectedPolo) {
      setAlunos([]);
      return;
    }

    const filters: any = { status: 'ativo' };
    if (selectedPolo) {
      filters.poloId = selectedPolo;
    }

    AlunosAPI.listar(filters).then(setAlunos);
  }, [selectedPolo, isAdminGlobal]);

  const handleGerar = async () => {
    if (!alunoId) return;
    setLoading(true);
    try {
      const res = await StudentReportsAPI.relatorioAtestadoMatricula(alunoId);
      setData(res);
    } catch (error) {
      console.error('Erro ao gerar atestado:', error);
      alert('Erro ao gerar atestado.');
    } finally {
      setLoading(false);
    }
  };

  const dataFormatada = data?.data_emissao ? new Date(data.data_emissao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Selecionar Aluno
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {isAdminGlobal && (
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <div className="flex items-center"><Building2 className="w-3 h-3 mr-1" /> Filtrar por Polo</div>
              </label>
              <Select value={selectedPolo} onChange={setSelectedPolo}>
                <option value="">Selecione o Polo...</option>
                {polos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </Select>
            </div>
          )}

          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1">Aluno Ativo</label>
            <Select value={alunoId} onChange={setAlunoId} disabled={isAdminGlobal && !selectedPolo}>
              <option value="">{isAdminGlobal && !selectedPolo ? 'Selecione um Polo primeiro...' : 'Selecione um aluno...'}</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Select>
          </div>
          <Button onClick={handleGerar} disabled={!alunoId || loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileCheck2 className="h-4 w-4 mr-2" />}
            Gerar Atestado
          </Button>
        </div>
      </Card>

      {data && (
        <Card className="p-16 max-w-[21cm] mx-auto bg-white shadow-lg print:shadow-none print:border-none print:p-0">
          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="IBUC Logo" className="h-20 w-auto" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 uppercase">Instituto Bíblico Unificado de Campinas</h1>
            <p className="text-sm text-gray-600">Educação Teológica de Qualidade</p>
          </div>

          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold underline">ATESTADO DE MATRÍCULA</h2>
          </div>

          {/* Texto do Atestado */}
          <div className="text-justify leading-loose text-gray-800 space-y-6 mb-16">
            <p>
              Certificamos para os devidos fins que o(a) aluno(a) <span className="font-bold">{data.aluno.nome}</span>,
              portador(a) do RG nº <span className="font-bold">{data.aluno.rg || '—'}</span> e CPF nº <span className="font-bold">{data.aluno.cpf || '—'}</span>,
              está regularmente matriculado(a) neste estabelecimento de ensino sob o protocolo <span className="font-bold">{data.matricula?.protocolo || 'NÃO INFORMADO'}</span>.
            </p>
            <p>
              O(A) referido(a) acadêmico(a) cursa atualmente o nível <span className="font-bold">{data.matricula?.turma?.nivel?.nome || '—'}</span> na turma <span className="font-bold">{data.matricula?.turma?.nome || '—'}</span>,
              referente ao período letivo de <span className="font-bold">{data.matricula?.periodo_letivo || '—'}</span>,
              no polo <span className="font-bold">{data.matricula?.polo?.nome || '—'}</span>.
            </p>
            <p>
              Por ser verdade, firmamos o presente.
            </p>
          </div>

          {/* Data e Assinatura */}
          <div className="text-center mt-20">
            <p className="mb-12">Campinas, {dataFormatada}.</p>

            <div className="mt-20 flex flex-col items-center">
              <div className="border-t border-gray-400 w-64 mb-2"></div>
              <p className="text-sm font-bold">Secretaria Acadêmica</p>
              <p className="text-xs text-gray-500 italic">Documento gerado eletronicamente pelo Sistema IBUC</p>
            </div>
          </div>

          <div className="mt-12 flex justify-end print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Imprimir / Salvar PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AtestadoMatriculaView;
