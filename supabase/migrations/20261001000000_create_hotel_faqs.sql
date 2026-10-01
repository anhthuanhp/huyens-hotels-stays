-- Per-hotel FAQ records. Public visitors can only read published entries.
-- Mutations require a Supabase Auth app_metadata role claim of "admin".
create table if not exists public.hotel_faqs (
  id uuid primary key default gen_random_uuid(),
  hotel_id bigint not null references public.hotels(id) on delete cascade,
  question_vi text not null,
  answer_vi text not null,
  question_en text,
  answer_en text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_faqs_question_vi_not_blank check (length(trim(question_vi)) > 0),
  constraint hotel_faqs_answer_vi_not_blank check (length(trim(answer_vi)) > 0),
  constraint hotel_faqs_question_en_not_blank check (question_en is null or length(trim(question_en)) > 0),
  constraint hotel_faqs_answer_en_not_blank check (answer_en is null or length(trim(answer_en)) > 0),
  constraint hotel_faqs_hotel_question_unique unique (hotel_id, question_vi)
);

create index if not exists hotel_faqs_public_order_idx
  on public.hotel_faqs (hotel_id, sort_order, id)
  where is_active = true;

alter table public.hotel_faqs enable row level security;

grant select on public.hotel_faqs to anon, authenticated;
grant insert, update, delete on public.hotel_faqs to authenticated;

drop policy if exists "Public can read active hotel FAQs" on public.hotel_faqs;
create policy "Public can read active hotel FAQs"
  on public.hotel_faqs
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins manage hotel FAQs" on public.hotel_faqs;
create policy "Admins manage hotel FAQs"
  on public.hotel_faqs
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

notify pgrst, 'reload schema';

