import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { DracmasAPI } from './dracmas.service';
import { TurmasAPI } from '../../services/turma.service';
import { AlunosAPI } from '../students/aluno.service';
import { useApp } from '../../context/AppContext';
import AccessControl from '../../components/AccessControl';

interface AlunoDracma {
  aluno_id: string;
  nome: string;
  quantidade: number;
}

interface TurmaOption {
  id: string;
  nome: string;
}

const DracmasLaunchManagement: React.FC = () => {
  const { currentUser } = useApp();
  const [criterios, setCriterios] = useState<{ codigo: string; nome: string; quantidade_padrao: number }[]>([]);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turmaId, setTurmaId] = useState('');
  const [tipo, setTipo] = useState(''); // Inicializa vazio, será setado ao carregar critérios
  const [descricao, setDescricao] = useState('');
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [alunos, setAlunos] = useState<AlunoDracma[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        // Carregar Turmas
        const params = currentUser?.id ? { professor_id: currentUser.id } : undefined;
        const listaTurmas = (await TurmasAPI.listar(params as any)) as any[];
        setTurmas((Array.isArray(listaTurmas) ? listaTurmas : []).map(t => ({ id: t.id, nome: t.nome })));

        // Carregar Critérios
        const listaCriterios: any = await DracmasAPI.listarCriterios();
        const ativos = Array.isArray(listaCriterios) ? listaCriterios.filter((c: any) => c.ativo) : [];
        setCriterios(ativos);
        
        if (ativos.length > 0) {
          setTipo(ativos[0].codigo);
        } else {
          setTipo('assiduidade');
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunos([]);
        return;
      }

      try {
        const lista = (await AlunosAPI.listar({ turma_id: turmaId })) as any[];
        setAlunos((Array.isArray(lista) ? lista : []).map(a => ({ aluno_id: a.id, nome: a.nome, quantidade: 0 })));
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
    <AccessControl allowedRoles={['super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral']}>
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
              <Select value={turmaId} onChange={val => setTurmaId(val)} required>
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
              <Select 
                value={tipo} 
                onChange={val => {
                  const novoTipo = val;
                  setTipo(novoTipo);
                  
                  // Opcional: Auto-preencher quantidade para todos alunos se o critério tiver padrão
                  // const criterio = criterios.find(c => c.codigo === novoTipo);
                  // if (criterio && criterio.quantidade_padrao > 0) {
                  //   if (confirm(`Deseja aplicar o valor padrão de ${criterio.quantidade_padrao} drácmas para todos?`)) {
                  //      setAlunos(prev => prev.map(a => ({ ...a, quantidade: criterio.quantidade_padrao })));
                  //   }
                  // }
                }}
              >
                {criterios.length > 0 ? (
                  criterios.map(c => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))
                ) : (
                  <option value="assiduidade">Assiduidade (Padrão)</option>
                )}
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
  </AccessControl>
);
};

export default DracmasLaunchManagement;
