import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { Badge } from "@/components/ui/badge";
import { announcementsQuery, formatDate } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/messages")({
  head: head("Messages", "Gym announcements and updates for trainers."),
  component: TrainerMessages,
});

function TrainerMessages() {
  const announcements = useQuery(announcementsQuery);
  const published = (announcements.data ?? []).filter((a) => a.published);

  return (
    <TrainerPage title="Messages" description="Announcements from the VYBE Fitness team">
      <div className="space-y-4">
        {published.length === 0 && <p className="text-sm text-muted-foreground">No announcements right now.</p>}
        {published.map((a) => (
          <article key={a.id} className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{a.title}</h2>
              <Badge variant="secondary">{formatDate(a.created_at)}</Badge>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
          </article>
        ))}
      </div>
    </TrainerPage>
  );
}
