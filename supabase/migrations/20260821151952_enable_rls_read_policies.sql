
do $$
declare t text;
begin
  foreach t in array array['person','day','block','checklist_item','workout','exercise','goal','block_done','item_check','block_override']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists anon_read on %I', t);
    execute format('create policy anon_read on %I for select to anon using (true)', t);
  end loop;
end $$;
