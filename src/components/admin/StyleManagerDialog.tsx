import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Style {
    id: string;
    name: string;
}

interface StyleManagerDialogProps {
    onStylesChange?: () => void;
}

export function StyleManagerDialog({ onStylesChange }: StyleManagerDialogProps) {
    const [styles, setStyles] = useState<Style[]>([]);
    const [newStyle, setNewStyle] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const fetchStyles = async () => {
        const { data } = await supabase
            .from('project_styles')
            .select('*')
            .order('name');
        if (data) setStyles(data);
    };

    useEffect(() => {
        if (isOpen) fetchStyles();
    }, [isOpen]);

    const handleAddStyle = async () => {
        if (!newStyle.trim()) return;

        setLoading(true);
        const { error } = await supabase
            .from('project_styles')
            .insert({ name: newStyle.trim() });

        if (error) {
            toast({
                title: 'Erro ao adicionar estilo',
                description: error.message.includes('unique') ? 'Este estilo já existe.' : error.message,
                variant: 'destructive',
            });
        } else {
            setNewStyle('');
            fetchStyles();
            if (onStylesChange) onStylesChange();
            toast({ title: 'Estilo adicionado!' });
        }
        setLoading(false);
    };

    const handleDeleteStyle = async (id: string, name: string) => {
        if (!confirm(`Confirmar exclusão de "${name}"?`)) return;

        const { error } = await supabase
            .from('project_styles')
            .delete()
            .eq('id', id);

        if (error) {
            toast({
                title: 'Erro ao excluir',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            fetchStyles();
            if (onStylesChange) onStylesChange();
            toast({ title: 'Estilo removido' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerenciar Estilos Arquitetônicos</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Novo estilo (ex: Colonial)"
                        value={newStyle}
                        onChange={(e) => setNewStyle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStyle()}
                    />
                    <Button onClick={handleAddStyle} disabled={loading || !newStyle.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Estilos Cadastrados</h4>
                    <ScrollArea className="h-[300px] border rounded-md p-2">
                        {styles.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-4">Nenhum estilo cadastrado.</p>
                        ) : (
                            <div className="space-y-1">
                                {styles.map((style) => (
                                    <div key={style.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group">
                                        <span className="text-sm font-medium">{style.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteStyle(style.id, style.name)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
