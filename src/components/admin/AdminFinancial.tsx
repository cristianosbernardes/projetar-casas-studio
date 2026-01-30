import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, DollarSign, FileText, Plus, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Badge } from '@/components/ui/badge';

interface Sale {
    id: string;
    customer_name: string;
    amount: number;
    status: string;
    sale_date: string;
    project_id?: string;
    payment_method: string;
}

export function AdminFinancial() {
    const { toast } = useToast();
    const { logAction } = useAuditLog();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [newSale, setNewSale] = useState({
        customer_name: '',
        amount: '',
        status: 'paid',
        payment_method: 'pix',
        notes: ''
    });

    const { data: sales, isLoading } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .order('sale_date', { ascending: false });
            if (error) throw error;
            return data as Sale[];
        }
    });

    const createSaleMutation = useMutation({
        mutationFn: async (data: any) => {
            // @ts-ignore
            const { error } = await supabase.from('sales').insert([data]);
            if (error) throw error;
            logAction({ action: 'CREATE', entity: 'FINANCE', details: { type: 'sale_manual', amount: data.amount } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            setIsCreateOpen(false);
            setNewSale({ customer_name: '', amount: '', status: 'paid', payment_method: 'pix', notes: '' });
            toast({ title: "Venda registrada!" });
        },
        onError: (err) => {
            toast({ title: "Erro ao registrar venda", description: err.message, variant: "destructive" });
        }
    });

    const totalRevenue = sales?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

    const handleReceipt = (sale: Sale) => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                    <head>
                        <title>Recibo #${sale.id.slice(0, 8)}</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                            .title { font-size: 24px; font-weight: bold; color: #333; }
                            .details { margin-bottom: 30px; }
                            .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f5f5f5; padding-bottom: 5px; }
                            .label { font-weight: bold; color: #666; }
                            .total { font-size: 20px; font-weight: bold; margin-top: 20px; text-align: right; }
                            .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="title">RECIBO DE PAGAMENTO</div>
                            <p>Projetar Casas - Soluções Arquitetônicas</p>
                        </div>
                        <div class="details">
                            <div class="row">
                                <span class="label">Cliente:</span>
                                <span>${sale.customer_name}</span>
                            </div>
                            <div class="row">
                                <span class="label">Data:</span>
                                <span>${new Date(sale.sale_date).toLocaleDateString()}</span>
                            </div>
                            <div class="row">
                                <span class="label">Método:</span>
                                <span>${sale.payment_method.toUpperCase()}</span>
                            </div>
                            <div class="row">
                                <span class="label">Status:</span>
                                <span>${sale.status === 'paid' ? 'PAGO' : sale.status.toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="total">
                            VALOR TOTAL: R$ ${Number(sale.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div class="footer">
                            <p>Este recibo foi gerado eletronicamente em ${new Date().toLocaleString()}.</p>
                            <p>Obrigado pela preferência!</p>
                        </div>
                        <script>window.print();</script>
                    </body>
                </html>
            `);
            win.document.close();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <DollarSign className="h-8 w-8 text-primary" />
                        Financeiro
                    </h1>
                    <p className="text-muted-foreground">Gestão de vendas e receita.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Venda
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Venda</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome do Cliente</Label>
                                <Input
                                    value={newSale.customer_name}
                                    onChange={e => setNewSale({ ...newSale, customer_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor (R$)</Label>
                                <Input
                                    type="number"
                                    value={newSale.amount}
                                    onChange={e => setNewSale({ ...newSale, amount: e.target.value })}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => createSaleMutation.mutate({
                                    ...newSale,
                                    amount: Number(newSale.amount)
                                })}
                            >
                                Salvar Venda
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">+0% em relação ao mês anterior (Demo)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sales?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Transações registradas</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></TableCell>
                                </TableRow>
                            ) : sales?.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{format(new Date(sale.sale_date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{sale.customer_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={sale.status === 'paid' ? 'default' : 'secondary'}>
                                            {sale.status === 'paid' ? 'Pago' : sale.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>R$ {Number(sale.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleReceipt(sale)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Recibo
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
