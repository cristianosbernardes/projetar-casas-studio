import { useState, useMemo } from 'react';
import { Check, Zap, Droplets, Wrench, Building2, FileText, Sparkles, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project, PackageType } from '@/types/database';

interface AddonOption {
    id: PackageType;
    name: string;
    description: string;
    icon: React.ReactNode;
    priceKey: 'price' | 'price_electrical' | 'price_hydraulic' | 'price_sanitary' | 'price_structural';
    features: string[];
}

const ADDONS: AddonOption[] = [
    {
        id: 'architectural',
        name: 'Projeto Arquitetônico',
        description: 'Projeto completo com detalhamento executivo',
        icon: <FileText className="h-5 w-5" />,
        priceKey: 'price',
        features: ['Plantas Baixas', 'Fachadas', 'Cortes', 'Quadro de Esquadrias', 'Memorial Descritivo'],
    },
    {
        id: 'electrical',
        name: 'Projeto Elétrico',
        description: 'Dimensionamento e pontos elétricos',
        icon: <Zap className="h-5 w-5" />,
        priceKey: 'price_electrical',
        features: ['Pontos de Iluminação', 'Tomadas', 'Quadro de Distribuição', 'Fiação e Conduítes'],
    },
    {
        id: 'hydraulic',
        name: 'Projeto Hidráulico',
        description: 'Rede de água fria e quente',
        icon: <Droplets className="h-5 w-5" />,
        priceKey: 'price_hydraulic',
        features: ['Rede de Água Fria', 'Água Quente', 'Detalhamento Isométrico', 'Lista de Materiais'],
    },
    {
        id: 'sanitary',
        name: 'Projeto Sanitário',
        description: 'Esgoto e águas pluviais',
        icon: <Wrench className="h-5 w-5" />,
        priceKey: 'price_sanitary',
        features: ['Tubulação de Esgoto', 'Caixas de Gordura/Inspeção', 'Águas Pluviais', 'Fossa Séptica (se necess.)'],
    },
    {
        id: 'structural',
        name: 'Projeto Estrutural',
        description: 'Cálculos e detalhamento da estrutura',
        icon: <Building2 className="h-5 w-5" />,
        priceKey: 'price_structural',
        features: ['Fundação', 'Pilares e Vigas', 'Lajes', 'Armaduras e Ferragens'],
    },
];

interface ProjectAddonsProps {
    project: Project;
    onCheckout: (selectedAddons: PackageType[], total: number) => void;
    isLoading?: boolean;
}

const BUNDLE_DISCOUNT = 0.15; // 15% de desconto para pacote completo

export default function ProjectAddons({ project, onCheckout, isLoading = false }: ProjectAddonsProps) {
    // Architectural always selected by default
    const [selectedAddons, setSelectedAddons] = useState<PackageType[]>(['architectural']);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const getAddonPrice = (addon: AddonOption): number => {
        return Number(project[addon.priceKey]) || 0;
    };

    // Filter only addons that have a price set in the database
    const availableAddons = useMemo(() => {
        return ADDONS.filter(addon => getAddonPrice(addon) > 0);
    }, [project]);

    const { subtotal, discount, total, isCompleteBundle } = useMemo(() => {
        const sub = selectedAddons.reduce((sum, id) => {
            const addon = ADDONS.find(a => a.id === id);
            return sum + (addon ? getAddonPrice(addon) : 0);
        }, 0);

        const allAvailableSelected = availableAddons.every(addon =>
            selectedAddons.includes(addon.id)
        );

        // Only apply discount if we have more than just the base project and all available are selected
        const isComplete = allAvailableSelected && availableAddons.length > 2;
        const disc = isComplete ? sub * BUNDLE_DISCOUNT : 0;

        return {
            subtotal: sub,
            discount: disc,
            total: sub - disc,
            isCompleteBundle: isComplete,
        };
    }, [selectedAddons, availableAddons]);

    const toggleAddon = (id: PackageType) => {
        if (id === 'architectural') return; // Cannot unselect base project

        setSelectedAddons(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedAddons(availableAddons.map(a => a.id));
    };

    if (availableAddons.length === 0) return null;

    return (
        <div className="space-y-6">


            {/* Discount Banner */}
            {availableAddons.length > 2 && !isCompleteBundle && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
                    <p className="text-sm">
                        <span className="font-semibold text-primary">Dica:</span> Leve o pacote completo e ganhe{' '}
                        <span className="font-bold text-green-600">{Math.round(BUNDLE_DISCOUNT * 100)}% de desconto</span>!
                    </p>
                </div>
            )}

            {/* Addons List Compact */}
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card">
                <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
                    <span className="font-semibold text-sm text-foreground">ITENS OPCIONAIS</span>
                    <span className="text-xs text-muted-foreground">Selecione para adicionar</span>
                </div>
                {availableAddons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    const isBase = addon.id === 'architectural';
                    const price = getAddonPrice(addon);

                    return (
                        <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={cn(
                                "flex items-center justify-between p-3 transition-colors cursor-pointer hover:bg-muted/50",
                                isSelected ? "bg-primary/5" : "bg-card",
                                isBase && "pointer-events-none opacity-80"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        isSelected
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground/40"
                                    )}
                                >
                                    {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground leading-none">
                                        {addon.name}
                                    </span>
                                    {isBase && <span className="text-[10px] text-primary mt-0.5 font-bold">Obrigatório</span>}
                                </div>
                            </div>
                            <span className="font-bold text-sm text-foreground">
                                {formatPrice(price)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary & Action */}
            <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    {isCompleteBundle && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Desconto Combo</span>
                            <span>-{formatPrice(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                        <span className="text-base font-semibold">Total do Pedido</span>
                        <div className="text-right">
                            {isCompleteBundle && <span className="block text-xs text-muted-foreground line-through">{formatPrice(subtotal)}</span>}
                            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    size="lg"
                    onClick={() => onCheckout(selectedAddons, total)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        'Processando...'
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Ir para Pagamento Seguro
                        </>
                    )}
                </Button>

                <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Pagamento processado via <strong>Stripe</strong> com criptografia SSL</span>
                </div>
            </div>
        </div>
    );
}
