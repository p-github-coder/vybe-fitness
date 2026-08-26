import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { listQuery } from "@/lib/gym-data";

/* ---------------- constants ---------------- */

export const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type FitnessLevel = (typeof FITNESS_LEVELS)[number];

export const GOALS = [
  "Weight loss",
  "Muscle building",
  "Strength improvement",
  "Endurance",
  "General fitness",
  "Body toning",
] as const;

export const BODY_AREAS = [
  "Full body",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Core",
  "Legs",
  "Glutes",
] as const;

export const WORKOUT_PREFERENCES = [
  "Weight training",
  "Cardio",
  "HIIT",
  "Yoga",
  "Functional training",
  "Mobility training",
] as const;

export const EQUIPMENT_OPTIONS = [
  "Dumbbells",
  "Barbells",
  "Cable machines",
  "Leg press",
  "Treadmill",
  "Resistance bands",
  "Bodyweight",
] as const;

/* ---------------- types ---------------- */

export interface FitnessProfile {
  id: string;
  user_id: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_level: FitnessLevel;
  goals: string[];
  body_focus_areas: string[];
  workout_preferences: string[];
  equipment_preferences: string[];
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  recorded_on: string;
  weight_kg: number | null;
  workouts_completed: number;
  notes: string | null;
}

export interface EquipmentItem {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  target_muscles: string[];
  benefits: string[];
  recommended_goals: string[];
  category: string | null;
  difficulty: string | null;
  published: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  instructions: string | null;
  target_muscles: string[];
  equipment_id: string | null;
  equipment_name: string | null;
  recommended_reps: string | null;
  category: string | null;
  difficulty: string | null;
  published: boolean;
}

/* ---------------- queries ---------------- */

export const fitnessEquipmentQuery = listQuery<EquipmentItem>("equipment", {
  orderBy: "name",
  ascending: true,
});

export const fitnessExercisesQuery = listQuery<ExerciseItem>("exercises", {
  orderBy: "name",
  ascending: true,
});

export const progressQuery = listQuery<ProgressEntry>("progress_entries", {
  orderBy: "recorded_on",
});

