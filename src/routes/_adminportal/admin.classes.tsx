import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { adminClassesQuery, allTrainersQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_adminportal/admin/classes")({
  head: head("Classes", "Create and schedule classes, assign trainers and set capacity."),
  component: ClassesAdminPage,
});

function ClassesAdminPage() {
  const trainers = useQuery(allTrainersQuery);
  const trainerOptions = (trainers.data ?? []).map((t) => ({
    value: t.display_name ?? "Unnamed",
    label: t.display_name ?? "Unnamed",
  }));

  return (
    <AdminPage title="Classes" description="Timetable, trainers, capacity and visuals">
      <CrudManager
        table="classes"
        query={adminClassesQuery}
        entityLabel="Class"
        searchKeys={["name", "category", "trainer"]}
        columns={[
          {
            key: "name",
            header: "Class",
            render: (r) => (
              <div className="flex items-center gap-3">
                {r.image && <img src={r.image} alt="" className="h-9 w-9 rounded-md object-cover" />}
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.category ?? "Uncategorised"}</p>
                </div>
              </div>
            ),
          },
          { key: "trainer", header: "Trainer", render: (r) => r.trainer ?? "—" },
          { key: "schedule", header: "Schedule", render: (r) => r.schedule ?? "—" },
          { key: "duration", header: "Duration", render: (r) => `${r.duration_minutes} min` },
          { key: "capacity", header: "Capacity", render: (r) => r.capacity },
          { key: "difficulty", header: "Difficulty", render: (r) => r.difficulty ?? "—" },
          {
            key: "published",
            header: "Visibility",
            render: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Hidden"}</Badge>,
          },
        ]}
        fields={[
          { name: "name", label: "Class name", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image", label: "Class image URL", type: "text" },
          { name: "trainer", label: "Trainer", type: "select", options: trainerOptions },
          { name: "category", label: "Category", type: "select", options: ["Strength", "HIIT", "Yoga", "Cardio", "Boxing", "Mobility"].map((v) => ({ value: v, label: v })) },
          { name: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "All levels"].map((v) => ({ value: v, label: v })) },
          { name: "age_group", label: "Age group", type: "text", placeholder: "18+" },
          { name: "target_body_area", label: "Target body area", type: "text" },
          { name: "schedule", label: "Schedule", type: "text", placeholder: "Mon & Wed · 6:30pm" },
          { name: "duration_minutes", label: "Duration (minutes)", type: "number", defaultValue: 60 },
          { name: "capacity", label: "Maximum capacity", type: "number", defaultValue: 20 },
          { name: "published", label: "Published on website", type: "boolean", defaultValue: true },
        ]}
      />
    </AdminPage>
  );
}
