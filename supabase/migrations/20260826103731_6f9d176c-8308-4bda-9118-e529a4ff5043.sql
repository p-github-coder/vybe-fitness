-- Fitness profiles
CREATE TABLE public.fitness_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  age integer,
  height_cm numeric,
  weight_kg numeric,
  fitness_level text NOT NULL DEFAULT 'beginner',
  goals text[] NOT NULL DEFAULT '{}',
  body_focus_areas text[] NOT NULL DEFAULT '{}',
  workout_preferences text[] NOT NULL DEFAULT '{}',
  equipment_preferences text[] NOT NULL DEFAULT '{}',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fitness_profiles TO authenticated;
GRANT ALL ON public.fitness_profiles TO service_role;
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own fitness profile"
  ON public.fitness_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view fitness profiles"
  ON public.fitness_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'trainer'));

CREATE POLICY "Admins manage fitness profiles"
  ON public.fitness_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER fitness_profiles_updated_at BEFORE UPDATE ON public.fitness_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Progress entries
CREATE TABLE public.progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recorded_on date NOT NULL DEFAULT current_date,
  weight_kg numeric,
  workouts_completed integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_entries TO authenticated;
GRANT ALL ON public.progress_entries TO service_role;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own progress"
  ON public.progress_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view progress"
  ON public.progress_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'trainer'));

CREATE TRIGGER progress_entries_updated_at BEFORE UPDATE ON public.progress_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Equipment enrichment
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS benefits text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_goals text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text;

-- Exercise enrichment
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS recommended_reps text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS equipment_name text;

-- Auto-generated workout plans (no trainer)
ALTER TABLE public.workout_plans ALTER COLUMN trainer_id DROP NOT NULL;
ALTER TABLE public.workout_plans ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'trainer';
ALTER TABLE public.workout_plan_items ADD COLUMN IF NOT EXISTS day_of_week text;

CREATE POLICY "Members manage own generated plans"
  ON public.workout_plans FOR ALL TO authenticated
  USING (auth.uid() = member_id AND source = 'auto')
  WITH CHECK (auth.uid() = member_id AND source = 'auto');

CREATE POLICY "Members manage own generated plan items"
  ON public.workout_plan_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND p.member_id = auth.uid() AND p.source = 'auto'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND p.member_id = auth.uid() AND p.source = 'auto'));
