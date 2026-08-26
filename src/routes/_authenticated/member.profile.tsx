import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MemberShell } from "@/components/member/MemberShell";
import { RoleGate } from "@/components/site/RoleGate";
import { Chip } from "@/routes/_authenticated/member.assessment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { displayName, useAccount } from "@/lib/auth";
import {
  BODY_AREAS,
  EQUIPMENT_OPTIONS,
  FITNESS_LEVELS,
  GOALS,
  WORKOUT_PREFERENCES,
  bmi,
  fitnessProfileQuery,
  saveFitnessProfile,
  type FitnessLevel,
} from "@/lib/fitness";

export const Route = createFileRoute("/_authenticated/member/profile")({
  head: () => ({
    meta: [
      { title: "My Fitness Profile — VYBE Fitness" },
      { name: "description", content: "Update your body metrics, goals and training preferences." },
      { property: "og:title", content: "My Fitness Profile — VYBE Fitness" },
      { property: "og:description", content: "Update your body metrics, goals and training preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="member">
      <MemberProfile />
    </RoleGate>
  ),
});

function MemberProfile() {
  const { userId, profile: account } = useAccount();
  const queryClient = useQueryClient();
  const { data: fitness } = useQuery(fitnessProfileQuery(userId));

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [level, setLevel] = useState<FitnessLevel>("beginner");
  const [goals, setGoals] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fitness) return;
    setAge(fitness.age ? String(fitness.age) : "");
    setHeight(fitness.height_cm ? String(fitness.height_cm) : "");
    setWeight(fitness.weight_kg ? String(fitness.weight_kg) : "");
    setLevel(fitness.fitness_level ?? "beginner");
    setGoals(fitness.goals ?? []);
    setAreas(fitness.body_focus_areas ?? []);
    setPrefs(fitness.workout_preferences ?? []);
    setEquipment(fitness.equipment_preferences ?? []);
  }, [fitness]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      await saveFitnessProfile(userId, {
        age: age ? Number(age) : null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        fitness_level: level,
        goals,
        body_focus_areas: areas,
        workout_preferences: prefs,
        equipment_preferences: equipment,
        completed: true,
      });
      await queryClient.invalidateQueries();
      toast.success("Profile updated — recommendations refreshed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <MemberShell>
      <p className="text-eyebrow">Fitness profile</p>
      <h1 className="text-display mt-3 text-4xl">{displayName(account)}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {account?.email} {bmi(fitness ?? null) ? `· BMI ${bmi(fitness ?? null)}` : ""}
      </p>

      {!fitness && (
        <div className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-muted-foreground">You haven't completed the fitness assessment yet.</p>
          <Button asChild size="sm">
            <Link to="/member/assessment">Take the assessment</Link>
          </Button>
        </div>
      )}

      <div className="surface-card mt-8 space-y-8 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="f-age">Age</Label>
            <Input id="f-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-height">Height (cm)</Label>
            <Input id="f-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-weight">Weight (kg)</Label>
            <Input id="f-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>

        <Section title="Fitness level">
          {FITNESS_LEVELS.map((l) => (
            <Chip key={l} label={l[0]!.toUpperCase() + l.slice(1)} active={level === l} onClick={() => setLevel(l)} />
          ))}
        </Section>

        <Section title="Goals">
          {GOALS.map((g) => (
            <Chip key={g} label={g} active={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} />
          ))}
        </Section>

        <Section title="Body focus areas">
          {BODY_AREAS.map((a) => (
            <Chip key={a} label={a} active={areas.includes(a)} onClick={() => toggle(areas, setAreas, a)} />
          ))}
        </Section>

        <Section title="Workout preferences">
          {WORKOUT_PREFERENCES.map((p) => (
            <Chip key={p} label={p} active={prefs.includes(p)} onClick={() => toggle(prefs, setPrefs, p)} />
          ))}
        </Section>

        <Section title="Equipment access">
          {EQUIPMENT_OPTIONS.map((p) => (
            <Chip key={p} label={p} active={equipment.includes(p)} onClick={() => toggle(equipment, setEquipment, p)} />
          ))}
        </Section>

        <Button disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </MemberShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
