create function public.create_booking_with_verified_inventory(
  p_booking_code text, p_hotel_id bigint, p_stay_type text,
  p_check_in date, p_check_out date, p_months integer,
  p_adults integer, p_children integer, p_full_name text,
  p_email text, p_phone text, p_note text, p_rooms jsonb,
  p_inventory jsonb, p_inventory_start date, p_inventory_end date
) returns jsonb
language plpgsql
security invoker
set search_path = ''
set timezone = 'Asia/Ho_Chi_Minh'
as $$
declare
  v_start date := p_check_in;
  v_end date := p_check_out;
  v_room jsonb;
  v_verified jsonb;
  v_room_id bigint;
  v_capacity integer;
  v_internal bigint;
begin
  if p_stay_type = 'month' then
    v_start := current_date;
    v_end := (v_start + make_interval(months => p_months))::date;
  end if;

  if v_start is null or v_end is null or v_end <= v_start
    or v_start is distinct from p_inventory_start
    or v_end is distinct from p_inventory_end then
    raise sqlstate 'PT409' using message = 'Kỳ lưu trú đã thay đổi. Vui lòng kiểm tra lại.';
  end if;

  -- Share the lock used by create_booking_atomic_v2, including its other callers.
  perform 1 from public.hotels where id = p_hotel_id and status = 'active' for update;
  if not found then
    raise sqlstate 'PT409' using message = 'Cơ sở không còn nhận đặt phòng.';
  end if;

  for v_room in select value from jsonb_array_elements(p_rooms)
  loop
    select value into v_verified
      from jsonb_array_elements(p_inventory)
      where value->>'roomSlug' = v_room->>'roomSlug';

    select id, quantity into v_room_id, v_capacity
      from public.rooms
      where hotel_id = p_hotel_id and slug = v_room->>'roomSlug' and status = 'active'
      for update;

    if not found or v_room_id is distinct from (v_verified->>'roomId')::bigint
      or v_capacity is distinct from (v_verified->>'totalQuantity')::integer
      or coalesce((v_verified->>'availableQuantity')::integer, 0) < (v_room->>'quantity')::integer then
      raise sqlstate 'PT409' using message = 'Tồn phòng đã thay đổi. Vui lòng tìm phòng lại.';
    end if;

    select coalesce(sum(br.quantity), 0) into v_internal
      from public.booking_rooms br
      join public.bookings b on b.id = br.booking_id
      where br.room_id = v_room_id and b.hotel_id = p_hotel_id
        and b.status <> 'cancelled' and b.check_in < v_end and b.check_out > v_start;

    if v_internal is distinct from (v_verified->>'internalQuantity')::bigint then
      raise sqlstate 'PT409' using message = 'Tồn phòng đã thay đổi. Vui lòng tìm phòng lại.';
    end if;
  end loop;

  return public.create_booking_atomic_v2(
    p_booking_code, p_hotel_id, p_stay_type, p_check_in, p_check_out,
    p_months, p_adults, p_children, p_full_name, p_email, p_phone, p_note, p_rooms
  );
end;
$$;

revoke all on function public.create_booking_with_verified_inventory(
  text, bigint, text, date, date, integer, integer, integer, text, text, text, text, jsonb, jsonb, date, date
) from public, anon, authenticated;

grant execute on function public.create_booking_with_verified_inventory(
  text, bigint, text, date, date, integer, integer, integer, text, text, text, text, jsonb, jsonb, date, date
) to service_role;

-- The web server uses service_role. Browser roles must go through the
-- server-side GoHost check instead of invoking the previous RPC directly.
revoke execute on function public.create_booking_atomic_v2(
  text, bigint, text, date, date, integer, integer, integer, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.create_booking_atomic_v2(
  text, bigint, text, date, date, integer, integer, integer, text, text, text, text, jsonb
) to service_role;
