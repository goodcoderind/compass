-- Compass Supabase setup
-- Run this in Supabase SQL Editor after creating a project.
-- This also creates a private Storage bucket named "resumes".

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size integer,
  extracted_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.career_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null check (
    tool in (
      'resume',
      'roadmap',
      'projects',
      'learning',
      'interview',
      'linkedin',
      'jdanalyzer'
    )
  ),
  title text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_created_idx
  on public.resumes (user_id, created_at desc);

create index if not exists career_outputs_user_created_idx
  on public.career_outputs (user_id, created_at desc);

alter table public.resumes enable row level security;
alter table public.career_outputs enable row level security;

drop policy if exists "Users can read their own resumes" on public.resumes;
create policy "Users can read their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own resumes" on public.resumes;
create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own career outputs" on public.career_outputs;
create policy "Users can read their own career outputs"
  on public.career_outputs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own career outputs" on public.career_outputs;
create policy "Users can insert their own career outputs"
  on public.career_outputs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own career outputs" on public.career_outputs;
create policy "Users can delete their own career outputs"
  on public.career_outputs for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can upload their own resume files" on storage.objects;
create policy "Users can upload their own resume files"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read their own resume files" on storage.objects;
create policy "Users can read their own resume files"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own resume files" on storage.objects;
create policy "Users can delete their own resume files"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
