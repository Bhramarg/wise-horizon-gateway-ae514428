create table
  public.certificate_layouts (
    id uuid not null default gen_random_uuid (),
    level text not null,
    background_url text null,
    fields jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint certificate_layouts_pkey primary key (id),
    constraint certificate_layouts_level_key unique (level)
  );

-- Enable RLS
alter table public.certificate_layouts enable row level security;

-- Admins can manage layouts
create policy "Admins can manage certificate layouts" on public.certificate_layouts
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

-- Anyone can read layouts (for verification page)
create policy "Anyone can view certificate layouts" on public.certificate_layouts
for select
to public
using (true);
