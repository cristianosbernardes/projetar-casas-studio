import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Phone, Calendar, DollarSign, User, ArrowRight, Ban, CheckCircle2, MapPin, MessageSquare, ShoppingBag } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

import { Lead } from '@/types/database';

type LeadStatus = 'new' | 'in_progress' | 'closed_won' | 'closed_lost';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'new', label: 'Novos', color: 'bg-blue-500/10 text-blue-500 border-blue-200' },
    { id: 'in_progress', label: 'Em Negociação', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-200' },
    { id: 'closed_won', label: 'Fechados', color: 'bg-green-500/10 text-green-500 border-green-200' },
    { id: 'closed_lost', label: 'Perdidos / Arquivados', color: 'bg-gray-500/10 text-gray-500 border-gray-200' },
];

export function AdminCRM() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads-crm'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Lead[];
        },
    });

    // ... (keep mutation same) 
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
            const { error } = await (supabase
                .from('leads')
                .update({ status } as any)
                .eq('id', id) as any);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads-crm'] });
            toast({ title: "Status atualizado com sucesso!" });
        },
        onError: () => {
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const getLeadsByStatus = (status: LeadStatus) => {
        return leads?.filter(lead => (lead.status || 'new') === status) || [];
    };

    const formatCurrency = (val: number | null) => {
        if (!val) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM de Vendas</h1>
                    <p className="text-muted-foreground">Gerencie seu funil de vendas visualmente.</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 pb-4 min-w-[1000px]">
                    {STATUS_COLUMNS.map(column => {
                        const columnLeads = getLeadsByStatus(column.id);
                        const totalValue = columnLeads.reduce((acc, curr) => acc + (curr.total_value || 0), 0);

                        return (
                            <div key={column.id} className="flex-1 flex flex-col min-w-[300px] h-full bg-muted/30 rounded-xl border border-border/50">
                                {/* Column Header */}
                                <div className={`p-4 border-b border-border/50 bg-white/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${column.color}`}>
                                            {column.label}
                                        </div>
                                        <Badge variant="secondary" className="bg-white shadow-sm">
                                            {columnLeads.length}
                                        </Badge>
                                    </div>
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Potencial: <span className="text-foreground">{formatCurrency(totalValue)}</span>
                                    </div>
                                </div>

                                {/* Leads List (Scrollable) */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                                    {columnLeads.length === 0 ? (
                                        <div className="h-32 flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-gray-100 rounded-lg">
                                            <div className="text-sm">Vazio</div>
                                        </div>
                                    ) : (
                                        columnLeads.map(lead => (
                                            <Card
                                                key={lead.id}
                                                className="shadow-sm hover:shadow-md transition-all border-border/60 hover:border-primary/20 group relative bg-white cursor-pointer"
                                                onClick={() => setSelectedLead(lead)}
                                            >
                                                <CardContent className="p-4 space-y-3">
                                                    {/* Header Card */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-sm line-clamp-1">{lead.name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(lead.created_at), "dd MMM", { locale: ptBR })}
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                                    <MoreVertical className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {STATUS_COLUMNS.filter(c => c.id !== column.id).map(s => (
                                                                    <DropdownMenuItem
                                                                        key={s.id}
                                                                        onClick={() => updateStatusMutation.mutate({ id: lead.id, status: s.id })}
                                                                    >
                                                                        Mover para {s.label}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="space-y-2">
                                                        {lead.total_value && (
                                                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                                                                <DollarSign className="h-3.5 w-3.5" />
                                                                {formatCurrency(lead.total_value)}
                                                            </div>
                                                        )}

                                                        {lead.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs w-full gap-2 text-muted-foreground hover:text-green-600 hover:border-green-200 hover:bg-green-50"
                                                                        onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`, '_blank')}
                                                                    >
                                                                        <Phone className="h-3 w-3" />
                                                                        WhatsApp
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>

                                                {/* Status Specific Footer Actions */}
                                                {column.id === 'new' && (
                                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-4 z-10" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full shadow-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                                                            title="Mover para Negociação"
                                                            onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'in_progress' })}
                                                        >
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {column.id === 'in_progress' && (
                                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-4 z-10 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
                                                            title="Venda Fechada!"
                                                            onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'closed_won' })}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full shadow-lg bg-gray-400 hover:bg-gray-500 text-white"
                                                            title="Arquivar/Perdido"
                                                            onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'closed_lost' })}
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Projeto: {selectedLead?.name}</DialogTitle>
                        <DialogDescription>
                            Solicitação enviada em {selectedLead?.created_at && format(new Date(selectedLead.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Informações de Contato */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Contato
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm"><span className="font-medium">Email:</span> {selectedLead?.email}</p>
                                <p className="text-sm flex items-center gap-2">
                                    <span className="font-medium">WhatsApp:</span>
                                    {selectedLead?.phone ? (
                                        <a
                                            href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-green-600 hover:underline flex items-center gap-1"
                                        >
                                            <Phone className="h-3 w-3" />
                                            {selectedLead.phone}
                                        </a>
                                    ) : 'Não informado'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">País:</span>{' '}
                                    {selectedLead?.country === 'BR' || !selectedLead?.country
                                        ? '🇧🇷 Brasil'
                                        : <span className="flex items-center gap-1">🌍 Internacional ({selectedLead?.country})</span>}
                                </p>
                                <p className="text-sm"><span className="font-medium">Origem:</span> {selectedLead?.source || 'Orgânico'}</p>
                            </div>
                        </div>

                        {/* Detalhes do Terreno e Projeto */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Carrinho & Projeto
                            </h3>

                            {/* Metadata / Cart Items Display */}
                            {selectedLead?.metadata && (selectedLead.metadata as any).cart_items && (selectedLead.metadata as any).cart_items.length > 0 && (
                                <div className="bg-muted/30 p-3 rounded-lg border border-muted space-y-3 mb-3">
                                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                                        <ShoppingBag className="h-3.5 w-3.5" /> Itens no Carrinho
                                    </h4>
                                    {(selectedLead.metadata as any).cart_items.map((item: any, index: number) => (
                                        <div key={index} className="bg-white p-2 rounded border border-gray-100 shadow-sm flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-sm">{item.title}</span>
                                                <span className="text-xs font-semibold text-green-600">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                                </span>
                                            </div>
                                            {item.code && (
                                                <span className="text-[10px] text-muted-foreground bg-gray-50 px-1 rounded w-fit">Ref: {item.code}</span>
                                            )}
                                            {item.addons && item.addons.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.addons.map((addon: string) => (
                                                        <Badge key={addon} variant="secondary" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">
                                                            + {addon === 'electrical' ? 'Elétrico' :
                                                                addon === 'hydraulic' ? 'Hidráulico' :
                                                                    addon === 'structural' ? 'Estrutural' :
                                                                        addon === 'sanitary' ? 'Sanitário' : addon}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Dimensões:</span>{' '}
                                    {selectedLead?.width ? `${selectedLead.width}m (frente) x ${selectedLead.depth}m (fundo)` : 'Não informado'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Topografia:</span>{' '}
                                    {selectedLead?.topography === 'flat' && 'Plano'}
                                    {selectedLead?.topography === 'uphill' && 'Aclive (sobe p/ fundo)'}
                                    {selectedLead?.topography === 'downhill' && 'Declive (desce p/ fundo)'}
                                    {!selectedLead?.topography && 'Não informada'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Churrasqueira:</span>{' '}
                                    {selectedLead?.want_bbq ? '✅ Sim' : '❌ Não'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Fase:</span>{' '}
                                    {selectedLead?.phase === 'idea' && 'Apenas Ideia'}
                                    {selectedLead?.phase === 'planning' && 'Planejamento'}
                                    {selectedLead?.phase === 'ready' && 'Pronto p/ construir'}
                                    {!selectedLead?.phase && 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Preferências de Atendimento */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Preferências
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm flex items-center gap-2">
                                    <span className="font-medium">Aceita Ligação:</span>
                                    {selectedLead?.want_call ? (
                                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">Sim</Badge>
                                    ) : (
                                        <Badge variant="secondary">Não</Badge>
                                    )}
                                </p>
                                {selectedLead?.want_call && (
                                    <p className="text-sm">
                                        <span className="font-medium">Melhor Horário:</span> {selectedLead?.call_time}
                                    </p>
                                )}
                                <p className="text-sm">
                                    <span className="font-medium">Prazo para Início:</span>{' '}
                                    {selectedLead?.timeline === 'immediate' && 'Imediato'}
                                    {selectedLead?.timeline === '30-days' && 'Até 30 dias'}
                                    {selectedLead?.timeline === '3-months' && 'Até 3 meses'}
                                    {selectedLead?.timeline === '6-months' && 'Mais de 6 meses'}
                                    {!selectedLead?.timeline && 'Indefinido'}
                                </p>
                            </div>
                        </div>

                        {/* Mensagem / Descrição */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Visão do Projeto
                            </h3>
                            <div className="bg-muted p-4 rounded-lg text-sm text-foreground/80 italic">
                                "{selectedLead?.message || 'Nenhuma descrição fornecida.'}"
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
