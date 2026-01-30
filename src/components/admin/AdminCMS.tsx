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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, MessageSquare, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    button_text: string;
    active: boolean;
    display_order: number;
}

export function AdminCMS() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { logAction } = useAuditLog();
    const [isUploading, setIsUploading] = useState(false);

    // --- BANNERS ---
    const { data: banners, isLoading: isLoadingBanners } = useQuery({
        queryKey: ['site-banners'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase.from('site_banners').select('*').order('display_order');
            if (error) throw error;
            return data as Banner[];
        }
    });

    const bannerMutation = useMutation({
        mutationFn: async (banner: Partial<Banner>) => {
            if (banner.id) {
                // @ts-ignore
                const { error } = await supabase.from('site_banners').update(banner).eq('id', banner.id);
                if (error) throw error;
                logAction({ action: 'UPDATE', entity: 'CMS', entityId: banner.id, details: { type: 'banner_update' } });
            } else {
                // @ts-ignore
                const { error } = await supabase.from('site_banners').insert([banner]);
                if (error) throw error;
                logAction({ action: 'CREATE', entity: 'CMS', details: { type: 'banner_create', title: banner.title } });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-banners'] });
            toast({ title: "Banner salvo com sucesso!" });
        },
        onError: (err) => {
            toast({ title: "Erro ao salvar banner", description: err.message, variant: "destructive" });
        }
    });

    const deleteBannerMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            const { error } = await supabase.from('site_banners').delete().eq('id', id);
            if (error) throw error;
            logAction({ action: 'DELETE', entity: 'CMS', entityId: id, details: { type: 'banner_delete' } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-banners'] });
            toast({ title: "Banner removido!" });
        }
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, bannerId?: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `banner-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);

            if (bannerId) {
                bannerMutation.mutate({ id: bannerId, image_url: publicUrl });
            } else {
                // Para novos banners, criar um novo draft
                bannerMutation.mutate({
                    title: 'Novo Banner',
                    image_url: publicUrl,
                    display_order: (banners?.length || 0) + 1
                });
            }
        } catch (error: any) {
            toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-primary" />
                    Gestão de Conteúdo (CMS)
                </h1>
                <p className="text-muted-foreground">Gerencie banners, textos e depoimentos do site.</p>
            </div>

            <Tabs defaultValue="banners">
                <TabsList>
                    <TabsTrigger value="banners" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Banners da Home
                    </TabsTrigger>
                    {/* Futuro: Depoimentos */}
                    <TabsTrigger value="testimonials" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Depoimentos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="banners" className="space-y-6">
                    <div className="grid gap-6">
                        {/* Upload Novo Banner */}
                        <Card className="border-dashed border-2 bg-muted/5">
                            <CardHeader>
                                <CardTitle className="text-base">Adicionar Novo Banner</CardTitle>
                                <CardDescription>Faça upload de uma imagem (1920x1080 recomendado) para criar um novo banner.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="max-w-md"
                                        onChange={(e) => handleImageUpload(e)}
                                        disabled={isUploading}
                                    />
                                    {isUploading && <Loader2 className="animate-spin h-4 w-4" />}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de Banners */}
                        {isLoadingBanners ? (
                            <Loader2 className="animate-spin mx-auto" />
                        ) : banners?.map((banner) => (
                            <Card key={banner.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-64 h-48 bg-gray-100 flex-shrink-0 relative group">
                                        <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                                                Trocar Foto
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, banner.id)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <CardContent className="flex-1 p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1 w-full max-w-lg">
                                                <Label>Título Principal</Label>
                                                <Input
                                                    value={banner.title || ''}
                                                    onChange={(e) => bannerMutation.mutate({ id: banner.id, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`active-${banner.id}`}>Ativo</Label>
                                                <Switch
                                                    id={`active-${banner.id}`}
                                                    checked={banner.active}
                                                    onCheckedChange={(checked) => bannerMutation.mutate({ id: banner.id, active: checked })}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm('Excluir este banner?')) deleteBannerMutation.mutate(banner.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label>Subtítulo (Opcional)</Label>
                                                <Input
                                                    value={banner.subtitle || ''}
                                                    onChange={(e) => bannerMutation.mutate({ id: banner.id, subtitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Ordem Exibição</Label>
                                                <Input
                                                    type="number"
                                                    value={banner.display_order}
                                                    onChange={(e) => bannerMutation.mutate({ id: banner.id, display_order: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="testimonials">
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Gestão de Depoimentos</h3>
                        <p>Em breve você poderá gerenciar o que os clientes dizem sobre você aqui.</p>
                        <Button variant="outline" className="mt-4" disabled>Coming Soon</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
