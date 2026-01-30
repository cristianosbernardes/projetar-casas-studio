import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    created_at: string;
    link?: string;
}

export function AdminNotifications() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch Notifications
    const { data: notifications = [] } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as Notification[];
        },
    });

    // Realtime Subscription
    useEffect(() => {
        console.log("Setting up realtime subscription for notifications...");
        const channel = supabase
            .channel('admin_notifications_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log("Notification received!", payload);
                    queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });

                    // Play sound (Base64 simple beep) if enabled
                    const soundEnabled = localStorage.getItem('admin_notification_sound') !== 'false';

                    if (soundEnabled) {
                        try {
                            const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
                            const audioUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
                            const sound = new Audio(audioUrl);
                            sound.volume = 0.5;
                            sound.play().catch((err) => console.error("Error playing sound:", err));
                        } catch (e) {
                            console.error("Audio setup error:", e);
                        }
                    }

                    toast({
                        title: "Nova Notificação",
                        description: payload.new.title || "Você tem uma nova mensagem",
                    });
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
                if (status === 'SUBSCRIBED') {
                    // toast({ title: "Conectado ao servidor de notificações", variant: "default" });
                }
            });

        return () => {
            console.log("Cleaning up subscription");
            supabase.removeChannel(channel);
        };
    }, [queryClient, toast]);

    // Mark as Read Mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        },
    });

    // Mark All as Read Mutation
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            toast({ title: "Todas marcadas como lidas" });
        },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto text-xs px-2 py-1 text-muted-foreground hover:text-primary"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            Marcar lidas
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 flex gap-3 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read && "bg-muted/30"
                                    )}
                                    onClick={() => {
                                        if (!notification.read) markAsReadMutation.mutate(notification.id);
                                        // Handle link navigation if needed
                                    }}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.read && "text-foreground")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 pt-1">
                                            {new Date(notification.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <div className="p-2 border-t text-center">
                        <span className="text-xs text-muted-foreground">Últimas 20 notificações</span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
