"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Wrench } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Btn } from "@/components/ui";
import { SortableList } from "@/components/admin/SortableList";
import { orderByIds } from "@/components/admin/reorderFieldArray";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminApi } from "@/lib/adminApi";

interface ServiceRow {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  visible: boolean;
}

export function ServicesListClient({ initial }: { initial: ServiceRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const [deleting, setDeleting] = React.useState<ServiceRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/services/${deleting._id}`);
      setRows((prev) => prev.filter((r) => r._id !== deleting._id));
      toast.success("Service deleted");
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
        reorderEndpoint="/api/admin/services/reorder"
        onReorder={(ids) => setRows((prev) => orderByIds(prev, ids, (r) => r._id))}
        empty={
          <EmptyState
            icon={Wrench}
            title="No services yet"
            description="Create your first service offering."
            action={
              <Link href="/admin/services/new">
                <Btn iconRight="plus">New service</Btn>
              </Link>
            }
          />
        }
        render={(r) => (
          <div className="sortable-row__main">
            <div className="sortable-row__title">
              <span style={{ fontWeight: 600 }}>{r.title}</span>
              <span className="t-small">/{r.slug}</span>
            </div>
            <div className="sortable-row__actions">
              <StatusBadge kind={r.visible ? "visible" : "hidden"} />
              <Link href={`/admin/services/${r._id}`} className="admin-icon-btn">
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
        title="Delete service?"
        message={deleting ? `Delete "${deleting.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
