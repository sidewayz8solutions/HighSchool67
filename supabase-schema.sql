-- High School Sim - Supabase Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security
alter table if exists game_saves force row level security;

-- Create game_saves table for cloud sync
create table if not exists game_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  player jsonb not null,
  progress jsonb not null,
  npcs jsonb not null default '[]'::jsonb,
  challenges jsonb not null default '[]'::jsonb,
  story_progress jsonb not null default '{}'::jsonb,
  last_synced_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique (user_id)
);

-- Enable RLS
alter table game_saves enable row level security;

-- RLS Policy: Users can only read their own saves
create policy "Users can read own saves"
  on game_saves
  for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own saves
create policy "Users can insert own saves"
  on game_saves
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can only update their own saves
create policy "Users can update own saves"
  on game_saves
  for update
  using (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own saves
create policy "Users can delete own saves"
  on game_saves
  for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_game_saves_updated_at
  before update on game_saves
  for each row
  execute function update_updated_at_column();

-- Index for faster lookups by user_id
create index if not exists idx_game_saves_user_id on game_saves(user_id);

-- Stripe webhook idempotency table
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  created_at timestamp with time zone default now()
);

-- User entitlements sourced from Stripe/RevenueCat
create table if not exists entitlements (
  user_id uuid references auth.users(id) on delete cascade not null,
  entitlement_id text not null,
  status text not null check (status in ('active', 'inactive')),
  source text not null check (source in ('stripe', 'revenuecat')),
  expires_at timestamp with time zone null,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  primary key (user_id, entitlement_id)
);

alter table entitlements enable row level security;

create policy "Users can read own entitlements"
  on entitlements
  for select
  using (auth.uid() = user_id);

create index if not exists idx_entitlements_user_id on entitlements(user_id);
