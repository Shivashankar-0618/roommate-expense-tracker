-- =====================================================================
-- RoomMate · Supabase schema (NO sign-in version: access by room code only)
-- Paste this whole file into: Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- How security works:
--   * The three tables have Row Level Security ON and NO policies, and all direct
--     table privileges are revoked -> the public anon key cannot read or write them.
--   * The app talks only to the functions below. Each one needs the room code
--     and only touches that room's rows. The room code is the "password".
-- =====================================================================

-- If you ran the earlier sign-in version of this file, clean it up first
-- (this deletes its tables - fine if you have no data yet):
-- drop table if exists public.expenses, public.members, public.room_users, public.rooms cascade;
drop function if exists public.create_room(text);
drop function if exists public.join_room(text);
drop function if exists public.is_room_member(uuid);
drop function if exists public.is_room_admin(uuid);

-- ---------- 1. TABLES -------------------------------------------------

create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  join_code   text not null unique
              default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  created_at  timestamptz not null default now()
);

create table public.members (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.rooms (id) on delete cascade,
  name          text not null check (char_length(btrim(name)) between 1 and 40),
  position      int  not null default 0,
  -- A member takes part in the split for month M when:
  --   (active_from is null or month(active_from) <= M) and
  --   (active_until is null or M < month(active_until))
  -- so old months keep their original calculations.
  active_from   date,
  active_until  date,
  created_at    timestamptz not null default now(),
  unique (id, room_id)
);
create index members_room_idx on public.members (room_id, position);

create table public.expenses (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms (id) on delete cascade,
  description    text not null check (char_length(btrim(description)) between 1 and 120),
  amount_paise   bigint not null check (amount_paise > 0),      -- integer paise, never floats
  paid_by        uuid not null,                                 -- members.id
  expense_date   date not null default current_date,            -- decides which month it belongs to
  created_at     timestamptz not null default now(),
  -- the payer must belong to the SAME room as the expense
  foreign key (paid_by, room_id) references public.members (id, room_id) on delete restrict
);
create index expenses_room_date_idx on public.expenses (room_id, expense_date desc);

-- ---------- 2. LOCK THE TABLES ----------------------------------------

alter table public.rooms     enable row level security;
alter table public.members   enable row level security;
alter table public.expenses  enable row level security;
-- (no policies on purpose: nothing is reachable directly)
revoke all on public.rooms, public.members, public.expenses from anon, authenticated;

-- ---------- 3. INTERNAL HELPER (not callable from the app) ------------

create or replace function public._room_id(p_code text)
returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select id into v from public.rooms where join_code = upper(btrim(coalesce(p_code, '')));
  if v is null then
    raise exception 'Invalid room code';
  end if;
  return v;
end;
$$;
revoke all on function public._room_id(text) from public, anon, authenticated;

-- ---------- 4. APP FUNCTIONS (all need the room code) ------------------

-- Create a room with the four initial roommates. Returns the room code.
create or replace function public.create_room(p_name text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_room  uuid;
  v_code  text;
  v_names text[] := array['Shivuu', 'Ankush', 'Shashi', 'Tushar'];
  i int;
begin
  insert into public.rooms (name) values (btrim(p_name)) returning id, join_code into v_room, v_code;
  for i in 1 .. array_length(v_names, 1) loop
    insert into public.members (room_id, name, position) values (v_room, v_names[i], i);
  end loop;
  return v_code;
end;
$$;

-- ONE request returns everything the app needs: room + members + all expenses.
create or replace function public.get_room_data(p_code text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v uuid := public._room_id(p_code);
begin
  return jsonb_build_object(
    'room', (select jsonb_build_object('id', r.id, 'name', r.name, 'join_code', r.join_code)
             from public.rooms r where r.id = v),
    'members', coalesce((select jsonb_agg(to_jsonb(m) - 'created_at' order by m.position, m.created_at)
                         from public.members m where m.room_id = v), '[]'::jsonb),
    'expenses', coalesce((select jsonb_agg(to_jsonb(e) order by e.expense_date desc, e.created_at desc)
                          from public.expenses e where e.room_id = v), '[]'::jsonb)
  );
end;
$$;

create or replace function public.add_expense(
  p_code text, p_description text, p_amount_paise bigint, p_paid_by uuid, p_expense_date date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code); r public.expenses;
begin
  insert into public.expenses (room_id, description, amount_paise, paid_by, expense_date)
  values (v, btrim(p_description), p_amount_paise, p_paid_by, p_expense_date)
  returning * into r;
  return to_jsonb(r);
end;
$$;

create or replace function public.update_expense(
  p_code text, p_id uuid, p_description text, p_amount_paise bigint, p_paid_by uuid, p_expense_date date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code); r public.expenses;
begin
  update public.expenses
     set description = btrim(p_description), amount_paise = p_amount_paise,
         paid_by = p_paid_by, expense_date = p_expense_date
   where id = p_id and room_id = v
   returning * into r;
  if not found then raise exception 'Expense not found'; end if;
  return to_jsonb(r);
end;
$$;

create or replace function public.delete_expense(p_code text, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code);
begin
  delete from public.expenses where id = p_id and room_id = v;
  if not found then raise exception 'Expense not found'; end if;
end;
$$;

create or replace function public.rename_member(p_code text, p_id uuid, p_name text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code); r public.members;
begin
  update public.members set name = btrim(p_name) where id = p_id and room_id = v returning * into r;
  if not found then raise exception 'Roommate not found'; end if;
  return to_jsonb(r) - 'created_at';
end;
$$;

-- p_until = first day of a month -> stops counting them from that month on; null = restore
create or replace function public.set_member_active_until(p_code text, p_id uuid, p_until date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code); r public.members;
begin
  update public.members set active_until = p_until where id = p_id and room_id = v returning * into r;
  if not found then raise exception 'Roommate not found'; end if;
  return to_jsonb(r) - 'created_at';
end;
$$;

create or replace function public.add_member(p_code text, p_name text, p_active_from date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v uuid := public._room_id(p_code); r public.members;
begin
  insert into public.members (room_id, name, position, active_from)
  values (v, btrim(p_name),
          coalesce((select max(position) from public.members where room_id = v), 0) + 1,
          p_active_from)
  returning * into r;
  return to_jsonb(r) - 'created_at';
end;
$$;

-- Only these functions are callable by the app (anon key).
revoke all on function
  public.create_room(text),
  public.get_room_data(text),
  public.add_expense(text, text, bigint, uuid, date),
  public.update_expense(text, uuid, text, bigint, uuid, date),
  public.delete_expense(text, uuid),
  public.rename_member(text, uuid, text),
  public.set_member_active_until(text, uuid, date),
  public.add_member(text, text, date)
from public;

grant execute on function
  public.create_room(text),
  public.get_room_data(text),
  public.add_expense(text, text, bigint, uuid, date),
  public.update_expense(text, uuid, text, bigint, uuid, date),
  public.delete_expense(text, uuid),
  public.rename_member(text, uuid, text),
  public.set_member_active_until(text, uuid, date),
  public.add_member(text, text, date)
to anon, authenticated;
