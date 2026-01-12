import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, Globe, Phone, Mail, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSetting {
    key: string;
    value: string;
    description: string;
}

export function AdminSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

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

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary" />
                    Configurações Globais
                </h1>
                <p className="text-muted-foreground">Personalize as variáveis do sistema sem editar código.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Empresa e Contato</CardTitle>
                    <CardDescription>Informações exibidas no rodapé e botões de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={updateSettingMutation.isPending} className="min-w-[140px]">
                            {updateSettingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Configurações Avançadas</CardTitle>
                    <CardDescription>Variáveis técnicas usadas pelo sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
            </Card>
        </div>
    );
}
