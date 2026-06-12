"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FolderKanban } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Btn } from "@/components/ui";
import { SortableList } from "@/components/admin/SortableList";
import { orderByIds } from "@/components/admin/reorderFieldArray";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminApi } from "@/lib/adminApi";

interface ProjectRow {
  _id: string;
  title: string;
  category: string;
  featured: boolean;
  visible: boolean;
}

export function ProjectsListClient({ initial }: { initial: ProjectRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const [deleting, setDeleting] = React.useState<ProjectRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/projects/${deleting._id}`);
      setRows((prev) => prev.filter((r) => r._id !== deleting._id));
      toast.success("Project deleted");
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
        reorderEndpoint="/api/admin/projects/reorder"
        onReorder={(ids) => setRows((prev) => orderByIds(prev, ids, (r) => r._id))}
        empty={
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Add your first portfolio item."
            action={
              <Link href="/admin/projects/new">
                <Btn iconRight="plus">New project</Btn>
              </Link>
            }
          />
        }
        render={(r) => (
          <div className="sortable-row__main">
            <div className="sortable-row__title">
              <span style={{ fontWeight: 600 }}>{r.title}</span>
              {r.featured && <span className="badge badge--accent">Featured</span>}
              <span className="t-small">{r.category}</span>
            </div>
            <div className="sortable-row__actions">
              <StatusBadge kind={r.visible ? "visible" : "hidden"} />
              <Link href={`/admin/projects/${r._id}`} className="admin-icon-btn">
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
        title="Delete project?"
        message={deleting ? `Delete "${deleting.title}"?` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
