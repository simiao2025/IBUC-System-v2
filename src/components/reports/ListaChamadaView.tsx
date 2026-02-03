import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { TurmaService } from '../../services/turma.service';
import { PolosAPI } from '../../services/polo.service';
import { Loader2, Download, ClipboardCheck, Search, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatLocalDate } from '../../shared/utils/dateUtils';

const ListaChamadaView: React.FC = () => {
  const { currentUser } = useApp();
  const isAdminGlobal = !currentUser?.adminUser?.poloId;

  const [turmaId, setTurmaId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [polos, setPolos] = useState<{ id: string, nome: string }[]>([]);
  const [selectedPolo, setSelectedPolo] = useState(currentUser?.adminUser?.poloId || '');
  const [turmas, setTurmas] = useState<any[]>([]);

  // Carregar Polos
  useEffect(() => {
    if (isAdminGlobal) {
      PolosAPI.listar().then((data: any) => { // Removed the empty object argument
        setPolos(Array.isArray(data) ? data : []);
      });
    }
  }, [isAdminGlobal]);

  // Carregar turmas do polo selecionado
  useEffect(() => {
    if (isAdminGlobal && !selectedPolo) {
      setTurmas([]);
      return;
    }
    TurmaService.listarTurmas(selectedPolo ? { polo_id: selectedPolo } : {}).then(setTurmas);
  }, [selectedPolo, isAdminGlobal]);

  const handleGerar = async () => {
    if (!turmaId) return;
    setLoading(true);
    try {
      const res = await RelatorioService.relatorioListaChamada(turmaId);
      setData(res);
    } catch (error) {
      console.error('Erro ao gerar lista de chamada:', error);
      alert('Erro ao gerar lista.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 print:hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Configurar Lista de Chamada
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Turma</label>
            <Select value={turmaId} onChange={setTurmaId} disabled={isAdminGlobal && !selectedPolo}>
              <option value="">{isAdminGlobal && !selectedPolo ? 'Selecione um Polo...' : 'Selecione a turma...'}</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </div>
          <Button onClick={handleGerar} disabled={!turmaId || loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
            Gerar Lista
          </Button>
        </div>
      </Card>

      {data && (
        <Card className="p-10 max-w-[21cm] mx-auto bg-white shadow-lg print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-900 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase">Lista de Chamada</h2>
              <p className="text-sm font-bold text-gray-700 mt-1">
                Turma: {data.turma?.nome} | Nível: {data.turma?.nivel?.nome}
              </p>
              <p className="text-xs text-gray-600 mt-1 uppercase">Polo: {data.turma?.polo?.nome}</p>
            </div>
            <div className="text-right border-l-2 border-gray-300 pl-4">
              <p className="text-sm font-bold">Data: ____/____/________</p>
              <p className="text-xs text-gray-500 mt-1 italic leading-tight">Emitido em: {formatLocalDate(data.data_geracao)}</p>
            </div>
          </div>

          <table className="min-w-full border-collapse border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-left text-xs font-bold uppercase w-12 text-center">Nº</th>
                <th className="border border-gray-400 px-4 py-2 text-left text-xs font-bold uppercase">Nome do Aluno</th>
                <th className="border border-gray-400 px-4 py-2 text-center text-xs font-bold uppercase w-32">Assinatura / Presença</th>
              </tr>
            </thead>
            <tbody>
              {data.alunos?.map((aluno: any, index: number) => (
                <tr key={aluno.id} className="h-10">
                  <td className="border border-gray-400 px-4 py-1 text-center text-sm font-medium">{index + 1}</td>
                  <td className="border border-gray-400 px-4 py-1 text-sm">{aluno.nome}</td>
                  <td className="border border-gray-400 px-4 py-1"></td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 5) }).map((_, i) => (
                <tr key={`blank-${i}`} className="h-10 bg-gray-50/30">
                  <td className="border border-gray-400 px-4 py-1 text-center text-sm font-medium text-gray-300">{data.alunos?.length + i + 1}</td>
                  <td className="border border-gray-400 px-4 py-1 italic text-gray-300 text-xs">Espaço para aluno extraordinário</td>
                  <td className="border border-gray-400 px-4 py-1"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 grid grid-cols-2 gap-8 text-center pt-8">
            <div className="flex flex-col items-center">
              <div className="border-t border-gray-400 w-full mb-2"></div>
              <p className="text-xs font-bold uppercase">Assinatura do Monitor/Polo</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="border-t border-gray-400 w-full mb-2"></div>
              <p className="text-xs font-bold uppercase">Assinatura do Professor</p>
            </div>
          </div>

          <div className="mt-12 flex justify-end print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Imprimir Lista
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListaChamadaView;
