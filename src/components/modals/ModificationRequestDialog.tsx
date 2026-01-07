import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ModificationRequestDialogProps {
    projectTitle: string;
    projectSlug: string;
}

export function ModificationRequestDialog({ projectTitle, projectSlug }: ModificationRequestDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        description: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Solicitação de modificação:', {
            project: projectTitle,
            slug: projectSlug,
            ...formData
        });

        toast({
            title: "Solicitação Enviada!",
            description: "Recebemos seu pedido de modificação. Entraremos em contato em breve.",
        });

        setIsSubmitting(false);
        setIsOpen(false);
        setFormData({ name: '', email: '', phone: '', description: '' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-foreground">
                    <Settings2 className="h-4 w-4" />
                    Solicitar Modificação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Personalizar Projeto</DialogTitle>
                    <DialogDescription>
                        Gostou do projeto <strong>{projectTitle}</strong> mas quer fazer alguns ajustes?
                        Preencha abaixo que analisaremos para você.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Seu nome"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">WhatsApp</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="(00) 00000-0000"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">O que você gostaria de mudar?</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Ex: Gostaria de aumentar a sala, adicionar uma suíte no térreo..."
                            className="min-h-[120px]"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar Solicitação
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
