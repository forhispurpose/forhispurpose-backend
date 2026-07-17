-- For His Purpose — Supabase schema (free tier Postgres)
-- Run this once in Supabase: Project → SQL Editor → New Query → paste → Run.

create table if not exists newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  name text,
  source text default 'website',
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  reason text,
  message text not null,
  status text default 'new',
  created_at timestamptz not null default now()
);

create table if not exists prayer_requests (
  id bigint generated always as identity primary key,
  name text,
  email text not null,
  request text not null,
  pref text default 'Keep this private — team only',
  status text default 'new',
  created_at timestamptz not null default now()
);

create table if not exists bible_study_signups (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  whatsapp text,
  new_to_bible text,
  created_at timestamptz not null default now()
);

create table if not exists mentorship_applications (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  age text,
  track text,
  guardian text,
  why text,
  status text default 'pending_review',
  created_at timestamptz not null default now()
);

create table if not exists volunteer_interest (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  area text,
  created_at timestamptz not null default now()
);

create table if not exists testimonies (
  id bigint generated always as identity primary key,
  name text default 'Anonymous',
  category text,
  story text not null,
  status text default 'pending_review',
  created_at timestamptz not null default now()
);

-- Row Level Security: keep these tables closed to the public API/anon key.
-- The backend uses the SERVICE ROLE key (server-side only, bypasses RLS), so
-- enabling RLS here just guarantees no one can read/write these tables directly
-- from the browser using the public anon key.
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;
alter table prayer_requests enable row level security;
alter table bible_study_signups enable row level security;
alter table mentorship_applications enable row level security;
alter table volunteer_interest enable row level security;
alter table testimonies enable row level security;
