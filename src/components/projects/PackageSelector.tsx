import { useState, useMemo } from 'react';
import { Check, Zap, Droplets, Wrench, Building2, FileText, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project, PackageType } from '@/types/database';

interface PackageOption {
  id: PackageType;
  name: string;
  description: string;
  icon: React.ReactNode;
  priceKey: 'price' | 'price_electrical' | 'price_hydraulic' | 'price_sanitary' | 'price_structural';
  included: string[];
}

const packages: PackageOption[] = [
  {
    id: 'architectural',
    name: 'Projeto Arquitetônico',
    description: 'Projeto principal com plantas e fachadas',
    icon: <FileText className="h-5 w-5" />,
    priceKey: 'price',
    included: ['Planta baixa', 'Planta de cobertura', 'Cortes e fachadas', 'Planta de situação', 'Memorial descritivo'],
  },
  {
    id: 'electrical',
    name: 'Projeto Elétrico',
    description: 'Instalações elétricas completas',
    icon: <Zap className="h-5 w-5" />,
    priceKey: 'price_electrical',
    included: ['Planta de pontos elétricos', 'Diagrama unifilar', 'Quadro de cargas', 'Memorial de cálculo'],
  },
  {
    id: 'hydraulic',
    name: 'Projeto Hidráulico',
    description: 'Água fria e água quente',
    icon: <Droplets className="h-5 w-5" />,
    priceKey: 'price_hydraulic',
    included: ['Planta de água fria', 'Planta de água quente', 'Isométrico', 'Lista de materiais'],
  },
  {
    id: 'sanitary',
    name: 'Projeto Sanitário',
    description: 'Esgoto e águas pluviais',
    icon: <Wrench className="h-5 w-5" />,
    priceKey: 'price_sanitary',
    included: ['Planta de esgoto', 'Planta de águas pluviais', 'Detalhes de fossa/sumidouro', 'Memorial'],
  },
  {
    id: 'structural',
    name: 'Projeto Estrutural',
    description: 'Fundação e estrutura',
    icon: <Building2 className="h-5 w-5" />,
    priceKey: 'price_structural',
    included: ['Planta de fundação', 'Planta de formas', 'Armação de pilares/vigas', 'Memorial de cálculo'],
  },
];

interface PackageSelectorProps {
  project: Project;
  onSelectionChange?: (selected: PackageType[], total: number) => void;
  onWhatsAppClick?: (selected: PackageType[], total: number) => void;
}

const BUNDLE_DISCOUNT = 0.15; // 15% discount for complete bundle

const PackageSelector = ({ project, onSelectionChange, onWhatsAppClick }: PackageSelectorProps) => {
  const [selectedPackages, setSelectedPackages] = useState<PackageType[]>(['architectural']);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPackagePrice = (pkg: PackageOption): number => {
    const price = project[pkg.priceKey];
    return typeof price === 'number' ? price : 0;
  };

  const availablePackages = useMemo(() => {
    return packages.filter(pkg => {
      const price = getPackagePrice(pkg);
      return price > 0;
    });
  }, [project]);

  const { subtotal, discount, total, isCompleteBundle } = useMemo(() => {
    const sub = selectedPackages.reduce((sum, pkgId) => {
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) return sum;
      return sum + getPackagePrice(pkg);
    }, 0);

    const allAvailableSelected = availablePackages.every(pkg => 
      selectedPackages.includes(pkg.id)
    );
    const isComplete = allAvailableSelected && availablePackages.length > 1 && selectedPackages.length === availablePackages.length;
    const disc = isComplete ? sub * BUNDLE_DISCOUNT : 0;

    return {
      subtotal: sub,
      discount: disc,
      total: sub - disc,
      isCompleteBundle: isComplete,
    };
  }, [selectedPackages, availablePackages]);

  const togglePackage = (pkgId: PackageType) => {
    // Architectural is always required
    if (pkgId === 'architectural') return;

    setSelectedPackages(prev => {
      const newSelection = prev.includes(pkgId)
        ? prev.filter(id => id !== pkgId)
        : [...prev, pkgId];
      
      onSelectionChange?.(newSelection, total);
      return newSelection;
    });
  };

  const selectAllPackages = () => {
    const allIds = availablePackages.map(pkg => pkg.id);
    setSelectedPackages(allIds);
    onSelectionChange?.(allIds, total);
  };

  const handleWhatsAppClick = () => {
    onWhatsAppClick?.(selectedPackages, total);
  };

  if (availablePackages.length <= 1) {
    return null; // Don't show if only architectural is available
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Projetos Complementares
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione os projetos que deseja adquirir
          </p>
        </div>
        {availablePackages.length > 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllPackages}
            className="text-xs"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Pacote Completo
          </Button>
        )}
      </div>

      {/* Bundle discount banner */}
      {availablePackages.length > 2 && !isCompleteBundle && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Leve todos e ganhe {Math.round(BUNDLE_DISCOUNT * 100)}% OFF!
              </p>
              <p className="text-sm text-muted-foreground">
                Adquira o pacote completo com desconto especial
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Package list */}
      <div className="space-y-3">
        {availablePackages.map((pkg) => {
          const price = getPackagePrice(pkg);
          const isSelected = selectedPackages.includes(pkg.id);
          const isArchitectural = pkg.id === 'architectural';

          return (
            <div
              key={pkg.id}
              onClick={() => togglePackage(pkg.id)}
              className={cn(
                "relative border rounded-xl p-4 transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                isArchitectural && "cursor-default"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {pkg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{pkg.name}</h4>
                    {isArchitectural && (
                      <Badge variant="secondary" className="text-xs">Principal</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                  
                  {/* Included items */}
                  <div className="flex flex-wrap gap-1">
                    {pkg.included.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                    {pkg.included.length > 3 && (
                      <span className="text-xs text-primary">
                        +{pkg.included.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(price)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        {selectedPackages.length > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({selectedPackages.length} projetos)</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
        )}
        
        {isCompleteBundle && (
          <div className="flex justify-between text-sm">
            <span className="text-primary font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Desconto Pacote Completo (-{Math.round(BUNDLE_DISCOUNT * 100)}%)
            </span>
            <span className="text-primary font-medium">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-lg font-semibold text-foreground">Total</span>
          <div className="text-right">
            {isCompleteBundle && (
              <span className="text-sm text-muted-foreground line-through mr-2">
                {formatPrice(subtotal)}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleWhatsAppClick}
      >
        Solicitar Orçamento via WhatsApp
      </Button>
    </div>
  );
};

export default PackageSelector;
