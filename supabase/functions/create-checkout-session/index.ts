
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { items, returnUrl, customerEmail } = await req.json()

        // 1. Initialize Supabase Client
        const supabaseClient = createClient(
            // Supabase API URL - env var automatically populated by functions client
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase API ANON KEY - env var automatically populated by functions client
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            // Create client with Auth context of the user that called the function.
            // This way your row-level-security (RLS) policies are applied.
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 2. Validate Items & Calculate Prices (SERVER SIDE VALIDATION)
        // We fetch the REAL products from the DB to ensure no price tampering
        const projectIds = items.map((i: any) => i.id)
        const { data: projects, error: projectsError } = await supabaseClient
            .from('projects')
            .select('*')
            .in('id', projectIds)

        if (projectsError || !projects) {
            throw new Error('Failed to fetch products')
        }

        const lineItems = []

        for (const item of items) {
            const project = projects.find((p: any) => p.id === item.id)
            if (!project) continue

            // Main Project Line Item
            lineItems.push({
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: project.title,
                        description: `Código: ${project.code || project.slug}`,
                        images: [project.cover_image || ''], // You might need to fetch images too or pass valid url
                        metadata: {
                            project_id: project.id,
                            project_code: project.code,
                            type: 'project'
                        }
                    },
                    unit_amount: Math.round(project.price * 100), // Stripe expects cents
                },
                quantity: 1,
            })

            // Addons Line Items
            if (item.addons && item.addons.length > 0) {
                for (const addonId of item.addons) {
                    let addonName = ''
                    let addonPrice = 0

                    if (addonId === 'electrical' && project.price_electrical) {
                        addonName = 'Projeto Elétrico'
                        addonPrice = project.price_electrical
                    } else if (addonId === 'hydraulic' && project.price_hydraulic) {
                        addonName = 'Projeto Hidráulico'
                        addonPrice = project.price_hydraulic
                    } else if (addonId === 'sanitary' && project.price_sanitary) {
                        addonName = 'Projeto Sanitário'
                        addonPrice = project.price_sanitary
                    } else if (addonId === 'structural' && project.price_structural) {
                        addonName = 'Projeto Estrutural'
                        addonPrice = project.price_structural
                    }

                    if (addonPrice > 0) {
                        lineItems.push({
                            price_data: {
                                currency: 'brl',
                                product_data: {
                                    name: `${addonName} - ${project.title}`,
                                    metadata: {
                                        project_id: project.id,
                                        addon_type: addonId,
                                        type: 'addon'
                                    }
                                },
                                unit_amount: Math.round(addonPrice * 100),
                            },
                            quantity: 1,
                        })
                    }
                }
            }
        }

        // 3. Create Stripe Checkout Session
        const sessionPayload: any = {
            payment_method_types: ['card', 'boleto'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}?canceled=true`,
            metadata: {
                // Store metadata to link back to your system
                user_id: 'guest', // You should get the user ID from auth context if logged in
            }
        }

        if (customerEmail) {
            sessionPayload.customer_email = customerEmail;
        }

        const session = await stripe.checkout.sessions.create(sessionPayload);

        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
