-- =============================================================================
-- Al-Ihsan Relief — Supabase Schema
-- Run this in your Supabase SQL Editor to create all tables + RLS policies.
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Admin Users ─────────────────────────────────────────────────────────────
create table if not exists admin_users (
  id         uuid primary key,                     -- matches auth.users.id
  email      text,
  bootstrap  boolean default false,
  created_at timestamptz default now(),
  created_by uuid
);

alter table admin_users enable row level security;

create policy "Admins can read admin_users"
  on admin_users for select
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can insert admin_users"
  on admin_users for insert
  with check ( auth.uid() in (select id from admin_users) or not exists (select 1 from admin_users) );

create policy "Admins can update admin_users"
  on admin_users for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete admin_users"
  on admin_users for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── Gallery ─────────────────────────────────────────────────────────────────
create table if not exists gallery (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text,
  url        text not null,
  created_at timestamptz default now()
);

alter table gallery enable row level security;

create policy "Anyone can read gallery"
  on gallery for select using (true);

create policy "Admins can insert gallery"
  on gallery for insert
  with check ( auth.uid() in (select id from admin_users) );

create policy "Admins can update gallery"
  on gallery for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete gallery"
  on gallery for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── Videos ──────────────────────────────────────────────────────────────────
create table if not exists videos (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  url        text not null,
  created_at timestamptz default now()
);

alter table videos enable row level security;

create policy "Anyone can read videos"
  on videos for select using (true);

create policy "Admins can insert videos"
  on videos for insert
  with check ( auth.uid() in (select id from admin_users) );

create policy "Admins can update videos"
  on videos for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete videos"
  on videos for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── Appeals ─────────────────────────────────────────────────────────────────
create table if not exists appeals (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  description text,
  amount      numeric default 0,
  created_at  timestamptz default now()
);

alter table appeals enable row level security;

create policy "Anyone can read appeals"
  on appeals for select using (true);

create policy "Admins can manage appeals"
  on appeals for all
  using ( auth.uid() in (select id from admin_users) );

-- ─── Posts ────────────────────────────────────────────────────────────────────
create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  body       text,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select using (true);

create policy "Admins can manage posts"
  on posts for all
  using ( auth.uid() in (select id from admin_users) );

-- ─── Projects ────────────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  category    text,
  created_at  timestamptz default now()
);

alter table projects enable row level security;

create policy "Anyone can read projects"
  on projects for select using (true);

create policy "Admins can manage projects"
  on projects for all
  using ( auth.uid() in (select id from admin_users) );

-- ─── Contacts (Form Submissions) ────────────────────────────────────────────
create table if not exists contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Anyone can create contacts"
  on contacts for insert
  with check (true);

create policy "Admins can read contacts"
  on contacts for select
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can update contacts"
  on contacts for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete contacts"
  on contacts for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── Volunteer Applications ──────────────────────────────────────────────────
create table if not exists volunteer_applications (
  id                       uuid primary key default gen_random_uuid(),
  full_name                text not null,
  age                      int not null,
  gender                   text not null,
  phone                    text not null,
  email                    text not null,
  city                     text not null,
  state                    text not null,
  address                  text not null,
  occupation               text not null,
  marital_status           text not null,
  preferred_role           text not null,
  availability             text not null,
  mosque_community         text not null,
  emergency_contact_name   text not null,
  emergency_contact_phone  text not null,
  experience               text not null,
  motivation               text not null,
  id_document_url          text,
  q_amanah                 text not null,
  q_confidentiality        text not null,
  q_adab                   text not null,
  scenario_response        text not null,
  quiz_score               int not null check (quiz_score >= 0 and quiz_score <= 100),
  accepted_terms           boolean not null default false,
  accepted_privacy         boolean not null default false,
  accepted_confidentiality boolean not null default false,
  status                   text not null default 'PENDING'
                           check (status in ('PENDING', 'REVIEWED', 'SHORTLISTED', 'DECLINED')),
  created_at               timestamptz default now(),
  updated_at               timestamptz
);

alter table volunteer_applications enable row level security;

create policy "Anyone can create volunteer applications"
  on volunteer_applications for insert
  with check (true);

create policy "Admins can read volunteer applications"
  on volunteer_applications for select
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can update volunteer applications"
  on volunteer_applications for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete volunteer applications"
  on volunteer_applications for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── Aid Applications (Beneficiary Help Requests) ───────────────────────────
create table if not exists aid_applications (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  phone             text not null,
  email             text,
  address           text not null,
  city              text not null,
  state             text not null,
  aid_category      text not null,
  household_size    int default 1,
  monthly_income    text,
  description       text not null,
  referral_source   text,
  status            text not null default 'PENDING'
                    check (status in ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED')),
  created_at        timestamptz default now(),
  updated_at        timestamptz
);

alter table aid_applications enable row level security;

create policy "Anyone can create aid applications"
  on aid_applications for insert
  with check (true);

create policy "Admins can read aid applications"
  on aid_applications for select
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can update aid applications"
  on aid_applications for update
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can delete aid applications"
  on aid_applications for delete
  using ( auth.uid() in (select id from admin_users) );

-- ─── General Applications ────────────────────────────────────────────────────
create table if not exists applications (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  address    text not null,
  created_at timestamptz default now()
);

alter table applications enable row level security;

create policy "Anyone can create applications"
  on applications for insert
  with check (true);

create policy "Admins can read applications"
  on applications for select
  using ( auth.uid() in (select id from admin_users) );

create policy "Admins can manage applications"
  on applications for all
  using ( auth.uid() in (select id from admin_users) );

-- ─── Enable Realtime for tables that need it ─────────────────────────────────
alter publication supabase_realtime add table gallery;
