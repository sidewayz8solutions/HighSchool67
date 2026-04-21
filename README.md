# High School Sim

A cutting-edge, cross-platform life simulation game built with **Expo SDK 54**, **React 19**, and **React Native New Architecture**. Play as a high school student, join cliques, customize your room, build relationships with AI-powered NPCs, and compete in mini-games — all from a single codebase targeting iOS, Android, and Web.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + Expo Router v4 |
| React | React 19 with React Compiler |
| Architecture | React Native New Architecture (Fabric + TurboModules) |
| Monorepo | Turborepo + pnpm workspaces |
| State | Zustand + Immer + persist middleware (local-first) |
| Backend | Supabase (auth, DB, cloud sync) |
| Monetization | RevenueCat (iOS/Android IAP + Stripe web) |
| AI | OpenAI GPT-4o-mini for dynamic NPC dialogue |
| Animations | React Native Reanimated 3 + Gesture Handler |

## Project Structure

```
highschool-sim/
├── apps/
│   └── game/                 # Expo app (iOS + Android + Web)
├── packages/
│   ├── game-engine/          # Core simulation logic & Zustand store
│   ├── ui/                   # Shared React Native UI components
│   ├── types/                # Shared TypeScript interfaces
│   ├── ai/                   # OpenAI narrative generation
│   └── config/               # Shared eslint, tsconfig
```

## Getting Started

```bash
# Install dependencies
cd highschool-sim
pnpm install

# Copy environment variables
cp apps/game/.env.example apps/game/.env
# Edit apps/game/.env with your API keys

# Run on web
pnpm --filter game web

# Run on iOS
pnpm --filter game ios

# Run on Android
pnpm --filter game android
```

## Environment Setup

Create `apps/game/.env` with your keys/endpoints:

```
# AI dialogue backend endpoint (OpenAI key stays on server)
EXPO_PUBLIC_AI_DIALOGUE_ENDPOINT=https://your-api.example.com/dialogue

# Supabase (cloud save + auth)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# RevenueCat (monetization)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key

# Stripe checkout session endpoint (web purchases)
EXPO_PUBLIC_STRIPE_CHECKOUT_ENDPOINT=https://your-api.example.com/payments/create-checkout-session
```

## Supabase Setup (Cloud Save)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your Project URL and Anon Key into `.env`
4. Enable Email auth in Authentication > Providers (or use Anonymous auth)

## Game Features

### Core Systems
- **Character Creation**: Choose name and clique (Jock, Nerd, Popular, Goth, Artsy, Preppy)
- **Daily Life Simulation**: Semester-based time progression with energy system
- **Social System**: 5 unique NPCs with friendship and romance meters
- **AI Dialogue**: Dynamic, context-aware conversations powered by OpenAI GPT-4o-mini
- **Room Customization**: Interactive 8×8 grid editor — place, select, and remove furniture
- **Dual-Currency Economy**: Points (earned) and Gems (premium)
- **Daily Challenges**: Auto-resetting quests for bonus rewards

### Story Mode (Gated Premium Chapters)
- **The First Day** (Free) — Choose your first friend group
- **Lunchroom Drama** (Progress-locked) — Pick your table, pass stat checks
- **Prom Night** (Premium — 💎15) — Romance and social drama
- **The Senior Prank** (Premium — 💎25) — Rebellion-required heist
- **Graduation Day** (Season Pass) — The finale

### Mini-Games
| Game | Stat Boost | Mechanic |
|------|-----------|----------|
| Math Blitz | Academics | Rapid math quiz |
| Football Toss | Athletics | Gesture flick physics |
| Dance Battle | Popularity | Rhythm tap game |
| Art Studio | Creativity | Color matching |
| Memory Match | Academics | Card matching |

### Cloud Save
- **Anonymous auth** — play immediately, no signup required
- **Email auth** — full account with cross-device sync
- **Auto-sync** — saves every 60 seconds when enabled
- **Manual sync** — save/load on demand from Profile tab

### Monetization
- **Gems Packs**: $0.99 (100), $4.99 (550), $9.99 (1200)
- **Starter Pack**: $2.99 one-time
- **Season Pass**: Basic ($4.99/mo), VIP ($9.99/mo), Lifetime ($49.99)
- RevenueCat SDK integrated for real iOS/Android purchases

## Deployment

```bash
# Build web app
pnpm --filter game export:web

# Build native apps via EAS
pnpm --filter game eas build --platform all
```

## License

MIT
