import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Play, Save, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const AdminSqlEditor = () => {
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const runQueryMutation = useMutation({
        mutationFn: async (sql: string) => {
            const { data, error } = await supabase.rpc('admin_exec_sql', { query_text: sql });
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            if (data && !Array.isArray(data) && data.error) {
                setError(data.error);
                setResults([]);
            } else {
                setError(null);
                setResults(Array.isArray(data) ? data : []);
                toast({ title: "Query executada com sucesso!" });
            }
        },
        onError: (err: any) => {
            setError(err.message);
            setResults([]);
            toast({
                title: "Erro na execução",
                description: err.message,
                variant: "destructive"
            });
        }
    });

    const handleRun = () => {
        if (!query.trim()) return;
        runQueryMutation.mutate(query);
    };

    const presets = [
        {
            name: "Listar Projetos",
            sql: "SELECT id, title, created_at FROM projects ORDER BY created_at DESC LIMIT 10"
        },
        {
            name: "Contar Clientes",
            sql: "SELECT count(*) as total_users FROM profiles"
        },
        {
            name: "Ver Logs Recentes",
            sql: "SELECT * FROM modification_requests ORDER BY created_at DESC LIMIT 5"
        }
    ];

    const loadPreset = (sql: string) => {
        setQuery(sql);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Banco SQL
                    </h2>
                    <p className="text-muted-foreground">
                        Execute comandos SQL diretamente no banco de dados. Acesso restrito.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                Editor de Query
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="font-mono min-h-[200px] bg-slate-950 text-slate-50 border-slate-800"
                                placeholder="SELECT * FROM table..."
                            />
                            <div className="flex justify-end mt-4">
                                <Button onClick={handleRun} disabled={runQueryMutation.isPending} className="gap-2">
                                    {runQueryMutation.isPending ? (
                                        "Executando..."
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" /> Run Query
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 font-mono text-sm">
                            Error: {error}
                        </div>
                    )}

                    {results.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultados ({results.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-auto max-h-[500px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(results[0]).map((key) => (
                                                <TableHead key={key}>{key}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).map((val: any, j) => (
                                                    <TableCell key={j} className="font-mono text-xs">
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Presets</CardTitle>
                            <CardDescription>Queries pré-configuradas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {presets.map((preset, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => loadPreset(preset.sql)}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-medium">{preset.name}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {preset.sql}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
