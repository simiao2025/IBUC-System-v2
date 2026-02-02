import React, { useEffect, useState, useMemo } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useApp } from '@/app/providers/AppContext';
import { CalendarModelsAPI, type CalendarModel, type CreateCalendarModelDto } from '@/features/calendar/services/calendarModels.service';
import { ModulosAPI } from '@/services/modulos.service';
import type { Modulo } from '@/types/database';
import { Trash2, Calendar, Edit, ChevronRight } from 'lucide-react';

interface CalendarModelListProps {
  onSelectModel: (model: CalendarModel) => void;
}

export const CalendarModelList: React.FC<CalendarModelListProps> = ({ onSelectModel }) => {
  const { showFeedback, showConfirm } = useApp();
  const [models, setModels] = useState<CalendarModel[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const [newModel, setNewModel] = useState<CreateCalendarModelDto>({
    nome: '',
    modulo_id: '',
    ano: new Date().getFullYear(),
    semestre: 1,
    turno: 'noite'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modelsData, modulosData] = await Promise.all([
        CalendarModelsAPI.listar(),
        ModulosAPI.listar()
      ]);
      setModels(Array.isArray(modelsData) ? modelsData : []);
      setModulos(Array.isArray(modulosData) ? modulosData : []);
    } catch (error) {
      console.error('Error fetching calendar models:', error);
      showFeedback('error', 'Erro', 'Falha ao carregar modelos de calendário.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const modulosById = useMemo(() => new Map(modulos.map(m => [m.id, m.titulo])), [modulos]);

  const handleCreate = async () => {
    if (!newModel.nome.trim()) {
      showFeedback('error', 'Validação', 'Informe o nome do modelo.');
      return;
    }
    if (!newModel.modulo_id) {
      showFeedback('error', 'Validação', 'Selecione o módulo.');
      return;
    }

    setCreatingLoading(true);
    try {
      const created = await CalendarModelsAPI.criar(newModel);
      showFeedback('success', 'Sucesso', 'Modelo criado com sucesso.');
      setIsCreating(false);
      setNewModel({
        nome: '',
        modulo_id: '',
        ano: new Date().getFullYear(),
        semestre: 1,
        turno: 'noite'
      });
      await fetchData();
      if (created) onSelectModel(created);
    } catch (error) {
      console.error('Error creating model:', error);
      showFeedback('error', 'Erro', 'Falha ao criar modelo.');
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('Excluir Modelo', 'Tem certeza que deseja excluir este modelo? Todas as datas serão perdidas.', async () => {
      try {
        await CalendarModelsAPI.deletar(id);
        showFeedback('success', 'Sucesso', 'Modelo excluído.');
        fetchData();
      } catch (error) {
        showFeedback('error', 'Erro', 'Falha ao excluir modelo.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Modelos Disponíveis</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          Novo Modelo
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 bg-gray-50 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Novo Modelo de Calendário</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Modelo (ex: Discipulado 2026/1)"
              value={newModel.nome}
              onChange={e => setNewModel(prev => ({ ...prev, nome: (e.target as HTMLInputElement).value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                value={newModel.modulo_id}
                onChange={e => setNewModel(prev => ({ ...prev, modulo_id: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {modulos.map(m => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ano"
                type="number"
                value={newModel.ano}
                onChange={e => setNewModel(prev => ({ ...prev, ano: Number((e.target as HTMLInputElement).value) }))}
              />
              <Input
                label="Semestre"
                type="number"
                value={newModel.semestre || ''}
                onChange={e => setNewModel(prev => ({ ...prev, semestre: Number((e.target as HTMLInputElement).value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                value={newModel.turno || 'noite'}
                onChange={e => setNewModel(prev => ({ ...prev, turno: e.target.value }))}
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={creatingLoading}>Salvar</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <Card key={model.id} className="hover:shadow-md transition-shadow cursor-pointer relative group">
              <div onClick={() => onSelectModel(model)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-gray-900 truncate pr-6">{model.nome}</h4>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Módulo:</span> {modulosById.get(model.modulo_id) || 'Desconhecido'}</p>
                  <p><span className="font-medium">Período:</span> {model.ano} / {model.semestre}º Semestre</p>
                  <p><span className="font-medium">Turno:</span> <span className="capitalize">{model.turno}</span></p>
                </div>
                
                <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
                  Editar datas <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(model.id); }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  title="Excluir modelo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
          
          {models.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum modelo de calendário encontrado.</p>
              <p className="text-gray-400 text-sm mt-1">Crie um modelo para agilizar o cadastro de turmas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
