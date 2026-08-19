import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { siteContentQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_adminportal/admin/ai")({
  head: head("AI management", "Control the AI-powered features across the platform."),
  component: AiPage,
});

const toggles = [
  { key: "ai_recommendations", label: "Class recommendations", hint: "Suggest classes to members based on their goals and history." },
  { key: "ai_workout_plans", label: "Workout plan drafting", hint: "Let trainers generate a first draft of a member's plan." },
  { key: "ai_chat_assistant", label: "Member assistant", hint: "In-app assistant answering membership and schedule questions." },
  { key: "ai_churn_alerts", label: "Attendance alerts", hint: "Flag members whose attendance is dropping off." },
] as const;

function AiPage() {
  const content = useQuery(siteContentQuery);
  const queryClient = useQueryClient();

  const valueFor = (key: string) => content.data?.find((c) => c.key === key)?.value === "true";

  const setToggle = useMutation({
    mutationFn: async ({ key, label, enabled }: { key: string; label: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, label, value: String(enabled) }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("AI settings updated");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage title="AI management" description="Switch AI-assisted features on or off for the whole gym">
      <div className="surface-card divide-y divide-border">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-start justify-between gap-6 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <Label htmlFor={t.key} className="text-sm font-medium">{t.label}</Label>
                <p className="mt-1 text-sm text-muted-foreground">{t.hint}</p>
              </div>
            </div>
            <Switch
              id={t.key}
              checked={valueFor(t.key)}
              onCheckedChange={(enabled) => setToggle.mutate({ key: t.key, label: t.label, enabled })}
            />
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
