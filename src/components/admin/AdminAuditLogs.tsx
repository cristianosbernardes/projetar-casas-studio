import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemLog {
    id: string;
    action_type: string;
    entity: string;
    entity_id: string;
    details: any;
    created_at: string;
    user_id: string;
    user_email?: string; // Join manual ou via view se necessario
}

export function AdminAuditLogs() {
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const { data: logs, isLoading, refetch } = useQuery({
        queryKey: ['system-logs'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('system_logs')
                .select(`
                    id,
                    action_type,
                    entity,
                    entity_id,
                    details,
                    created_at,
                    user_id
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            // Fetch user emails manually since we don't have a direct join on auth.users easily without a view
            const userIds = [...new Set(data.map((l: any) => l.user_id).filter(Boolean))];

            // We can't select from auth.users directly via client usually, but we can try profiles if available
            // Or just display ID. Let's try profiles if assuming they exist and are synced.
            // If not, we just show ID.

            return data as SystemLog[];
        },
    });

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            'LOGIN': 'bg-blue-100 text-blue-700',
            'CREATE': 'bg-green-100 text-green-700',
            'UPDATE': 'bg-yellow-100 text-yellow-700',
            'DELETE': 'bg-red-100 text-red-700',
            'EXPORT': 'bg-purple-100 text-purple-700',
        };
        return <Badge className={`${colors[action] || 'bg-gray-100 text-gray-700'} border-0`}>{action}</Badge>;
    };

    const filteredLogs = logs?.filter(log => {
        if (actionFilter !== 'all' && log.action_type !== actionFilter) return false;
        if (entityFilter !== 'all' && log.entity !== entityFilter) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                log.entity_id?.toLowerCase().includes(searchLower) ||
                JSON.stringify(log.details).toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-primary" />
                        Logs de Auditoria
                    </h1>
                    <p className="text-muted-foreground">Rastreabilidade completa de ações do sistema.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Filtros</CardTitle>
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por ID ou detalhes..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Tipo de Ação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Ações</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="CREATE">Criação</SelectItem>
                                <SelectItem value="UPDATE">Edição</SelectItem>
                                <SelectItem value="DELETE">Exclusão</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Entidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Entidades</SelectItem>
                                <SelectItem value="PROJECTS">Projetos</SelectItem>
                                <SelectItem value="LEADS">Leads</SelectItem>
                                <SelectItem value="AUTH">Autenticação</SelectItem>
                                <SelectItem value="SETTINGS">Configurações</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Ação</TableHead>
                                        <TableHead>Entidade</TableHead>
                                        <TableHead>Detalhes</TableHead>
                                        <TableHead>Usuário (ID)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!filteredLogs?.length ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum log encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                                                </TableCell>
                                                <TableCell>{getActionBadge(log.action_type)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{log.entity}</Badge>
                                                    {log.entity_id && (
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-1 max-w-[100px] truncate" title={log.entity_id}>
                                                            ID: {log.entity_id}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <div className="text-xs font-mono bg-muted/50 p-2 rounded max-h-[100px] overflow-y-auto whitespace-pre-wrap">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {log.user_id}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
