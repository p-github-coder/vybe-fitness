import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import {
  assignmentsQuery,
  deleteRow,
  exercisesQuery,
  formatDate,
  fullName,
  listQuery,
  profilesQuery,
  upsertRow,
  workoutPlansQuery,
  type WorkoutPlanItem,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/plans")({
  head: head("Workout plans", "Build and assign workout plans for your members."),
  component: TrainerPlans,
});

const planItemsQuery = listQuery<WorkoutPlanItem>("workout_plan_items", {
  orderBy: "sort_order",
  ascending: true,
});

interface DraftItem {
  exercise_name: string;
  sets: number;
  reps: string;
  equipment: string;
  instructions: string;
}

const emptyItem: DraftItem = { exercise_name: "", sets: 3, reps: "10", equipment: "", instructions: "" };

function TrainerPlans() {
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const plans = useQuery(workoutPlansQuery);
  const items = useQuery(planItemsQuery);
  const assignments = useQuery(assignmentsQuery);
  const profiles = useQuery(profilesQuery);
  const exercises = useQuery(exercisesQuery);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [memberId, setMemberId] = useState("");
  const [draft, setDraft] = useState<DraftItem[]>([{ ...emptyItem }]);

  const myMembers = (profiles.data ?? []).filter((p) =>
    (assignments.data ?? []).some((a) => a.trainer_id === userId && a.member_id === p.user_id),
  );
  const myPlans = (plans.data ?? []).filter((p) => p.trainer_id === userId);

  function reset() {
    setTitle(""); setFocus(""); setNotes(""); setMemberId(""); setDraft([{ ...emptyItem }]);
  }

  const create = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !memberId) throw new Error("Add a title and choose a member");
      const { data, error } = await supabase
        .from("workout_plans")
        .insert({ trainer_id: userId!, member_id: memberId, title: title.trim(), focus, notes })
        .select("id")
        .single();
      if (error) throw error;
      const rows = draft
        .filter((d) => d.exercise_name.trim())
        .map((d, i) => ({
          plan_id: data.id,
          exercise_name: d.exercise_name,
          sets: d.sets,
          reps: d.reps,
          equipment: d.equipment,
          instructions: d.instructions,
          sort_order: i,
        }));
      if (rows.length) {
        const { error: itemErr } = await supabase.from("workout_plan_items").insert(rows);
        if (itemErr) throw itemErr;
      }
    },
    onSuccess: async () => {
      toast.success("Workout plan created");
      setOpen(false);
      reset();
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("workout_plans", id),
    onSuccess: async () => {
      toast.success("Plan deleted");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <TrainerPage
      title="Workout plans"
      description={`${myPlans.length} plans created`}
      actions={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New plan</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>New workout plan</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger><SelectValue placeholder="Choose a member" /></SelectTrigger>
                  <SelectContent>
                    {myMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>{fullName(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="8-week strength block" />
              </div>
              <div className="space-y-2">
                <Label>Focus</Label>
                <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Lower body hypertrophy" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setDraft((d) => [...d, { ...emptyItem }])}>
                    Add exercise
                  </Button>
                </div>
                {draft.map((item, i) => (
                  <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[2fr_70px_90px_1fr_auto]">
                    <Input
                      list="exercise-options"
                      placeholder="Exercise"
                      value={item.exercise_name}
                      onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, exercise_name: e.target.value } : x)))}
                    />
                    <Input
                      type="number"
                      value={item.sets}
                      onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, sets: Number(e.target.value) } : x)))}
                    />
                    <Input
                      placeholder="Reps"
                      value={item.reps}
                      onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))}
                    />
                    <Input
                      placeholder="Equipment"
                      value={item.equipment}
                      onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, equipment: e.target.value } : x)))}
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <datalist id="exercise-options">
                  {(exercises.data ?? []).map((e) => <option key={e.id} value={e.name} />)}
                </datalist>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Create plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {myPlans.length === 0 && <p className="text-sm text-muted-foreground">No plans yet — create your first one.</p>}
        {myPlans.map((p) => {
          const planItems = (items.data ?? []).filter((i) => i.plan_id === p.id);
          return (
            <div key={p.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {fullName(profiles.data?.find((m) => m.user_id === p.member_id) ?? null)} · {formatDate(p.created_at)}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {p.focus && <p className="mt-2 text-sm text-muted-foreground">Focus: {p.focus}</p>}
              <ul className="mt-4 space-y-1 text-sm">
                {planItems.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3 border-b border-border/60 py-1">
                    <span>{i.exercise_name}</span>
                    <span className="text-muted-foreground">{i.sets} × {i.reps ?? "—"}</span>
                  </li>
                ))}
                {planItems.length === 0 && <li className="text-muted-foreground">No exercises added.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </TrainerPage>
  );
}
