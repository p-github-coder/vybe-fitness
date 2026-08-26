import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminSupabase } from "@/integrations/supabase/admin-client";
import { siteContentQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_adminportal/admin/settings")({
  head: head("Settings", "Gym contact details and general platform settings."),
  component: SettingsPage,
});

const settings = [
  { key: "gym_name", label: "Gym name", type: "input" as const },
  { key: "gym_address", label: "Address", type: "textarea" as const },
  { key: "gym_phone", label: "Phone number", type: "input" as const },
  { key: "gym_email", label: "Email address", type: "input" as const },
  { key: "gym_hours", label: "Opening hours", type: "textarea" as const },
  { key: "gym_instagram", label: "Instagram URL", type: "input" as const },
];

function SettingsPage() {
  const content = useQuery(siteContentQuery);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!content.data) return;
    setForm(
      Object.fromEntries(
        settings.map((s) => [s.key, content.data.find((c) => c.key === s.key)?.value ?? ""]),
      ),
    );
  }, [content.data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = settings.map((s) => ({ key: s.key, label: s.label, value: form[s.key] ?? "" }));
      const { error } = await adminSupabase.from("site_content").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Settings saved");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage title="Settings" description="Contact details used across the website">
      <div className="surface-card max-w-2xl space-y-5 p-6">
        {settings.map((s) => (
          <div key={s.key} className="space-y-2">
            <Label htmlFor={s.key}>{s.label}</Label>
            {s.type === "textarea" ? (
              <Textarea
                id={s.key}
                value={form[s.key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [s.key]: e.target.value }))}
              />
            ) : (
              <Input
                id={s.key}
                value={form[s.key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [s.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </AdminPage>
  );
}
