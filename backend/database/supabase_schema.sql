-- Supabase schema for Smart Checkout System
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  barcode text not null unique,
  price numeric(10,2) not null,
  category text,
  image_url text,
  stock_quantity integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text default 'active',
  started_at timestamptz default now(),
  completed_at timestamptz,
  exit_verified boolean default false,
  qr_token text,
  total_amount numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer default 1,
  price_at_scan numeric(10,2) not null,
  scanned_at timestamptz default now(),
  unique(session_id, product_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null,
  amount numeric(10,2) not null,
  method text default 'simulate',
  status text default 'pending',
  transaction_id text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.fraud_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null,
  risk_score numeric(5,2) default 0,
  flags jsonb,
  details text,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  resource text,
  resource_id text,
  ip_address text,
  details jsonb,
  created_at timestamptz default now()
);

insert into public.products (name, barcode, price, category, stock_quantity)
values
  ('Whole Wheat Bread', '8901234567890', 45.00, 'Bakery', 150),
  ('Toned Milk 1L', '8901234567891', 55.00, 'Dairy', 200),
  ('Basmati Rice 1kg', '8901234567892', 120.00, 'Grains', 300),
  ('Olive Oil 500ml', '8901234567893', 350.00, 'Cooking', 80),
  ('Dark Chocolate Bar', '8901234567894', 90.00, 'Snacks', 250)
on conflict (barcode) do nothing;

alter table public.products enable row level security;
alter table public.sessions enable row level security;
alter table public.cart_items enable row level security;
alter table public.payments enable row level security;
alter table public.fraud_logs enable row level security;
alter table public.audit_logs enable row level security;

create policy "products_viewable_by_authenticated_users" on public.products
for select using (auth.role() = 'authenticated');

create policy "users_manage_their_sessions" on public.sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_their_cart_items" on public.cart_items
for all using (
  session_id in (select id from public.sessions where user_id = auth.uid())
) with check (
  session_id in (select id from public.sessions where user_id = auth.uid())
);

create policy "users_manage_their_payments" on public.payments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_their_fraud_logs" on public.fraud_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_manage_their_audit_logs" on public.audit_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
