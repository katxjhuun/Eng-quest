-- English Quest: Google-linked progress storage.
-- Execute this once in Supabase SQL Editor. Keep the Supabase secret key on the server only.
create table if not exists public.user_progress (
  user_sub text primary key,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
revoke all on table public.user_progress from anon, authenticated;
grant select, insert, update, delete on table public.user_progress to service_role;
comment on table public.user_progress is 'English Quest learning state keyed by Google OpenID subject; accessible only through the application server.';
