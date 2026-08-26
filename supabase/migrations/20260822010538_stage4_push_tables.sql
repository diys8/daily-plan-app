
create table push_subscription (
  id          bigint generated always as identity primary key,
  person_id   bigint not null references person(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);
alter table push_subscription enable row level security;
create policy anon_insert on push_subscription for insert to anon with check (true);
create policy anon_select on push_subscription for select to anon using (true);
create policy anon_delete on push_subscription for delete to anon using (true);

-- server-only secrets: RLS on, NO anon policy => anon cannot read; edge function reads via service role.
create table app_secret (
  name   text primary key,
  value  text not null
);
alter table app_secret enable row level security;
