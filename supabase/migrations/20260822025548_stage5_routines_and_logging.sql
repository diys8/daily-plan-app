
-- Routines get a focus tag (strength / cardio / mobility / ...)
alter table workout add column if not exists focus text not null default 'strength';
-- Exercises get a section (warmup / main / cooldown) and an optional load note
alter table exercise add column if not exists section text not null default 'main';
alter table exercise add column if not exists load text not null default '';

-- Per-session logging: did the exercise + how it felt, per date.
create table if not exists exercise_log (
  id           bigint generated always as identity primary key,
  person_id    bigint not null references person(id) on delete cascade,
  exercise_id  bigint not null references exercise(id) on delete cascade,
  on_date      date not null,
  done         boolean not null default false,
  feel         text not null default '',   -- e.g. easy | ok | hard  (or light | right | heavy)
  unique (person_id, exercise_id, on_date)
);
alter table exercise_log enable row level security;
drop policy if exists anon_all on exercise_log;
create policy anon_read on exercise_log for select to anon using (true);
create policy anon_insert on exercise_log for insert to anon with check (true);
create policy anon_update on exercise_log for update to anon using (true) with check (true);
create policy anon_delete on exercise_log for delete to anon using (true);
create index if not exists exercise_log_person_date on exercise_log(person_id, on_date);

-- Name the existing routines nicely + set focus.
update workout set name='Strength A — legs + lateral power', focus='strength' where code='A';
update workout set name='Strength B — core, back & balance', focus='strength' where code='B';

select
 (select count(*) from workout) as routines,
 (select count(*) from exercise) as exercises,
 (select count(*) from exercise_log) as logs;
