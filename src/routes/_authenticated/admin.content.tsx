import { createFileRoute } from "@tanstack/react-router";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { CrudManager } from "@/components/dashboard/CrudManager";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { announcementsQuery, faqsQuery, siteContentQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: head("Website content", "Edit homepage copy, FAQs and announcements."),
  component: ContentPage,
});

function ContentPage() {
  return (
    <AdminPage title="Website content" description="Copy, FAQs and announcements shown on the public site">
      <Tabs defaultValue="copy">
        <TabsList>
          <TabsTrigger value="copy">Site copy</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="ann">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="mt-4">
          <CrudManager
            table="site_content"
            query={siteContentQuery}
            entityLabel="Content block"
            searchKeys={["key", "label", "value"]}
            columns={[
              { key: "label", header: "Block", render: (r) => <span className="font-medium">{r.label ?? r.key}</span> },
              { key: "key", header: "Key", render: (r) => <code className="text-xs text-muted-foreground">{r.key}</code> },
              { key: "value", header: "Value", render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.value ?? "—"}</span> },
            ]}
            fields={[
              { name: "key", label: "Key", type: "text", placeholder: "home_hero_title" },
              { name: "label", label: "Label", type: "text" },
              { name: "value", label: "Value", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="faqs" className="mt-4">
          <CrudManager
            table="faqs"
            query={faqsQuery}
            entityLabel="FAQ"
            searchKeys={["question", "answer"]}
            columns={[
              { key: "question", header: "Question", render: (r) => <span className="font-medium">{r.question}</span> },
              { key: "answer", header: "Answer", render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.answer}</span> },
              { key: "sort_order", header: "Order", render: (r) => r.sort_order },
              { key: "published", header: "Visibility", render: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Hidden"}</Badge> },
            ]}
            fields={[
              { name: "question", label: "Question", type: "text" },
              { name: "answer", label: "Answer", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number", defaultValue: 0 },
              { name: "published", label: "Published", type: "boolean", defaultValue: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="ann" className="mt-4">
          <CrudManager
            table="announcements"
            query={announcementsQuery}
            entityLabel="Announcement"
            searchKeys={["title", "body"]}
            columns={[
              { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
              { key: "body", header: "Message", render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.body ?? "—"}</span> },
              { key: "published", header: "Visibility", render: (r) => <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge> },
            ]}
            fields={[
              { name: "title", label: "Title", type: "text" },
              { name: "body", label: "Message", type: "textarea" },
              { name: "published", label: "Published", type: "boolean", defaultValue: true },
            ]}
          />
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
