import React, { useEffect, useState } from 'react';
import { Play, Calendar, MapPin, ChevronRight, Info, X } from 'lucide-react';
import { EventosService, type Evento } from '../../features/events/services/eventos.service';
import Card from '../ui/Card';
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
        <section className="bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
                {/* Próximos Eventos */}
                {futureEvents.length > 0 && (
                    <div className="space-y-12">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Agenda de Eventos
                            </h2>
                            <div className="mt-4 h-1.5 w-24 bg-red-600 mx-auto rounded-full"></div>
                            <p className="mt-6 text-lg text-gray-600 leading-relaxed font-light">
                                Participe das nossas atividades e fique por dentro de tudo o que acontece na nossa comunidade.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {futureEvents.map(evt => (
                                <Card key={evt.id} className="flex flex-col h-full group hover:shadow-2xl transition-all duration-300 border-none bg-gray-50/50 hover:bg-white ring-1 ring-gray-100 hover:ring-red-100">
                                    <div className="flex-1 flex flex-col p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                                                {evt.categoria || 'Geral'}
                                            </span>
                                            <div className="flex items-center text-gray-500 text-xs font-semibold">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(evt.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3">
                                            {evt.titulo}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {evt.descricao || 'Nenhuma descrição disponível para este evento.'}
                                        </p>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <MapPin className="h-4 w-4 mr-2 text-red-500/60" />
                                                <span className="truncate">{evt.local || 'Local a definir'}</span>
                                            </div>
                                            
                                            {evt.link_cta && (
                                                <Button asChild variant="primary" size="sm" className="w-full bg-red-600 hover:bg-red-700 shadow-md">
                                                    <a href={evt.link_cta} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                                        Mais Informações
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Galeria de Memórias */}
                {pastEvents.length > 0 && (
                    <div className="space-y-12">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Galeria de Memórias
                            </h2>
                            <div className="mt-4 h-1.5 w-24 bg-red-600 mx-auto rounded-full"></div>
                            <p className="mt-6 text-lg text-gray-600 font-light">
                                Retratos de momentos abençoados em nossos encontros realizados.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {pastEvents.flatMap(evt => evt.midia.map((m, idx) => ({ ...m, eventTitle: evt.titulo, id: `${evt.id}-${idx}` }))).slice(0, 12).map(m => (
                                <div 
                                    key={m.id}
                                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100"
                                    onClick={() => openLightbox(m.url, m.type)}
                                >
                                    <img 
                                        src={m.type === 'image' ? m.url : `https://img.youtube.com/vi/${getYouTubeId(m.url)}/hqdefault.jpg`} 
                                        alt={m.eventTitle}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                                    
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="bg-red-600 text-[10px] text-white font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
                                                {m.type === 'video' ? 'Vídeo' : 'Foto'}
                                            </span>
                                            {m.type === 'video' && (
                                                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-white text-sm font-bold line-clamp-2 leading-tight uppercase tracking-wide opacity-90 group-hover:opacity-100">
                                            {m.eventTitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Profissional */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300" 
                    onClick={() => setSelectedMedia(null)}
                >
                    <button 
                        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-red-600 group"
                        title="Fechar (Esc)"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    
                    <div className="max-w-[95vw] w-full max-h-[90vh] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        {selectedMedia.type === 'image' ? (
                            <img 
                                src={selectedMedia.url} 
                                alt="Visualização" 
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500" 
                            />
                        ) : (
                            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black animate-in zoom-in-95 duration-500">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1&rel=0&modestbranding=1`}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title="Evento IBUC"
                                ></iframe>
                            </div>
                        )}
                    </div>
                    
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium uppercase tracking-[0.2em]">
                        Clique fora para fechar
                    </div>
                </div>
            )}
        </section>
    );
};

// Helper para extrair ID do YouTube
function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
