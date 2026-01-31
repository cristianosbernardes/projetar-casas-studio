import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Lock, PlusCircle, CreditCard, X, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectWithImages } from '@/types/database';
import { stripeService } from '@/services/stripe';

const OrderBumpItem = ({ projectId, parentItemId, parentCode }: { projectId: string, parentItemId: string, parentCode?: string }) => {
    const { addItem, items } = useCart();

    const { data: project } = useQuery({
        queryKey: ['project-bump', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*, project_images(image_url)')
                .eq('id', projectId)
                .single();
            if (error) return null;
            return data as ProjectWithImages;
        },
        enabled: !!projectId
    });

    // Don't show if already in cart
    if (items.some(i => i.id === projectId)) return null;

    if (!project) return null;

    const handleAdd = () => {
        const availableAddons = [
            project.price_electrical ? { id: 'electrical' as const, label: 'Projeto Elétrico', price: project.price_electrical } : null,
            project.price_hydraulic ? { id: 'hydraulic' as const, label: 'Projeto Hidráulico', price: project.price_hydraulic } : null,
            project.price_sanitary ? { id: 'sanitary' as const, label: 'Projeto Sanitário', price: project.price_sanitary } : null,
            project.price_structural ? { id: 'structural' as const, label: 'Projeto Estrutural', price: project.price_structural } : null,
        ].filter((addon): addon is { id: "electrical" | "hydraulic" | "sanitary" | "structural"; label: string; price: number } => addon !== null);

        addItem({
            id: project.id,
            title: project.title,
            basePrice: project.price,
            price: project.price,
            image_url: project.project_images?.[0]?.image_url || '',
            addons: [],
            availableAddons: availableAddons as any,
            formattedPrice: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.price),
            code: project.code,
            orderBumpId: project.order_bump_id
        });
    };
    return (
        <div className="mt-8 border border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-6 rounded-xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                Oportunidade Única
            </div>

            <h5 className="font-semibold text-amber-900 mb-4 flex items-center gap-2 pt-2">
                <span className="bg-amber-100 text-amber-700 p-1.5 rounded-full ring-1 ring-amber-200"><Star className="h-4 w-4 fill-amber-700" /></span>
                Quem comprou esse "{parentCode || 'projeto'}" levou também esse aqui:
            </h5>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-amber-100 shadow-sm transition-all hover:border-amber-300 hover:shadow-md group">
                <Link to={`/projeto/${project.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-1 cursor-pointer group-hover:opacity-90 transition-opacity text-left">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {project.project_images?.[0]?.image_url && (
                            <img src={project.project_images[0].image_url} alt={project.title} className="w-full h-full object-cover" />
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2 text-base group-hover:text-amber-700 transition-colors">
                            {project.title}
                            {project.code && (
                                <Badge variant="outline" className="border-amber-200 text-amber-700 text-[10px] h-5 px-1.5 font-normal bg-amber-50">
                                    {project.code}
                                </Badge>
                            )}
                        </h4>
                        <p className="text-sm text-amber-600 font-bold mt-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.price)}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1 block">Clique para ver detalhes</span>
                    </div>
                </Link>

                <Button
                    onClick={handleAdd}
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shrink-0 w-full sm:w-auto border-0"
                >
                    Adicionar +
                </Button>
            </div>
        </div>
    );
};

import { LeadCaptureDialog } from '@/components/checkout/LeadCaptureDialog'; // Add Import

// ...

const CartPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false); // New State
    const { items, removeItem, total, addAddonToItem, removeAddonFromItem, refreshCartPrices } = useCart();

    // Validate prices on mount
    useEffect(() => {
        refreshCartPrices();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleCheckoutClick = () => {
        setIsLeadDialogOpen(true);
    };

    const handleLeadSubmit = async (leadData: { name: string; email: string; whatsapp: string }) => {
        setIsLoading(true);
        try {
            // 1. Save Lead to Supabase
            const { error: leadError } = await supabase.from('leads').insert({
                name: leadData.name,
                email: leadData.email,
                phone: leadData.whatsapp, // Map to phone column
                project_id: items[0]?.id, // Associate with first item if any
                status: 'checkout_started',
                source: 'checkout_modal',
                metadata: {
                    cart_items: items // Save full cart details
                }
            } as any);

            if (leadError) {
                console.error('Error saving lead:', leadError);
                // Continue anyway, don't block purchase if lead save fails
            }

            // 2. Proceed to Stripe
            console.log("Iniciando checkout seguro com Stripe...");
            const { url } = await stripeService.createCheckoutSession(items, leadData.email);

            if (url) {
                window.location.href = url;
            } else {
                toast.error("Erro ao iniciar pagamento. Tente novamente.");
                setIsLoading(false); // Stop loading if failed
            }
        } catch (error) {
            console.error("Erro no checkout:", error);
            toast.error("Não foi possível iniciar o pagamento. Verifique sua conexão.");
            setIsLoading(false);
        }
    };

    // Social Proof Random Number (Consistent per session ideally, but random for now is fine)
    const activeViewers = Math.floor(Math.random() * 4) + 2; // 2 to 5 viewers

    if (items.length === 0) {
        // ... (empty cart layout)
        return (
            <Layout>
                <div className="section-container py-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <ShoppingCart className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Seu carrinho está vazio</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Explore nosso catálogo de projetos e encontre a casa dos seus sonhos para começar a construir.
                    </p>
                    <Link to="/projetos">
                        <Button size="lg" className="mt-4">
                            Ver Projetos
                        </Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="section-container py-12 lg:py-20">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    Carrinho de Compras
                </h1>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-8">
                        {items.map((item) => (
                            <div key={item.id}>
                                {/* Main Item Card */}
                                <div className="flex gap-4 sm:gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm relative z-10">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between h-full">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                                        {item.title}
                                                        {item.code && (
                                                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-gray-300">
                                                                {item.code}
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">Projeto Arquitetônico Completo</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                    title="Remover projeto e adicionais"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {/* Item Breakdown List */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                                                {/* Base Item */}
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-gray-700">Projeto Arquitetônico</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(item.basePrice)}</span>
                                                </div>

                                                {/* Addons List */}
                                                {item.addons.map(addonId => {
                                                    const addonDetails = item.availableAddons?.find(a => a.id === addonId);
                                                    const label = addonDetails ? addonDetails.label : addonId; // Fallback
                                                    const price = addonDetails ? addonDetails.price : 0;

                                                    return (
                                                        <div key={addonId} className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-left-2">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => removeAddonFromItem(item.id, addonId)}
                                                                    className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                                                                    title="Remover este adicional"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                                <span className="text-green-700 font-medium flex items-center gap-1">
                                                                    <PlusCircle className="h-3 w-3" /> {label}
                                                                </span>
                                                            </div>
                                                            <span className="font-semibold text-gray-900">{formatCurrency(price)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-sm text-muted-foreground font-medium">Subtotal do Item</span>
                                            <span className="font-bold text-2xl text-primary">{formatCurrency(item.price)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Upsell / Leve Também Section */}
                                {item.availableAddons && item.availableAddons.filter(addon => !item.addons.includes(addon.id)).length > 0 && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 pt-8 rounded-b-2xl border-x border-b border-blue-100 -mt-2 mb-8 relative z-0 mx-2 shadow-inner">
                                        <div className="flex items-center gap-2 mb-4 mt-1">
                                            <PlusCircle className="h-5 w-5 text-blue-600" />
                                            <h4 className="font-bold text-blue-900">Turbine seu projeto (Recomendado)</h4>
                                        </div>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {item.availableAddons
                                                .filter(addon => !item.addons.includes(addon.id))
                                                .map((addon) => (
                                                    <div key={addon.id} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-all">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm mb-1">{addon.label}</p>
                                                            <p className="text-[10px] text-muted-foreground">Essencial para a obra.</p>
                                                        </div>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className="font-bold text-blue-700 text-sm">{formatCurrency(addon.price)}</span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-3"
                                                                onClick={() => addAddonToItem(item.id, addon.id)}
                                                            >
                                                                Adicionar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Order Bump Section */}
                                {item.orderBumpId && (
                                    <OrderBumpItem
                                        projectId={item.orderBumpId}
                                        parentItemId={item.id}
                                        parentCode={item.code}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg sticky top-32">

                            {/* Prova Social (CRO) */}
                            <div className="mb-6 bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 animate-pulse">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                {activeViewers} pessoas estão vendo esse projeto agora
                            </div>

                            <h2 className="font-bold text-xl text-gray-900 mb-6">Resumo do Pedido</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Desconto</span>
                                    <span className="text-green-600 font-medium">- R$ 0,00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={handleCheckoutClick}
                                    size="lg"
                                    className="w-full h-14 text-base font-bold shadow-lg shadow-green-600/20 bg-green-600 hover:bg-green-700 transition-all hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    FINALIZAR COMPRA SEGURA
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-2">
                                    <CreditCard className="h-3 w-3" />
                                    <span>Pagamento processado via <strong>Stripe</strong></span>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2.5">
                                        <div className="bg-green-100 p-1.5 rounded-full text-green-700 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-1.95c.95-.36 1.76-.84 2.33-1.42 1.34-1.34 2-3.1 2-5.58V5l-8-3-8 3v8c0 3 .75 5 2 7" /><path d="m9 12 2 2 4-4" /></svg>
                                        </div>
                                        <div className="leading-tight">
                                            <p className="font-bold text-[10px] text-gray-900 uppercase">Compra Blindada</p>
                                            <p className="text-[9px] text-gray-500">Dados 100% Protegidos</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2.5">
                                        <div className="bg-blue-100 p-1.5 rounded-full text-blue-700 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4z" /></svg>
                                        </div>
                                        <div className="leading-tight">
                                            <p className="font-bold text-[10px] text-gray-900 uppercase">Entrega Digital</p>
                                            <p className="text-[9px] text-gray-500">Receba por E-mail</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2.5 col-span-2">
                                        <div className="bg-amber-100 p-1.5 rounded-full text-amber-700 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                                        </div>
                                        <div className="leading-tight">
                                            <p className="font-bold text-[10px] text-gray-900 uppercase">Satisfação Garantida</p>
                                            <p className="text-[9px] text-gray-500">7 Dias de garantia incondicional ou seu dinheiro de volta.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LeadCaptureDialog
                open={isLeadDialogOpen}
                onOpenChange={setIsLeadDialogOpen}
                onConfirm={handleLeadSubmit}
                isLoading={isLoading}
            />
        </Layout>
    );
};

export default CartPage;
