// Supabase Edge Function: stripe-webhook
// Recibe eventos de Stripe y actualiza la tabla `subscriptions` en Supabase.
//
// Variables de entorno requeridas en Supabase Dashboard:
//   STRIPE_SECRET_KEY         -> clave secreta de Stripe
//   STRIPE_WEBHOOK_SECRET     -> webhook signing secret (whsec_...)
//   SUPABASE_SERVICE_ROLE_KEY -> clave de servicio (para escribir en DB sin RLS)

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  if (!signature) {
    return new Response('Sin firma Stripe', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // Suscripción activada o renovada
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        const priceId = sub.items.data[0]?.price?.id ?? '';
        const planId = resolvePlanId(priceId);

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          status: sub.status === 'active' ? 'active' : 'incomplete',
          plan_id: planId,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' });

        console.log(`Suscripción ${sub.status} para usuario ${userId}`);
        break;
      }

      // Suscripción cancelada o expirada
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          status: 'canceled',
          plan_id: 'free',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' });

        console.log(`Suscripción cancelada para usuario ${userId}`);
        break;
      }

      // Pago completado (checkout exitoso)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        // La suscripción se actualiza via customer.subscription.created
        // Solo loguear aquí para debugging
        console.log(`Checkout completado: ${session.id}`);
        break;
      }

      // Pago fallido – downgrade a free
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (sub?.user_id) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'incomplete',
          }).eq('user_id', sub.user_id);

          console.log(`Pago fallido para customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

function resolvePlanId(priceId: string): string {
  // Mapear price IDs de Stripe a nombres de plan
  // Actualiza estos IDs con los de tu dashboard de Stripe
  const map: Record<string, string> = {
    'price_premium_monthly': 'premium_monthly',
    'price_premium_annual': 'premium_annual',
  };
  return map[priceId] ?? 'premium_monthly';
}
