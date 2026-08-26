alter table exercise add column if not exists paused boolean not null default false;
alter table exercise add column if not exists paused_reason text not null default '';