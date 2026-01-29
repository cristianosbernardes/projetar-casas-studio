import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MoreVertical, Phone, Calendar, ArrowRight, Eye, MessageSquare, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ModificationRequest } from '@/types/database';

export function AdminModificationsList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['modification-requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('modification_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as ModificationRequest[];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('modification_requests')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
            toast({ title: "Status atualizado com sucesso!" });
            if (selectedRequest) {
                setSelectedRequest(prev => prev ? { ...prev, status: 'contacted' } : null);
            }
        },
        onError: () => {
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    });

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Novo</Badge>;
            case 'contacted':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">Contatado</Badge>;
            case 'closed':
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">Fechado</Badge>;
            case 'deal':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Fechado (Ganho)</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleWhatsApp = (phone: string, name: string) => {
        const message = `Olá ${name}, vi sua solicitação de modificação no Projetar Casas. Podemos conversar?`;
        window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');

        // Auto update status to contacted if new
        if (selectedRequest && selectedRequest.status === 'new') {
            updateStatusMutation.mutate({ id: selectedRequest.id, status: 'contacted' });
        }
    };

    const openDetails = (req: ModificationRequest) => {
        setSelectedRequest(req);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Projeto</TableHead>
                            <TableHead>Fase / Prazo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!requests?.length ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Nenhuma solicitação encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id} className="group">
                                    <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(req.created_at!), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{req.name}</span>
                                            <span className="text-xs text-muted-foreground">{req.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-sm">{req.project_title || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs gap-1">
                                            <div className='flex items-center gap-1'>
                                                <span className='font-semibold text-gray-500'>Fase:</span>
                                                {req.phase === 'idea' && 'Ideia'}
                                                {req.phase === 'planning' && 'Planejamento'}
                                                {req.phase === 'ready' && 'Pronto p/ construir'}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <span className='font-semibold text-gray-500'>Prazo:</span>
                                                {req.timeline === '30-days' && 'Urgente (30d)'}
                                                {req.timeline === '3-months' && 'Médio (3 meses)'}
                                                {req.timeline === 'undefined' && 'Indefinido'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(req.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openDetails(req)} title="Ver Detalhes">
                                                <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleWhatsApp(req.whatsapp, req.name)}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                title="Chamar no WhatsApp"
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'new' })}>
                                                        Marcar como Novo
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'contacted' })}>
                                                        Marcar como Contatado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'deal' })}>
                                                        Marcar como Fechado (Ganho)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'closed' })}>
                                                        Arquivar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* DETAILS DIALOG */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Solicitação</DialogTitle>
                        <DialogDescription>Recebido em {selectedRequest && format(new Date(selectedRequest.created_at!), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="col-span-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    O que o cliente quer mudar:
                                </h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    "{selectedRequest.description}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cliente</h4>
                                    <p className="font-medium">{selectedRequest.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-3 w-3 text-green-600" />
                                        <span className="text-sm">{selectedRequest.whatsapp}</span>
                                    </div>
                                    {selectedRequest.want_call && (
                                        <Badge variant="outline" className="mt-2 border-green-200 bg-green-50 text-green-700">
                                            Pede Ligação ({selectedRequest.call_time})
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Projeto Base</h4>
                                    <p className="font-medium">{selectedRequest.project_title}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Terreno</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {selectedRequest.topography === 'flat' && 'Plano'}
                                            {selectedRequest.topography === 'uphill' && 'Aclive (Sobe)'}
                                            {selectedRequest.topography === 'downhill' && 'Declive (Desce)'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Dimensões: {selectedRequest.width}m (Frente) x {selectedRequest.depth}m (Fundo)
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Extras</h4>
                                    <div className="flex flex-col gap-2">
                                        <Badge variant="secondary" className="w-fit">
                                            Origem: {selectedRequest.source}
                                        </Badge>
                                        {selectedRequest.want_bbq ? (
                                            <Badge className="w-fit bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Quer Churrasqueira 🔥</Badge>
                                        ) : (
                                            <Badge variant="outline" className="w-fit text-muted-foreground">Sem Churrasqueira</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 pt-4 border-t mt-2">
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Fechar</Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleWhatsApp(selectedRequest.whatsapp, selectedRequest.name)}
                                >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Chamar no WhatsApp
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
