INSERT INTO public.user_roles (user_id, role)
VALUES ('22200e29-7d2e-4897-b68d-a50d9fe20033', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET account_status = 'approved'
WHERE user_id = '22200e29-7d2e-4897-b68d-a50d9fe20033';