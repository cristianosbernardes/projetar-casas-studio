import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Project } from '@/types/database';

export interface CartAddon {
    id: string; // e.g., 'electrical'
    label: string;
    price: number;
}

export interface CartItem {
    id: string; // Project ID
    title: string;
    basePrice: number; // Price without addons
    price: number; // Current total price
    image_url: string;
    code?: string; // Project code (e.g., 'COD. 123')
    addons: string[]; // List of addon IDs (e.g., 'hidraulico', 'eletrico')
    availableAddons: CartAddon[]; // List of ALL possible addons for this project
    formattedPrice: string;
    orderBumpId?: string | null; // ID of the recommended order bump project
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    addAddonToItem: (itemId: string, addonId: string) => void;
    removeAddonFromItem: (itemId: string, addonId: string) => void;
    clearCart: () => void;
    total: number;
    openCart: boolean;
    setOpenCart: (open: boolean) => void;
    refreshCartPrices: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [openCart, setOpenCart] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart from localStorage
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items, isInitialized]);

    const addItem = (newItem: CartItem) => {
        setItems((currentItems) => {
            const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id);

            if (existingItemIndex >= 0) {
                toast.info("Projeto atualizado no carrinho!");
                const updatedItems = [...currentItems];
                updatedItems[existingItemIndex] = newItem;
                return updatedItems;
            }

            toast.success("Projeto adicionado ao carrinho!");
            return [...currentItems, newItem];
        });
        setOpenCart(true);
    };

    const removeItem = (id: string) => {
        setItems(items => items.filter(item => item.id !== id));
        toast.success("Item removido.");
    };

    const addAddonToItem = (itemId: string, addonId: string) => {
        setItems(currentItems => {
            return currentItems.map(item => {
                if (item.id !== itemId) return item;

                // Check if already has addon
                if (item.addons.includes(addonId)) return item;

                const addon = item.availableAddons.find(a => a.id === addonId);
                if (!addon) return item;

                const newAddons = [...item.addons, addonId];
                const newPrice = item.price + addon.price;

                toast.success(`Adicional ${addon.label} incluído!`);

                return {
                    ...item,
                    addons: newAddons,
                    price: newPrice,
                    formattedPrice: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPrice)
                };
            });
        });
    };

    const removeAddonFromItem = (itemId: string, addonId: string) => {
        setItems(currentItems => {
            return currentItems.map(item => {
                if (item.id !== itemId) return item;

                if (!item.addons.includes(addonId)) return item;

                const addon = item.availableAddons.find(a => a.id === addonId);
                // If for some reason we can't find details, just remove ID (should not happen usually but safety check)
                // If we rely on availableAddons for price, we need it.
                // Assuming availableAddons is always populated correctly.

                const deduction = addon ? addon.price : 0;

                const newAddons = item.addons.filter(a => a !== addonId);
                const newPrice = item.price - deduction;

                toast.info(`Adicional removido.`);

                return {
                    ...item,
                    addons: newAddons,
                    price: newPrice,
                    formattedPrice: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPrice)
                };
            });
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    const refreshCartPrices = async () => {
        if (items.length === 0) return;

        // Ensure we are only fetching valid UUIDs to prevent PostgreSQL errors
        const validIds = items.map(i => i.id).filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

        if (validIds.length === 0) return;

        const { data: projectsData, error } = await supabase
            .from('projects')
            .select('*')
            .in('id', validIds);

        if (error || !projectsData) {
            console.error("Erro ao validar carrinho", error);
            return;
        }

        // Force type casting to avoid 'never' inference issues with Supabase types
        const projects = projectsData as unknown as Project[];

        let hasChanges = false;

        // Create new items array based on current items but updated with fresh data
        const newItems = items.map(item => {
            const project = projects.find(p => p.id === item.id);

            // If project not found (deleted?), maybe remove or keep stale? 
            // For safety, if not found, we don't update (keep as is or handle removal separately)
            if (!project) return item;

            // Re-construct available addons with FRESH prices
            const newAvailableAddons: CartAddon[] = [];
            if (project.price_electrical) newAvailableAddons.push({ id: 'electrical', label: 'Projeto Elétrico', price: project.price_electrical });
            if (project.price_hydraulic) newAvailableAddons.push({ id: 'hydraulic', label: 'Projeto Hidráulico', price: project.price_hydraulic });
            if (project.price_sanitary) newAvailableAddons.push({ id: 'sanitary', label: 'Projeto Sanitário', price: project.price_sanitary });
            if (project.price_structural) newAvailableAddons.push({ id: 'structural', label: 'Projeto Estrutural', price: project.price_structural });

            // Calculate new base price
            const newBasePrice = project.price;

            // Calculate new addons total cost
            let newAddonPrice = 0;
            item.addons.forEach(addonId => {
                const freshAddon = newAvailableAddons.find(a => a.id === addonId);
                if (freshAddon) {
                    newAddonPrice += freshAddon.price;
                }
            });

            const newTotal = newBasePrice + newAddonPrice;

            // Check if anything changed (price, basePrice, code, orderBump)
            const priceChanged = newTotal !== item.price || newBasePrice !== item.basePrice;
            const metaChanged = item.code !== project.code || item.orderBumpId !== project.order_bump_id;

            if (priceChanged || metaChanged) {
                hasChanges = true;
                return {
                    ...item,
                    basePrice: newBasePrice,
                    price: newTotal,
                    availableAddons: newAvailableAddons, // Update available addons reference
                    formattedPrice: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newTotal),
                    code: project.code || undefined,
                    orderBumpId: project.order_bump_id
                };
            }
            return item;
        });

        if (hasChanges) {
            setItems(newItems);
            toast.info("Os preços do carrinho foram atualizados para os valores atuais.");
        }
    };

    const total = items.reduce((acc, item) => acc + item.price, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, addAddonToItem, removeAddonFromItem, clearCart, total, openCart, setOpenCart, refreshCartPrices }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
