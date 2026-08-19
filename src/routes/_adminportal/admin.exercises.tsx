import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { exercisesQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/admin/exercises")({
  head: head("Exercises", "Manage the exercise library used in workout plans."),
  component: ExercisesPage,
});

function ExercisesPage() {
  return (
    <AdminPage title="Exercises" description="The movement library behind every workout plan">
      <CrudManager
        table="exercises"
        query={exercisesQuery}
        entityLabel="Exercise"
        searchKeys={["name", "description"]}
        columns={[
          {
            key: "name",
            header: "Exercise",
            render: (r) => (
              <div className="flex items-center gap-3">
                {r.image && <img src={r.image} alt="" className="h-9 w-9 rounded-md object-cover" />}
                <span className="font-medium">{r.name}</span>
              </div>
            ),
          },
          {
            key: "muscles",
            header: "Target muscles",
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {(r.target_muscles ?? []).map((m) => (
                  <Badge key={m} variant="secondary">{m}</Badge>
                ))}
              </div>
            ),
          },
          { key: "difficulty", header: "Difficulty", render: (r) => r.difficulty ?? "—" },
          {
            key: "instructions",
            header: "Instructions",
            render: (r) => <span className="line-clamp-1 text-muted-foreground">{r.instructions ?? "—"}</span>,
          },
        ]}
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "image", label: "Image URL", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "instructions", label: "Instructions", type: "textarea" },
          { name: "target_muscles", label: "Target muscles", type: "array" },
          { name: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced"].map((v) => ({ value: v, label: v })) },
          { name: "published", label: "Published", type: "boolean", defaultValue: true },
        ]}
      />
    </AdminPage>
  );
}
