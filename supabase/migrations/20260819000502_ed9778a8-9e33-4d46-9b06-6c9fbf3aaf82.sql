-- ============ ENUMS ============
CREATE TYPE public.booking_status AS ENUM ('confirmed','cancelled','completed','waitlist');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');
CREATE TYPE public.membership_status AS ENUM ('active','expired','cancelled','pending');

-- ============ CLASS EXTENSIONS ============
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS trainer_id uuid;

ALTER TABLE public.membership_plans
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'basic';

-- Admins need write access to profiles beyond status
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins manage trainer profiles
CREATE POLICY "Admins manage trainer profiles" ON public.trainer_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ EQUIPMENT ============
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text,
  description text,
  target_muscles text[] NOT NULL DEFAULT '{}',
  difficulty text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.equipment TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published equipment is public" ON public.equipment FOR SELECT USING (published = true);
CREATE POLICY "Admins manage equipment" ON public.equipment FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EXERCISES ============
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text,
  description text,
  instructions text,
  target_muscles text[] NOT NULL DEFAULT '{}',
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE SET NULL,
  difficulty text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published exercises are public" ON public.exercises FOR SELECT USING (published = true);
CREATE POLICY "Admins manage exercises" ON public.exercises FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  trainer_id uuid,
  booking_date date NOT NULL,
  booking_time text,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, class_id, booking_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own bookings" ON public.bookings FOR ALL TO authenticated
  USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Trainers view their class bookings" ON public.bookings FOR SELECT TO authenticated
  USING (trainer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = bookings.class_id AND c.trainer_id = auth.uid()));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  trainer_id uuid,
  attended_on date NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view own attendance" ON public.attendance FOR SELECT TO authenticated
  USING (member_id = auth.uid());
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Trainers manage attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'trainer')) WITH CHECK (public.has_role(auth.uid(),'trainer'));

-- ============ USER MEMBERSHIPS ============
CREATE TABLE public.user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  status public.membership_status NOT NULL DEFAULT 'active',
  started_on date NOT NULL DEFAULT CURRENT_DATE,
  expires_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memberships TO authenticated;
GRANT ALL ON public.user_memberships TO service_role;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own membership" ON public.user_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins manage memberships" ON public.user_memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER user_memberships_updated_at BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRAINER ASSIGNMENTS ============
CREATE TABLE public.trainer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  member_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_assignments TO authenticated;
GRANT ALL ON public.trainer_assignments TO service_role;
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage assignments" ON public.trainer_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Trainer or member view assignment" ON public.trainer_assignments FOR SELECT TO authenticated
  USING (trainer_id = auth.uid() OR member_id = auth.uid());

-- ============ WORKOUT PLANS ============
CREATE TABLE public.workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  member_id uuid NOT NULL,
  title text NOT NULL,
  focus text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_plans TO service_role;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers manage own plans" ON public.workout_plans FOR ALL TO authenticated
  USING (trainer_id = auth.uid()) WITH CHECK (trainer_id = auth.uid());
CREATE POLICY "Members view own plans" ON public.workout_plans FOR SELECT TO authenticated
  USING (member_id = auth.uid());
CREATE POLICY "Admins manage plans" ON public.workout_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workout_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  sets integer NOT NULL DEFAULT 3,
  reps text,
  duration text,
  equipment text,
  instructions text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plan_items TO authenticated;
GRANT ALL ON public.workout_plan_items TO service_role;
ALTER TABLE public.workout_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan items follow plan access" ON public.workout_plan_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND (p.trainer_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND (p.trainer_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Members read own plan items" ON public.workout_plan_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workout_plans p WHERE p.id = plan_id AND p.member_id = auth.uid()));

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published announcements are public" ON public.announcements FOR SELECT USING (published = true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published faqs are public" ON public.faqs FOR SELECT USING (published = true);
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE CONTENT ============
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is public" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin needs to read every profile row for member management (already covered by has_role in existing SELECT policy)

-- ============ SEED ============
INSERT INTO public.site_content (key, label, value) VALUES
  ('home_hero_eyebrow','Homepage hero eyebrow','Victoria Island, Lagos'),
  ('home_hero_title','Homepage hero title','Train like it matters.'),
  ('home_hero_subtitle','Homepage hero subtitle','A premium training floor, elite coaches and programming built around your body.'),
  ('home_cta_label','Homepage CTA label','Join VYBE');

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('What are your opening hours?','We are open Monday to Saturday, 5am to 11pm, and Sunday 7am to 8pm.',1),
  ('Do I need a trainer to book classes?','No. Any approved member can book any published class subject to capacity.',2),
  ('Can I freeze my membership?','Yes — speak to the front desk and we will pause your plan for up to 30 days.',3);

INSERT INTO public.equipment (name, description, target_muscles, difficulty) VALUES
  ('Leg Press Machine','Plate-loaded leg press for lower body strength.','{Quads,Glutes,Hamstrings}','Beginner'),
  ('Squat Rack','Olympic rack with safety arms for squats and presses.','{Quads,Glutes,Core}','Intermediate'),
  ('Assault Bike','Air-resistance bike for conditioning intervals.','{"Full body",Cardio}','All levels'),
  ('Cable Crossover','Dual adjustable pulleys for chest, back and arms.','{Chest,Back,Arms}','Intermediate'),
  ('Dumbbell Rack','2.5kg to 50kg rubber hex dumbbells.','{"Full body"}','All levels');

INSERT INTO public.exercises (name, description, instructions, target_muscles, difficulty) VALUES
  ('Back Squat','Barbell squat for total lower-body strength.','Brace, descend to parallel, drive through midfoot.','{Quads,Glutes,Core}','Intermediate'),
  ('Leg Press','Machine press for quad and glute volume.','Feet shoulder width, control the negative, do not lock out.','{Quads,Glutes}','Beginner'),
  ('Walking Lunge','Unilateral lower body builder.','Long stride, back knee to floor, stay tall.','{Quads,Glutes,Hamstrings}','Beginner'),
  ('Bench Press','Barbell horizontal press.','Retract shoulder blades, touch chest, press to lockout.','{Chest,Triceps,Shoulders}','Intermediate'),
  ('Deadlift','Hip hinge pull from the floor.','Neutral spine, push the floor away, lock hips at the top.','{Back,Glutes,Hamstrings}','Advanced');