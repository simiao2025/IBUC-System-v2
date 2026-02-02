import React, { useEffect, useState } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { useApp } from '@/app/providers/AppContext';
import { 
  CalendarModelsAPI, 
  type CalendarModel, 
  type CalendarModelDay,
  type CreateCalendarModelDayDto 
} from '@/features/calendar/services/calendarModels.service';
import { LicoesAPI } from '@/services/modulos.service';
import type { Licao } from '@/types/database';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { formatLocalDate, parseISOToLocal } from '@/shared/utils/dateUtils';

interface CalendarModelDetailProps {
  model: CalendarModel;
  onBack: () => void;
}

export const CalendarModelDetail: React.FC<CalendarModelDetailProps> = ({ model, onBack }) => {
  const { showFeedback, showConfirm } = useApp();
  const [days, setDays] = useState<CalendarModelDay[]>([]);
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [newDay, setNewDay] = useState<CreateCalendarModelDayDto>({
    modelo_id: model.id,
    data_aula: '',
    licao_id: '',
    observacoes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [daysData, licoesData] = await Promise.all([
        CalendarModelsAPI.listarDias(model.id),
        LicoesAPI.listar({ modulo_id: model.modulo_id })
      ]);
      setDays(Array.isArray(daysData) ? daysData.sort((a, b) => new Date(a.data_aula).getTime() - new Date(b.data_aula).getTime()) : []);
      setLicoes(Array.isArray(licoesData) ? licoesData.sort((a, b) => a.ordem - b.ordem) : []);
    } catch (error) {
      console.error('Error fetching details:', error);
      showFeedback('error', 'Erro', 'Falha ao carregar detalhes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [model.id]);

  const handleAddDay = async () => {
    if (!newDay.data_aula) {
      showFeedback('error', 'Validação', 'Informe a data.');
      return;
    }

    setAdding(true);
    try {
      await CalendarModelsAPI.adicionarDia({
        ...newDay,
        modelo_id: model.id
      });
      showFeedback('success', 'Sucesso', 'Data adicionada.');
      setNewDay(prev => ({ ...prev, data_aula: '', licao_id: '', observacoes: '' }));
      fetchData();
    } catch (error) {
      console.error('Error adding day:', error);
      showFeedback('error', 'Erro', 'Falha ao adicionar data.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDay = (dayId: string) => {
    showConfirm('Remover Data', 'Deseja remover esta data do calendário?', async () => {
      try {
        await CalendarModelsAPI.removerDia(dayId);
        showFeedback('success', 'Removido', 'Data removida.');
        setDays(prev => prev.filter(d => d.id !== dayId));
      } catch (error) {
        showFeedback('error', 'Erro', 'Falha ao remover data.');
      }
    });
  };

  // Helper to find next available date (simple +7 days logic based on last entry)
  const suggestNextDate = () => {
    if (days.length === 0) return;
    const lastDate = new Date(days[days.length - 1].data_aula);
    lastDate.setDate(lastDate.getDate() + 7); // Add 1 week
    setNewDay(prev => ({ ...prev, data_aula: lastDate.toISOString().split('T')[0] }));
  };

  // Helper to find next lesson
  const suggestNextLesson = () => {
    if (days.length === 0) {
      if (licoes.length > 0) setNewDay(prev => ({ ...prev, licao_id: licoes[0].id }));
      return;
    }
    
    const usedLessonIds = new Set(days.map(d => d.licao_id).filter(Boolean));
    const nextLesson = licoes.find(l => !usedLessonIds.has(l.id));
    
    if (nextLesson) {
      setNewDay(prev => ({ ...prev, licao_id: nextLesson.id }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{model.nome}</h2>
          <p className="text-sm text-gray-600">
            {days.length} aulas agendadas • {model.ano}/{model.semestre}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adicionar Data Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Adicionar Aula</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newDay.data_aula}
                    onChange={e => setNewDay(prev => ({ ...prev, data_aula: (e.target as HTMLInputElement).value }))}
                  />
                  <button 
                    onClick={suggestNextDate}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    title="Sugerir próxima semana"
                  >
                    +7d
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lição</label>
                <div className="flex gap-2">
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    value={newDay.licao_id || ''}
                    onChange={e => setNewDay(prev => ({ ...prev, licao_id: e.target.value }))}
                  >
                    <option value="">-- Selecione a lição --</option>
                    {licoes.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.ordem}. {l.titulo}
                      </option>
                    ))}
                  </select>
                   <button 
                    onClick={suggestNextLesson}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    title="Sugerir próxima lição"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Input
                label="Observações (opcional)"
                value={newDay.observacoes || ''}
                onChange={e => setNewDay(prev => ({ ...prev, observacoes: (e.target as HTMLInputElement).value }))}
              />

              <Button className="w-full" onClick={handleAddDay} loading={adding} disabled={!newDay.data_aula}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ao Calendário
              </Button>
            </div>
          </Card>
        </div>

        {/* Lista de Dias */}
        <div className="lg:col-span-2">
          {loading ? (
             <div className="text-center py-8 text-gray-500">Carregando cronograma...</div>
          ) : (
            <div className="space-y-3">
              {days.map((day, index) => {
                const licao = licoes.find(l => l.id === day.licao_id);
                const isPast = new Date(day.data_aula) < new Date();
                
                return (
                  <div 
                    key={day.id} 
                    className={`flex items-center justify-between p-4 bg-white rounded-lg border ${isPast ? 'border-gray-100 bg-gray-50' : 'border-gray-200 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg text-center min-w-[60px] ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700'}`}>
                        <div className="text-xs font-bold uppercase">{new Date(day.data_aula).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</div>
                        <div className="text-lg font-bold">{new Date(day.data_aula).getDate()}</div>
                         <div className="text-xs">{new Date(day.data_aula).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                      </div>
                      
                      <div>
                        {licao ? (
                          <div className="font-semibold text-gray-900">
                             <span className="text-gray-500 mr-2">#{licao.ordem}</span> 
                             {licao.titulo}
                          </div>
                        ) : (
                          <div className="font-semibold text-gray-500 italic">Aula sem lição vinculada</div>
                        )}
                        {day.observacoes && (
                          <div className="text-sm text-gray-600 mt-1">Obs: {day.observacoes}</div>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveDay(day.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}

              {days.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">Nenhuma data cadastrada neste modelo.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
