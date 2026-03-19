import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      throw new Error("Missing required parameters: code, userId");
    }

    // Find the code
    const { data: giftCode, error: codeError } = await supabase
      .from("gift_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (codeError || !giftCode) {
      return new Response(JSON.stringify({ success: false, message: "Código não encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (giftCode.status !== "active") {
      return new Response(JSON.stringify({ success: false, message: "Código já resgatado ou expirado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (giftCode.creator_user_id === userId) {
      return new Response(JSON.stringify({ success: false, message: "Você não pode resgatar seu próprio código" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const expiresAt = new Date(giftCode.expires_at);
    if (expiresAt < new Date()) {
       await supabase.from("gift_codes").update({ status: "expired" }).eq("id", giftCode.id);
       return new Response(JSON.stringify({ success: false, message: "Este código expirou" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Mark code as redeemed
    await supabase.from("gift_codes").update({
      status: "redeemed",
      redeemed_by_user_id: userId,
      redeemed_at: new Date().toISOString()
    }).eq("id", giftCode.id);

    // Update the user's plan
    await supabase.from("profiles").update({ plan: giftCode.plan_granted }).eq("user_id", userId);

    // Give them a "subscription" so it lasts for the granted months
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + giftCode.months_granted);

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: giftCode.plan_granted,
      status: "active",
      interval: "monthly",
      current_period_end: currentPeriodEnd.toISOString(),
      // leave stripe_customer_id and stripe_subscription_id null
    });

    const planName = giftCode.plan_granted === "vip_plus" ? "VIP+" : "VIP";

    return new Response(JSON.stringify({ success: true, planName, months: giftCode.months_granted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error redeeming gift code:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
