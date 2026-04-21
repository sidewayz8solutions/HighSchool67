# Supabase Edge Functions (Templates)

This folder contains starter function templates for production wiring:

- `dialogue` - AI dialogue proxy
- `payments-create-checkout-session` - Stripe Checkout session creation
- `payments-webhook` - Stripe webhook verification + entitlement sync

## Deploy

```bash
supabase functions deploy dialogue
supabase functions deploy payments-create-checkout-session
supabase functions deploy payments-webhook
```

## Required Secrets

Set these in your Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=...
supabase secrets set STRIPE_SECRET_KEY=...
supabase secrets set STRIPE_WEBHOOK_SECRET=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set APP_WEB_URL=https://your-web-app.example.com
supabase secrets set STRIPE_PRICE_BASIC=price_...
supabase secrets set STRIPE_PRICE_PREMIUM=price_...
supabase secrets set STRIPE_PRICE_LIFETIME=price_...
```

`SUPABASE_URL` is injected automatically in Edge Functions.

## App Env Wiring

In `apps/game/.env`:

```bash
EXPO_PUBLIC_AI_DIALOGUE_ENDPOINT=https://<project-ref>.functions.supabase.co/dialogue
EXPO_PUBLIC_STRIPE_CHECKOUT_ENDPOINT=https://<project-ref>.functions.supabase.co/payments-create-checkout-session
```

## TODOs before production

- Replace placeholder auth in `payments-create-checkout-session` (`userId` extraction).
- Add stricter rate limiting and abuse controls in `dialogue`.
- Add revocation/renewal logic for all subscription event paths in webhook.
