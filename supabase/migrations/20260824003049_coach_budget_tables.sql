create table if not exists coach_config (
  id int primary key default 1,
  primary_model text not null default 'claude-sonnet-4-6',
  fallback_model text not null default 'claude-haiku-4-5-20251001',
  monthly_allowance_usd numeric not null default 0.83,
  yearly_cap_usd numeric not null default 10,
  primary_in numeric not null default 3, primary_out numeric not null default 15,
  fallback_in numeric not null default 1, fallback_out numeric not null default 5
);
insert into coach_config (id) values (1) on conflict (id) do nothing;

create table if not exists coach_usage (
  person_id bigint not null references person(id),
  on_month text not null,
  spent_usd numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (person_id, on_month)
);

alter table coach_config enable row level security;
alter table coach_usage enable row level security;