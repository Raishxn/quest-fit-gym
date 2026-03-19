import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.19.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const { priceId, userId, plan, interval } = await req.json();

    if (!priceId || !userId) {
      throw new Error("Missing required parameters: priceId, userId");
    }

    // You might want to verify the user via JWT here using createClient and auth.getUser(token)
    // For simplicity, we assume the userId from body corresponds to the authenticated user.
    // In production, ensure the Authorization header is passed and validated.

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      billing_address_collection: "auto",
      client_reference_id: userId,
      customer_email: undefined, // Option: fetch user email using supabase client if desired
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings?tab=plan&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
      allow_promotion_codes: true,
      metadata: {
        userId,
        plan: plan || 'vip',
        interval: interval || 'monthly',
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
