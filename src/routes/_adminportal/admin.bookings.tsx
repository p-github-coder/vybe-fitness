import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, head } from "@/components/dashboard/AdminPage";
import { StatusBadge } from "@/components/dashboard/CrudManager";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  adminClassesQuery,
  attendanceQuery,
  bookingsQuery,
  formatDate,
  fullName,
  profilesQuery,
  upsertRow,
  type AttendanceStatus,
  type BookingStatus,
} from "@/lib/gym-data";

export const Route = createFileRoute("/_adminportal/admin/bookings")({
  head: head("Bookings", "Track class bookings and attendance across the gym."),
  component: BookingsPage,
});

function BookingsPage() {
  const queryClient = useQueryClient();
  const bookings = useQuery(bookingsQuery);
  const classes = useQuery(adminClassesQuery);
  const profiles = useQuery(profilesQuery);
  const attendance = useQuery(attendanceQuery);
  const [statusFilter, setStatusFilter] = useState("all");

  const className = (id: string) => classes.data?.find((c) => c.id === id)?.name ?? "—";
  const memberName = (userId: string) => fullName(profiles.data?.find((p) => p.user_id === userId) ?? null);
  const trainerFor = (classId: string) => classes.data?.find((c) => c.id === classId)?.trainer ?? "—";

  const rows = (bookings.data ?? []).filter((b) => statusFilter === "all" || b.status === statusFilter);

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Booking updated");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mark = useMutation({
    mutationFn: async ({
      memberId,
      classId,
      bookingId,
      status,
    }: {
      memberId: string;
      classId: string;
      bookingId: string;
      status: AttendanceStatus;
    }) => {
      await upsertRow("attendance", {
        member_id: memberId,
        class_id: classId,
        booking_id: bookingId,
        status,
      });
    },
    onSuccess: async () => {
      toast.success("Attendance recorded");
      await queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage title="Bookings" description={`${rows.length} bookings`}>
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-4 space-y-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["all", "confirmed", "waitlist", "completed", "cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All bookings" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-muted-foreground">No bookings yet.</TableCell></TableRow>
                )}
                {rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{memberName(b.member_id)}</TableCell>
                    <TableCell>{className(b.class_id)}</TableCell>
                    <TableCell>{trainerFor(b.class_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(b.booking_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{b.booking_time ?? "—"}</TableCell>
                    <TableCell><StatusBadge value={b.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            mark.mutate({ memberId: b.member_id, classId: b.class_id, bookingId: b.id, status: "present" })
                          }
                        >
                          Mark present
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: b.id, status: "completed" })}>
                          Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: b.id, status: "cancelled" })}>
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(attendance.data ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-muted-foreground">No attendance recorded yet.</TableCell></TableRow>
                )}
                {(attendance.data ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{memberName(a.member_id)}</TableCell>
                    <TableCell>{a.class_id ? className(a.class_id) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(a.attended_on)}</TableCell>
                    <TableCell><StatusBadge value={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
