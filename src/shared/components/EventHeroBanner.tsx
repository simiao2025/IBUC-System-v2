import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Info, MapPin } from 'lucide-react';
import { EventosService, type Evento } from '../../features/events/services/eventos.service';
import { parseISOToLocal, formatLocalDate } from '../utils/dateUtils';

export const EventHeroBanner: React.FC = () => {
    const [highlights, setHighlights] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                let data = await EventosService.listar({
                    is_destaque: true,
                    status: 'agendado',
                    limit: 3
                });

                // Fallback: Se não houver destaques, pega os próximos agendados
                if (data.length === 0) {
                    data = await EventosService.listar({
                        status: 'agendado',
                        limit: 3
                    });
                }
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
    const eventImage = mainEvent.midia?.[0]?.url;

    return (
        <div className="relative overflow-hidden group">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl border border-white/5">
                    {/* Background with Image and Gradient Overlay */}
                    {eventImage ? (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={eventImage} 
                                alt={mainEvent.titulo} 
                                className="w-full h-full object-cover opacity-40 blur-sm group-hover:scale-110 transition-transform duration-[2000ms]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900/80 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-red-600 to-red-800"></div>
                    )}

                    <div className="relative z-10 p-8 sm:p-12">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
                                    <Info className="h-4 w-4 mr-2 text-red-400" />
                                    {mainEvent.categoria === 'matricula' ? 'Matrículas Abertas' : 
                                     mainEvent.categoria === 'formatura' ? 'Formatura IBUC' :
                                     mainEvent.categoria === 'aula' ? 'Início das Aulas' : 
                                     mainEvent.categoria === 'informativo' ? 'Comunicado Oficial' : 'Destaque'}
                                </div>
                                
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
                                    {mainEvent.titulo}
                                </h2>
                                
                                <p className="text-xl text-white/70 max-w-xl leading-relaxed font-medium">
                                    {mainEvent.descricao || 'Participe de nossas atividades e faça parte da família IBUC.'}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 pt-4">
                                    <div className="flex items-center py-2 px-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                                        <Calendar className="h-5 w-5 mr-3 text-red-500" />
                                        <span className="text-white font-bold">
                                            {formatLocalDate(mainEvent.data_inicio)}
                                        </span>
                                    </div>
                                    
                                    {mainEvent.local && (
                                        <div className="flex items-center py-2 px-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm text-white/80">
                                            <MapPin className="h-5 w-5 mr-2 text-red-500" />
                                            <span className="font-semibold">{mainEvent.local}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex flex-wrap gap-4">
                                    {mainEvent.link_cta ? (
                                        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 shadow-xl shadow-red-950/20 font-black uppercase tracking-wider h-14 transition-all hover:scale-105 active:scale-95">
                                            <Link to={mainEvent.link_cta}>
                                                Saber Mais
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    ) : mainEvent.categoria === 'matricula' && (
                                        <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl px-10 shadow-xl font-black uppercase tracking-wider h-14">
                                            <Link to="/pre-matricula">
                                                Fazer Matrícula
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Image Showcase - "Banner principal" */}
                            <div className="hidden lg:block relative">
                                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-[4/5] max-w-[400px] mx-auto group-hover:rotate-2 transition-transform duration-700">
                                    <img 
                                        src={eventImage || "https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80&w=2070"} 
                                        alt={mainEvent.titulo}
                                        className="w-full h-full object-contain bg-gray-800"
                                    />
                                </div>
                                {/* Decorative Blur */}
                                <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
