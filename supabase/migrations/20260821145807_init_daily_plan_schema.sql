
-- People (Diyanah, Gong). Each has a private slug used in their link.
create table person (
  id           bigint generated always as identity primary key,
  name         text not null,
  slug         text not null unique,
  timezone     text not null default 'Asia/Singapore',
  created_at   timestamptz not null default now()
);

-- One row per weekday per person (0=Sun .. 6=Sat). This is the recurring template.
create table day (
  id         bigint generated always as identity primary key,
  person_id  bigint not null references person(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6),
  label      text not null,
  chip       text not null,
  unique (person_id, weekday)
);

-- A schedule block within a day (template).
create table block (
  id         bigint generated always as identity primary key,
  day_id     bigint not null references day(id) on delete cascade,
  sort       int not null,
  time       text not null,           -- 'HH:MM' 24h
  title      text not null,
  detail     text default '',         -- info line
  supp       text default '',         -- supplements info line
  tag        text not null default 'work',  -- food | work | play | rest
  workout    text,                    -- 'A' | 'B' when this block is a workout
  notify     boolean not null default true
);

-- Editable tick-off checklist items for a block (template).
create table checklist_item (
  id         bigint generated always as identity primary key,
  block_id   bigint not null references block(id) on delete cascade,
  sort       int not null,
  text       text not null
);

-- Workouts and their exercises (info-only: name, scheme, demo, cue).
create table workout (
  id         bigint generated always as identity primary key,
  person_id  bigint not null references person(id) on delete cascade,
  code       text not null,           -- 'A' | 'B'
  name       text not null default '',
  unique (person_id, code)
);

create table exercise (
  id          bigint generated always as identity primary key,
  workout_id  bigint not null references workout(id) on delete cascade,
  sort        int not null,
  name        text not null,
  scheme      text default '',        -- sets/reps/rest as text
  demo_slug   text,                   -- library demo reference (filled later)
  cue         text default '',
  is_footwork boolean not null default false,
  locked      boolean not null default false
);

-- Editable badminton goals that drive AI suggestions.
create table goal (
  id         bigint generated always as identity primary key,
  person_id  bigint not null references person(id) on delete cascade,
  sort       int not null,
  text       text not null
);

-- Per-date runtime state (resets each day; nothing carries over).
create table block_done (
  id         bigint generated always as identity primary key,
  person_id  bigint not null references person(id) on delete cascade,
  block_id   bigint not null references block(id) on delete cascade,
  on_date    date not null,
  done       boolean not null default true,
  unique (person_id, block_id, on_date)
);

create table item_check (
  id                bigint generated always as identity primary key,
  person_id         bigint not null references person(id) on delete cascade,
  checklist_item_id bigint not null references checklist_item(id) on delete cascade,
  on_date           date not null,
  checked           boolean not null default true,
  unique (person_id, checklist_item_id, on_date)
);

-- 'Only today' edits: a date-scoped patch over a block (title/time/detail/skip).
create table block_override (
  id         bigint generated always as identity primary key,
  person_id  bigint not null references person(id) on delete cascade,
  block_id   bigint not null references block(id) on delete cascade,
  on_date    date not null,
  patch      jsonb not null default '{}'::jsonb,
  unique (person_id, block_id, on_date)
);

create index on block (day_id, sort);
create index on checklist_item (block_id, sort);
create index on exercise (workout_id, sort);
create index on block_done (person_id, on_date);
create index on item_check (person_id, on_date);
