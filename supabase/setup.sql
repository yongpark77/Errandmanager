-- ============================================
-- Errand Manager - Supabase Setup SQL
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create tables
-- ============================================

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  remind_days_before INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- errands table
CREATE TABLE IF NOT EXISTS errands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'home', 'subscriptions', 'health', 'other')),
  interval_type TEXT NOT NULL CHECK (interval_type IN ('months', 'miles')),
  interval_value INTEGER NOT NULL,
  next_due DATE NOT NULL,
  last_completed DATE,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  reminders BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_errands_user_id ON errands(user_id);
CREATE INDEX IF NOT EXISTS idx_errands_next_due ON errands(next_due);
CREATE INDEX IF NOT EXISTS idx_errands_category ON errands(category);

-- completion_history table
CREATE TABLE IF NOT EXISTS completion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  scheduled_date DATE NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_completion_history_errand_id ON completion_history(errand_id);
CREATE INDEX IF NOT EXISTS idx_completion_history_user_id ON completion_history(user_id);

-- 2. Enable RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_history ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- errands policies
CREATE POLICY "Users can view own errands" ON errands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own errands" ON errands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own errands" ON errands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own errands" ON errands FOR DELETE USING (auth.uid() = user_id);

-- completion_history policies
CREATE POLICY "Users can view own history" ON completion_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON completion_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON completion_history FOR DELETE USING (auth.uid() = user_id);

-- 3. Auto-create profile on signup trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_errands_updated_at ON errands;
CREATE TRIGGER set_errands_updated_at
  BEFORE UPDATE ON errands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
