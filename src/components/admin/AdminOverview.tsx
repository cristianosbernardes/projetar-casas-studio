import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, DollarSign, Users, Eye, Building2, TrendingUp } from 'lucide-react';

export function AdminOverview() {
    // 1. Fetch KPI Data
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-overview-stats'],
        queryFn: async () => {
            // Parallel fetches for efficiency
            const [projectsRes, leadsRes] = await Promise.all([
                supabase.from('projects').select('id, price, views, title').is('deleted_at', null),
                supabase.from('leads').select('id, total_value, status, created_at'),
            ]);

            const projects = (projectsRes.data || []) as unknown as { id: string, price: number, views: number | null, title: string }[];
            const leads = (leadsRes.data || []) as unknown as { id: string, total_value: number | null, status: string | null, created_at: string }[];

            // Calculate KPIs
            const totalProjects = projects.length;
            const totalViews = projects.reduce((acc, curr) => acc + (curr.views || 0), 0);
            const totalLeads = leads.length;
            const potentialRevenue = leads.reduce((acc, curr) => acc + (curr.total_value || 0), 0);

            // Prepare Top 5 Projects
            const topProjects = [...projects]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map(p => ({
                    name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
                    views: p.views || 0
                }));

            // Prepare Monthly Leads Chart
            // Group leads by month
            const monthlyDataMap = new Map();
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            leads.forEach(lead => {
                const date = new Date(lead.created_at);
                const monthIndex = date.getMonth();
                const key = months[monthIndex];

                if (!monthlyDataMap.has(key)) {
                    monthlyDataMap.set(key, { name: key, leads: 0, sales: 0 });
                }

                const entry = monthlyDataMap.get(key);
                entry.leads += 1;
                // Assuming 'closed_won' is a sale
                if (lead.status === 'closed_won') {
                    entry.sales += (lead.total_value || 0);
                }
            });

            // Sort by month index logic or just use fixed array if we want full year
            // let's just make it dynamic based on existing data
            const monthlyChartData = Array.from(monthlyDataMap.values());

            return {
                kpi: { totalProjects, totalViews, totalLeads, potentialRevenue },
                charts: { topProjects, monthlyChartData }
            };
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { kpi, charts } = stats || { kpi: {}, charts: {} };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
                <p className="text-muted-foreground mt-1">Acompanhe a performance do seu negócio em tempo real.</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {kpi?.potentialRevenue?.toLocaleString('pt-BR') || '0,00'}</div>
                        <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads Totais</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi?.totalLeads || 0}</div>
                        <p className="text-xs text-muted-foreground">+15 novos leads este mês</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi?.totalViews || 0}</div>
                        <p className="text-xs text-muted-foreground">Acessos totais aos projetos</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi?.totalProjects || 0}</div>
                        <p className="text-xs text-muted-foreground">Projetos no portfólio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Main Sales/Leads Chart */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Performance de Leads</CardTitle>
                        <CardDescription>Volume de leads recebidos por mês.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.monthlyChartData || []}>
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
                                    <Bar dataKey="leads" fill="#0f172a" radius={[4, 4, 0, 0]} name="Leads" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Projects Chart */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Projetos Mais Acessados</CardTitle>
                        <CardDescription>Top 5 projetos por visualizações.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts?.topProjects || []} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="views" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} name="Visualizações">
                                        {charts?.topProjects?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#2563eb'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
