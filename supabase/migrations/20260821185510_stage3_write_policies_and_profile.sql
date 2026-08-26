
-- Profile fields for the AI later (equipment, constraints/injuries).
alter table person add column if not exists equipment text not null default '';
alter table person add column if not exists constraints text not null default '';

-- Write access for the editable tables (anon, matching the private-link model).
do $$
declare t text;
begin
  foreach t in array array['block','checklist_item','block_done','item_check','block_override','goal','person','exercise','day']
  loop
    execute format('drop policy if exists anon_insert on %I', t);
    execute format('drop policy if exists anon_update on %I', t);
    execute format('drop policy if exists anon_delete on %I', t);
    execute format('create policy anon_insert on %I for insert to anon with check (true)', t);
    execute format('create policy anon_update on %I for update to anon using (true) with check (true)', t);
    execute format('create policy anon_delete on %I for delete to anon using (true)', t);
  end loop;
end $$;
