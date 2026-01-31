
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Gift, ArrowRight } from 'lucide-react';

export const ExitIntentPopup = () => {
    const [open, setOpen] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (hasTriggered) return;

            // Trigger when mouse leaves the top of the viewport
            if (e.clientY <= 0) {
                setOpen(true);
                setHasTriggered(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hasTriggered]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-gray-50 border-2 border-amber-200">


                <div className="flex flex-col items-center text-center pt-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Gift className="h-8 w-8 text-amber-600" />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                            Espere! Não vá embora ainda...
                        </DialogTitle>
                        <DialogDescription className="text-lg text-gray-600">
                            Temos uma condição especial para você fechar seu projeto hoje.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-2">
                        <p className="font-medium text-gray-800">
                            Finalize agora e garanta <span className="text-green-600 font-bold">Prioridade na Produção</span> + <span className="text-amber-600 font-bold">Envio por E-mail</span>.
                        </p>
                        <p className="text-sm text-gray-500">
                            Oferta válida apenas para esta sessão.
                        </p>
                    </div>

                    <DialogFooter className="w-full sm:justify-center">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg shadow-lg shadow-green-600/20"
                            onClick={() => setOpen(false)}
                        >
                            Quero Aproveitar
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </DialogFooter>

                    <button
                        onClick={() => setOpen(false)}
                        className="mt-4 text-xs text-muted-foreground hover:text-gray-600 underline"
                    >
                        Não, obrigado. Vou perder essa oportunidade.
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
