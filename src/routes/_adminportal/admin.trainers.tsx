import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { allTrainersQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_adminportal/admin/trainers")({
  head: head("Trainers", "Manage trainer profiles, specialties and assignments."),
  component: TrainersPage,
});

function TrainersPage() {
  return (
    <AdminPage title="Trainers" description="Coaching team, specialties and credentials">
      <CrudManager
        table="trainer_profiles"
        query={allTrainersQuery}
        entityLabel="Trainer"
        searchKeys={["display_name", "bio"]}
        columns={[
          { key: "name", header: "Trainer", render: (r) => <span className="font-medium">{r.display_name ?? "Unnamed"}</span> },
          { key: "exp", header: "Experience", render: (r) => `${r.years_of_experience} yrs` },
          {
            key: "spec",
            header: "Specialties",
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {(r.specialties ?? []).slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            ),
          },
          {
            key: "areas",
            header: "Body areas",
            render: (r) => <span className="text-muted-foreground">{(r.areas_of_expertise ?? []).join(", ") || "—"}</span>,
          },
          {
            key: "certs",
            header: "Certifications",
            render: (r) => <span className="text-muted-foreground">{(r.certifications ?? []).join(", ") || "—"}</span>,
          },
        ]}
        fields={[
          { name: "display_name", label: "Name", type: "text" },
          { name: "profile_image", label: "Profile image URL", type: "text" },
          { name: "bio", label: "Bio", type: "textarea" },
          { name: "years_of_experience", label: "Years of experience", type: "number", defaultValue: 0 },
          { name: "certifications", label: "Certifications", type: "array" },
          { name: "specialties", label: "Specialties (Strength, Weight loss, HIIT, Yoga…)", type: "array" },
          { name: "areas_of_expertise", label: "Body areas trained", type: "array" },
          { name: "is_demo", label: "Show on public site", type: "boolean", defaultValue: true },
        ]}
      />
    </AdminPage>
  );
}
