-- Keep the existing tables and data. Review and apply separately.
begin;

create unique index gohost_ical_sources_canonical_url_key
  on public.gohost_ical_sources ((replace(feed_url, 'platform.gohost.vn:443/', 'platform.gohost.vn/')));

create unique index gohost_ical_sources_canonical_unit_key
  on public.gohost_ical_sources (room_id, (upper(btrim(unit_code))));

-- Serialize source additions and capacity reductions on the parent room.
create function public.check_gohost_source_capacity() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  capacity integer;
begin
  if TG_OP = 'UPDATE' and NEW.room_id = OLD.room_id then
    return NEW;
  end if;
  select quantity into capacity from public.rooms where id = NEW.room_id for update;
  if capacity is null or (
    select count(*) from public.gohost_ical_sources where room_id = NEW.room_id
  ) >= capacity then
    raise exception using errcode = '23514', message = 'GoHost sources exceed room capacity';
  end if;
  return NEW;
end;
$$;

create function public.check_gohost_room_capacity() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(NEW.quantity, 0) < coalesce(OLD.quantity, 0)
     and coalesce(NEW.quantity, 0) < (
       select count(*) from public.gohost_ical_sources where room_id = OLD.id
     ) then
    raise exception using errcode = '23514', message = 'Room capacity is below the number of GoHost sources';
  end if;
  return NEW;
end;
$$;

revoke all on function public.check_gohost_source_capacity() from public, anon, authenticated;
revoke all on function public.check_gohost_room_capacity() from public, anon, authenticated;

create trigger gohost_source_capacity
  before insert or update of room_id on public.gohost_ical_sources
  for each row execute function public.check_gohost_source_capacity();

create trigger gohost_room_capacity
  before update of quantity on public.rooms
  for each row execute function public.check_gohost_room_capacity();

commit;
