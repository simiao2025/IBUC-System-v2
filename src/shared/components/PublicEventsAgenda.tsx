import React, { useEffect, useState } from 'react';
import { Play, Calendar, MapPin, ChevronRight, Info } from 'lucide-react';
import { EventosService, type Evento } from '../features/events/services/eventos.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-10">
            {/* Próximos Eventos */}
            {futureEvents.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-end justify-between border-b pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Agenda de Eventos</h2>
                            <p className="text-gray-600 mt-2">Fique por dentro do que está acontecendo no IBUC.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {futureEvents.map(evt => (
                            <Card key={evt.id} className="group hover:shadow-xl transition-all border-l-4 border-l-red-600">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-red-600 font-bold uppercase">
                                        <span>{evt.categoria || 'Geral'}</span>
                                        <span className="bg-red-50 px-2 py-1 rounded">{new Date(evt.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                        {evt.titulo}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {evt.descricao || 'Nenhuma descrição disponível.'}
                                    </p>
                                    <div className="flex flex-col gap-2 pt-2 border-t text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                            {evt.local || 'Local a definir'}
                                        </div>
                                    </div>
                                    {evt.link_cta && (
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <a href={evt.link_cta} target="_blank" rel="noopener noreferrer">
                                                Mais Informações
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Galeria de Memórias */}
            {pastEvents.length > 0 && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Galeria de Memórias</h2>
                        <p className="text-gray-600 mt-2">Momentos especiais registrados em nossos eventos realizados.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {pastEvents.flatMap(evt => evt.midia.map((m, idx) => ({ ...m, eventTitle: evt.titulo, id: `${evt.id}-${idx}` }))).slice(0, 12).map(m => (
                            <div 
                                key={m.id}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-md"
                                onClick={() => openLightbox(m.url, m.type)}
                            >
                                <img 
                                    src={m.type === 'image' ? m.url : `https://img.youtube.com/vi/${getYouTubeId(m.url)}/hqdefault.jpg`} 
                                    alt={m.eventTitle}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                                    {m.type === 'video' ? (
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2">
                                            <Play className="h-6 w-6 text-white fill-white" />
                                        </div>
                                    ) : (
                                        <Info className="h-8 w-8 text-white mb-2" />
                                    )}
                                    <span className="text-white text-xs font-medium uppercase tracking-wider">{m.eventTitle}</span>
                                </div>
                                {m.type === 'video' && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-md">
                                        <Play className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox Simples */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedMedia(null)}>
                    <button className="absolute top-6 right-6 text-white text-4xl hover:text-red-500 transition-colors">&times;</button>
                    <div className="max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        {selectedMedia.type === 'image' ? (
                            <img src={selectedMedia.url} alt="Visualização" className="max-w-full max-h-full object-contain rounded-lg lg:scale-125" />
                        ) : (
                            <div className="w-full aspect-video">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1`}
                                    className="w-full h-full rounded-lg"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

// Helper para extrair ID do YouTube
function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
