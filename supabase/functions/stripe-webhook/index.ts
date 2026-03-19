import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.19.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'QF-';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) result += '-';
  }
  return result;
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan, interval } = session.metadata || {};

        if (userId && plan) {
          // Store/update subscription
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan: plan,
            status: "active",
            interval: interval || 'monthly',
          });

          // Update user's current profile plan
          await supabase.from("profiles").update({ plan }).eq("user_id", userId);

          // Generate Gift Code if applicable
          if ((interval === "semiannual" || interval === "annual") && (plan === "vip_plus" || plan === "pro")) {
            let planGranted = "vip";
            let monthsGranted = 1;

            if (plan === "vip_plus") {
              planGranted = "vip";
              monthsGranted = interval === "semiannual" ? 1 : 2;
            } else if (plan === "pro") {
              planGranted = "vip_plus";
              monthsGranted = interval === "semiannual" ? 1 : 2;
            }

            const code = generateRandomCode();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 90);

            await supabase.from("gift_codes").insert({
              code,
              creator_user_id: userId,
              plan_granted: planGranted,
              months_granted: monthsGranted,
              source_plan: plan,
              source_interval: interval,
              expires_at: expiresAt.toISOString(),
            });
            console.log(`Generated gift code ${code} for user ${userId}`);
          }
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // Find which user has this subscription
        const { data: sub } = await supabase.from("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).single();
        
        if (sub) {
          const status = subscription.status;
          await supabase.from("subscriptions").update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }).eq("user_id", sub.user_id);
          
          if (status !== 'active' && status !== 'trialing') {
             await supabase.from("profiles").update({ plan: 'free' }).eq("user_id", sub.user_id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: sub } = await supabase.from("subscriptions").select("user_id").eq("stripe_subscription_id", subscription.id).single();
        if (sub) {
          await supabase.from("subscriptions").update({ status: 'canceled' }).eq("user_id", sub.user_id);
          await supabase.from("profiles").update({ plan: 'free' }).eq("user_id", sub.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
});
