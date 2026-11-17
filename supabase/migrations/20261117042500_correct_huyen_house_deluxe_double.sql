do $$
declare
  target_room_id public.rooms.id%type;
begin
  select rooms.id into strict target_room_id
  from public.rooms
  join public.hotels on hotels.id = rooms.hotel_id
  where hotels.slug = 'huyen-house'
    and rooms.slug = 'family-house';

  update public.rooms
  set size = 22,
      beds_vi = '1 giường Queen',
      beds_en = '1 Queen bed',
      description_vi = 'Phòng Deluxe Double tại Huyen House rộng 22 m², có 1 giường Queen.',
      description_en = 'The Deluxe Double Room at Huyen House is 22 m² and has 1 queen bed.'
  where id = target_room_id;
end;
$$;
