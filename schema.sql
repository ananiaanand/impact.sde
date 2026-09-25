-- Supabase Schema for SDG 11 Teacher Analytics

-- 1. Users / Roles
-- Assuming auth.users already exists, we use public profiles.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'student' -- 'student' or 'teacher'
);
-- 2. Rooms (Multiplayer / Game Setup)
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid primary key default uuid_generate_v4(),
  room_code text unique not null,
  mode text not null, -- '1p', '1v1', '2v2'
  status text default 'waiting', -- 'waiting', 'active', 'completed'
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.room_players (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  joined_at timestamp with time zone default now(),
  unique(room_id, user_id)
);

-- 3. Game Sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  session_id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  case_id text,
  urban_context text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  score float,
  obstacles_found int default 0,
  clues_found int default 0,
  hints_used int default 0,
  correct_answers int default 0,
  incorrect_answers int default 0,
  final_investigation_score float,
  understanding_state jsonb -- quantum-inspired model state
);

-- 3. Level Interactions
CREATE TABLE IF NOT EXISTS public.level_interactions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.game_sessions(session_id),
  level_number int,
  target_sdg text,
  hints_requested int default 0,
  attempts int default 0,
  success boolean,
  time_spent_seconds int
);

-- Ensure RLS is enabled and policies allow teachers to view all, students to view own.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_interactions ENABLE ROW LEVEL SECURITY;

-- Teacher policies
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can view all sessions" ON public.game_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can view all interactions" ON public.level_interactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Room Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can read room players" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert room players" ON public.room_players FOR INSERT WITH CHECK (true);
