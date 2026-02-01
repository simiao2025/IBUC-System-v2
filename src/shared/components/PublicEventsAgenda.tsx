import React, { useEffect, useState } from 'react';
import { Play, Calendar, MapPin, ChevronRight, Info, X, Image as ImageIcon } from 'lucide-react';
import { EventosService, type Evento } from '../../features/events/services/eventos.service';
import Button from '../ui/Button';

export const PublicEventsAgenda: React.FC = () => {
    const [informativos, setInformativos] = useState<Evento[]>([]);
    const [eventosAgendados, setEventosAgendados] = useState<Evento[]>([]);
    const [publicacoes, setPublicacoes] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Informativos (Status Agendado + Categoria Informativo)
                const infoData = await EventosService.listar({
                    status: 'agendado',
                    categoria: 'informativo',
                    limit: 4
                });
                
                // Eventos (Status Agendado + Categorias de Evento)
                const eventsData = await EventosService.listar({
                    status: 'agendado',
                    // Buscamos tudo agendado e filtramos no front para garantir exclusão de informativos se vierem juntos
                    limit: 10
                });

                // Publicações (Status Realizado)
                const pastData = await EventosService.listar({
                    status: 'realizado',
                    limit: 16
                });
                
                setInformativos(infoData);
                setEventosAgendados(eventsData.filter(e => e.categoria !== 'informativo'));
                setPublicacoes(pastData.filter(e => e.midia && e.midia.length > 0));
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
        <div className="space-y-16 sm:space-y-32 pb-20">
            {/* Seção 1: Informativos & Avisos (Destaque Moderno) */}
            {informativos.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1.5 bg-red-600 rounded-full"></div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
                            Comunicados <span className="text-red-600">& Avisos</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {informativos.map(info => (
                            <div key={info.id} className="relative group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col sm:flex-row gap-6 items-center">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                                
                                <div className="relative z-10 bg-red-600 text-white p-5 rounded-2xl shadow-lg shadow-red-200">
                                    <Info className="h-8 w-8" />
                                </div>

                                <div className="relative z-10 flex-1 text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate-2-lines">{info.titulo}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-medium">{info.descricao}</p>
                                    {info.link_cta && (
                                        <a 
                                            href={info.link_cta} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-red-600 font-bold text-sm hover:gap-2 transition-all"
                                        >
                                            Saiba mais <ChevronRight className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Seção 2: Agenda de Eventos (Cards Verticais) */}
            <section className="relative overflow-hidden pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-50/50 to-transparent -z-10"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                Próximos Encontros
                            </div>
                            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase">
                                Agenda de <span className="text-red-600">Eventos</span>
                            </h2>
                        </div>
                        <div className="mt-8 md:mt-0 flex gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total</p>
                                <p className="text-2xl font-black text-gray-900">{eventosAgendados.length}</p>
                            </div>
                        </div>
                    </div>

                    {eventosAgendados.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {eventosAgendados.map(evt => (
                                <div key={evt.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img 
                                            src={evt.midia?.[0]?.url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={evt.titulo}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        
                                        {/* Badge de Data */}
                                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                            <div className="bg-white rounded-2xl p-2 px-3 text-center min-w-[50px] shadow-xl">
                                                <p className="text-red-600 text-xl font-black leading-none">{new Date(evt.data_inicio + 'T12:00:00').getDate()}</p>
                                                <p className="text-gray-500 text-[9px] font-bold uppercase">{new Date(evt.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</p>
                                            </div>
                                            <div className="text-white">
                                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Início às</p>
                                                <p className="text-sm font-black">20:00h</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {evt.categoria || 'Geral'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight">
                                            {evt.titulo}
                                        </h3>
                                        
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center text-gray-500 text-sm font-medium">
                                                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                                <span className="truncate">{evt.local || 'Sede IBUC'}</span>
                                            </div>
                                        </div>
                                        
                                        {evt.link_cta && (
                                            <Button asChild className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 shadow-lg shadow-red-200 transition-all font-bold">
                                                <a href={evt.link_cta} target="_blank" rel="noopener noreferrer">
                                                    Garantir Vaga
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold italic">Nenhum evento futuro agendado.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Seção 3: Mural de Memórias (Publicações - Visual Dark/Glass) */}
            <section className="bg-gray-950 py-24 sm:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 blur-[150px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[150px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                            Registros Históricos
                        </div>
                        <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase mb-6">
                            Mural de <span className="text-blue-500">Publicações</span>
                        </h2>
                        <p className="text-lg text-white/50 font-medium leading-relaxed">
                            Acompanhe os melhores momentos, resumos e galeria de fotos de tudo o que o IBUC tem realizado.
                        </p>
                    </div>

                    {publicacoes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {publicacoes.flatMap(evt => evt.midia.map((m, idx) => ({ ...m, eventTitle: evt.titulo, id: `${evt.id}-${idx}` }))).map((m, i) => (
                                <div 
                                    key={m.id}
                                    className={`group relative overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 ${
                                        i % 5 === 0 ? 'md:col-span-2 md:row-span-2 aspect-video md:aspect-auto' : 'aspect-square'
                                    } rounded-[1.5rem] sm:rounded-[2rem] border border-white/5`}
                                    onClick={() => openLightbox(m.url, m.type)}
                                >
                                    <img 
                                        src={m.type === 'image' ? m.url : `https://img.youtube.com/vi/${getYouTubeId(m.url)}/hqdefault.jpg`} 
                                        alt={m.eventTitle}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 flex justify-between items-end">
                                        <div className="max-w-[80%]">
                                            <p className="text-white text-xs sm:text-base font-black uppercase tracking-tight line-clamp-2 leading-none">
                                                {m.eventTitle}
                                            </p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-full text-white border border-white/20">
                                            {m.type === 'video' ? <Play className="h-4 w-4 fill-white" /> : <ImageIcon className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-white/20 border border-white/5 rounded-[3rem] bg-white/[0.02]">
                            Nenhuma publicação encontrada no momento.
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
