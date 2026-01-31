import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [openCart, setOpenCart] = useState(false);

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
    }, []);

    // Save cart from localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

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

    const total = items.reduce((acc, item) => acc + item.price, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, addAddonToItem, removeAddonFromItem, clearCart, total, openCart, setOpenCart }}>
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
