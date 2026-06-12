"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Btn } from "@/components/ui";
import { SortableList } from "@/components/admin/SortableList";
import { orderByIds } from "@/components/admin/reorderFieldArray";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminApi } from "@/lib/adminApi";
import { formatDate } from "@/lib/utils";

interface BlogRow {
  _id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  createdAt: string;
}

export function BlogListClient({ initial }: { initial: BlogRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const [deleting, setDeleting] = React.useState<BlogRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/blog/${deleting._id}`);
      setRows((prev) => prev.filter((r) => r._id !== deleting._id));
      toast.success("Post deleted");
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
        reorderEndpoint="/api/admin/blog/reorder"
        onReorder={(ids) => setRows((prev) => orderByIds(prev, ids, (r) => r._id))}
        empty={
          <EmptyState
            icon={FileText}
            title="No posts yet"
            description="Write your first article."
            action={
              <Link href="/admin/blog/new">
                <Btn iconRight="plus">New post</Btn>
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
              <StatusBadge kind={r.published ? "published" : "draft"} />
              <span className="t-small">{formatDate(r.createdAt)}</span>
              <Link href={`/admin/blog/${r._id}`} className="admin-icon-btn">
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
        title="Delete post?"
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
