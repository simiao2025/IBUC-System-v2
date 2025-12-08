import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { DracmasAPI, TurmasAPI, AlunosAPI } from '../../lib/api';
import { useApp } from '../../context/AppContext';

interface AlunoDracma {
  aluno_id: string;
  nome: string;
  quantidade: number;
}

interface TurmaOption {
  id: string;
  nome: string;
}

const DracmasLaunch: React.FC = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turmaId, setTurmaId] = useState('');
  const [tipo, setTipo] = useState('assiduidade');
  const [descricao, setDescricao] = useState('');
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [alunos, setAlunos] = useState<AlunoDracma[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const response = await TurmasAPI.listar();
        const lista = response.data as any[];
        setTurmas(lista.map(t => ({ id: t.id, nome: t.nome })));
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };

    carregarTurmas();
  }, []);

  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunos([]);
        return;
      }

      try {
        const response = await AlunosAPI.listar({ turma_id: turmaId });
        const lista = response.data as any[];
        setAlunos(lista.map(a => ({ aluno_id: a.id, nome: a.nome, quantidade: 0 })));
      } catch (error) {
        console.error('Erro ao carregar alunos da turma:', error);
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  const handleQuantidadeChange = (alunoId: string, value: string) => {
    const quantidade = parseInt(value || '0', 10) || 0;
    setAlunos(prev => prev.map(a => a.aluno_id === alunoId ? { ...a, quantidade } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turmaId) {
      alert('Selecione a turma.');
      return;
    }

    const transacoes = alunos.filter(a => a.quantidade !== 0).map(a => ({
      aluno_id: a.aluno_id,
      quantidade: a.quantidade,
    }));

    if (transacoes.length === 0) {
      alert('Informe pelo menos uma quantidade de Drácmas para algum aluno.');
      return;
    }

    if (!currentUser) {
      alert('Usuário não autenticado.');
      return;
    }

    setLoading(true);
    try {
      await DracmasAPI.lancarLote({
        turma_id: turmaId,
        data,
        tipo,
        descricao,
        registrado_por: currentUser.id,
        transacoes,
      });
      alert('Drácmas lançadas com sucesso!');
      setAlunos(prev => prev.map(a => ({ ...a, quantidade: 0 })));
    } catch (error) {
      console.error('Erro ao lançar Drácmas:', error);
      alert('Erro ao lançar Drácmas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Lançamento de Drácmas</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <Select value={turmaId} onChange={e => setTurmaId(e.target.value)} required>
                <option value="">Selecione a turma</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Recompensa</label>
              <Select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="assiduidade">Assiduidade</option>
                <option value="tarefa">Tarefa</option>
                <option value="participacao">Participação</option>
                <option value="pergunta">Pergunta Respondida</option>
                <option value="outro">Outro</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alunos da Turma</label>
            <div className="space-y-2">
              {alunos.length === 0 && (
                <p className="text-sm text-gray-600">Nenhum aluno encontrado para a turma selecionada.</p>
              )}
              {alunos.map(aluno => (
                <div key={aluno.aluno_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{aluno.nome}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Drácmas</span>
                    <Input
                      type="number"
                      value={aluno.quantidade}
                      onChange={e => handleQuantidadeChange(aluno.aluno_id, e.target.value)}
                      className="w-24 text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" loading={loading}>
              Salvar Lançamento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DracmasLaunch;
