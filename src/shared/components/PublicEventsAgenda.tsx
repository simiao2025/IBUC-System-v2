import React, { useEffect, useState } from 'react';
import { Play, Calendar, MapPin, ChevronRight, Info, X } from 'lucide-react';
import { EventosService, type Evento } from '../../features/events/services/eventos.service';
import Button from '../ui/Button';

export const PublicEventsAgenda: React.FC = () => {
    const [futureEvents, setFutureEvents] = useState<Evento[]>([]);
    const [pastEvents, setPastEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Próximos Eventos
                const future = await EventosService.listar({
                    status: 'agendado',
                    limit: 6
                });
                // Eventos Realizados (para a galeria)
                const past = await EventosService.listar({
                    status: 'realizado',
                    limit: 12
                });
                
                setFutureEvents(future);
                setPastEvents(past.filter(e => e.midia && e.midia.length > 0));
            } catch (error) {
                console.error('Erro ao buscar eventos públicos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const openLightbox = (url: string, type: 'image' | 'video') => {
        setSelectedMedia({ url, type });
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Carregando eventos...</div>;

    return (
        <div className="space-y-24">
            {/* Seção 1: Agenda de Eventos (O que vem aí) */}
            <section className="bg-white py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-100 pb-8">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase">
                                Agenda de <span className="text-red-600">Eventos</span>
                            </h2>
                            <p className="mt-4 text-xl text-gray-500 font-medium">
                                Fique por dentro de tudo o que vai acontecer no IBUC.
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0">
                            <div className="inline-flex items-center px-4 py-2 bg-red-50 rounded-xl text-red-700 font-bold text-sm">
                                <Calendar className="h-5 w-5 mr-2" />
                                {futureEvents.length} Eventos Agendados
                            </div>
                        </div>
                    </div>

                    {futureEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {futureEvents.map(evt => (
                                <div key={evt.id} className="group relative flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                    {/* Tag de Data Lateral */}
                                    <div className="absolute top-6 left-6 z-10">
                                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-3 flex flex-col items-center min-w-[64px] border border-gray-100">
                                            <span className="text-red-600 text-2xl font-black leading-none">
                                                {new Date(evt.data_inicio + 'T12:00:00').getDate()}
                                            </span>
                                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                {new Date(evt.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 pt-24">
                                        <div className="mb-4">
                                            <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                                                {evt.categoria || 'Evento'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-red-600 transition-colors mb-4 line-clamp-2">
                                            {evt.titulo}
                                        </h3>
                                        
                                        <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                            {evt.descricao || 'Detalhes do evento em breve.'}
                                        </p>
                                        
                                        <div className="mt-auto space-y-4">
                                            <div className="flex items-center text-gray-400 text-sm font-semibold">
                                                <MapPin className="h-5 w-5 mr-3 text-red-500/40" />
                                                <span className="truncate">{evt.local || 'Local a definir'}</span>
                                            </div>
                                            
                                            {evt.link_cta && (
                                                <Button asChild className="w-full bg-gray-900 hover:bg-red-600 text-white rounded-2xl py-6 transition-all duration-300">
                                                    <a href={evt.link_cta} target="_blank" rel="noopener noreferrer">
                                                        Garantir minha vaga
                                                        <ChevronRight className="ml-2 h-5 w-5" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold italic">Nenhum evento agendado para os próximos dias.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Seção 2: Mural de Memórias (Publicações) */}
            <section className="bg-gray-50 py-16 sm:py-24 rounded-[3rem] sm:rounded-[5rem] mx-2 sm:mx-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase">
                            Mural de <span className="text-blue-600">Publicações</span>
                        </h2>
                        <div className="mt-6 h-2 w-20 bg-blue-600 mx-auto rounded-full"></div>
                        <p className="mt-8 text-xl text-gray-500 font-medium">
                            Nossa história é feita de momentos. Relembre aqui as mídias e publicações dos nossos eventos.
                        </p>
                    </div>

                    {pastEvents.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                            {pastEvents.flatMap(evt => evt.midia.map((m, idx) => ({ ...m, eventTitle: evt.titulo, id: `${evt.id}-${idx}` }))).map(m => (
                                <div 
                                    key={m.id}
                                    className="group relative aspect-square rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-700"
                                    onClick={() => openLightbox(m.url, m.type)}
                                >
                                    <img 
                                        src={m.type === 'image' ? m.url : `https://img.youtube.com/vi/${getYouTubeId(m.url)}/hqdefault.jpg`} 
                                        alt={m.eventTitle}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                    />
                                    
                                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                                        <div className="bg-white/30 backdrop-blur-md p-4 rounded-full mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {m.type === 'video' ? (
                                                <Play className="h-8 w-8 text-white fill-white ml-1" />
                                            ) : (
                                                <Info className="h-8 w-8 text-white" />
                                            )}
                                        </div>
                                        <span className="text-white text-xs font-black uppercase tracking-tighter sm:tracking-[0.1em] line-clamp-2">
                                            {m.eventTitle}
                                        </span>
                                    </div>

                                    {m.type === 'video' && (
                                        <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            Vídeo
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            Nenhuma publicação encontrada.
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Simples (já implementado mas mantendo o padrão) */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-300" 
                    onClick={() => setSelectedMedia(null)}
                >
                    <button 
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/5 p-3 rounded-full"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    
                    <div className="max-w-[95vw] w-full max-h-[90vh] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        {selectedMedia.type === 'image' ? (
                            <img 
                                src={selectedMedia.url} 
                                alt="Visualização" 
                                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500" 
                            />
                        ) : (
                            <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1&rel=0`}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper para extrair ID do YouTube
function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
