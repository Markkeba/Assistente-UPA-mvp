import { createClient } from "@/lib/supabase-server";
import { stripe, STRIPE_PRICE_ID, APP_URL } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, nome")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  // Create Stripe customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.nome || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${APP_URL}/dashboard/conta`,
    metadata: { userId: user.id },
    locale: "pt-BR",
  });

  return NextResponse.json({ url: session.url });
}
