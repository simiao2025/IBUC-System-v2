/*
 * ------------------------------------------------------------------
 * 🔒 ARQUIVO BLINDADO / SHIELDED FILE 🔒
 * ------------------------------------------------------------------
 * ESTE ARQUIVO CONTÉM LÓGICA CRÍTICA DE GERAÇÃO DE RELATÓRIOS.
 * (Certificado, Histórico, Boletim)
 *
 * NÃO REFATORE OU MODIFIQUE SEM UM PLANO DE REFATORAÇÃO APROVADO
 * E UMA ANÁLISE DE IMPACTO PRÉVIA (/impact-analysis).
 *
 * QUALQUER ALTERAÇÃO DEVE SER ESTRITAMENTE NECESSÁRIA E VALIDADA.
 * ------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { RelatorioService } from '../../services/relatorio.service';
import { AlunosAPI } from '../../features/students/aluno.service';
import { TurmasAPI } from '../../features/classes/services/turma.service';
import { Loader2, Download, Award, Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

interface Turma {
    id: string;
    nome: string;
    nivel_id: string;
}

interface Aluno {
    id: string;
    nome: string;
    nivel_atual_id: string;
}

const CertificadoView: React.FC = () => {
    const { currentUser, showFeedback } = useApp();

    const [alunoId, setAlunoId] = useState('');
    const [nivelId, setNivelId] = useState('');
    const [turmaId, setTurmaId] = useState('');
    const [statusFilter, setStatusFilter] = useState('concluido');
    const [loading, setLoading] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const selectedPolo = currentUser?.adminUser?.poloId || '';

    // Carregar Turmas quando mudar Polo
    useEffect(() => {
        if (!selectedPolo) {
            setTurmas([]);
            setTurmaId('');
            return;
        }

        TurmasAPI.listar({ polo_id: selectedPolo }).then((data: any) => {
            setTurmas(Array.isArray(data) ? data : []);
            setTurmaId('');
        });
    }, [selectedPolo]);

    // Carregar Alunos
    useEffect(() => {
        if (!selectedPolo) {
            setAlunos([]);
            return;
        }

        const filters: any = { 
            polo_id: selectedPolo,
            status: statusFilter
        };
        
        if (turmaId) filters.turma_id = turmaId;

        AlunosAPI.listar(filters).then((data: any) => {
            setAlunos(Array.isArray(data) ? data : []);
        });
    }, [selectedPolo, turmaId, statusFilter]);

    // Ao selecionar um aluno, se não tiver nível selecionado pela turma, pega do aluno
    useEffect(() => {
        if (alunoId && !nivelId) {
            const aluno = alunos.find(a => a.id === alunoId);
            if (aluno?.nivel_atual_id) {
                setNivelId(aluno.nivel_atual_id);
            }
        }
    }, [alunoId, alunos, nivelId]);

    const handleGerar = async () => {
        if (!alunoId || !nivelId) {
            showFeedback('info', 'Atenção', 'Selecione o aluno e o nível do certificado.');
            return;
        }
        
        setLoading(true);
        try {
            const res = await RelatorioService.gerarCertificado(alunoId, nivelId);
            const result = (res as any)?.data?.result || (res as any)?.result || res;
            const path = (result as any)?.path;
            if (path) {
                const { data } = supabase.storage.from('documentos').getPublicUrl(path);
                if (data?.publicUrl) {
                    window.open(data.publicUrl, '_blank');
                    showFeedback('success', 'Certificado Gerado', 'O certificado foi gerado e salvo com sucesso.');
                } else {
                    throw new Error('Erro ao obter URL do certificado.');
                }
            } else {
                throw new Error('Caminho do certificado não retornado.');
            }
        } catch (error) {
            console.error('Erro ao gerar certificado:', error);
            showFeedback('error', 'Falha na Geração', 'Não foi possível gerar o certificado. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-lg">
                        <Award className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Certificado do Aluno</h2>
                        <p className="text-sm text-gray-500">Emita o certificado oficial de conclusão de nível</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center"><Users className="w-3 h-3 mr-1" /> Turma</div>
                        </label>
                        <Select value={turmaId} onChange={(val) => {
                            setTurmaId(val);
                            const t = turmas.find(x => x.id === val);
                            if (t?.nivel_id) setNivelId(t.nivel_id);
                            else setNivelId('');
                        }} disabled={!selectedPolo}>
                            <option value="">Todas as Turmas...</option>
                            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </Select>
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center"><Search className="w-3 h-3 mr-1" /> Status do Aluno</div>
                        </label>
                        <Select value={statusFilter} onChange={setStatusFilter}>
                            <option value="concluido">Somente Concluídos</option>
                            <option value="ativo">Ativos (Para Teste)</option>
                        </Select>
                    </div>

                    <div className="lg:col-span-1 w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            <div className="flex items-center"><Search className="w-3 h-3 mr-1" /> Selecionar Aluno</div>
                        </label>
                        <Select value={alunoId} onChange={setAlunoId} disabled={!selectedPolo}>
                            <option value="">{!selectedPolo ? 'Selecione um Polo...' : 'Selecione um aluno...'}</option>
                            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                        </Select>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                            onClick={handleGerar} 
                            disabled={!alunoId || !nivelId || loading}
                            className="w-full"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <Download className="h-5 w-5 mr-2" />
                            )}
                            {loading ? '' : 'Gerar'}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <div className="text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-yellow-800">Modo de Teste Manual</h4>
                    <p className="text-sm text-yellow-700">
                        Você pode alterar o filtro para <strong>&quot;Ativos (Para Teste)&quot;</strong> se desejar emitir um certificado para um aluno que ainda não finalizou o curso formalmente no sistema.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificadoView;
