
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight } from 'lucide-react';

interface LeadCaptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: { name: string; email: string; whatsapp: string }) => void;
    isLoading: boolean;
}

export const LeadCaptureDialog = ({ open, onOpenChange, onConfirm, isLoading }: LeadCaptureDialogProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'E-mail inválido';
        if (!whatsapp.trim()) newErrors.whatsapp = 'WhatsApp/Telefone é obrigatório';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onConfirm({ name, email, whatsapp });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-green-600" />
                        Finalizar Compra Segura
                    </DialogTitle>
                    <DialogDescription>
                        Informe seus dados de contato para liberarmos seu acesso e enviarmos o projeto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="lead-name" className="text-right">Nome Completo</Label>
                        <Input
                            id="lead-name"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lead-email" className="text-right">E-mail (para recebimento)</Label>
                        <Input
                            id="lead-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lead-whatsapp" className="text-right">WhatsApp / Telefone</Label>
                        <Input
                            id="lead-whatsapp"
                            placeholder="(11) 99999-9999"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className={errors.whatsapp ? 'border-red-500' : ''}
                        />
                        {errors.whatsapp && <span className="text-xs text-red-500">{errors.whatsapp}</span>}
                    </div>

                    <DialogFooter className="pt-4">
                        <div className="w-full space-y-2">
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Continuar para Pagamento
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                                <Lock className="h-3 w-3" /> Seus dados estão protegidos e não serão compartilhados.
                            </p>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
