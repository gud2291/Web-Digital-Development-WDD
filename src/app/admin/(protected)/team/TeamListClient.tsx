"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Btn } from "@/components/ui";
import { SortableList } from "@/components/admin/SortableList";
import { orderByIds } from "@/components/admin/reorderFieldArray";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminApi } from "@/lib/adminApi";

interface TeamRow {
  _id: string;
  name: string;
  designation: string;
  photo: string;
  visible: boolean;
}

export function TeamListClient({ initial }: { initial: TeamRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const [deleting, setDeleting] = React.useState<TeamRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/team/${deleting._id}`);
      setRows((p) => p.filter((r) => r._id !== deleting._id));
      toast.success("Removed");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SortableList
        items={rows}
        getId={(r) => r._id}
        reorderEndpoint="/api/admin/team/reorder"
        onReorder={(ids) => setRows((prev) => orderByIds(prev, ids, (r) => r._id))}
        empty={
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Add your first team member."
            action={
              <Link href="/admin/team/new">
                <Btn iconRight="plus">New member</Btn>
              </Link>
            }
          />
        }
        render={(r) => (
          <div className="sortable-row__main">
            <div className="sortable-row__title" style={{ alignItems: "center" }}>
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span className="avatar" style={{ width: 34, height: 34, background: "#1B4DA8" }}>
                  {r.name.split(/\s+/).map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase()}
                </span>
              )}
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span className="t-small">{r.designation}</span>
            </div>
            <div className="sortable-row__actions">
              <StatusBadge kind={r.visible ? "visible" : "hidden"} />
              <Link href={`/admin/team/${r._id}`} className="admin-icon-btn">
                <Icon name="code" size={12} /> Edit
              </Link>
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setDeleting(r)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Remove team member?"
        message={deleting ? `Remove ${deleting.name}?` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
