
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModificationRequest } from "@/types/database";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { startOfMonth, format, subMonths, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface AdminModificationsStatsProps {
    requests: ModificationRequest[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS: Record<string, string> = {
    new: '#3b82f6', // blue-500
    contacted: '#eab308', // yellow-500
    deal: '#22c55e', // green-500
    closed: '#64748b' // slate-500
};

export function AdminModificationsStats({ requests }: AdminModificationsStatsProps) {
    if (!requests) return null;

    // 1. KPIs
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'new').length;
    const contactedRequests = requests.filter(r => r.status === 'contacted').length;
    const dealRequests = requests.filter(r => r.status === 'deal').length;

    // Conversion Rate (Deal / Total)
    const conversionRate = totalRequests > 0 ? ((dealRequests / totalRequests) * 100).toFixed(1) : "0";

    // 2. Status Distribution (Pie Chart)
    const statusData = [
        { name: 'Novos', value: pendingRequests, color: STATUS_COLORS.new },
        { name: 'Em Contato', value: contactedRequests, color: STATUS_COLORS.contacted },
        { name: 'Fechados', value: dealRequests, color: STATUS_COLORS.deal },
        { name: 'Arquivados', value: requests.filter(r => r.status === 'closed').length, color: STATUS_COLORS.closed },
    ].filter(item => item.value > 0);

    // 3. Requests over time (Last 6 months)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), i);
        return {
            name: format(date, 'MMM', { locale: ptBR }),
            fullName: format(date, 'MMMM yyyy', { locale: ptBR }),
            date: date,
            value: 0
        };
    }).reverse();

    requests.forEach(req => {
        const reqDate = new Date(req.created_at);
        const month = last6Months.find(m => isSameMonth(m.date, reqDate));
        if (month) {
            month.value += 1;
        }
    });

    // 4. Top Projects
    const projectCount: Record<string, { name: string, count: number }> = {};
    requests.forEach(req => {
        if (req.project_title) {
            if (!projectCount[req.project_title]) {
                projectCount[req.project_title] = { name: req.project_title, count: 0 };
            }
            projectCount[req.project_title].count += 1;
        }
    });

    const topProjects = Object.values(projectCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground">Pedidos recebidos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos (Pendente)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">Aguardando contato</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{contactedRequests}</div>
                        <p className="text-xs text-muted-foreground">Em andamento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
                        <p className="text-xs text-muted-foreground">{dealRequests} fechados</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Evolution Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Evolução Mensal</CardTitle>
                        <CardDescription>Volume de solicitações nos últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={last6Months}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} name="Solicitações" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Distribuição por Status</CardTitle>
                        <CardDescription>Visão geral do funil</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    {/* Legends are handled by Tooltip, or can be custom */}
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {statusData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Projetos Mais Solicitados</CardTitle>
                    <CardDescription>Os projetos que mais geram interesse de modificação</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProjects.map((project, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <span className="font-medium text-sm">{project.name}</span>
                                </div>
                                <span className="font-bold">{project.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
