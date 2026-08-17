
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('member','trainer','admin');
CREATE TYPE public.account_status AS ENUM ('pending','approved','rejected','suspended');

-- UPDATED AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- GYMS
CREATE TABLE public.gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gyms TO anon, authenticated;
GRANT ALL ON public.gyms TO service_role;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gyms are publicly readable" ON public.gyms FOR SELECT USING (true);
CREATE TRIGGER gyms_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.gyms (id, name, slug, address, phone, email)
VALUES ('11111111-1111-1111-1111-111111111111','VYBE Fitness','vybe-fitness','12 Adeola Odeku Street, Victoria Island, Lagos','+234 801 234 5678','hello@vybefitness.com');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  username text UNIQUE,
  email text,
  phone text,
  age int,
  gender text,
  profile_image text,
  account_status public.account_status NOT NULL DEFAULT 'pending',
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND account_status = 'approved');
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.user_id = auth.uid()));
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, username, email, phone, age, gender, profile_image, account_status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NULLIF(NEW.raw_user_meta_data ->> 'username',''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NULLIF(NEW.raw_user_meta_data ->> 'age','')::int,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'profile_image',
    'pending'
  );

  _role := CASE WHEN (NEW.raw_user_meta_data ->> 'requested_role') = 'trainer' THEN 'trainer'::public.app_role
                ELSE 'member'::public.app_role END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT DO NOTHING;

  IF _role = 'trainer' THEN
    INSERT INTO public.trainer_profiles (user_id, display_name, years_of_experience, certifications, specialties, areas_of_expertise, profile_image)
    VALUES (
      NEW.id,
      trim(coalesce(NEW.raw_user_meta_data ->> 'first_name','') || ' ' || coalesce(NEW.raw_user_meta_data ->> 'last_name','')),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'years_of_experience','')::int, 0),
      string_to_array(coalesce(NEW.raw_user_meta_data ->> 'certifications',''), ','),
      string_to_array(coalesce(NEW.raw_user_meta_data ->> 'specialties',''), ','),
      string_to_array(coalesce(NEW.raw_user_meta_data ->> 'areas_of_expertise',''), ','),
      NEW.raw_user_meta_data ->> 'profile_image'
    );
  END IF;

  RETURN NEW;
END; $$;

-- TRAINER PROFILES
CREATE TABLE public.trainer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  display_name text,
  years_of_experience int NOT NULL DEFAULT 0,
  certifications text[] NOT NULL DEFAULT '{}',
  specialties text[] NOT NULL DEFAULT '{}',
  areas_of_expertise text[] NOT NULL DEFAULT '{}',
  profile_image text,
  bio text,
  is_demo boolean NOT NULL DEFAULT false,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trainer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.trainer_profiles TO authenticated;
GRANT ALL ON public.trainer_profiles TO service_role;
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trainer_profiles_updated_at BEFORE UPDATE ON public.trainer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can view approved trainers" ON public.trainer_profiles FOR SELECT
  USING (is_demo = true OR public.is_approved(user_id));
CREATE POLICY "Trainers can view own trainer profile" ON public.trainer_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Trainers can insert own trainer profile" ON public.trainer_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Trainers can update own trainer profile" ON public.trainer_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CLASSES
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image text,
  trainer text,
  schedule text,
  difficulty text,
  age_group text,
  target_body_area text,
  published boolean NOT NULL DEFAULT true,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published classes are public" ON public.classes FOR SELECT USING (published = true);
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MEMBERSHIP PLANS
CREATE TABLE public.membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'month',
  tagline text,
  features text[] NOT NULL DEFAULT '{}',
  benefits text[] NOT NULL DEFAULT '{}',
  recommended boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.membership_plans TO anon, authenticated;
GRANT ALL ON public.membership_plans TO service_role;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published plans are public" ON public.membership_plans FOR SELECT USING (published = true);
CREATE POLICY "Admins manage plans" ON public.membership_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- APPROVAL EVENTS
CREATE TABLE public.approval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affected_user uuid NOT NULL,
  admin_user uuid NOT NULL,
  action text NOT NULL,
  notes text,
  gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.approval_events TO authenticated;
