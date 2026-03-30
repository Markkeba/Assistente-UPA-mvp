import { stripe } from "@/lib/stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Use service role for webhook (bypasses RLS)
function getServiceSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const status =
        sub.status === "active" ? "active" :
        sub.status === "past_due" ? "past_due" :
        sub.status === "canceled" ? "canceled" : "active";

      await supabase
        .from("profiles")
        .update({
          subscription_status: status,
          stripe_subscription_id: sub.id,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase
        .from("profiles")
        .update({ subscription_status: "canceled" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("profiles")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      if (invoice.billing_reason === "subscription_cycle" || invoice.billing_reason === "subscription_create") {
        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
