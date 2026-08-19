import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { equipmentQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_adminportal/admin/equipment")({
  head: head("Equipment", "Manage the gym floor equipment catalogue."),
  component: EquipmentPage,
});

function EquipmentPage() {
  return (
    <AdminPage title="Equipment" description="Machines, racks and tools on the floor">
      <CrudManager
        table="equipment"
        query={equipmentQuery}
        entityLabel="Equipment item"
        searchKeys={["name", "description"]}
        columns={[
          {
            key: "name",
            header: "Equipment",
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
            key: "published",
            header: "Visibility",
            render: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Hidden"}</Badge>,
          },
        ]}
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "image", label: "Image URL", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "target_muscles", label: "Target muscles", type: "array" },
          { name: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "All levels"].map((v) => ({ value: v, label: v })) },
          { name: "published", label: "Published", type: "boolean", defaultValue: true },
        ]}
      />
    </AdminPage>
  );
}
