import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { head, TrainerPage } from "@/components/dashboard/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/auth";
import { allTrainersQuery } from "@/lib/gym-data";

export const Route = createFileRoute("/_authenticated/trainer/profile")({
  head: head("My profile", "Update your coaching profile shown on the website."),
  component: TrainerProfilePage,
});

function TrainerProfilePage() {
  const { userId } = useAccount();
  const queryClient = useQueryClient();
  const trainers = useQuery(allTrainersQuery);
  const mine = trainers.data?.find((t) => t.user_id === userId) ?? null;

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    years_of_experience: 0,
    specialties: "",
    certifications: "",
    areas_of_expertise: "",
  });

  useEffect(() => {
    if (!mine) return;
    setForm({
      display_name: mine.display_name ?? "",
      bio: mine.bio ?? "",
      years_of_experience: mine.years_of_experience,
      specialties: (mine.specialties ?? []).join(", "),
      certifications: (mine.certifications ?? []).join(", "),
      areas_of_expertise: (mine.areas_of_expertise ?? []).join(", "),
    });
  }, [mine]);

  const split = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        display_name: form.display_name,
        bio: form.bio,
        years_of_experience: Number(form.years_of_experience) || 0,
        specialties: split(form.specialties),
        certifications: split(form.certifications),
        areas_of_expertise: split(form.areas_of_expertise),
      };
      if (mine) {
        const { error } = await supabase.from("trainer_profiles").update(payload).eq("id", mine.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trainer_profiles").insert({ ...payload, user_id: userId! });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <TrainerPage title="My profile" description="This is what members see on the trainers page">
      <div className="surface-card max-w-2xl space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input id="display_name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yoe">Years of experience</Label>
          <Input id="yoe" type="number" value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spec">Specialties (comma separated)</Label>
          <Input id="spec" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="certs">Certifications (comma separated)</Label>
          <Input id="certs" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="areas">Areas of expertise (comma separated)</Label>
          <Input id="areas" value={form.areas_of_expertise} onChange={(e) => setForm({ ...form, areas_of_expertise: e.target.value })} />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </TrainerPage>
  );
}
