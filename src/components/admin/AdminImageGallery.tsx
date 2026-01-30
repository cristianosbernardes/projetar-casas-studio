import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase, getOptimizedImageUrl } from '@/integrations/supabase/client';
import { convertToWebP } from '@/lib/image-optimizer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AdminImageGalleryProps {
    projectId?: string;
    onFilesSelected?: (files: File[]) => void;
    localFiles?: { file: File, preview: string }[];
    onRemoveLocalFile?: (index: number) => void;
}

export function AdminImageGallery({
    projectId,
    onFilesSelected,
    localFiles = [],
    onRemoveLocalFile
}: AdminImageGalleryProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Fetch Images (Only if projectId exists)
    const { data: images, isLoading } = useQuery({
        queryKey: ['project-images', projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const { data, error } = await supabase
                .from('project_images')
                .select('*')
                .eq('project_id', projectId)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!projectId
    });

    // Upload Mutation (Direct Upload - ONLY used when projectId exists)
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!projectId) return;

            // Converter para WebP antes de qualquer coisa
            const webpFile = await convertToWebP(file, 0.8);

            const fileExt = 'webp';
            const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(fileName, webpFile, {
                    contentType: 'image/webp',
                    upsert: false
                });

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
            toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso!' });
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

    // Delete Mutation (Direct Delete - ONLY used when projectId exists)
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

        const files = Array.from(event.target.files);

        // CASE 1: New Project Mode (Local State)
        if (!projectId) {
            if (onFilesSelected) {
                onFilesSelected(files);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // CASE 2: Existing Project Mode (Direct Upload)
        setUploading(true);
        try {
            await Promise.all(files.map(file => uploadMutation.mutateAsync(file)));
        } catch (e) {
            // Error handled in mutation
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Render Local Files (New Project Mode)
    if (!projectId) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Galeria (Novo Projeto)</h3>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Selecionar Imagens
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

                {localFiles?.length === 0 ? (
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/5 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-lg mb-1">Adicione imagens ao projeto</p>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Selecione as fotos agora. O upload será feito automaticamente ao salvar o projeto.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {localFiles?.length} imagem(ns) selecionada(s) para upload.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {localFiles?.map((fileObj, index) => (
                                <div key={index} className="group relative rounded-lg overflow-hidden border bg-background">
                                    <AspectRatio ratio={16 / 9}>
                                        <img
                                            src={fileObj.preview}
                                            alt={`Preview ${index}`}
                                            className="object-cover w-full h-full opacity-90"
                                        />
                                    </AspectRatio>

                                    {/* Badge de Capa para o primeiro item */}
                                    {index === 0 && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-1 rounded shadow-md border border-white/20">
                                                Capa
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            onClick={() => onRemoveLocalFile?.(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-2 right-2">
                                        <span className="text-[10px] uppercase font-bold bg-yellow-500/90 text-black px-2 py-0.5 rounded shadow-sm">
                                            Novo
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Render Existing Images (Edit Project Mode)
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
