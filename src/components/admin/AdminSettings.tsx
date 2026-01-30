import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, Globe, Phone, Mail, Instagram, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";  // Ensure Textarea is imported from ui components
import { useAuditLog } from '@/hooks/useAuditLog';

interface SystemSetting {
    key: string;
    value: string;
    description: string;
}

interface MessageTemplate {
    id: string;
    title: string;
    content: string;
    category: string;
    active: boolean;
}

export function AdminSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('admin_notification_sound') !== 'false';
    });

    const handleSoundToggle = (enabled: boolean) => {
        setSoundEnabled(enabled);
        localStorage.setItem('admin_notification_sound', enabled.toString());
        if (enabled) {
            // Test sound on enable
            try {
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }
        }
        toast({ title: enabled ? "Som ativado 🔊" : "Som desativado 🔇" });
    };

    const { data: settings, isLoading } = useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('key');

            if (error) throw error;
            return data as SystemSetting[];
        },
        staleTime: 300000,
    });

    useEffect(() => {
        if (settings) {
            const initial: Record<string, string> = {};
            settings.forEach(s => initial[s.key] = s.value);
            setLocalSettings(initial);
        }
    }, [settings]);

    const updateSettingMutation = useMutation({
        mutationFn: async (items: { key: string, value: string }[]) => {
            // Parallel updates
            await Promise.all(items.map(item =>
                supabase.from('system_settings').update({ value: item.value }).eq('key', item.key)
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            toast({ title: "Configurações salvas!" });
        },
        onError: () => {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    });

    const handleSave = () => {
        const updates = Object.entries(localSettings).map(([key, value]) => ({ key, value }));
        updateSettingMutation.mutate(updates);
    };

    const handleChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    // Loading handled in UI

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <Tabs defaultValue="general">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-8 w-8 text-primary" />
                            Configurações
                        </h1>
                        <p className="text-muted-foreground">Gerencie templates e variáveis do sistema.</p>
                    </div>
                    <TabsList>
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="templates">Templates de Mensagem</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências Pessoais</CardTitle>
                            <CardDescription>Configurações locais do seu painel (não afeta outros usuários).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Sons de Notificação</Label>
                                    <p className="text-sm text-muted-foreground">Reproduzir um alerta sonoro ao receber novas notificações.</p>
                                </div>
                                <Switch
                                    checked={soundEnabled}
                                    onCheckedChange={handleSoundToggle}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dados da Empresa e Contato</CardTitle>
                            <CardDescription>Informações exibidas no rodapé e botões de contato.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoading ? (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
                                        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
                                        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
                                    </div>
                                    <div className="flex justify-end pt-4"><Skeleton className="h-10 w-[140px]" /></div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp Principal</Label>
                                        <Input
                                            value={localSettings['whatsapp_main'] || ''}
                                            onChange={e => handleChange('whatsapp_main', e.target.value)}
                                            placeholder="5511999999999"
                                        />
                                        <p className="text-xs text-muted-foreground">Apenas números (com DDD e código país)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Nome da Empresa (SEO)</Label>
                                        <Input
                                            value={localSettings['company_name'] || ''}
                                            onChange={e => handleChange('company_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Link do Instagram</Label>
                                        <Input
                                            value={localSettings['instagram_url'] || ''}
                                            onChange={e => handleChange('instagram_url', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {!isLoading && (
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave} disabled={updateSettingMutation.isPending} className="min-w-[140px]">
                                        {updateSettingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações Avançadas</CardTitle>
                            <CardDescription>Variáveis técnicas usadas pelo sistema</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10" /></div>
                                    <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10" /></div>
                                </div>
                            ) : (
                                <>
                                    {settings?.filter(s => !['whatsapp_main', 'company_name', 'instagram_url'].includes(s.key)).map(setting => (
                                        <div key={setting.key} className="space-y-2">
                                            <Label>{setting.key} <span className="text-muted-foreground font-normal text-xs ml-2">({setting.description})</span></Label>
                                            <Input
                                                value={localSettings[setting.key] || ''}
                                                onChange={e => handleChange(setting.key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    {settings?.filter(s => !['whatsapp_main', 'company_name', 'instagram_url'].includes(s.key)).length === 0 && (
                                        <div className="text-sm text-muted-foreground italic">Nenhuma configuração avançada extra encontrada.</div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates">
                    <MessageTemplatesManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MessageTemplatesManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { logAction } = useAuditLog();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const { data: templates, isLoading } = useQuery({
        queryKey: ['message-templates'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase.from('message_templates').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data as MessageTemplate[];
        }
    });

    const createTemplateMutation = useMutation({
        mutationFn: async (vars: { title: string, content: string }) => {
            // @ts-ignore
            const { error } = await supabase.from('message_templates').insert([{ title: vars.title, content: vars.content }]);
            if (error) throw error;
            logAction({ action: 'CREATE', entity: 'SETTINGS', details: { type: 'template_create', title: vars.title } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['message-templates'] });
            setTitle('');
            setContent('');
            toast({ title: "Template criado!" });
        },
        onError: (err) => {
            toast({ title: "Erro ao criar", description: err.message, variant: "destructive" });
        }
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            const { error } = await supabase.from('message_templates').delete().eq('id', id);
            if (error) throw error;
            logAction({ action: 'DELETE', entity: 'SETTINGS', entityId: id, details: { type: 'template_delete' } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['message-templates'] });
            toast({ title: "Template removido!" });
        }
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Novo Template</CardTitle>
                    <CardDescription>Crie respostas prontas para agilizar o atendimento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título (Identificação Interna)</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Boas Vindas, Cobrança..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Conteúdo da Mensagem</Label>
                        <Textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Olá! Recebemos seu contato..."
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">Dica: Use variáveis como [nome] para personalizar manualmente depois.</p>
                    </div>
                    <Button onClick={() => createTemplateMutation.mutate({ title, content })} disabled={!title || !content || createTemplateMutation.isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Template
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : templates?.length === 0 ? (
                    <p className="text-muted-foreground col-span-2 text-center py-8">Nenhum template cadastrado.</p>
                ) : (
                    templates?.map(t => (
                        <Card key={t.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex justify-between items-center">
                                    {t.title}
                                    <Button variant="ghost" size="sm" onClick={() => deleteTemplateMutation.mutate(t.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.content}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
