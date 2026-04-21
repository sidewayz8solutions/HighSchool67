import Stripe from 'https://esm.sh/stripe@16.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
    },
  });
}

type EntitlementId = 'season_pass_basic' | 'season_pass_vip' | 'season_pass_lifetime';

function tierToEntitlement(tierId: string | undefined): EntitlementId | null {
  if (tierId === 'basic') return 'season_pass_basic';
  if (tierId === 'premium') return 'season_pass_vip';
  if (tierId === 'lifetime') return 'season_pass_lifetime';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceRole) {
    return jsonResponse(500, { error: 'server_misconfigured' });
  }

  const stripeSignature = req.headers.get('stripe-signature');
  if (!stripeSignature) {
    return jsonResponse(400, { error: 'missing_signature' });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, stripeSignature, stripeWebhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return jsonResponse(400, { error: 'invalid_signature' });
  }

  const admin = createClient(supabaseUrl, supabaseServiceRole);

  // Idempotency gate: skip already-processed events.
  const { data: existingEvent } = await admin
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();

  if (existingEvent) {
    return jsonResponse(200, { received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const entitlement = tierToEntitlement(session.metadata?.tierId);
        if (!userId || !entitlement) break;

        const expiresAt = session.mode === 'subscription' ? null : null;
        await admin.from('entitlements').upsert({
          user_id: userId,
          entitlement_id: entitlement,
          status: 'active',
          source: 'stripe',
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const entitlement = tierToEntitlement(subscription.metadata?.tierId);
        if (!userId || !entitlement) break;

        await admin
          .from('entitlements')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('entitlement_id', entitlement);
        break;
      }
      case 'invoice.paid':
      default:
        // No-op for currently unsupported events.
        break;
    }

    await admin.from('stripe_events').insert({
      id: event.id,
      type: event.type,
      created_at: new Date().toISOString(),
    });

    return jsonResponse(200, { received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return jsonResponse(500, { error: 'webhook_processing_failed' });
  }
});
