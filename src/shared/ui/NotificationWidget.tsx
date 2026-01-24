import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/shared/ui';
import { Bell, Check, ExternalLink, Info, Wallet, Rocket, AlertCircle } from 'lucide-react';
import { NotificationAPI, type Notificacao } from '@/shared/api/NotificationService';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const NotificationWidget: React.FC = () => {
    const [notifications, setNotifications] = useState<Notificacao[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            const data = await NotificationAPI.list();
            setNotifications(data || []);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Polling a cada 2 minutos (opcional, pode ser substituído por Realtime futuramente)
        const interval = setInterval(loadNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await NotificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
        } catch (error) {
            toast.error('Erro ao marcar como lida');
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'cobranca': return <Wallet className="h-5 w-5 text-orange-500" />;
            case 'inicio_aulas': return <Rocket className="h-5 w-5 text-purple-500" />;
            case 'sistema': return <Info className="h-5 w-5 text-blue-500" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    if (loading && notifications.length === 0) {
        return <Card className="p-4"><p className="text-gray-500 text-center text-sm">Carregando avisos...</p></Card>;
    }

    const unread = notifications.filter(n => !n.lida);

    if (notifications.length === 0) return null;

    return (
        <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-teal-600" />
                    Avisos e Notificações
                    {unread.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unread.length}</span>}
                </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {notifications.map((n) => (
                    <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.lida ? 'bg-teal-50/30' : ''}`}>
                        <div className="flex gap-4">
                            <div className="mt-1">{getIcon(n.tipo)}</div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-semibold ${!n.lida ? 'text-gray-900' : 'text-gray-600'}`}>{n.titulo}</p>
                                    <span className="text-[10px] text-gray-400 font-mono italic">
                                        {new Date(n.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 leading-snug">{n.mensagem}</p>
                                <div className="mt-3 flex gap-3">
                                    {!n.lida && (
                                        <button 
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center"
                                        >
                                            <Check className="h-3 w-3 mr-1" /> Marcar como lida
                                        </button>
                                    )}
                                    {n.link && (
                                        <Link 
                                            to={n.link}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                        >
                                            <ExternalLink className="h-3 w-3 mr-1" /> Acessar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
