import { useState, useMemo } from 'react';
import { Check, Info, Sparkles, BookOpen, CreditCard, Zap, Droplets, Wrench, Building2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { formatCurrency, cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import type { Project, PackageType } from '@/types/database';

interface AddonOption {
    id: PackageType;
    name: string;
    description: string;
    icon: React.ReactNode;
    priceKey: 'price' | 'price_electrical' | 'price_hydraulic' | 'price_sanitary' | 'price_structural';
}

const ADDONS: AddonOption[] = [
    {
        id: 'electrical',
        name: 'Elétrico',
        description: 'Pontos de energia, iluminação e tomadas.',
        icon: <Zap className="h-4 w-4" />,
        priceKey: 'price_electrical',
    },
    {
        id: 'hydraulic',
        name: 'Hidráulico',
        description: 'Água fria, água quente e esgoto.',
        icon: <Droplets className="h-4 w-4" />,
        priceKey: 'price_hydraulic',
    },
    {
        id: 'sanitary',
        name: 'Sanitário',
        description: 'Esgoto e tratamento de resíduos.',
        icon: <Wrench className="h-4 w-4" />,
        priceKey: 'price_sanitary',
    },
    {
        id: 'structural',
        name: 'Estrutural',
        description: 'Fundações, vigas e pilares.',
        icon: <Building2 className="h-4 w-4" />,
        priceKey: 'price_structural',
    },
];

interface ProjectAddonsProps {
    project: Project;
    onCheckout: (selectedAddons: PackageType[], total: number) => void;
    isLoading?: boolean;
}

export default function ProjectAddons({ project, onCheckout, isLoading }: ProjectAddonsProps) {
    const [selectedAddons, setSelectedAddons] = useState<PackageType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const getAddonPrice = (addon: AddonOption): number => {
        return Number(project[addon.priceKey]) || 0;
    };

    const availableAddons = useMemo(() => {
        return ADDONS.filter(addon => getAddonPrice(addon) > 0);
    }, [project]);

    const toggleAddon = (addonId: PackageType) => {
        setSelectedAddons((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    const addonsTotal = availableAddons.reduce(
        (acc, addon) => (selectedAddons.includes(addon.id) ? acc + getAddonPrice(addon) : acc),
        0
    );

    const basePrice = project.price;
    const finalTotal = basePrice + addonsTotal;
    const isCompletePackage = availableAddons.length > 0 && selectedAddons.length === availableAddons.length;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">

            {/* Base Product - Always Visible */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">Projeto Arquitetônico</p>
                        <p className="text-[10px] text-green-600 font-medium uppercase tracking-wide">Item Obrigatório</p>
                    </div>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(basePrice)}</span>
            </div>

            {/* Collapsible Addons Section */}
            {availableAddons.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                Personalizar ({availableAddons.length} Opcionais)
                            </span>
                            {selectedAddons.length > 0 && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                    {selectedAddons.length} selecionados
                                </span>
                            )}
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>

                    {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/30 divide-y divide-gray-100">
                            {availableAddons.map((addon) => {
                                const isSelected = selectedAddons.includes(addon.id);
                                return (
                                    <div
                                        key={addon.id}
                                        className={cn(
                                            "flex items-center p-3 transition-colors cursor-pointer group hover:bg-white",
                                            isSelected ? "bg-green-50/30" : ""
                                        )}
                                        onClick={() => toggleAddon(addon.id)}
                                    >
                                        <Checkbox
                                            id={addon.id}
                                            checked={isSelected}
                                            className="mr-3 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4 pointer-events-none"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium text-gray-700 truncate">{addon.name}</span>
                                                <HoverCard openDelay={200}>
                                                    <HoverCardTrigger asChild>
                                                        <Info className="h-3 w-3 text-gray-400 hover:text-green-600 cursor-help flex-shrink-0" />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="left" className="w-64 p-3">
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold text-xs text-green-700 flex items-center gap-2">
                                                                {addon.icon} {addon.name}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {addon.description}
                                                            </p>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                            + {formatCurrency(getAddonPrice(addon))}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Gift Banner - Compact */}
            {availableAddons.length > 0 && selectedAddons.length === availableAddons.length ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-3 items-center animate-pulse">
                    <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-800 leading-none">Brinde Desbloqueado!</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">Você ganhou o Manual do Construtor.</p>
                    </div>
                </div>
            ) : availableAddons.length > 0 && (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">
                        Selecione todos os opcionais para ganhar um <span className="font-bold text-emerald-600">Brinde Exclusivo</span>.
                    </p>
                </div>
            )}

            <div className="space-y-3 pt-2">
                <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                    <div>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Final</span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                            {formatCurrency(finalTotal)}
                        </span>
                        <p className="text-[10px] text-green-600 font-bold">12x de {formatCurrency(finalTotal / 12)}</p>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-sm font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200/50 transition-all hover:scale-[1.01] uppercase tracking-wide rounded-xl"
                    onClick={() => onCheckout(selectedAddons, finalTotal)}
                    disabled={isLoading}
                >
                    {isLoading ? "Processando..." : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Comprar Projeto Agora
                        </>
                    )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                    <Lock className="h-2.5 w-2.5" />
                    <span>Pagamento Seguro SSL | Satisfação Garantida</span>
                </div>
            </div>
        </div>
    );
}