GRANT ALL ON public.approval_events TO service_role;
ALTER TABLE public.approval_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read approval events" ON public.approval_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ADMIN ACTION FUNCTION (server-side enforced)
CREATE OR REPLACE FUNCTION public.admin_set_account_status(_user_id uuid, _status public.account_status, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET account_status = _status WHERE user_id = _user_id;
  INSERT INTO public.approval_events (affected_user, admin_user, action, notes)
  VALUES (_user_id, auth.uid(), _status::text, _notes);
END; $$;
REVOKE ALL ON FUNCTION public.admin_set_account_status(uuid, public.account_status, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(uuid, public.account_status, text) TO authenticated;

-- SEED MEMBERSHIP PLANS
INSERT INTO public.membership_plans (name, price, period, tagline, features, benefits, recommended, sort_order) VALUES
('Essential', 25000, 'month', 'Everything you need to start strong',
 ARRAY['Full gym floor access','Locker room & showers','1 induction session','Open 6am - 10pm'],
 ARRAY['No joining fee','Cancel anytime'], false, 1),
('Performance', 45000, 'month', 'For members training with intent',
 ARRAY['Everything in Essential','Unlimited group classes','2 PT sessions monthly','Sauna & recovery zone','24/7 access'],
 ARRAY['Priority class booking','Free InBody scan quarterly'], true, 2),
('Elite', 85000, 'month', 'Private coaching and full recovery',
 ARRAY['Everything in Performance','Weekly 1:1 coaching','Personalised nutrition plan','Private training studio','Guest passes'],
 ARRAY['Dedicated coach','Complimentary guest passes'], false, 3);

-- SEED CLASSES
INSERT INTO public.classes (name, description, image, trainer, schedule, difficulty, age_group, target_body_area) VALUES
('Strength Training','Progressive barbell and dumbbell work built around compound lifts and clean technique.','/images/class-strength.jpg','Marcus Ade','Mon, Wed, Fri - 6:30 AM','Intermediate','16+','Full body'),
('HIIT Burn','Short, brutal intervals that spike your heart rate and keep burning long after you leave.','/images/class-hiit.jpg','Tolu Bakare','Tue, Thu - 7:00 PM','Advanced','18+','Full body / Conditioning'),
('Vinyasa Yoga','Breath-led flow to build mobility, balance and a calmer nervous system.','/images/class-yoga.jpg','Amara Okoye','Mon, Sat - 8:00 AM','Beginner','All ages','Core, mobility'),
('Cardio Engine','Treadmill, bike and rower intervals designed to raise your aerobic ceiling.','/images/class-cardio.jpg','David Nwosu','Wed, Sat - 6:00 PM','Intermediate','16+','Heart & lungs'),
('Functional Training','Sled pushes, carries and kettlebell work that transfers straight into real life.','/images/class-functional.jpg','Marcus Ade','Tue, Fri - 5:30 PM','Intermediate','18+','Full body'),
('Core & Stability','Targeted core, hip and lower-back work to protect your spine and build control.','/images/class-core.jpg','Amara Okoye','Thu - 6:30 AM','Beginner','All ages','Core, lower back');

-- SEED DEMO TRAINERS
INSERT INTO public.trainer_profiles (display_name, years_of_experience, certifications, specialties, areas_of_expertise, profile_image, bio, is_demo) VALUES
('Marcus Ade', 11, ARRAY['NASM-CPT','USA Weightlifting L2'], ARRAY['Strength','Powerlifting','Olympic lifting'], ARRAY['Back','Legs','Full body'], '/images/trainer-marcus.jpg','Eleven years turning nervous beginners into confident lifters.', true),
('Amara Okoye', 8, ARRAY['RYT-500','Precision Nutrition L1'], ARRAY['Yoga','Mobility','Recovery'], ARRAY['Core','Hips','Spine'], '/images/trainer-amara.jpg','Movement coach focused on mobility, breath and longevity.', true),
('Tolu Bakare', 6, ARRAY['ACE-CPT','TRX Certified'], ARRAY['HIIT','Conditioning','Fat loss'], ARRAY['Full body','Cardio'], '/images/trainer-tolu.jpg','High-energy conditioning coach who makes hard work addictive.', true),
('David Nwosu', 9, ARRAY['NSCA-CSCS','Sports Nutrition Cert'], ARRAY['Athletic performance','Endurance'], ARRAY['Legs','Cardio','Full body'], '/images/trainer-david.jpg','Strength and conditioning specialist for athletes and weekend warriors.', true);
