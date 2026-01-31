import { supabase } from "@/integrations/supabase/client";

export const stripeService = {
    async createCheckoutSession(items: any[], userEmail?: string) {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                items: items.map(item => ({
                    id: item.id,
                    addons: item.addons,
                    code: item.code, // Pass code for metadata
                    orderBumpId: item.orderBumpId // Pass for tracking
                })),
                customerEmail: userEmail,
                returnUrl: window.location.origin + '/minha-conta/pedidos' // Redirect here after success
            },
        });

        if (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }

        if (data?.error) {
            console.error('Stripe session error:', data.error);
            throw new Error(data.error);
        }

        return data;
    }
};
