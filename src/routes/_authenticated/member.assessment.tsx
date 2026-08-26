import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MemberShell } from "@/components/member/MemberShell";
import { RoleGate } from "@/components/site/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/lib/auth";
import {
  BODY_AREAS,
  EQUIPMENT_OPTIONS,
  FITNESS_LEVELS,
  GOALS,
  WORKOUT_PREFERENCES,
  fitnessProfileQuery,
  saveFitnessProfile,
  type FitnessLevel,
} from "@/lib/fitness";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/member/assessment")({
  head: () => ({
    meta: [
      { title: "Fitness Assessment — VYBE Fitness" },
      { name: "description", content: "Tell us about your body, goals and preferences to unlock your VYBE plan." },
      { property: "og:title", content: "Fitness Assessment — VYBE Fitness" },
      { property: "og:description", content: "Personalise your training with the VYBE fitness assessment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="member">
      <Assessment />
    </RoleGate>
  ),
});

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

const STEPS = ["Body", "Level", "Goals", "Focus", "Preferences"] as const;

function Assessment() {
  const { userId } = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existing } = useQuery(fitnessProfileQuery(userId));

  const [step, setStep] = useState(0);
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
    if (!existing) return;
    setAge(existing.age ? String(existing.age) : "");
    setHeight(existing.height_cm ? String(existing.height_cm) : "");
    setWeight(existing.weight_kg ? String(existing.weight_kg) : "");
    setLevel(existing.fitness_level ?? "beginner");
    setGoals(existing.goals ?? []);
    setAreas(existing.body_focus_areas ?? []);
    setPrefs(existing.workout_preferences ?? []);
    setEquipment(existing.equipment_preferences ?? []);
  }, [existing]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function handleSave() {
    if (!userId) return;
    if (goals.length === 0) {
      toast.error("Pick at least one goal");
      setStep(2);
      return;
    }
    setSaving(true);
    try {
      await saveFitnessProfile(userId, {
        age: age ? Number(age) : null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        fitness_level: level,
        goals,
        body_focus_areas: areas.length ? areas : ["Full body"],
        workout_preferences: prefs,
        equipment_preferences: equipment,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries();
      toast.success("Your personalised plan is ready");
      navigate({ to: "/member", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <MemberShell>
      <p className="text-eyebrow">Step {step + 1} of {STEPS.length}</p>
      <h1 className="text-display mt-3 text-4xl">Fitness assessment</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Answer a few questions and VYBE will match you with the right equipment, coaches, classes and weekly plan.
      </p>

      <div className="mt-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div className="surface-card mt-8 space-y-6 p-6 sm:p-8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="72" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Your current fitness level</h2>
            <div className="flex flex-wrap gap-2">
              {FITNESS_LEVELS.map((l) => (
                <Chip key={l} label={l[0]!.toUpperCase() + l.slice(1)} active={level === l} onClick={() => setLevel(l)} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-semibold">What are you training for?</h2>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip key={g} label={g} active={goals.includes(g)} onClick={() => toggle(goals, setGoals, g)} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Body areas you want to focus on</h2>
            <div className="flex flex-wrap gap-2">
              {BODY_AREAS.map((a) => (
                <Chip key={a} label={a} active={areas.includes(a)} onClick={() => toggle(areas, setAreas, a)} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-semibold">Workout styles you enjoy</h2>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_PREFERENCES.map((p) => (
                  <Chip key={p} label={p} active={prefs.includes(p)} onClick={() => toggle(prefs, setPrefs, p)} />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="font-semibold">Equipment you like using</h2>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((p) => (
                  <Chip key={p} label={p} active={equipment.includes(p)} onClick={() => toggle(equipment, setEquipment, p)} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Building your plan…" : "Generate my plan"}
            </Button>
          )}
        </div>
      </div>
    </MemberShell>
  );
}
