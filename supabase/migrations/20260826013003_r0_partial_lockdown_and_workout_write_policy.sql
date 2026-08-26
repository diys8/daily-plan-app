-- 1. Remove anon DELETE on tables the app never deletes from.
--    (person, day, push_subscription, exercise_log are never deleted by app.js.
--     The notify function deletes stale push_subscription rows as service_role, which bypasses RLS.)
drop policy if exists anon_delete on public.person;
drop policy if exists anon_delete on public.day;
drop policy if exists anon_delete on public.push_subscription;
drop policy if exists anon_delete on public.exercise_log;

-- 2. The workout table only had SELECT for anon, so creating or renaming a routine
--    was denied by RLS and failed silently. Grant the writes the app actually makes.
create policy anon_insert on public.workout for insert to anon with check (true);
create policy anon_update on public.workout for update to anon using (true) with check (true);