import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Info } from 'lucide-react';
import { EventosService, type Evento } from '../../features/events/services/eventos.service';
import Button from '../ui/Button';

export const EventHeroBanner: React.FC = () => {
    const [highlights, setHighlights] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                const data = await EventosService.listar({
                    is_destaque: true,
                    status: 'agendado',
                    limit: 3
                });
                setHighlights(data);
            } catch (error) {
                console.error('Erro ao buscar destaques:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHighlights();
    }, []);

    if (loading || highlights.length === 0) return null;

    const mainEvent = highlights[0];

    return (
        <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white overflow-hidden shadow-2xl">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            <Info className="h-3 w-3 mr-1" />
                            {mainEvent.categoria === 'matricula' ? 'Matrículas Abertas' : 
                             mainEvent.categoria === 'formatura' ? 'Formatura IBUC' :
                             mainEvent.categoria === 'aula' ? 'Início das Aulas' : 'Destaque'}
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            {mainEvent.titulo}
                        </h2>
                        
                        <p className="text-lg text-white/90 max-w-2xl">
                            {mainEvent.descricao || 'Participe de nossas atividades e faça parte da família IBUC.'}
                        </p>

                        <div className="flex items-center text-white/80 text-sm gap-4">
                            <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(mainEvent.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            {mainEvent.local && (
                                <span className="flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-1 opacity-50" />
                                    {mainEvent.local}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-shrink-0 gap-3">
                        {mainEvent.link_cta ? (
                            <Button asChild size="lg" className="bg-white !text-red-700 hover:bg-gray-100 shadow-lg font-bold">
                                <Link to={mainEvent.link_cta}>
                                    Saber Mais
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        ) : mainEvent.categoria === 'matricula' && (
                            <Button asChild size="lg" className="bg-white !text-red-700 hover:bg-gray-100 shadow-lg font-bold">
                                <Link to="/pre-matricula">
                                    Fazer Matrícula
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
