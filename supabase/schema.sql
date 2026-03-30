-- Plantão V3.9 — Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nome text,
  crm text,
  created_at timestamp with time zone default now(),
  trial_ends_at timestamp with time zone,
  subscription_status text default 'trial' check (
    subscription_status in ('trial', 'active', 'canceled', 'past_due', 'expired')
  ),
  stripe_customer_id text,
  stripe_subscription_id text
);

-- Consultas table
create table if not exists public.consultas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  input text,
  output text,
  tokens_used int
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.consultas enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Consultas policies
create policy "Users can view own consultas"
  on public.consultas for select
  using (auth.uid() = user_id);

create policy "Users can insert own consultas"
  on public.consultas for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage all consultas"
  on public.consultas for all
  using (auth.role() = 'service_role');

-- Function: create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, trial_ends_at, subscription_status)
  values (
    new.id,
    new.email,
    now() + interval '7 days',
    'trial'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
