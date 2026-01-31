import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Lock, PlusCircle, CreditCard, X, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectWithImages } from '@/types/database';

const OrderBumpItem = ({ projectId, parentItemId }: { projectId: string, parentItemId: string }) => {
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
            formattedPrice: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.price)
        });
    };

    return (
        <div className="mt-4 border-2 border-dashed border-yellow-400 bg-yellow-50/50 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                OFERTA ESPECIAL
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden shrink-0 shadow-sm border border-yellow-200">
                    {project.project_images?.[0]?.image_url && (
                        <img src={project.project_images[0].image_url} alt={project.title} className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                        {project.title}
                        {project.code && (
                            <Badge variant="outline" className="border-yellow-600/30 text-yellow-800 text-[10px] h-5 px-1.5">
                                {project.code}
                            </Badge>
                        )}
                        <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-0 h-5 px-1.5 text-[10px]">Recomendado</Badge>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">
                        Aproveite para levar este projeto complementar com um preço especial.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="font-bold text-lg text-green-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.price)}
                        </span>

                    </div>
                </div>

                <Button
                    onClick={handleAdd}
                    className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 font-bold shadow-sm shrink-0 w-full sm:w-auto"
                >
                    Adicionar ao Pedido <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
                </Button>
            </div>
        </div>
    );
};

const CartPage = () => {
    const { items, removeItem, total, addAddonToItem, removeAddonFromItem } = useCart();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleCheckout = () => {
        // Integration with Stripe will happen here
        console.log("Proceeding to checkout with items:", items);

        // For now, let's simulate a secure redirect or modal opening
        // In the next step, we will implement the Stripe Session creation
        window.location.href = '#checklist-stripe'; // Placeholder
    };

    if (items.length === 0) {
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
                                <div className="flex gap-4 sm:gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
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
                                    <OrderBumpItem projectId={item.orderBumpId} parentItemId={item.id} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg sticky top-32">
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
                                <Button onClick={handleCheckout} size="lg" className="w-full h-12 text-base shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700">
                                    <Lock className="mr-2 h-4 w-4" />
                                    Finalizar Compra Segura
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <CreditCard className="h-3 w-3" />
                                    <span>Pagamento processado por <strong>Stripe</strong></span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed border border-gray-100">
                                    <p className="flex gap-2">
                                        <Lock className="h-3 w-3 shrink-0 mt-0.5" />
                                        Seus dados estão protegidos. Utilizamos criptografia de ponta a ponta para garantir sua segurança.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CartPage;
