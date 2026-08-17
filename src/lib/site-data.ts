import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface TrainerRecord {
  id: string;
  display_name: string | null;
  years_of_experience: number;
  certifications: string[];
  specialties: string[];
  areas_of_expertise: string[];
  profile_image: string | null;
  bio: string | null;
}

export interface ClassRecord {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  trainer: string | null;
  schedule: string | null;
  difficulty: string | null;
  age_group: string | null;
  target_body_area: string | null;
}

export interface PlanRecord {
  id: string;
  name: string;
  price: number;
  period: string;
  tagline: string | null;
  features: string[];
  benefits: string[];
  recommended: boolean;
}

export const trainersQuery = queryOptions({
  queryKey: ["trainers"],
  queryFn: async (): Promise<TrainerRecord[]> => {
    const { data, error } = await supabase
      .from("trainer_profiles")
      .select(
        "id, display_name, years_of_experience, certifications, specialties, areas_of_expertise, profile_image, bio",
      )
      .order("years_of_experience", { ascending: false });
    if (error) throw error;
    return (data ?? []) as TrainerRecord[];
  },
});

export const classesQuery = queryOptions({
  queryKey: ["classes"],
  queryFn: async (): Promise<ClassRecord[]> => {
    const { data, error } = await supabase
      .from("classes")
      .select("id, name, description, image, trainer, schedule, difficulty, age_group, target_body_area")
      .eq("published", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ClassRecord[];
  },
});

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: async (): Promise<PlanRecord[]> => {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, price, period, tagline, features, benefits, recommended")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((p) => ({ ...p, price: Number(p.price) })) as PlanRecord[];
  },
});

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}
