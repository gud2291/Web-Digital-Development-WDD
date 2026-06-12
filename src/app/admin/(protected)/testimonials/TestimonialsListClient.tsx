"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MessageSquareQuote } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Btn, Stars } from "@/components/ui";
import { SortableList } from "@/components/admin/SortableList";
import { orderByIds } from "@/components/admin/reorderFieldArray";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminApi } from "@/lib/adminApi";

interface TestimonialRow {
  _id: string;
  clientName: string;
  clientCompany: string;
  rating: number;
  message: string;
  visible: boolean;
  adminHearted: boolean;
}

export function TestimonialsListClient({ initial }: { initial: TestimonialRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const [deleting, setDeleting] = React.useState<TestimonialRow | null>(null);
  const [busy, setBusy] = React.useState(false);

  const toggle = async (row: TestimonialRow, key: "visible" | "adminHearted") => {
    try {
      const updated = await adminApi.put<TestimonialRow>(`/api/admin/testimonials/${row._id}`, {
        [key]: !row[key],
      });
      setRows((p) => p.map((r) => (r._id === row._id ? { ...r, ...updated } : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/testimonials/${deleting._id}`);
      setRows((p) => p.filter((r) => r._id !== deleting._id));
      toast.success("Deleted");
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
        reorderEndpoint="/api/admin/testimonials/reorder"
        onReorder={(ids) => setRows((prev) => orderByIds(prev, ids, (r) => r._id))}
        empty={
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials yet"
            description="Add your first client review."
            action={
              <Link href="/admin/testimonials/new">
                <Btn iconRight="plus">New testimonial</Btn>
              </Link>
            }
          />
        }
        render={(r) => (
          <div className="sortable-row__main">
            <div className="sortable-row__title">
              <span style={{ fontWeight: 600 }}>{r.clientName}</span>
              <span className="t-small">{r.clientCompany || "—"}</span>
              <Stars value={r.rating} />
            </div>
            <div className="sortable-row__actions">
              <button type="button" onClick={() => toggle(r, "visible")} className="admin-icon-btn" title="Toggle visibility">
                <StatusBadge kind={r.visible ? "visible" : "hidden"} />
              </button>
              <button
                type="button"
                onClick={() => toggle(r, "adminHearted")}
                className="admin-icon-btn"
                title="Toggle featured"
                style={r.adminHearted ? { color: "#EC4899", borderColor: "#FCA5A5" } : undefined}
              >
                <Icon name="heart" size={12} /> {r.adminHearted ? "Featured" : "—"}
              </button>
              <Link href={`/admin/testimonials/${r._id}`} className="admin-icon-btn">
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
        title="Delete testimonial?"
        message={deleting ? `Delete review by ${deleting.clientName}?` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
