import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Loader2 } from 'lucide-react';
import { dracmasApi } from '@/entities/finance';
import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { Input } from '@/shared/ui';
import { useUI } from '@/shared/lib/providers/UIProvider';

export type DracmasCriterio = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  quantidade_padrao: number;
};

export const DracmasSettings: React.FC = () => {
  const { showFeedback } = useUI();
  const [dracmasCriterios, setDracmasCriterios] = useState<DracmasCriterio[]>([]);
  const [dracmasCriteriosLoading, setDracmasCriteriosLoading] = useState(false);
  const [showDracmasModal, setShowDracmasModal] = useState(false);
  const [editingDracma, setEditingDracma] = useState<DracmasCriterio | null>(null);
  const [dracmaForm, setDracmaForm] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    quantidade_padrao: 1
  });

  const carregarDracmasCriterios = useCallback(async () => {
    try {
      setDracmasCriteriosLoading(true);
      const data = (await dracmasApi.listCriterios()) as DracmasCriterio[];
      setDracmasCriterios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar critérios de Drácmas:', error);
      setDracmasCriterios([]);
    } finally {
      setDracmasCriteriosLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarDracmasCriterios();
  }, [carregarDracmasCriterios]);

  const toggleCriterioAtivo = async (criterio: DracmasCriterio) => {
    try {
      await dracmasApi.updateCriterio(criterio.id, { ativo: !criterio.ativo });
      await carregarDracmasCriterios();
    } catch (error) {
      console.error('Erro ao atualizar critério de Drácmas:', error);
      showFeedback('error', 'Erro', 'Não foi possível atualizar o critério.');
    }
  };

  const handleOpenDracmaModal = (criterio?: DracmasCriterio) => {
    if (criterio) {
      setEditingDracma(criterio);
      setDracmaForm({
        codigo: criterio.codigo,
        nome: criterio.nome,
        descricao: criterio.descricao || '',
        quantidade_padrao: criterio.quantidade_padrao
      });
    } else {
      setEditingDracma(null);
      setDracmaForm({
        codigo: '',
        nome: '',
        descricao: '',
        quantidade_padrao: 1
      });
    }
    setShowDracmasModal(true);
  };

  const handleSaveDracma = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDracma) {
        await dracmasApi.updateCriterio(editingDracma.id, {
          nome: dracmaForm.nome,
          descricao: dracmaForm.descricao,
          quantidade_padrao: Number(dracmaForm.quantidade_padrao)
        });
        showFeedback('success', 'Sucesso', 'Critério atualizado com sucesso!');
      } else {
        await dracmasApi.createCriterio({
          codigo: dracmaForm.codigo,
          nome: dracmaForm.nome,
          descricao: dracmaForm.descricao,
          quantidade_padrao: Number(dracmaForm.quantidade_padrao),
          ativo: true
        });
        showFeedback('success', 'Sucesso', 'Critério criado com sucesso!');
      }
      setShowDracmasModal(false);
      void carregarDracmasCriterios();
    } catch (error) {
      console.error('Erro ao salvar critÃ©rio:', error);
      showFeedback('error', 'Erro', 'Erro ao salvar critÃ©rio.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">ConfiguraÃ§Ã£o de DrÃ¡cmas (CritÃ©rios)</h2>
          <p className="text-sm text-gray-600">
            Defina quais critÃ©rios ficam ativos para lanÃ§amento e consulta.
          </p>
        </div>
        <Button onClick={() => handleOpenDracmaModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo CritÃ©rio
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">CritÃ©rios</h3>
          {dracmasCriteriosLoading && (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </div>
          )}
        </div>

        {!dracmasCriteriosLoading && dracmasCriterios.length === 0 && (
          <p className="text-sm text-gray-600">Nenhum critÃ©rio encontrado.</p>
        )}

        {dracmasCriterios.length > 0 && (
          <div className="space-y-3">
            {dracmasCriterios.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{c.nome}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        c.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.codigo}</p>
                  {c.descricao && <p className="text-sm text-gray-600 mt-1">{c.descricao}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-700">
                    PadrÃ£o: <span className="font-semibold">{c.quantidade_padrao}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDracmaModal(c)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void toggleCriterioAtivo(c)}
                  >
                    {c.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Cadastro/EdiÃ§Ã£o de DrÃ¡cmas */}
      {showDracmasModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSaveDracma}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingDracma ? 'Editar CritÃ©rio' : 'Novo CritÃ©rio'}
                  </h3>
                  <div className="space-y-4">
                    {!editingDracma && (
                      <Input
                        label="CÃ³digo (slug)"
                        value={dracmaForm.codigo}
                        onChange={e => setDracmaForm(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="ex: frequencia-ebd"
                        required
                      />
                    )}
                    <Input
                      label="Nome"
                      value={dracmaForm.nome}
                      onChange={e => setDracmaForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="ex: FrequÃªncia na EBD"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DescriÃ§Ã£o</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={dracmaForm.descricao}
                        onChange={e => setDracmaForm(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Input
                      label="Quantidade PadrÃ£o"
                      type="number"
                      value={dracmaForm.quantidade_padrao}
                      onChange={e => setDracmaForm(prev => ({ ...prev, quantidade_padrao: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <Button type="submit">
                    Salvar
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setShowDracmasModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
