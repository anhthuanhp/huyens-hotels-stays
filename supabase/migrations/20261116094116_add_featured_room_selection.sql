begin;

alter table public.rooms
  add column is_featured boolean not null default false,
  add constraint rooms_featured_must_be_active check (not is_featured or status = 'active');

create unique index rooms_one_featured_per_hotel
  on public.rooms (hotel_id) where is_featured;

create function public.guard_room_featured_selection() returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status <> 'active' then
    new.is_featured := false;
  end if;

  if current_user in ('anon', 'authenticated')
     and (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    if tg_op = 'INSERT' then
      if new.is_featured then
        raise exception using errcode = '42501', message = 'Only admins can select featured rooms';
      end if;
    elsif new.is_featured is distinct from old.is_featured
       or (old.is_featured and new.hotel_id is distinct from old.hotel_id) then
      raise exception using errcode = '42501', message = 'Only admins can change featured rooms';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.guard_room_featured_selection() from public, anon, authenticated;

create trigger rooms_guard_featured_selection
  before insert or update of is_featured, hotel_id, status on public.rooms
  for each row execute function public.guard_room_featured_selection();

create function public.save_room_featured_selection(
  p_room_id bigint,
  p_changes jsonb,
  p_featured boolean,
  p_expected_featured_id bigint
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_hotel_id bigint;
  target_hotel_id bigint;
  featured_id bigint;
  locked_hotel_id bigint;
  current_room public.rooms%rowtype;
  updated_room public.rooms%rowtype;
begin
  if (select auth.uid()) is null
     or (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Only admins can change featured rooms';
  end if;

  select room.hotel_id into strict previous_hotel_id
  from public.rooms room where room.id = p_room_id;
  target_hotel_id := coalesce((p_changes ->> 'hotel_id')::bigint, previous_hotel_id);

  -- Lock both possible hotels before locking or modifying any room.
  for locked_hotel_id in
    select distinct id from unnest(array[previous_hotel_id, target_hotel_id]) as hotels(id) order by id
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('featured-room:' || locked_hotel_id::text, 0));
  end loop;

  select * into strict current_room from public.rooms where id = p_room_id for update;
  if current_room.hotel_id <> previous_hotel_id then
    raise exception using errcode = '40001', message = 'Room property changed. Reload before saving.';
  end if;

  updated_room := pg_catalog.jsonb_populate_record(current_room, p_changes);
  if p_featured then
    if updated_room.status <> 'active' then
      raise exception using errcode = '23514', message = 'Only public rooms can be featured';
    end if;
    select room.id into featured_id
    from public.rooms room where room.hotel_id = target_hotel_id and room.is_featured;
    if featured_id is distinct from p_expected_featured_id then
      raise exception using errcode = '40001', message = 'Featured room changed. Reload before saving.';
    end if;
    update public.rooms set is_featured = false where id = featured_id and id <> p_room_id;
  end if;

  update public.rooms
  set hotel_id = updated_room.hotel_id,
      slug = updated_room.slug,
      name_vi = updated_room.name_vi,
      name_en = updated_room.name_en,
      description_vi = updated_room.description_vi,
      description_en = updated_room.description_en,
      size = updated_room.size,
      max_guests = updated_room.max_guests,
      beds_vi = updated_room.beds_vi,
      beds_en = updated_room.beds_en,
      base_price_daily = updated_room.base_price_daily,
      base_price_monthly = updated_room.base_price_monthly,
      quantity = updated_room.quantity,
      amenities_vi = updated_room.amenities_vi,
      amenities_en = updated_room.amenities_en,
      status = updated_room.status,
      is_featured = coalesce(p_featured, current_room.is_featured)
  where id = p_room_id;
end;
$$;

revoke all on function public.save_room_featured_selection(bigint, jsonb, boolean, bigint) from public, anon, authenticated;
grant execute on function public.save_room_featured_selection(bigint, jsonb, boolean, bigint) to authenticated;

commit;
