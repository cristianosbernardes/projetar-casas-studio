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
import { MessageSquare, Mail, Phone, Calendar } from "lucide-react";

// Mock data for demonstration
const MOCK_LEADS = [
    {
        id: 1,
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 99876-5432",
        project: "Casa Térrea Moderna 3 Quartos 101",
        message: "Gostaria de saber se é possível aumentar a garagem para 3 carros.",
        date: "2024-03-20T14:30:00",
        status: "new", // new, contacted, closed
        type: "modification"
    },
    {
        id: 2,
        name: "Maria Oliveira",
        email: "maria.oli@email.com",
        phone: "(21) 98765-4321",
        project: "Sobrado com Varanda Gourmet",
        message: "Tenho um terreno 10x20, esse projeto cabe?",
        date: "2024-03-19T09:15:00",
        status: "contacted",
        type: "question"
    },
    {
        id: 3,
        name: "Carlos Santos",
        email: "carlos.santos@email.com",
        phone: "(31) 99999-8888",
        project: "Casa Térrea Moderna 3 Quartos 101",
        message: "Preciso de um orçamento para o projeto estrutural + elétrico.",
        date: "2024-03-18T16:45:00",
        status: "closed",
        type: "budget"
    }
];

export function AdminLeadsList() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-green-500 hover:bg-green-600">Novo</Badge>;
            case 'contacted':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Em Contato</Badge>;
            case 'closed':
                return <Badge variant="outline" className="text-muted-foreground">Finalizado</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Solicitações e Leads
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie as mensagens e pedidos de modificação recebidos.
                    </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                    {MOCK_LEADS.length} solicitações
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Projeto</TableHead>
                                <TableHead>Mensagem</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_LEADS.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(lead.date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{lead.name}</span>
                                            <span className="text-xs text-muted-foreground">{lead.email}</span>
                                            <span className="text-xs text-muted-foreground">{lead.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px] truncate text-sm">
                                        {lead.project}
                                    </TableCell>
                                    <TableCell className="max-w-[300px]">
                                        <p className="truncate text-sm text-muted-foreground" title={lead.message}>
                                            {lead.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(lead.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Contatar via WhatsApp">
                                                <Phone className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Enviar Email">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
