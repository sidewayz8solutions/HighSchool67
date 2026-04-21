# HighSchool67 Backend API Contract

This document defines the minimum backend endpoints required by the app changes:

- AI dialogue proxy endpoint for NPC/story text generation
- Stripe checkout session creation endpoint for web purchases
- Stripe webhook endpoint for purchase verification and entitlement syncing

## 1) AI Dialogue Endpoint

Used by:

- `apps/game/services/ai.ts` via `EXPO_PUBLIC_AI_DIALOGUE_ENDPOINT`

### Route

- `POST /dialogue`

### Request Body (JSON)

```json
{
  "playerName": "Alex",
  "clique": "nerd",
  "npcName": "Raven",
  "npcClique": "goth",
  "relationship": 42,
  "currentScene": "hallway between classes"
}
```

### Validation Rules

- `playerName`: non-empty string, max 64 chars
- `clique`: non-empty string, max 32 chars
- `npcName`: non-empty string, max 64 chars
- `npcClique`: non-empty string, max 32 chars
- `relationship`: integer 0-100
- `currentScene`: non-empty string, max 1000 chars

### Success Response

- `200 OK`

```json
{
  "text": "Hey Alex, I saved you a seat by the window."
}
```

### Error Responses

- `400 Bad Request`: invalid payload
- `429 Too Many Requests`: rate limit exceeded
- `500 Internal Server Error`: model/backend failure

Recommended error shape:

```json
{
  "error": "invalid_request",
  "message": "relationship must be between 0 and 100"
}
```

### Notes

- Keep OpenAI key server-side only.
- Apply per-user/IP rate limits.
- Add moderation/safety filters before returning text to clients.

## 2) Stripe Checkout Session Endpoint (Web)

Used by:

- `apps/game/services/purchases.ts` via `EXPO_PUBLIC_STRIPE_CHECKOUT_ENDPOINT`

### Route

- `POST /payments/create-checkout-session`

### Request Body (JSON)

```json
{
  "tierId": "premium"
}
```

Supported `tierId` values:

- `basic`
- `premium`
- `lifetime`

### Validation Rules

- Reject unknown `tierId` with `400`.
- Map each `tierId` to server-defined Stripe Price IDs (do not trust client pricing).

### Success Response

- `200 OK`

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### Error Responses

- `400 Bad Request`: invalid tier
- `401 Unauthorized`: user not authenticated (if required)
- `500 Internal Server Error`: Stripe API failure

### Notes

- Use idempotency keys when creating sessions.
- Attach user identity metadata (`userId`, `tierId`) on session creation.
- Set success/cancel return URLs to app web routes.

## 3) Stripe Webhook Endpoint

Required for authoritative entitlement updates.

### Route

- `POST /payments/webhook`

### Required Stripe Events

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded` (if async methods enabled)
- `invoice.paid` (if recurring subscriptions are used)
- `customer.subscription.deleted` (for subscription revocation)

### Processing Requirements

- Verify Stripe signature using webhook secret.
- Enforce idempotent event handling by event ID.
- Resolve app user from session metadata.
- Upsert entitlement state in backend store (example: Supabase table `entitlements`).
- Return `2xx` only after successful persistence.

### Suggested Entitlements Schema

Example table: `entitlements`

- `user_id` (PK or composite key)
- `entitlement_id` (`season_pass_basic`, `season_pass_vip`, `season_pass_lifetime`)
- `status` (`active`, `inactive`)
- `source` (`stripe`, `revenuecat`)
- `updated_at`
- `expires_at` (nullable for lifetime)

## 4) Auth and Security

- Require authenticated user for checkout creation.
- Never accept monetary amounts from client.
- Keep all Stripe/OpenAI secrets server-side.
- Log request IDs and user IDs for auditability.

## 5) Client Compatibility Guarantees

The app currently expects:

- AI endpoint returns `{ "text": string }`
- Checkout endpoint returns `{ "checkoutUrl": string }`

Any shape changes should be versioned or coordinated with client updates.

## 6) Quick Smoke Tests

### AI

```bash
curl -X POST "$AI_DIALOGUE_ENDPOINT" \
  -H "content-type: application/json" \
  -d '{
    "playerName":"Alex",
    "clique":"nerd",
    "npcName":"Raven",
    "npcClique":"goth",
    "relationship":42,
    "currentScene":"hallway between classes"
  }'
```

### Checkout

```bash
curl -X POST "$STRIPE_CHECKOUT_ENDPOINT" \
  -H "content-type: application/json" \
  -d '{"tierId":"premium"}'
```
