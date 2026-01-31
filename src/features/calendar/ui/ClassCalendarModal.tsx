import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { CalendarioService } from '../../../entities/calendar/api/calendario.service';
import type { AgendamentoAula } from '../../../entities/calendar/model/types';
import { ModulosAPI, LicoesAPI } from '../../../services/modulos.service';
import type { Modulo, Licao } from '../../../types/database';
import { useApp } from '../../../context/AppContext';

interface ClassCalendarModalProps {
  turma: { id: string; nome: string };
  onClose: () => void;
}

export const ClassCalendarModal: React.FC<ClassCalendarModalProps> = ({ turma, onClose }) => {
  const { showFeedback, showConfirm } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<AgendamentoAula[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [form, setForm] = useState({
    modulo_id: '',
    licao_id: '',
    observacoes: ''
  });
  const [saving, setSaving] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await CalendarioService.listarPorTurma(
        turma.id, 
        currentDate.getMonth() + 1, 
        currentDate.getFullYear()
      );
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
      showFeedback('error', 'Erro', 'Falha ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const carregarModulos = async () => {
    try {
      const resp = await ModulosAPI.listar();
      setModulos(resp.data);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, [currentDate, turma.id]);

  useEffect(() => {
    carregarModulos();
  }, []);

  useEffect(() => {
    if (form.modulo_id) {
      LicoesAPI.listar({ modulo_id: form.modulo_id }).then(resp => {
        setLicoes(resp.data);
      });
    } else {
      setLicoes([]);
    }
  }, [form.modulo_id]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const existing = agendamentos.find(a => isSameDay(parseISO(a.data_aula), day));
    
    if (existing) {
      setForm({
        modulo_id: existing.modulo_id,
        licao_id: existing.licao_id,
        observacoes: existing.observacoes || ''
      });
    } else {
      setForm({
        modulo_id: '',
        licao_id: '',
        observacoes: ''
      });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !form.licao_id) {
      showFeedback('warning', 'Aviso', 'Selecione a lição.');
      return;
    }

    setSaving(true);
    try {
      const data_aula = format(selectedDate, 'yyyy-MM-dd');
      const existing = agendamentos.find(a => isSameDay(parseISO(a.data_aula), selectedDate));

      const payload = {
        turma_id: turma.id,
        modulo_id: form.modulo_id,
        licao_id: form.licao_id,
        data_aula,
        observacoes: form.observacoes
      };

      if (existing) {
        await CalendarioService.atualizar(existing.id, payload);
      } else {
        await CalendarioService.criar(payload);
      }

      showFeedback('success', 'Sucesso', 'Aula agendada com sucesso.');
      setShowForm(false);
      carregarAgendamentos();
    } catch (error: any) {
      showFeedback('error', 'Erro', error.message || 'Falha ao salvar agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('Remover Aula', 'Deseja remover esta aula do calendário?', async () => {
      try {
        await CalendarioService.deletar(id);
        showFeedback('success', 'Sucesso', 'Aula removida.');
        carregarAgendamentos();
        if (showForm) setShowForm(false);
      } catch (error) {
        showFeedback('error', 'Erro', 'Falha ao remover aula.');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-red-600" />
              Calendário de Aulas: <span className="text-red-700 ml-2">{turma.nome}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Calendar Area */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold capitalize text-gray-700">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                   Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="bg-gray-50 py-2 text-center text-xs font-bold text-gray-500 uppercase">
                  {d}
                </div>
              ))}
              
              {calendarDays.map((day, idx) => {
                const agendamento = agendamentos.find(a => isSameDay(parseISO(a.data_aula), day));
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                
                return (
                  <div 
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[80px] p-2 transition-colors cursor-pointer group relative
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                      ${isToday(day) ? 'ring-2 ring-red-500 ring-inset z-10' : ''}
                      hover:bg-red-50
                    `}
                  >
                    <span className={`text-sm font-medium ${isToday(day) ? 'text-red-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {agendamento && (
                      <div className="mt-1">
                        <div className="bg-red-100 text-red-800 text-[10px] p-1 rounded border border-red-200 line-clamp-2">
                          <span className="font-bold">Mod {agendamento.modulo?.titulo?.split(' ')[1] || ''}:</span> {agendamento.licao?.titulo}
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} className="text-red-400" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-center text-xs text-gray-500 gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>Aula Agendada</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 ring-1 ring-red-500 rounded"></div>
                <span>Hoje</span>
              </div>
            </div>
          </div>

          {/* Form Pane */}
          {showForm && (
            <div className="w-80 border-l bg-gray-50 p-6 shadow-inner overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-800">
                  {format(selectedDate!, "dd 'de' MMMM", { locale: ptBR })}
                </h4>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
                  <Select 
                    value={form.modulo_id} 
                    onChange={val => setForm(p => ({ ...p, modulo_id: val, licao_id: '' }))}
                  >
                    <option value="">Selecione o Módulo</option>
                    {modulos.map(m => (
                      <option key={m.id} value={m.id}>{m.titulo}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lição</label>
                  <Select 
                    value={form.licao_id} 
                    onChange={val => setForm(p => ({ ...p, licao_id: val }))}
                    disabled={!form.modulo_id}
                  >
                    <option value="">Selecione a Lição</option>
                    {licoes.map(l => (
                      <option key={l.id} value={l.id}>{l.ordem}. {l.titulo}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea 
                    className="w-full h-24 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                    placeholder="Ex: Trazer bíblia, aula externa..."
                    value={form.observacoes}
                    onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
                  ></textarea>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    loading={saving}
                  >
                    Salvar Agendamento
                  </Button>
                  
                  {agendamentos.find(a => isSameDay(parseISO(a.data_aula), selectedDate!)) && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        const existing = agendamentos.find(a => isSameDay(parseISO(a.data_aula), selectedDate!));
                        if (existing) handleDelete(existing.id);
                      }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start">
                  <Info size={16} className="text-blue-500 mr-2 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Clique em um dia do calendário para agendar ou editar a lição programada para aquela data.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
