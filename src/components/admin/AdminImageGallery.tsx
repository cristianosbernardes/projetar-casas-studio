import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase, getOptimizedImageUrl } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AdminImageGalleryProps {
    projectId: string;
}

export function AdminImageGallery({ projectId }: AdminImageGalleryProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Fetch Images
    const { data: images, isLoading } = useQuery({
        queryKey: ['project-images', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('project_images')
                .select('*')
                .eq('project_id', projectId)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        },
    });

    // Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(fileName);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('project_images')
                .insert({
                    project_id: projectId,
                    image_url: publicUrl,
                    display_order: (images?.length || 0) + 1,
                });

            if (dbError) throw dbError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-images', projectId] });
            toast({ title: 'Gsucesso', description: 'Imagem enviada com sucesso!' });
        },
        onError: (error) => {
            console.error(error);
            toast({
                title: 'Erro no upload',
                description: 'Não foi possível enviar a imagem.',
                variant: 'destructive'
            });
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (imageId: string) => {
            const { error } = await supabase
                .from('project_images')
                .delete()
                .eq('id', imageId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-images', projectId] });
            toast({ title: 'Imagem removida' });
        },
        onError: (error) => {
            toast({
                title: 'Erro ao remover',
                description: error.message,
                variant: 'destructive'
            });
        }
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(event.target.files);

        // Upload sequentially to preserve order roughly, or Promise.all for speed
        // Let's do Promise.all but handle errors individually roughly
        try {
            await Promise.all(files.map(file => uploadMutation.mutateAsync(file)));
        } catch (e) {
            // Error handled in mutation
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Galeria do Projeto</h3>
                <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Adicionar Imagens
                        </>
                    )}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : images?.length === 0 ? (
                <div
                    className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                        Nenhuma imagem ainda. Clique para fazer upload.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images?.map((img) => (
                        <div key={img.id} className="group relative rounded-lg overflow-hidden border bg-background">
                            <AspectRatio ratio={16 / 9}>
                                <img
                                    src={getOptimizedImageUrl(img.image_url, { width: 400 })}
                                    alt="Project"
                                    className="object-cover w-full h-full"
                                />
                            </AspectRatio>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMutation.mutate(img.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