export function fitnessProfileQuery(userId: string | null) {
  return queryOptions({
    queryKey: ["fitness-profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<FitnessProfile | null> => {
      const { data, error } = await supabase
        .from("fitness_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as FitnessProfile | null) ?? null;
    },
  });
}

export async function saveFitnessProfile(userId: string, values: Partial<FitnessProfile>) {
  const { error } = await supabase
    .from("fitness_profiles")
    .upsert({ user_id: userId, ...values } as never, { onConflict: "user_id" });
  if (error) throw error;
}

/* ---------------- recommendation engine ---------------- */

const norm = (v: string) => v.toLowerCase().trim();

function overlap(a: readonly string[] | null | undefined, b: readonly string[] | null | undefined) {
  if (!a?.length || !b?.length) return 0;
  const setB = b.map(norm);
  return a.filter((x) => setB.some((y) => y.includes(norm(x)) || norm(x).includes(y))).length;
}

function textHas(text: string | null | undefined, values: readonly string[]) {
  if (!text) return 0;
  const t = norm(text);
  return values.filter((v) => t.includes(norm(v))).length;
}

export interface Recommendation<T> {
  item: T;
  score: number;
  reasons: string[];
}

function clampScore(raw: number, max: number) {
  if (max <= 0) return 60;
  return Math.min(99, Math.round(55 + (raw / max) * 44));
}

export function recommendEquipment(
  profile: FitnessProfile | null,
  items: EquipmentItem[],
): Recommendation<EquipmentItem>[] {
  if (!profile) return items.slice(0, 6).map((item) => ({ item, score: 70, reasons: ["Popular on the VYBE floor"] }));
  return items
    .filter((i) => i.published)
    .map((item) => {
      const reasons: string[] = [];
      let score = 0;
      const muscleHits = overlap(profile.body_focus_areas, item.target_muscles);
      if (muscleHits) {
        score += muscleHits * 3;
        reasons.push(`Trains your focus areas (${item.target_muscles.slice(0, 3).join(", ")})`);
      }
      const goalHits = overlap(profile.goals, item.recommended_goals);
      if (goalHits) {
        score += goalHits * 3;
        reasons.push(`Supports your ${profile.goals[0]?.toLowerCase()} goal`);
      }
      if (overlap(profile.equipment_preferences, [item.name, item.category ?? ""])) {
        score += 4;
        reasons.push("Matches the equipment you prefer");
      }
      if (item.difficulty && norm(item.difficulty).includes(norm(profile.fitness_level))) {
        score += 2;
        reasons.push(`Suited to ${profile.fitness_level} lifters`);
      }
      return { item, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, _i, arr) => ({ ...r, score: clampScore(r.score, arr[0]?.score ?? 1) }));
}

export function recommendExercises(
  profile: FitnessProfile | null,
  items: ExerciseItem[],
): Recommendation<ExerciseItem>[] {
  return items
    .filter((i) => i.published)
    .map((item) => {
      const reasons: string[] = [];
      let score = 0;
      if (profile) {
        const muscleHits = overlap(profile.body_focus_areas, item.target_muscles);
        if (muscleHits) {
          score += muscleHits * 3;
          reasons.push(`Hits ${item.target_muscles.slice(0, 2).join(" & ")}`);
        }
        if (item.difficulty && norm(item.difficulty).includes(norm(profile.fitness_level))) {
          score += 3;
          reasons.push(`${profile.fitness_level} friendly`);
        }
        if (overlap(profile.equipment_preferences, [item.equipment_name ?? "", item.category ?? ""])) {
          score += 3;
          reasons.push("Uses equipment you have access to");
        }
        score += textHas(item.description, profile.goals);
      }
      return { item, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, _i, arr) => ({ ...r, score: clampScore(r.score, arr[0]?.score ?? 1) }));
}

export interface TrainerLike {
  id: string;
  user_id: string | null;
  display_name: string | null;
  years_of_experience: number;
  specialties: string[];
  areas_of_expertise: string[];
  certifications: string[];
  profile_image: string | null;
  bio: string | null;
}

export function recommendTrainers(
  profile: FitnessProfile | null,
  trainers: TrainerLike[],
): Recommendation<TrainerLike>[] {
  return trainers
    .map((item) => {
      const reasons: string[] = [];
      let score = item.years_of_experience >= 5 ? 3 : 1;
      if (item.years_of_experience >= 5) reasons.push(`${item.years_of_experience} years of coaching experience`);
      if (profile) {
        const pool = [...item.specialties, ...item.areas_of_expertise];
        const goalHits = overlap(profile.goals, pool);
        if (goalHits) {
          score += goalHits * 4;
          reasons.push(`Specialises in ${profile.goals.slice(0, 2).join(" and ").toLowerCase()}`);
        }
        const areaHits = overlap(profile.body_focus_areas, pool);
        if (areaHits) {
          score += areaHits * 3;
          reasons.push(`Coaches your focus areas (${profile.body_focus_areas.slice(0, 2).join(", ")})`);
        }
        const prefHits = overlap(profile.workout_preferences, pool);
        if (prefHits) {
          score += prefHits * 3;
          reasons.push(`Runs ${profile.workout_preferences.slice(0, 2).join(" & ").toLowerCase()} sessions`);
        }
        if (profile.fitness_level === "beginner" && item.years_of_experience >= 3) {
          score += 2;
          reasons.push("Great with members starting out");
        }
      }
      if (!reasons.length) reasons.push("Well-rounded coach for general fitness");
      return { item, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, _i, arr) => ({ ...r, score: clampScore(r.score, arr[0]?.score ?? 1) }));
}

export interface ClassLike {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string | null;
  difficulty: string | null;
  age_group: string | null;
  target_body_area: string | null;
  schedule: string | null;
  trainer: string | null;
  duration_minutes: number;
  capacity: number;
  published: boolean;
}

export function recommendClasses(
  profile: FitnessProfile | null,
  classes: ClassLike[],
): Recommendation<ClassLike>[] {
  return classes
    .filter((c) => c.published)
    .map((item) => {
      const reasons: string[] = [];
      let score = 0;
      if (profile) {
        if (item.difficulty && norm(item.difficulty).includes(norm(profile.fitness_level))) {
          score += 4;
          reasons.push(`Matches your ${profile.fitness_level} experience level`);
        }
        const prefHits =
          overlap(profile.workout_preferences, [item.category ?? "", item.name]) +
          textHas(item.description, profile.workout_preferences);
        if (prefHits) {
          score += prefHits * 3;
          reasons.push(`Fits your preference for ${profile.workout_preferences[0]?.toLowerCase()}`);
        }
        const areaHits =
          overlap(profile.body_focus_areas, [item.target_body_area ?? ""]) +
          textHas(item.description, profile.body_focus_areas);
        if (areaHits) {
          score += areaHits * 3;
          reasons.push(`Targets ${item.target_body_area ?? profile.body_focus_areas[0]}`);
        }
        const goalHits = textHas(item.description, profile.goals) + textHas(item.name, profile.goals);
        if (goalHits) {
          score += goalHits * 3;
          reasons.push(`Supports your ${profile.goals[0]?.toLowerCase()} goal`);
        }
        if (profile.age && item.age_group) {
          const nums = item.age_group.match(/\d+/g)?.map(Number) ?? [];
          if (nums.length >= 2 && profile.age >= nums[0]! && profile.age <= nums[1]!) {
            score += 2;
            reasons.push(`Popular with the ${item.age_group} age group`);
          }
        }
      }
      if (!reasons.length) reasons.push("A VYBE staple that suits most members");
      return { item, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, _i, arr) => ({ ...r, score: clampScore(r.score, arr[0]?.score ?? 1) }));
}

/* ---------------- weekly plan generator ---------------- */

export interface PlannedExercise {
  name: string;
  sets: number;
  reps: string;
  equipment: string;
  targets: string[];
}

export interface PlannedDay {
  day: string;
  title: string;
  goal: string;
  exercises: PlannedExercise[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SET_SCHEME: Record<FitnessLevel, { sets: number; reps: string; days: number }> = {
  beginner: { sets: 3, reps: "10–12", days: 3 },
  intermediate: { sets: 4, reps: "8–12", days: 4 },
  advanced: { sets: 5, reps: "6–10", days: 5 },
};

export function buildWeeklyPlan(
  profile: FitnessProfile | null,
  exercises: ExerciseItem[],
): PlannedDay[] {
  const level: FitnessLevel = profile?.fitness_level ?? "beginner";
  const scheme = SET_SCHEME[level];
  const focus = profile?.body_focus_areas?.length ? profile.body_focus_areas : ["Full body"];
  const goal = profile?.goals?.[0] ?? "General fitness";

  const pool = exercises.filter((e) => e.published);

  return Array.from({ length: scheme.days }).map((_, i) => {
    const area = focus[i % focus.length] ?? "Full body";
    const matches = pool.filter((e) => overlap([area], e.target_muscles) > 0);
    const chosen = (matches.length >= 3 ? matches : pool).slice(i * 2, i * 2 + 4);
    const list = chosen.length ? chosen : pool.slice(0, 4);
    return {
      day: DAYS[i] ?? `Day ${i + 1}`,
      title: `${area} ${goal.includes("loss") ? "Conditioning" : "Strength"}`,
      goal,
      exercises: list.map((e) => ({
        name: e.name,
        sets: scheme.sets,
        reps: e.recommended_reps ?? scheme.reps,
        equipment: e.equipment_name ?? "Bodyweight",
        targets: e.target_muscles,
      })),
    } satisfies PlannedDay;
  });
}

export function bmi(profile: FitnessProfile | null): number | null {
  if (!profile?.height_cm || !profile.weight_kg) return null;
  const m = Number(profile.height_cm) / 100;
  if (!m) return null;
  return Math.round((Number(profile.weight_kg) / (m * m)) * 10) / 10;
}
