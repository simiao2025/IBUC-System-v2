import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { TurmaService, TurmaItem } from '../api/turma.service';
import { AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useUI } from '@/shared/lib/providers/UIProvider';

interface BatchClosureModalProps {
    turmas: TurmaItem[];
    polos: { id: string; nome: string }[];
    onClose: () => void;
    onSuccess: () => void;
}

type TurmaStatus = {
    turmaId: string;
    loading: boolean;
    canClose: boolean;
    reason?: string;
    moduleInfo?: { total_licoes: number; aulas_dadas: number; titulo: string };
    failingStudents: { nome: string; frequencia: number }[];
    processed: boolean;
    error?: string;
};

export const BatchClosureModal: React.FC<BatchClosureModalProps> = ({
    turmas,
    polos,
    onClose,
    onSuccess,
}) => {
    const { showFeedback } = useUI();
    const [statuses, setStatuses] = useState<Record<string, TurmaStatus>>({});
    const [globalLoading, setGlobalLoading] = useState(true);
    const [closing, setClosing] = useState(false);

    // Filter only active classes that have a current module
    const activeTurmas = turmas.filter(t => t.status === 'ativa' && t.modulo_atual_id);

    useEffect(() => {
        validateAllTurmas();
    }, []);

    const validateAllTurmas = async () => {
        setGlobalLoading(true);
        const newStatuses: Record<string, TurmaStatus> = {};

        // Initialize statuses
        activeTurmas.forEach(t => {
            newStatuses[t.id] = {
                turmaId: t.id,
                loading: true,
                canClose: false,
                failingStudents: [],
                processed: false
            };
        });
        setStatuses(newStatuses);

        // Process each class individually
        // In a real production app with many classes, we would batch this or use a promise pool
        // For now, Promise.all is acceptable as the number of classes shouldn't be massive
        await Promise.all(activeTurmas.map(async (turma) => {
            try {
                const data: any = await TurmaService.previewTransicao(turma.id);
                const alunos = data.alunos || [];
                const failing = alunos.filter((a: any) => !a.aprovado_frequencia);

                const moduleInfo = {
                    total_licoes: data.total_licoes || 0,
                    aulas_dadas: data.aulas_dadas || 0,
                    titulo: data.modulo_titulo || 'Módulo'
                };

                const isComplete = moduleInfo.aulas_dadas >= moduleInfo.total_licoes;
                const canClose = failing.length === 0 && isComplete;

                const reasons = [];
                if (!isComplete) {
                    reasons.push(`Módulo incompleto (${moduleInfo.aulas_dadas}/${moduleInfo.total_licoes} aulas)`);
                }
                if (failing.length > 0) {
                    reasons.push(`${failing.length} aluno(s) com baixa frequência`);
                }

                const reason = reasons.join(' e ') + (reasons.length > 0 ? '.' : '');

                setStatuses(prev => ({
                    ...prev,
                    [turma.id]: {
                        turmaId: turma.id,
                        loading: false,
                        canClose,
                        reason,
                        moduleInfo,
                        failingStudents: failing.map((a: any) => ({ nome: a.nome, frequencia: a.frequencia })),
                        processed: false
                    }
                }));
            } catch (err: any) {
                setStatuses(prev => ({
                    ...prev,
                    [turma.id]: {
                        turmaId: turma.id,
                        loading: false,
                        canClose: false,
                        reason: 'Erro ao validar turma',
                        error: err.message,
                        failingStudents: [],
                        processed: false
                    }
                }));
            }
        }));

        setGlobalLoading(false);
    };

    const handleCloseAllEligible = async () => {
        const eligibleIds = Object.values(statuses)
            .filter(s => s.canClose && !s.processed)
            .map(s => s.turmaId);

        if (eligibleIds.length === 0) return;

        setClosing(true);
        let successCount = 0;

        for (const turmaId of eligibleIds) {
            try {
                // We need to fetch the approved students again or store them?
                // To be safe and reuse logic, let's call preview again or just assume all passed since canClose is true
                // But the service expects the list of confirmed students.
                // Since canClose = true implies failingStudents = [], then ALL students in the class are approved.

                // We need the list of student IDs to send to close-module.
                // Let's re-fetch quickly or we should have stored it. 
                // Optimization: Calling preview again is safer than storing overly complex state.

                const data: any = await TurmaService.previewTransicao(turmaId);
                const alunos = data.alunos || [];
                const approvedIds = alunos.map((a: any) => a.aluno_id); // All are approved if logic holds

                await TurmaService.encerrarModulo(turmaId, {
                    alunos_confirmados: approvedIds
                });

                setStatuses(prev => ({
                    ...prev,
                    [turmaId]: { ...prev[turmaId], processed: true }
                }));
                successCount++;

            } catch (err) {
                console.error(`Falha ao fechar turma ${turmaId}`, err);
            }
        }
 
        setClosing(false);
        showFeedback('success', 'Processamento Concluído', `${successCount} turmas foram encerradas com sucesso.`);

        // Close modal if all active were processed, otherwise leave open to see errors
        const remaining = Object.values(statuses).filter(s => s.canClose && !s.processed).length; // Should be 0
        if (remaining === 0) {
            // Wait a bit so user sees the green checks
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }
    };

    const eligibleCount = Object.values(statuses).filter(s => s.canClose && !s.processed).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Encerrar Módulo - Validação em Lote</h2>
                        <p className="text-sm text-gray-500">
                            Analisando {activeTurmas.length} turmas ativas para encerramento de módulo.
                        </p>
                    </div>
                    <Button variant="outline" onClick={onClose} disabled={closing}>
                        Fechar
                    </Button>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">
                    {globalLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600">Verificando turmas e calculando frequências...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeTurmas.length === 0 && (
                                <div className="text-center py-8 text-gray-500">Nenhuma turma ativa encontrada para encerramento.</div>
                            )}
                            {activeTurmas.map(turma => {
                                const status = statuses[turma.id];
                                if (!status) return null;

                                const poloNome = polos.find(p => p.id === turma.polo_id)?.nome || 'Polo Desconhecido';

                                return (
                                    <div key={turma.id} className={`flex items-center justify-between p-4 rounded-lg border ${status.processed
                                        ? 'bg-green-50 border-green-200'
                                        : status.canClose
                                            ? 'bg-white border-gray-200'
                                            : 'bg-red-50 border-red-200'
                                        }`}>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{turma.nome}</span>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{poloNome}</span>
                                                {status.moduleInfo && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                                                        {status.moduleInfo.titulo}
                                                    </span>
                                                )}
                                            </div>

                                            {status.processed ? (
                                                <div className="text-sm text-green-700 font-medium flex items-center mt-1">
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Encerrado com sucesso
                                                </div>
                                            ) : !status.canClose ? (
                                                <div className="mt-1">
                                                    <p className="text-sm text-red-700 font-medium flex items-center">
                                                        <XCircle className="h-4 w-4 mr-1" /> Bloqueado: {status.reason}
                                                    </p>
                                                    {status.failingStudents.length > 0 && (
                                                        <div className="ml-5 mt-1 text-xs text-red-600">
                                                            Reprovados: {status.failingStudents.map(f => `${f.nome} (${f.frequencia}%)`).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-1 flex items-center gap-4">
                                                    <p className="text-sm text-green-700 flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Apto para encerramento
                                                    </p>
                                                    {status.moduleInfo && status.moduleInfo.aulas_dadas < status.moduleInfo.total_licoes && (
                                                        <span className="text-xs text-amber-600 flex items-center bg-amber-50 px-2 py-0.5 rounded">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Incompleto ({status.moduleInfo.aulas_dadas}/{status.moduleInfo.total_licoes} aulas)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            {/* Individual actions could go here, but prompt implies batch action */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t p-6 bg-gray-50 flex justify-end items-center gap-4">
                    <div className="text-sm text-gray-600">
                        {eligibleCount} turmas aptas para encerramento
                    </div>
                    <Button
                        onClick={handleCloseAllEligible}
                        disabled={eligibleCount === 0 || closing || globalLoading}
                        className={eligibleCount > 0 ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        {closing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...
                            </>
                        ) : (
                            <>Encerrar {eligibleCount} Turmas Aptas</>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
