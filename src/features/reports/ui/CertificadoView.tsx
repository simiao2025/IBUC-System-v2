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
import { Card } from '@/shared/ui';
import { Select } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { studentApi } from '@/entities/student';
import { turmaApi } from '@/entities/turma';
import { StudentReportsAPI, CertificadoAPI } from '@/entities/student';
import { API_BASE_URL } from '@/shared/api';
import { Certificado } from '../../types/database';
import { Loader2, Download, Award, Search, Users, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '@/entities/user';
import { useUI } from '@/shared/lib/providers/UIProvider';


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
    const { currentUser } = useAuth();
    const { showFeedback, showConfirm } = useUI();

    const [alunoId, setAlunoId] = useState('');
    const [nivelId, setNivelId] = useState('');
    const [turmaId, setTurmaId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [certificadosEmitidos, setCertificadosEmitidos] = useState<Certificado[]>([]);
    const selectedPolo = currentUser?.adminUser?.poloId || '';

    // Carregar Turmas quando mudar Polo
    useEffect(() => {
        if (!selectedPolo) {
            setTurmas([]);
            setTurmaId('');
            return;
        }

        turmaApi.list({ polo_id: selectedPolo, status: 'concluida' }).then((data: any) => {
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
            status: 'concluido'
        };

        if (turmaId) filters.turma_id = turmaId;

        studentApi.list(filters).then((data: any) => {
            setAlunos(Array.isArray(data) ? data : []);
        });
    }, [selectedPolo, turmaId]);

    // Ao selecionar um aluno, se não tiver nível selecionado pela turma, pega do aluno
    useEffect(() => {
        if (alunoId) {
            const aluno = alunos.find(a => a.id === alunoId);
            if (aluno?.nivel_atual_id && !nivelId) {
                setNivelId(aluno.nivel_atual_id);
            }
            carregarCertificados(alunoId);
        } else {
            setCertificadosEmitidos([]);
        }
    }, [alunoId, alunos]);

    const carregarCertificados = async (id: string) => {
        setLoadingCerts(true);
        try {
            const data = await CertificadoAPI.listar(id);
            setCertificadosEmitidos(data || []);
        } catch (error) {
            console.error('Erro ao carregar certificados:', error);
        } finally {
            setLoadingCerts(false);
        }
    };

    const handleGerar = async () => {
        if (!alunoId || !nivelId) {
            showFeedback('info', 'Atenção', 'Selecione o aluno e o nível do certificado.');
            return;
        }

        // 1. Verificar se o nível selecionado já possui certificado emitido na lista local
        const jaPossui = certificadosEmitidos.some(c => {
            const turmaDesteCert = turmas.find(t => t.id === c.turma_id);
            return turmaDesteCert?.nivel_id === nivelId;
        });

        if (jaPossui) {
            showFeedback('warning', 'Certificado Existente', 'Este aluno já possui um certificado emitido para este nível e ele está listado abaixo.');
            return;
        }

        showConfirm({
            title: 'Gerar Certificado',
            message: 'Deseja gerar o certificado para este aluno?',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await StudentReportsAPI.generateCertificado(alunoId, nivelId);
                    const result = (res as any)?.data?.result || (res as any)?.result || res;

                    if (result?.existente) {
                        showFeedback('warning', 'Certificado já Emitido', 'Este certificado já havia sido gerado anteriormente.');
                    } else {
                        showFeedback('success', 'Certificado Gerado', 'O certificado foi gerado e salvo com sucesso.');
                    }

                    if (result?.id) {
                        try {
                            const token = sessionStorage.getItem('auth_token');
                            const viewResp = await fetch(`${API_BASE_URL}/certificados/${result.id}/view`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (viewResp.ok) {
                                const blob = await viewResp.blob();
                                const url = window.URL.createObjectURL(blob);
                                window.open(url, '_blank');
                            }
                        } catch (e) {
                            console.error('Erro ao abrir certificado gerado:', e);
                        }
                    }

                    if (alunoId) carregarCertificados(alunoId); // para refletir a nova geração ou a detecção do existente
                    await carregarCertificados(alunoId);

                } catch (error) {
                    console.error('Erro ao gerar certificado:', error);
                    showFeedback('error', 'Falha na Geração', 'Não foi possível gerar o certificado.');
                } finally {
                    setLoading(false);
                }
            }
        });
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

                    <div className="lg:col-span-2 w-full">
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



            {/* Listagem de Certificados */}
            {alunoId && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-teal-600" />
                            <h3 className="font-bold text-gray-900">Certificados Emitidos</h3>
                        </div>
                        {loadingCerts && <Loader2 className="animate-spin h-4 w-4 text-gray-400" />}
                    </div>

                    {certificadosEmitidos.length === 0 && !loadingCerts ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">Nenhum certificado encontrado para este aluno.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emissão</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certificadosEmitidos.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {new Date(cert.data_emissao).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {cert.turma?.nome || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {cert.modulo?.titulo || '-'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                                {cert.codigo_validacao}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            const token = sessionStorage.getItem('auth_token');
                                                            const resp = await fetch(`${API_BASE_URL}/certificados/${cert.id}/view`, {
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            if (!resp.ok) throw new Error('Erro ao carregar PDF');
                                                            const blob = await resp.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            window.open(url, '_blank');
                                                        } catch (err) {
                                                            console.error('Erro ao abrir certificado:', err);
                                                            alert('Não foi possível abrir o certificado.');
                                                        }
                                                    }}
                                                    className="inline-flex items-center"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    Abrir
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default CertificadoView;
