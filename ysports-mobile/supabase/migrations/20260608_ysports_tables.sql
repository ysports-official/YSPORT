-- ─── Y SPORTS Supabase Tables ─────────────────────────────────────────────
-- Çalıştırma: Supabase Dashboard → SQL Editor → Bu dosyayı yapıştır → Run

-- ─── 1. market_athletes (Sporcu Piyasa / SGD Puanları) ────────────────────
create table if not exists public.market_athletes (
  id          bigserial primary key,
  name        text        not null,
  sport       text        not null,
  sgd_score   numeric(4,1) not null default 5.0,
  trend       text        not null default '+0%',
  color       text        not null default '#1a4fff',
  role        text        not null default 'sporcu',  -- sporcu | federasyon | kulup
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.market_athletes enable row level security;
create policy "Herkes okuyabilir" on public.market_athletes for select using (true);
create policy "Servis yazabilir"  on public.market_athletes for all using (auth.role() = 'service_role');

-- ─── 2. sponsorship_packages (Sponsorluk Paketleri) ──────────────────────
create table if not exists public.sponsorship_packages (
  id          bigserial primary key,
  name        text        not null,
  price       text        not null,
  color       text        not null default '#1a4fff',
  features    jsonb       not null default '[]',
  sort_order  int         not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);

alter table public.sponsorship_packages enable row level security;
create policy "Herkes okuyabilir" on public.sponsorship_packages for select using (true);

-- ─── 3. live_events (Canlı Maçlar - Realtime) ────────────────────────────
create table if not exists public.live_events (
  id          bigserial primary key,
  sport_emoji text        not null default '⚽',
  home_team   text        not null,
  away_team   text        not null,
  score       text        not null default '0 - 0',
  time_info   text        not null default '0''',
  status      text        not null default 'upcoming', -- live | upcoming | finished
  color       text        not null default '#4a6fa5',
  match_date  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.live_events enable row level security;
create policy "Herkes okuyabilir" on public.live_events for select using (true);
create policy "Servis yazabilir"  on public.live_events for all using (auth.role() = 'service_role');

-- Realtime aktif et
alter publication supabase_realtime add table public.live_events;

-- ─── 4. updated_at Trigger ───────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger market_athletes_updated_at
  before update on public.market_athletes
  for each row execute procedure public.handle_updated_at();

create trigger live_events_updated_at
  before update on public.live_events
  for each row execute procedure public.handle_updated_at();

-- ─── 5. Örnek Veri ───────────────────────────────────────────────────────
insert into public.market_athletes (name, sport, sgd_score, trend, color) values
  ('A. Yılmaz',  'Futbol',   8.7, '+12%', '#00b97a'),
  ('B. Kaya',    'Basketbol',7.9, '+8%',  '#1a4fff'),
  ('C. Demir',   'Güreş',    9.1, '+21%', '#8b2fff'),
  ('D. Çelik',   'Boks',     6.4, '-3%',  '#e84545'),
  ('E. Arslan',  'Yüzme',    8.2, '+5%',  '#c9a227'),
  ('F. Şahin',   'Atletizm', 7.5, '+9%',  '#06b6d4')
on conflict do nothing;

insert into public.sponsorship_packages (name, price, color, features, sort_order) values
  ('Starter',    '₺2.500/ay',  '#1a4fff', '["5 Sporcu Takibi","Temel SGD Raporu","E-posta Desteği"]', 1),
  ('Pro',        '₺7.500/ay',  '#8b2fff', '["25 Sporcu Takibi","AI Performans Analizi","Özel Sözleşme","7/24 Destek"]', 2),
  ('Enterprise', 'Özel Fiyat', '#c9a227', '["Sınırsız Sporcu","Beyaz Etiket","API Erişimi","Özel Entegrasyon"]', 3)
on conflict do nothing;

insert into public.live_events (sport_emoji, home_team, away_team, score, time_info, status, color) values
  ('⚽', 'Galatasaray',  'Fenerbahçe',   '2 - 1', '67''',   'live',     '#e84545'),
  ('🏀', 'Anadolu Efes', 'Fenerbahçe B', '78 - 74','Q3',    'live',     '#1a4fff'),
  ('🏐', 'Halkbank',     'Arkas',        '2 - 1', 'Set 4', 'live',     '#8b2fff'),
  ('⚽', 'Trabzonspor',  'Beşiktaş',     '0 - 0', '21:45', 'upcoming', '#4a6fa5'),
  ('🎾', 'T. Çağlar',   'M. Yıldız',    '6-4, 3-','Set 2', 'live',     '#c9a227')
on conflict do nothing;
