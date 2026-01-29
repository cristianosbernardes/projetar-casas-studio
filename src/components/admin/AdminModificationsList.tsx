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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MoreVertical, Phone, Calendar, ArrowRight, Eye, MessageSquare, MapPin, ExternalLink, Download, History, User, LayoutDashboard, List as ListIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ModificationRequest, ModificationHistory } from '@/types/database';
import { AdminModificationsStats } from './AdminModificationsStats';

export function AdminModificationsList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    // Query para histórico da solicitação selecionada
    const { data: requestHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['modification-history', selectedRequest?.id],
        queryFn: async () => {
            if (!selectedRequest?.id) return [];

            const { data, error } = await supabase
                .from('modification_history')
                .select('*')
                .eq('request_id', selectedRequest.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar histórico:', error);
                return [];
            }
            return data as ModificationHistory[];
        },
        enabled: !!selectedRequest?.id
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const currentRequest = requests?.find(r => r.id === id);
            const oldStatus = currentRequest?.status;

            // 1. Atualizar status
            const { error: updateError } = await supabase
                .from('modification_requests')
                .update({ status })
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Registrar no histórico
            // Tentar obter usuário atual (pode ser nulo se for edge function, mas aqui é client side)
            const { data: { user } } = await supabase.auth.getUser();

            if (oldStatus !== status) {
                await supabase
                    .from('modification_history')
                    .insert({
                        request_id: id,
                        previous_status: oldStatus,
                        new_status: status,
                        changed_by: user?.id,
                        notes: `Status alterado de ${oldStatus} para ${status}`
                    });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
            queryClient.invalidateQueries({ queryKey: ['modification-history'] });
            toast({ title: "Status atualizado com sucesso!" });
            if (selectedRequest) {
                setSelectedRequest(prev => prev ? { ...prev, status: 'contacted' } : null); // Isso pode precisar de ajuste lógico dependendo do status novo
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

    // Exportar para CSV
    const exportToCSV = () => {
        if (!filteredRequests.length) {
            toast({ title: "Nenhum dado para exportar", variant: "destructive" });
            return;
        }

        const headers = [
            'Data',
            'Cliente',
            'Email',
            'WhatsApp',
            'País',
            'Projeto',
            'Código Projeto',
            'Topografia',
            'Dimensões',
            'Comprimento',
            'Descrição',
            'Fase',
            'Prazo',
            'Churrasqueira',
            'Quer Ligação',
            'Horário Ligação',
            'Origem',
            'Status'
        ];

        const rows = filteredRequests.map(req => [
            format(new Date(req.created_at!), 'dd/MM/yyyy HH:mm'),
            req.name,
            req.email,
            req.whatsapp,
            req.country || 'BR',
            req.project_title,
            req.project_code || '',
            req.topography === 'flat' ? 'Plano' : req.topography === 'uphill' ? 'Aclive' : 'Declive',
            req.width,
            req.depth + 'm',
            `"${req.description?.replace(/"/g, '""')}"`, // Escape aspas
            req.phase,
            req.timeline,
            req.want_bbq ? 'Sim' : 'Não',
            req.want_call ? 'Sim' : 'Não',
            req.call_time || '',
            req.source,
            req.status === 'new' ? 'Novo' : req.status === 'contacted' ? 'Contatado' : req.status === 'deal' ? 'Fechado (Ganho)' : 'Arquivado'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `solicitacoes_modificacao_${format(new Date(), 'dd-MM-yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: `${filteredRequests.length} solicitações exportadas!` });
    };

    // Filtrar solicitações por status e busca
    const filteredRequests = requests?.filter(req => {
        // Filtro de status
        if (statusFilter !== 'all' && req.status !== statusFilter) return false;

        // Filtro de busca
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesName = req.name?.toLowerCase().includes(query);
            const matchesEmail = req.email?.toLowerCase().includes(query);
            const matchesPhone = req.whatsapp?.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
            const matchesProject = req.project_title?.toLowerCase().includes(query);
            const matchesCode = req.project_code?.toLowerCase().includes(query);

            return matchesName || matchesEmail || matchesPhone || matchesProject || matchesCode;
        }

        // Filtro de data
        if (dateFilter !== 'all') {
            const date = new Date(req.created_at!);
            const today = new Date();

            if (dateFilter === 'today') {
                if (!isWithinInterval(date, { start: startOfDay(today), end: endOfDay(today) })) return false;
            } else if (dateFilter === '7days') {
                const last7Days = subDays(today, 7);
                if (date < last7Days) return false;
            } else if (dateFilter === '30days') {
                const last30Days = subDays(today, 30);
                if (date < last30Days) return false;
            }
        }

        return true;
    }) || [];

    // Calcular contadores por status
    const statusCounts = {
        all: requests?.length || 0,
        new: requests?.filter(r => r.status === 'new').length || 0,
        contacted: requests?.filter(r => r.status === 'contacted').length || 0,
        deal: requests?.filter(r => r.status === 'deal').length || 0,
        closed: requests?.filter(r => r.status === 'closed').length || 0,
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
            <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <ListIcon className="h-4 w-4" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Indicadores
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="space-y-4">
                    {/* Filtros de Data e Busca */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg w-max">
                            <Button
                                variant={dateFilter === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setDateFilter('all')}
                                className="text-xs"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={dateFilter === 'today' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setDateFilter('today')}
                                className="text-xs"
                            >
                                Hoje
                            </Button>
                            <Button
                                variant={dateFilter === '7days' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setDateFilter('7days')}
                                className="text-xs"
                            >
                                7 dias
                            </Button>
                            <Button
                                variant={dateFilter === '30days' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setDateFilter('30days')}
                                className="text-xs"
                            >
                                30 dias
                            </Button>
                        </div>
                    </div>

                    {/* Busca */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por nome, email, telefone ou código do projeto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={exportToCSV}
                            variant="outline"
                            className="gap-2"
                            disabled={!filteredRequests.length}
                        >
                            <Download className="h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </div>

                    {/* Filtros de Status */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('all')}
                            className="gap-2"
                        >
                            Todos
                            <Badge variant="secondary" className="ml-1">{statusCounts.all}</Badge>
                        </Button>
                        <Button
                            variant={statusFilter === 'new' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('new')}
                            className="gap-2"
                        >
                            🔵 Novo
                            <Badge variant="secondary" className="ml-1">{statusCounts.new}</Badge>
                        </Button>
                        <Button
                            variant={statusFilter === 'contacted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('contacted')}
                            className="gap-2"
                        >
                            🟡 Contatado
                            <Badge variant="secondary" className="ml-1">{statusCounts.contacted}</Badge>
                        </Button>
                        <Button
                            variant={statusFilter === 'deal' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('deal')}
                            className="gap-2"
                        >
                            🟢 Fechado (Ganho)
                            <Badge variant="secondary" className="ml-1">{statusCounts.deal}</Badge>
                        </Button>
                        <Button
                            variant={statusFilter === 'closed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('closed')}
                            className="gap-2"
                        >
                            ⚫ Arquivado
                            <Badge variant="secondary" className="ml-1">{statusCounts.closed}</Badge>
                        </Button>
                    </div>
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
                                {!filteredRequests?.length ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Nenhuma solicitação encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <TableRow key={req.id} className="group">
                                            <TableCell className="text-muted-foreground text-xs">
                                                {format(new Date(req.created_at!), "dd/MM/yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{req.name}</span>
                                                        {req.country && req.country !== 'BR' && (
                                                            <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-blue-50 text-blue-700 border-blue-100">
                                                                🌍 Intl
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{req.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{req.project_title || 'N/A'}</span>
                                                    {req.project_code && (
                                                        <span className="text-[10px] text-gray-500 font-mono">Cód. {req.project_code}</span>
                                                    )}
                                                </div>
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
                                                        {req.timeline === '30-days' ? (
                                                            <Badge variant="destructive" className="h-5 px-1 text-[10px]">
                                                                🔥 Urgente (30d)
                                                            </Badge>
                                                        ) : (
                                                            <span>
                                                                {req.timeline === '3-months' && 'Médio (3 meses)'}
                                                                {req.timeline === 'undefined' && 'Indefinido'}
                                                            </span>
                                                        )}
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
                </TabsContent>

                <TabsContent value="stats">
                    <AdminModificationsStats requests={requests || []} />
                </TabsContent>
            </Tabs>

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
                                        {selectedRequest.country && selectedRequest.country_ddi && (
                                            <span className="text-sm font-medium">
                                                {selectedRequest.country === 'BR' && '🇧🇷'}
                                                {selectedRequest.country === 'PT' && '🇵🇹'}
                                                {selectedRequest.country === 'US' && '🇺🇸'}
                                                {selectedRequest.country === 'AO' && '🇦🇴'}
                                                {selectedRequest.country === 'MZ' && '🇲🇿'}
                                                {selectedRequest.country === 'ES' && '🇪🇸'}
                                                {selectedRequest.country === 'FR' && '🇫🇷'}
                                                {selectedRequest.country === 'GB' && '🇬🇧'}
                                                {selectedRequest.country === 'IT' && '🇮🇹'}
                                                {selectedRequest.country === 'DE' && '🇩🇪'}
                                                {selectedRequest.country === 'CA' && '🇨🇦'}
                                                {selectedRequest.country === 'AR' && '🇦🇷'}
                                                {selectedRequest.country === 'CH' && '🇨🇭'}
                                                {selectedRequest.country === 'AU' && '🇦🇺'}
                                                {' '}{selectedRequest.country_ddi}{' '}
                                            </span>
                                        )}
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
                                    {selectedRequest.project_code && (
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">Código: {selectedRequest.project_code}</p>
                                    )}
                                    {selectedRequest.project_id && (
                                        <a
                                            href={`/projeto/${selectedRequest.project_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Ver Projeto Original
                                        </a>
                                    )}
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
                                    <div className="text-sm space-y-1 mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">📐 Dimensões:</span>
                                            <span className="font-medium">{selectedRequest.width}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">📏 Comprimento:</span>
                                            <span className="font-medium">{selectedRequest.depth}m</span>
                                        </div>
                                        {selectedRequest.depth && selectedRequest.width && (() => {
                                            // Extrair valores numéricos do width (formato: "Frente: 10m / Fundo: 12m")
                                            const frenteMatch = selectedRequest.width.match(/Frente:\s*(\d+)/);
                                            const fundoMatch = selectedRequest.width.match(/Fundo:\s*(\d+)/);
                                            const frente = frenteMatch ? parseInt(frenteMatch[1]) : 0;
                                            const fundo = fundoMatch ? parseInt(fundoMatch[1]) : 0;
                                            const comprimento = parseInt(selectedRequest.depth);

                                            // Calcular área aproximada (média da frente e fundo * comprimento)
                                            const areaAprox = ((frente + fundo) / 2) * comprimento;

                                            return areaAprox > 0 ? (
                                                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                                    <span className="text-muted-foreground">📊 Área aprox.:</span>
                                                    <span className="font-bold text-primary">{areaAprox.toFixed(0)}m²</span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>


                                <div className="mt-6 border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <History className="h-4 w-4" />
                                        Histórico de Alterações
                                    </h4>

                                    {!requestHistory?.length ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum histórico registrado.</p>
                                    ) : (
                                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                                            {requestHistory.map((item) => (
                                                <div key={item.id} className="flex gap-3 text-sm relative pb-4 last:pb-0 border-l ml-2 pl-4 border-gray-200">
                                                    <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white" />
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900">
                                                                {item.new_status === 'new' && 'Novo'}
                                                                {item.new_status === 'contacted' && 'Contatado'}
                                                                {item.new_status === 'deal' && 'Fechado (Ganho)'}
                                                                {item.new_status === 'closed' && 'Arquivado'}
                                                                {!['new', 'contacted', 'deal', 'closed'].includes(item.new_status || '') && item.new_status}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
                                                            </span>
                                                        </div>
                                                        {item.previous_status && (
                                                            <p className="text-xs text-gray-500">
                                                                Anterior: {item.previous_status}
                                                            </p>
                                                        )}
                                                        {item.notes && (
                                                            <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs mt-1">
                                                                {item.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
        </div >
    );
}
