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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Phone, Loader2, User, Eye, Calendar, Map, CheckCircle2, Clock, ShoppingBag } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModificationRequest } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

interface MessageTemplate {
    id: string;
    title: string;
    content: string;
}

export function AdminLeadsList() {
    const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
    const [selectedLeadForMessage, setSelectedLeadForMessage] = useState<ModificationRequest | null>(null);

    // Fetch templates
    const { data: templates } = useQuery({
        queryKey: ['message-templates-list'],
        queryFn: async () => {
            // @ts-ignore
            const { data } = await supabase.from('message_templates').select('*').eq('active', true);
            return data as MessageTemplate[];
        }
    });

    // Buscar leads do Supabase
    const { data: leads, isLoading } = useQuery({
        queryKey: ['modification_requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('modification_requests') // Note: Using modification_requests view/table which maps to leads? Wait, the user said "AdminLeadsList" but the code uses "modification_requests".
                // Let's check if modification_requests has metadata. The user added metadata to "leads".
                // Usually modification_requests is a view or the same table. 
                // In AdminLeadsList.tsx line 54 it calls 'modification_requests'.
                // If 'modification_requests' is a view over 'leads', I might need to update the view too?
                // Or maybe AdminLeadsList SHOULD appear to indicate 'leads' table?
                // Visualizing lines 53-56: .from('modification_requests').select('*, projects(code)')
                // The previous step added metadata to 'leads'. 
                // If modification_requests is just a view or alias for leads, we need to be careful.
                // Assuming for now I should just try to select metadata as well.
                .select('*, projects(code)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data as any[];
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!leads || leads.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma solicitação encontrada.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solicitações de Modificação</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Projeto</TableHead>
                            <TableHead>Terreno</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {lead.whatsapp}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{lead.project_title || 'Projeto Removido'}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {lead.projects?.code && (
                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                {lead.projects.code}
                                            </span>
                                        )}
                                        <Badge variant="outline" className="lowercase">
                                            {lead.phase === 'idea' ? 'Ideia' : lead.phase === 'planning' ? 'Planejamento' : 'Pronto para Construir'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant={lead.topography === 'flat' ? 'secondary' : 'default'} className="text-xs">
                                            {lead.topography === 'flat' ? 'Plano' : lead.topography === 'uphill' ? 'Aclive' : 'Declive'}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                            {lead.width}m x {lead.depth}m
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {format(new Date(lead.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        title="Ver detalhes"
                                        className="mr-2"
                                        onClick={() => setSelectedRequest(lead)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        title="Enviar Mensagem"
                                        onClick={() => setSelectedLeadForMessage(lead)}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Detalhes da Solicitação</DialogTitle>
                            <DialogDescription>
                                Enviado em {selectedRequest && format(new Date(selectedRequest.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedRequest && (
                            <ScrollArea className="h-full max-h-[60vh] pr-4">
                                <div className="space-y-6">
                                    {/* Cliente */}
                                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <User className="h-4 w-4" /> Dados do Cliente
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block">Nome:</span>
                                                <span className="font-medium">{selectedRequest.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Email:</span>
                                                <span className="font-medium">{selectedRequest.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">WhatsApp:</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {selectedRequest.whatsapp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Projeto */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="border p-4 rounded-lg space-y-3">
                                            <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4" /> Itens de Interesse
                                            </h3>

                                            {/* Check for metadata with cart items */}
                                            {selectedRequest.metadata && (selectedRequest.metadata as any).cart_items && (selectedRequest.metadata as any).cart_items.length > 0 ? (
                                                <div className="space-y-3">
                                                    {(selectedRequest.metadata as any).cart_items.map((item: any, index: number) => (
                                                        <div key={index} className="bg-muted/30 p-3 rounded border border-muted flex flex-col gap-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-medium text-sm">{item.title}</div>
                                                                    {item.code && (
                                                                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border text-muted-foreground">
                                                                            {item.code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm font-semibold text-muted-foreground">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                                                </div>
                                                            </div>

                                                            {/* Addons */}
                                                            {item.addons && item.addons.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {item.addons.map((addon: string) => (
                                                                        <Badge key={addon} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
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
                                            ) : (
                                                // Fallback for legacy leads
                                                <div>
                                                    <p className="font-medium">{selectedRequest.project_title || 'Não identificado'}</p>
                                                    {selectedRequest?.projects?.code && (
                                                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-1 inline-block">
                                                            {selectedRequest.projects.code}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border p-4 rounded-lg space-y-2">
                                            <h3 className="font-semibold text-sm text-primary">Fase da Obra</h3>
                                            <Badge variant="outline" className="text-sm">
                                                {selectedRequest.phase === 'idea' ? 'Apenas uma ideia' :
                                                    selectedRequest.phase === 'planning' ? 'Planejamento' :
                                                        'Pronto para Construir'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Terreno */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Map className="h-4 w-4" /> Informações do Terreno
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-secondary/20 p-3 rounded text-center">
                                                <span className="text-xs text-muted-foreground block uppercase">Topografia</span>
                                                <span className="font-medium">
                                                    {selectedRequest.topography === 'flat' ? 'Plano' :
                                                        selectedRequest.topography === 'uphill' ? 'Aclive' : 'Declive'}
                                                </span>
                                            </div>
                                            <div className="bg-secondary/20 p-3 rounded text-center">
                                                <span className="text-xs text-muted-foreground block uppercase">Frente</span>
                                                <span className="font-medium">{selectedRequest.width}m</span>
                                            </div>
                                            <div className="bg-secondary/20 p-3 rounded text-center">
                                                <span className="text-xs text-muted-foreground block uppercase">Fundo</span>
                                                <span className="font-medium">{selectedRequest.depth}m</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalhes Extras */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Preferências e Detalhes
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 border p-3 rounded">
                                                <div className={`w-2 h-2 rounded-full ${selectedRequest.want_bbq ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-sm">Área Gourmet / Churrasqueira</span>
                                            </div>
                                            <div className="flex items-center gap-2 border p-3 rounded">
                                                <div className={`w-2 h-2 rounded-full ${selectedRequest.want_call ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-sm">Aceita contato telefônico</span>
                                            </div>
                                        </div>

                                        {selectedRequest.call_time && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                                <Clock className="h-4 w-4" />
                                                Melhor horário para contato: <span className="font-medium text-foreground">{selectedRequest.call_time}</span>
                                            </div>
                                        )}

                                        {selectedRequest.timeline && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                Previsão de início: <span className="font-medium text-foreground">{selectedRequest.timeline}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Descrição */}
                                    {selectedRequest.description && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Mensagem / Observações</h3>
                                            <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                                "{selectedRequest.description}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>

            {/* Modal de Seleção de Template */}
            <Dialog open={!!selectedLeadForMessage} onOpenChange={() => setSelectedLeadForMessage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar Mensagem via WhatsApp</DialogTitle>
                        <DialogDescription>
                            Escolha um template ou inicie uma conversa em branco.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-4">
                        <Button
                            variant="outline"
                            className="justify-start gap-2 h-auto py-3"
                            onClick={() => {
                                if (selectedLeadForMessage) {
                                    window.open(`https://wa.me/55${selectedLeadForMessage.whatsapp.replace(/\D/g, '')}`, '_blank');
                                    setSelectedLeadForMessage(null);
                                }
                            }}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <div>
                                <span className="font-medium block text-left">Conversa em Branco</span>
                                <span className="text-xs text-muted-foreground">Abrir WhatsApp sem texto pré-definido</span>
                            </div>
                        </Button>

                        <div className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-wide">Templates</div>

                        {!templates?.length && (
                            <p className="text-sm text-muted-foreground italic">Nenhum template cadastrado em Configurações.</p>
                        )}

                        {templates?.map(template => (
                            <Button
                                key={template.id}
                                variant="secondary"
                                className="justify-start gap-2 h-auto py-3"
                                onClick={() => {
                                    if (selectedLeadForMessage) {
                                        const text = template.content.replace(/\[nome\]/gi, selectedLeadForMessage.name.split(' ')[0]);
                                        const encoded = encodeURIComponent(text);
                                        window.open(`https://wa.me/55${selectedLeadForMessage.whatsapp.replace(/\D/g, '')}?text=${encoded}`, '_blank');
                                        setSelectedLeadForMessage(null);
                                    }
                                }}
                            >
                                <Send className="h-4 w-4" />
                                <div className="overflow-hidden">
                                    <span className="font-medium block text-left truncate">{template.title}</span>
                                    <span className="text-xs text-muted-foreground block text-left truncate max-w-[300px]">{template.content}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
