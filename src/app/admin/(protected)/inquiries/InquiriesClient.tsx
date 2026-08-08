"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { DataTable, type DataTableColumn, type DataTableFilter } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApi } from "@/lib/adminApi";
import { formatDate } from "@/lib/utils";

type Status = "new" | "viewed" | "replied" | "closed";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  status: Status;
  /** Passed the spam guard but scored high enough that we withheld the auto-reply. */
  suspicious?: boolean;
  spamReasons?: string[];
  createdAt: string;
}

const STATUS_OPTIONS: Status[] = ["new", "viewed", "replied", "closed"];

interface Props {
  initial: Inquiry[];
}

export function InquiriesClient({ initial }: Props) {
  const [rows, setRows] = React.useState<Inquiry[]>(initial);
  const [viewing, setViewing] = React.useState<Inquiry | null>(null);
  const [deleting, setDeleting] = React.useState<Inquiry | null>(null);
  const [busy, setBusy] = React.useState(false);

  const filters: DataTableFilter<Inquiry>[] = [
    {
      key: "status",
      label: "Status",
      options: STATUS_OPTIONS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
      match: (r, v) => r.status === v,
    },
    {
      key: "spam",
      label: "Spam",
      options: [
        { value: "clean", label: "Genuine only" },
        { value: "suspicious", label: "Possible spam" },
      ],
      match: (r, v) => (v === "suspicious" ? Boolean(r.suspicious) : !r.suspicious),
    },
    {
      key: "range",
      label: "Received",
      options: [
        { value: "7", label: "Last 7 days" },
        { value: "30", label: "Last 30 days" },
        { value: "90", label: "Last 90 days" },
      ],
      match: (r, v) => new Date(r.createdAt).getTime() >= Date.now() - Number(v) * 86400000,
    },
  ];

  const updateStatus = async (row: Inquiry, status: Status) => {
    try {
      const updated = await adminApi.patch<Inquiry>(`/api/admin/inquiries/${row._id}`, { status });
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, ...updated } : r)));
      if (viewing && viewing._id === row._id) setViewing({ ...viewing, status });
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/inquiries/${deleting._id}`);
      setRows((prev) => prev.filter((r) => r._id !== deleting._id));
      toast.success("Inquiry deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<Inquiry>[] = [
    {
      key: "name",
      header: "Contact",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            {r.name}
            {r.suspicious && (
              <span
                title={r.spamReasons?.join(", ") || "Flagged by the spam guard"}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#B45309",
                  background: "#FEF3C7",
                  borderRadius: 999,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                Possible spam
              </span>
            )}
          </div>
          <div className="t-small" style={{ fontSize: 12 }}>{r.email}</div>
        </div>
      ),
    },
    { key: "service", header: "Service", sortValue: (r) => r.service, render: (r) => r.service || "—", width: "160px" },
    { key: "budget", header: "Budget", render: (r) => r.budget || "—", width: "120px" },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      width: "120px",
      render: (r) => <StatusBadge kind={r.status} />,
    },
    {
      key: "createdAt",
      header: "Received",
      sortValue: (r) => r.createdAt,
      width: "140px",
      render: (r) => <span className="t-small">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      render: (r) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setViewing(r)}
            title="View"
          >
            <Icon name="search" size={12} /> View
          </button>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            onClick={() => setDeleting(r)}
            title="Delete"
          >
            <Icon name="x" size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={rows}
        rowKey={(r) => r._id}
        columns={columns}
        search={(r) => `${r.name} ${r.email} ${r.phone} ${r.message}`}
        searchPlaceholder="Search by name, email, message…"
        urlKey="inquiries"
        filters={filters}
        exportFilename="inquiries"
      />

      {viewing && (
        <div className="admin-modal-overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewing.name}</h3>
            <div className="admin-modal__body" style={{ display: "grid", gap: 10, fontSize: 14 }}>
              <Row label="Email" value={viewing.email} />
              <Row label="Phone" value={viewing.phone || "—"} />
              <Row label="Service" value={viewing.service || "—"} />
              <Row label="Budget" value={viewing.budget || "—"} />
              <Row label="Received" value={formatDate(viewing.createdAt)} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Message</div>
                <div style={{ background: "var(--c-bg-section)", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
                  {viewing.message}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600 }}>Status:</span>
                <select
                  className="select"
                  value={viewing.status}
                  onChange={(e) => updateStatus(viewing, e.target.value as Status)}
                  style={{ height: 36, maxWidth: 200 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <StatusBadge kind={viewing.status} />
              </div>
            </div>
            <div className="admin-modal__actions">
              <Link
                href={`/admin/quotation/generate?name=${encodeURIComponent(viewing.name)}&email=${encodeURIComponent(
                  viewing.email
                )}&phone=${encodeURIComponent(viewing.phone || "")}`}
              >
                <Btn variant="secondary" type="button" icon="file">Create quotation</Btn>
              </Link>
              <a href={`mailto:${viewing.email}`}>
                <Btn variant="secondary" type="button" icon="mail">Reply by email</Btn>
              </a>
              <Btn type="button" onClick={() => setViewing(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete inquiry?"
        message={deleting ? `Delete the inquiry from ${deleting.name}? This cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
      <span style={{ color: "var(--c-text-muted)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
