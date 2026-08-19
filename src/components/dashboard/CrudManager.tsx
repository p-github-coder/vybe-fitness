import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteRow, upsertRow, type ListQuery } from "@/lib/gym-data";

export interface CrudField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "array" | "select" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface CrudColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

type Row = { id: string };

export function CrudManager<T extends Row>({
  table,
  query,
  columns,
  fields,
  entityLabel,
  searchKeys,
  emptyMessage,
}: {
  table: string;
  query: ListQuery<T>;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  entityLabel: string;
  searchKeys?: string[];
  emptyMessage?: string;
}) {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(query);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const rows = useMemo(() => {
    if (!search.trim()) return data;
    const keys = searchKeys ?? fields.filter((f) => f.type === "text").map((f) => f.name);
    const term = search.toLowerCase();
    return data.filter((row) =>
      keys.some((k) => String((row as Record<string, unknown>)[k] ?? "").toLowerCase().includes(term)),
    );
  }, [data, search, searchKeys, fields]);

  function openCreate() {
    const initial: Record<string, unknown> = {};
    for (const f of fields) initial[f.name] = f.defaultValue ?? (f.type === "boolean" ? true : f.type === "array" ? "" : "");
    setForm(initial);
    setCreating(true);
  }

  function openEdit(row: T) {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      const v = (row as Record<string, unknown>)[f.name];
      initial[f.name] = f.type === "array" ? (Array.isArray(v) ? v.join(", ") : "") : (v ?? "");
    }
    setForm(initial);
    setEditing(row);
  }

  const save = useMutation({
    mutationFn: async () => {
      const values: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = form[f.name];
        if (f.type === "array") {
          values[f.name] = String(raw ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (f.type === "number") {
          values[f.name] = raw === "" || raw == null ? 0 : Number(raw);
        } else if (f.type === "boolean") {
          values[f.name] = Boolean(raw);
        } else {
          values[f.name] = raw === "" ? null : raw;
        }
      }
      await upsertRow(table, values, editing?.id);
    },
    onSuccess: async () => {
      toast.success(editing ? `${entityLabel} updated` : `${entityLabel} created`);
      setEditing(null);
      setCreating(false);
      await queryClient.invalidateQueries({ queryKey: query.queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow(table, id),
    onSuccess: async () => {
      toast.success(`${entityLabel} deleted`);
      await queryClient.invalidateQueries({ queryKey: query.queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dialogOpen = creating || editing !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${entityLabel.toLowerCase()}s…`}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New {entityLabel.toLowerCase()}
        </Button>
      </div>

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.header}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-muted-foreground">
                  {emptyMessage ?? `No ${entityLabel.toLowerCase()}s yet.`}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell key={c.key}>{c.render(row)}</TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => {
                        if (confirm(`Delete this ${entityLabel.toLowerCase()}?`)) remove.mutate(row.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${entityLabel.toLowerCase()}` : `New ${entityLabel.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>Changes are saved to your gym database immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    rows={3}
                    value={String(form[f.name] ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                ) : f.type === "boolean" ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      id={f.name}
                      checked={Boolean(form[f.name])}
                      onCheckedChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form[f.name] ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : f.type === "select" ? (
                  <Select
                    value={String(form[f.name] ?? "")}
                    onValueChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
                  >
                    <SelectTrigger id={f.name}>
                      <SelectValue placeholder={f.placeholder ?? "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options ?? []).map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={String(form[f.name] ?? "")}
                    placeholder={f.placeholder ?? (f.type === "array" ? "Comma separated" : undefined)}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setCreating(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "approved" || value === "active" || value === "confirmed" || value === "present"
      ? "default"
      : value === "pending" || value === "waitlist" || value === "late"
        ? "secondary"
        : "destructive";
  return (
    <Badge variant={tone as "default" | "secondary" | "destructive"} className="capitalize">
      {value}
    </Badge>
  );
}
