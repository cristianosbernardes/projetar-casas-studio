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
import { MessageSquare, Phone, Loader2, User } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModificationRequest } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminLeadsList() {
    // Buscar leads do Supabase
    const { data: leads, isLoading } = useQuery({
        queryKey: ['modification_requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('modification_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as ModificationRequest[];
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
                                    <Badge variant="outline" className="mt-1 lowercase">
                                        {lead.phase === 'idea' ? 'Ideia' : lead.phase === 'planning' ? 'Planejamento' : 'Pronto para Construir'}
                                    </Badge>
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
                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`, '_blank')}>
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
