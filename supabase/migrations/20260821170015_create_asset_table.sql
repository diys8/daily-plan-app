
create table asset (
  name        text primary key,
  content     text not null,
  updated_at  timestamptz not null default now()
);
alter table asset enable row level security;
create policy anon_read on asset for select to anon using (true);
