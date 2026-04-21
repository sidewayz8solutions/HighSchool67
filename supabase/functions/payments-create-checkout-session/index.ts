import Stripe from 'https://esm.sh/stripe@16.10.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

type CheckoutRequest = {
  tierId: 'basic' | 'premium' | 'lifetime';
};

const tierToEnvPriceKey: Record<CheckoutRequest['tierId'], string> = {
  basic: 'STRIPE_PRICE_BASIC',
  premium: 'STRIPE_PRICE_PREMIUM',
  lifetime: 'STRIPE_PRICE_LIFETIME',
};

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
    },
  });
}

function isValidTierId(value: unknown): value is CheckoutRequest['tierId'] {
  return value === 'basic' || value === 'premium' || value === 'lifetime';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const appUrl = Deno.env.get('APP_WEB_URL');
  if (!stripeSecretKey || !appUrl) {
    return jsonResponse(500, {
      error: 'server_misconfigured',
      message: 'Missing STRIPE_SECRET_KEY or APP_WEB_URL',
    });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'unauthorized', message: 'Missing bearer token' });
  }

  // TODO: Validate user with Supabase auth and resolve authenticated user id.
  const userId = 'replace-with-auth-user-id';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const tierId = (body as { tierId?: unknown })?.tierId;
  if (!isValidTierId(tierId)) {
    return jsonResponse(400, { error: 'invalid_tier', message: 'tierId must be basic, premium, or lifetime' });
  }

  const priceId = Deno.env.get(tierToEnvPriceKey[tierId]);
  if (!priceId) {
    return jsonResponse(500, {
      error: 'server_misconfigured',
      message: `Missing ${tierToEnvPriceKey[tierId]} secret`,
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: tierId === 'lifetime' ? 'payment' : 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/shop?checkout=success`,
        cancel_url: `${appUrl}/shop?checkout=cancel`,
        metadata: {
          userId,
          tierId,
        },
      },
      {
        idempotencyKey: crypto.randomUUID(),
      }
    );

    if (!session.url) {
      return jsonResponse(500, {
        error: 'stripe_session_error',
        message: 'Checkout session did not include a URL',
      });
    }

    return jsonResponse(200, { checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe session create failed:', error);
    return jsonResponse(500, {
      error: 'stripe_error',
      message: 'Failed to create checkout session',
    });
  }
});
